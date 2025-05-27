import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment';

// Interface de exemplo para tipagem
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  metacritic_score: number;
  platform: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  constructor(private httpService: HttpService) { }

  // Exemplo de método para buscar produtos
  async getAllProducts(): Promise<Product[]> {
    return this.httpService.get<Product[]>('/products_placeholder/');
  }

  async getProductById(id: string): Promise<Product> {
    return this.httpService.get<Product>(`/products_placeholder/${id}`);
  }


} 