import { Component, OnInit } from '@angular/core';
import { TestService } from '../../services/test.service';
import { CommonModule } from '@angular/common';
import { ProductPlaceholder } from '../../models/productPlaceholder.model';
import { Product } from '../../models/product.model';

interface GameWithPrice extends ProductPlaceholder {
  current_price: number;
  discount_percentage: number;
}

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent implements OnInit {
  discountedGames: GameWithPrice[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private testService: TestService) { }

  ngOnInit() {
    this.loadDiscountedGames();
  }

  private async loadDiscountedGames() {
    try {
      // Busca os placeholders e os produtos com preços
      const [placeholdersResponse, productsResponse] = await Promise.all([
        this.testService.getAllProducts(),
        this.testService.getAllProductsWithPrices()
      ]);

      // Garante que estamos trabalhando com arrays
      const placeholders = Array.isArray(placeholdersResponse) ? placeholdersResponse : [];
      const products = Array.isArray(productsResponse) ? productsResponse : [];

      console.log('Placeholders:', placeholders);
      console.log('Products:', products);

      // Combina os placeholders com os preços
      const gamesWithPrices: GameWithPrice[] = products.map(product => {
        const placeholder = placeholders.find(p => p.id === product.product_placeholder_id);
        if (placeholder) {
          return {
            ...placeholder,
            current_price: product.discounted_price,
            discount_percentage: product.percentage_discount
          };
        }
        return null;
      }).filter((game): game is GameWithPrice => game !== null);

      // Filtra jogos com 50% ou mais de desconto
      const highDiscountGames = gamesWithPrices.filter(game => game.discount_percentage >= 50);

      // Se não houver jogos com 50% ou mais de desconto, pega os 5 melhores descontos
      if (highDiscountGames.length === 0) {
        const gamesWithDiscount = gamesWithPrices.filter(game => game.discount_percentage > 0);

        if (gamesWithDiscount.length === 0) {
          // Se não houver nenhum jogo com desconto, mostra todos os jogos
          this.discountedGames = gamesWithPrices;
        } else {
          // Se houver jogos com desconto, mostra os 5 melhores descontos
          this.discountedGames = gamesWithDiscount
            .sort((a, b) => b.discount_percentage - a.discount_percentage)
            .slice(0, 5);
        }
      } else {
        this.discountedGames = highDiscountGames;
      }

      this.loading = false;
    } catch (err) {
      this.error = 'Erro ao carregar os jogos em promoção';
      this.loading = false;
      console.error('Erro ao carregar jogos:', err);
    }
  }
}
