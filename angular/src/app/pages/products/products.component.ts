import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../interfaces/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  title = 'Gestion des Produits';
  products: Product[] = [];
  isLoading = true;
  isModalOpen = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  currentProduct: Product | null = null;
  activeDropdown: number | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des produits', error);
        this.isLoading = false;
      }
    );
  }

  // Gestionnaire pour fermer le dropdown quand on clique ailleurs
  @HostListener('document:click')
  closeDropdown(): void {
    this.activeDropdown = null;
  }

  // Gestion du toggle du dropdown
  toggleDropdown(event: Event, productId: number | undefined): void {
    event.stopPropagation();

    if (!productId) return;

    // Ferme le dropdown si on clique à nouveau sur le même
    if (this.activeDropdown === productId) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = productId;
    }
  }

  // Empêche la fermeture quand on clique sur le contenu du dropdown
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal(mode: 'create' | 'edit' | 'view', product?: Product): void {
    this.modalMode = mode;
    this.isModalOpen = true;

    if (mode === 'create') {
      this.currentProduct = { name: '', price: 0, description: '' };
    } else if (product) {
      this.currentProduct = { ...product };
    }

    // Ferme le dropdown quand une action est exécutée
    this.activeDropdown = null;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentProduct = null;
  }

  saveProduct(): void {
    if (!this.currentProduct) return;

    if (this.modalMode === 'create') {
      this.productService.createProduct(this.currentProduct).subscribe(
        () => {
          this.loadProducts();
          this.closeModal();
        },
        (error) => console.error('Erreur lors de la création du produit', error)
      );
    } else if (this.modalMode === 'edit') {
      this.productService.updateProduct(this.currentProduct).subscribe(
        () => {
          this.loadProducts();
          this.closeModal();
        },
        (error) =>
          console.error('Erreur lors de la modification du produit', error)
      );
    }
  }

  deleteProduct(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.loadProducts();
          if (this.currentProduct && this.currentProduct.id === id) {
            this.closeModal();
          }
        },
        (error) =>
          console.error('Erreur lors de la suppression du produit', error)
      );
    }

    // Ferme le dropdown après la suppression
    this.activeDropdown = null;
  }
}
