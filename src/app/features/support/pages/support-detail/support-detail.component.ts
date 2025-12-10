import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupportConversation, SupportMessage } from '../../models/support.model';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-support-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './support-detail.component.html',
  styleUrls: ['./support-detail.component.scss'],
})
export class SupportDetailComponent implements OnInit {
  conversation?: SupportConversation;
  loading = false;
  sending = false;
  replyMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load(id);
    }
  }

  load(id: string): void {
    this.loading = true;
    this.supportService.getConversation(id).subscribe({
      next: (res) => {
        this.conversation = res.conversation;
        this.loading = false;
        if (this.conversation?.unreadByAdmin) {
          this.markSeen();
        }
      },
      error: (err) => {
        console.error('Error cargando conversación', err);
        this.loading = false;
      },
    });
  }

  markSeen(): void {
    if (!this.conversation) return;
    this.supportService.markSeen(this.conversation.id).subscribe({
      next: (res) => (this.conversation = res.conversation),
      error: (err) => console.warn('No se pudo marcar como visto', err),
    });
  }

  sendReply(): void {
    if (!this.conversation || !this.replyMessage.trim()) return;

    this.sending = true;
    this.supportService.replyConversation(this.conversation.id, this.replyMessage.trim()).subscribe({
      next: (res) => {
        this.conversation = res.conversation;
        this.replyMessage = '';
        this.sending = false;
      },
      error: (err) => {
        console.error('Error enviando respuesta', err);
        this.sending = false;
      },
    });
  }

  trackByMsg(_index: number, msg: SupportMessage): string {
    return msg.id;
  }

  goBack(): void {
    this.router.navigate(['/support']);
  }
}

