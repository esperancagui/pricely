import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment';
import { ProductPlaceholder } from '../models/productPlaceholder.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  constructor(private httpService: HttpService) { }

  // Busca todos os placeholders de produtos
  async getAllProducts(): Promise<ProductPlaceholder[]> {
    const response = await this.httpService.get<any>('/products_placeholder/');
    return response?.products || [];
  }

  // Busca um placeholder específico
  async getProductById(id: string): Promise<ProductPlaceholder> {
    return this.httpService.get<ProductPlaceholder>(`/products_placeholder/${id}`);
  }

  // Busca todos os produtos com preços e promoções
  async getAllProductsWithPrices(): Promise<Product[]> {
    const response = await this.httpService.get<any>('/products/');
    return response?.products || [];
  }

  // Busca um produto específico com preço e promoção
  async getProductWithPrice(id: string): Promise<Product> {
    return this.httpService.get<Product>(`/products/${id}`);
  }
} 