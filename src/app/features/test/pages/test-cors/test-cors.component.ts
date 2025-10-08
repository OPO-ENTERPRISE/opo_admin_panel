import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestService } from '../../../../core/services/test.service';

@Component({
  selector: 'app-test-cors',
  templateUrl: './test-cors.component.html',
  styleUrls: ['./test-cors.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export class TestCorsComponent implements OnInit {
  healthResult: any = null;
  loginResult: any = null;
  isLoadingHealth = false;
  isLoadingLogin = false;

  constructor(private testService: TestService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.testHealth();
  }

  testHealth(): void {
    this.isLoadingHealth = true;
    this.testService.testCORS().subscribe({
      next: (result) => {
        this.healthResult = result;
        this.isLoadingHealth = false;
        this.snackBar.open('Health check exitoso', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.healthResult = error;
        this.isLoadingHealth = false;
        this.snackBar.open('Error en health check', 'Cerrar', { duration: 3000 });
      },
    });
  }

  testLogin(): void {
    this.isLoadingLogin = true;
    this.testService.testLogin().subscribe({
      next: (result) => {
        this.loginResult = result;
        this.isLoadingLogin = false;
        this.snackBar.open('Login exitoso', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        this.loginResult = error;
        this.isLoadingLogin = false;
        this.snackBar.open('Error en login', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
