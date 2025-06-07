import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  categories = [
    { id: 1, name: 'RPG' },
    { id: 2, name: 'Ação' },
    { id: 3, name: 'Aventura' },
    { id: 4, name: 'Estratégia' },
    { id: 5, name: 'Indie' },
    { id: 6, name: 'Plataforma' }
  ];
}
