import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { SupportConversation } from '../../models/support.model';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-support-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.scss'],
})
export class SupportListComponent implements OnInit {
  displayedColumns = ['title', 'userEmail', 'status', 'lastUpdated', 'unread', 'actions'];
  conversations: SupportConversation[] = [];
  loading = false;
  search = '';

  constructor(private supportService: SupportService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.supportService.listConversations({ search: this.search || undefined }).subscribe({
      next: (res) => {
        this.conversations = res.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando conversaciones', err);
        this.loading = false;
      },
    });
  }

  onView(conv: SupportConversation): void {
    this.router.navigate(['/support', conv.id]);
  }
}

