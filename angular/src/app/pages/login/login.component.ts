import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  user: User = { username: '', password: '' };
  error: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.isLoading = true;
    this.error = '';

    this.authService.login(this.user).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/products']);
        } else {
          this.error = response.message || 'Identifiants incorrects';
        }
      },
      (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Erreur de connexion';
      }
    );
  }
}
