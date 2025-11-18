import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { TopicService } from '../../services/topic.service';
import { SourceTopicInfo } from '../../../../core/models/topic.model';

export interface AddQuestionsDialogData {
  topicId: number;
  topicTitle: string;
}

@Component({
  selector: 'app-add-questions-dialog',
  templateUrl: './add-questions-dialog.component.html',
  styleUrls: ['./add-questions-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  standalone: true,
})
export class AddQuestionsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  sourceTopics: SourceTopicInfo[] = [];
  filteredTopics: SourceTopicInfo[] = [];
  selectedTopics: Set<string> = new Set();
  isLoading = false;
  isCopying = false;

  // Filters
  searchControl = new FormControl('');
  areaFilter = new FormControl('all');

  // Table columns
  displayedColumns: string[] = ['select', 'title', 'area', 'subtopicCount', 'questionCount'];

  // Filter options
  areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    { value: '1', label: 'Policía Nacional (PN)' },
    { value: '2', label: 'Policía Local/Guardia Civil (PS)' },
  ];

  constructor(
    private dialogRef: MatDialogRef<AddQuestionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddQuestionsDialogData,
    private topicService: TopicService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadSourceTopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Search filter with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });

    // Area filter
    this.areaFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  private loadSourceTopics(): void {
    this.isLoading = true;

    this.topicService
      .getAvailableSourceTopics(this.data.topicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topics) => {
          this.sourceTopics = topics;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading source topics:', error);
          this.snackBar.open('Error al cargar temas disponibles', 'Cerrar', {
            duration: 5000,
          });
          this.isLoading = false;
        },
      });
  }

  private applyFilters(): void {
    let filtered = [...this.sourceTopics];

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter((topic) => topic.title.toLowerCase().includes(searchTerm));
    }

    // Apply area filter
    const areaFilter = this.areaFilter.value;
    if (areaFilter && areaFilter !== 'all') {
      filtered = filtered.filter((topic) => topic.area.toString() === areaFilter);
    }

    this.filteredTopics = filtered;
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.filteredTopics.forEach((topic) => {
        this.selectedTopics.add(topic.uuid);
      });
    } else {
      this.filteredTopics.forEach((topic) => {
        this.selectedTopics.delete(topic.uuid);
      });
    }
  }

  onSelectTopic(topicUuid: string, checked: boolean): void {
    if (checked) {
      this.selectedTopics.add(topicUuid);
    } else {
      this.selectedTopics.delete(topicUuid);
    }
  }

  isTopicSelected(topicUuid: string): boolean {
    return this.selectedTopics.has(topicUuid);
  }

  isAllSelected(): boolean {
    return (
      this.filteredTopics.length > 0 &&
      this.filteredTopics.every((topic) => this.selectedTopics.has(topic.uuid))
    );
  }

  isIndeterminate(): boolean {
    const selectedCount = this.filteredTopics.filter((topic) =>
      this.selectedTopics.has(topic.uuid)
    ).length;
    return selectedCount > 0 && selectedCount < this.filteredTopics.length;
  }

  getSelectedCount(): number {
    return this.selectedTopics.size;
  }

  getTotalQuestionsToCopy(): number {
    return this.sourceTopics
      .filter((topic) => this.selectedTopics.has(topic.uuid))
      .reduce((total, topic) => total + topic.questionCount, 0);
  }

  onCopyQuestions(): void {
    if (this.selectedTopics.size === 0) {
      this.snackBar.open('Debe seleccionar al menos un tema', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const totalQuestions = this.getTotalQuestionsToCopy();
    const confirmMessage = `¿Está seguro de que desea copiar ${totalQuestions} preguntas desde ${this.selectedTopics.size} tema(s) seleccionado(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isCopying = true;

    const request = {
      sourceTopicUuids: Array.from(this.selectedTopics),
    };

    this.topicService
      .copyQuestionsFromTopics(this.data.topicId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isCopying = false;
          this.snackBar.open(`✅ ${response.message}`, 'Cerrar', { duration: 5000 });
          this.dialogRef.close(true); // Indicate success
        },
        error: (error) => {
          console.error('Error copying questions:', error);
          this.isCopying = false;
          this.snackBar.open(
            'Error al copiar preguntas: ' + (error.error?.message || error.message),
            'Cerrar',
            { duration: 5000 }
          );
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getAreaName(area: number): string {
    return area === 1 ? 'PN' : 'PS';
  }

  getAreaFullName(area: number): string {
    return area === 1 ? 'Policía Nacional' : 'Policía Local/Guardia Civil';
  }
}
