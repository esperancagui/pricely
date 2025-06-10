import { Component, OnInit } from '@angular/core';
import { TestService } from '../../services/test.service';
import { CommonModule } from '@angular/common';
import { ProductPlaceholder } from '../../models/productPlaceholder.model';
import { Product } from '../../models/product.model';

interface GameWithPrice extends ProductPlaceholder {
  price: number;
  discount_price: number;
  url: string;
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
      console.log('Iniciando loadDiscountedGames');
      // Busca os placeholders e os produtos com preços
      const [placeholdersResponse, productsResponse] = await Promise.all([
        this.testService.getAllProducts(),
        this.testService.getAllProductsWithPrices()
      ]);

      console.log('Placeholders Response:', placeholdersResponse);
      console.log('Products Response:', productsResponse);

      // Garante que estamos trabalhando com arrays
      const placeholders = Array.isArray(placeholdersResponse) ? placeholdersResponse : [];
      const products = Array.isArray(productsResponse) ? productsResponse : [];

      if (placeholders.length === 0 || products.length === 0) {
        console.warn('Dados vazios ou incompletos da API. Placeholders:', placeholders.length, 'Products:', products.length);
        throw new Error('Nenhum dado recebido da API para combinação');
      }

      // Combina os placeholders com os preços
      const gamesWithPrices: GameWithPrice[] = products.map(product => {
        const placeholder = placeholders.find(p => p.id === product.product_placeholder_id);
        if (placeholder) {
          return {
            ...placeholder,
            price: product.price || 0,
            discount_price: product.discount_price || 0,
            url: product.url || ''
          };
        }
        return null;
      }).filter((game): game is GameWithPrice => game !== null);

      console.log('Games with prices (após combinação):', gamesWithPrices);

      if (gamesWithPrices.length === 0) {
        console.warn('Nenhum jogo encontrado após combinar os dados.');
        throw new Error('Nenhum jogo encontrado após combinar os dados');
      }

      // Filtra jogos com desconto
      const gamesWithDiscount = gamesWithPrices.filter(game =>
        game.discount_price > 0 && game.discount_price < game.price
      );

      console.log('Games with discount:', gamesWithDiscount);

      // Se não houver jogos com desconto, mostra todos os jogos
      if (gamesWithDiscount.length === 0) {
        this.discountedGames = gamesWithPrices;
        console.log('Mostrando todos os jogos, nenhum desconto encontrado.');
      } else {
        // Se houver jogos com desconto, mostra os 5 melhores descontos
        this.discountedGames = gamesWithDiscount
          .sort((a, b) => {
            const discountA = ((a.price - a.discount_price) / a.price) * 100;
            const discountB = ((b.price - b.discount_price) / b.price) * 100;
            return discountB - discountA;
          })
          .slice(0, 5);
        console.log('Mostrando os 5 melhores jogos com desconto:', this.discountedGames);
      }

      this.loading = false;
      console.log('LoadDiscountedGames concluído com sucesso.');
    } catch (err) {
      this.error = 'Erro ao carregar os jogos em promoção';
      this.loading = false;
      console.error('Erro detalhado em loadDiscountedGames:', err);
    }
  }

  // Função para lidar com erro de carregamento de imagem
  handleImageError(event: any) {
    event.target.src = 'assets/img/games/default-game.jpg';
  }
}
