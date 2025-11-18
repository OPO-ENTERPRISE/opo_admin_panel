import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ConvertVectorComponent } from './pages/convert-vector/convert-vector.component';

@Component({
  selector: 'app-ia-works',
  templateUrl: './ia-works.component.html',
  styleUrls: ['./ia-works.component.scss'],
  imports: [CommonModule, MatTabsModule, ConvertVectorComponent],
  standalone: true,
})
export class IaWorksComponent {
  selectedTab = 0;
}

