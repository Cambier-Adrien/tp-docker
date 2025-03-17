const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Add retry logic for database connection
const connectWithRetry = () => {
  console.log("Attempting to connect to MySQL database...");

  // Updated to match database name from database.sql
  const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || "mysql",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "products_db",
  });

  db.connect((err) => {
    if (err) {
      console.error("Erreur de connexion à MySQL:", err);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log("Connecté à MySQL avec succès");

    // Setup routes once connected
    setupRoutes(db);
  });
};

// Create API router to prefix all routes with /api
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Move all routes to a separate function that executes after DB connection
const setupRoutes = (db) => {
  // Récupérer tous les produits
  apiRouter.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des produits:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json(results);
    });
  });

  // Récupérer un produit par ID
  apiRouter.get("/products/:id", (req, res) => {
    db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la récupération du produit:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.length === 0) {
          return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json(result[0]);
      }
    );
  });

  // Ajouter un produit
  apiRouter.post("/products", (req, res) => {
    const { name, price, description } = req.body;
    db.query(
      "INSERT INTO products (name, price, description) VALUES (?, ?, ?)",
      [name, price, description],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'ajout du produit:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(201).json({ id: result.insertId, name, price, description });
      }
    );
  });

  // Modifier un produit
  apiRouter.put("/products/:id", (req, res) => {
    const { name, price, description } = req.body;
    db.query(
      "UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?",
      [name, price, description, req.params.id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du produit:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json({ message: "Produit mis à jour" });
      }
    );
  });

  // Supprimer un produit
  apiRouter.delete("/products/:id", (req, res) => {
    db.query(
      "DELETE FROM products WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de la suppression du produit:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json({ message: "Produit supprimé" });
      }
    );
  });

  // Authentification (sans Express)
  apiRouter.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query(
      "SELECT * FROM users WHERE username = ? AND password_hash = SHA2(?, 256)",
      [username, password],
      (err, result) => {
        if (err) {
          console.error("Erreur lors de l'authentification:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        if (result.length > 0) {
          res.json({ success: true });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Identifiants incorrects" });
        }
      }
    );
  });
};

// Start the connection process
connectWithRetry();

// Use the port from environment variables or default to 5000 to match Docker Compose
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur API démarré sur le port ${PORT}`));
