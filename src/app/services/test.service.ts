import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment';
import { ProductPlaceholder } from '../models/productPlaceholder.model';
import { Product } from '../models/product.model';

interface ApiResponse<T> {
  products: T[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  constructor(private httpService: HttpService) { }

  // Busca todos os placeholders de produtos
  async getAllProducts(): Promise<ProductPlaceholder[]> {
    try {
      const response = await this.httpService.get<ProductPlaceholder[]>('product-placeholders/');
      console.log('Resposta do endpoint product-placeholders:', response);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  // Busca um placeholder específico
  async getProductById(id: string): Promise<ProductPlaceholder> {
    try {
      return await this.httpService.get<ProductPlaceholder>(`product-placeholders/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      throw error;
    }
  }

  // Busca todos os produtos com preços e promoções
  async getAllProductsWithPrices(): Promise<Product[]> {
    try {
      const response = await this.httpService.get<ApiResponse<Product>>('products/');
      console.log('Resposta do endpoint products:', response);
      return response?.products || [];
    } catch (error) {
      console.error('Erro ao buscar produtos com preços:', error);
      throw error;
    }
  }

  // Busca um produto específico com preço e promoção
  async getProductWithPrice(id: string): Promise<Product> {
    try {
      return await this.httpService.get<Product>(`products/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar produto com preço ${id}:`, error);
      throw error;
    }
  }
} 