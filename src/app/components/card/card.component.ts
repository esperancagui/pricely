import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../../services/test.service';
import { ProductPlaceholder } from '../../models/productPlaceholder.model';
import { Product } from '../../models/product.model';

interface GameWithPrice extends ProductPlaceholder {
  current_price: number;
  discount_percentage: number;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  playstationGames: GameWithPrice[] = [];
  xboxGames: GameWithPrice[] = [];
  nintendoGames: GameWithPrice[] = [];
  pcGames: GameWithPrice[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private testService: TestService) { }

  ngOnInit() {
    this.loadGames();
  }

  private async loadGames() {
    try {
      console.log('Iniciando carregamento dos jogos...');

      // Busca os placeholders e os produtos com preços
      console.log('Buscando placeholders e produtos...');
      const [placeholdersResponse, productsResponse] = await Promise.all([
        this.testService.getAllProducts(),
        this.testService.getAllProductsWithPrices()
      ]);

      console.log('Resposta dos placeholders:', placeholdersResponse);
      console.log('Resposta dos produtos:', productsResponse);

      // Garante que estamos trabalhando com arrays
      const placeholders = Array.isArray(placeholdersResponse) ? placeholdersResponse : [];
      const products = Array.isArray(productsResponse) ? productsResponse : [];

      console.log('Placeholders processados:', placeholders);
      console.log('Produtos processados:', products);

      if (placeholders.length === 0 || products.length === 0) {
        throw new Error('Nenhum dado recebido da API');
      }

      // Combina os placeholders com os preços
      const gamesWithPrices: GameWithPrice[] = products.map(product => {
        const placeholder = placeholders.find(p => p.id === product.product_placeholder_id);
        if (placeholder) {
          return {
            ...placeholder,
            current_price: product.discounted_price || placeholder.price || 0,
            discount_percentage: product.percentage_discount || 0,
            platform: placeholder.platform || 'Plataforma não especificada'
          };
        }
        return null;
      }).filter((game): game is GameWithPrice => game !== null);

      console.log('Jogos combinados:', gamesWithPrices);

      if (gamesWithPrices.length === 0) {
        throw new Error('Nenhum jogo encontrado após combinar os dados');
      }

      // Filtra os jogos por plataforma com verificação de segurança
      // this.playstationGames = gamesWithPrices.filter(game => {
      //   console.log('Filtrando PlayStation:', game.platform);
      //   return game.platform.toLowerCase().includes('playstation');
      // }
      // );

      // this.xboxGames = gamesWithPrices.filter(game => {
      //   console.log('Filtrando Xbox:', game.platform);
      //   return game.platform.toLowerCase().includes('xbox');
      // }
      // );

      // this.nintendoGames = gamesWithPrices.filter(game => {
      //   console.log('Filtrando Nintendo:', game.platform);
      //   return game.platform.toLowerCase().includes('nintendo');
      // }
      // );

      // this.pcGames = gamesWithPrices.filter(game => {
      //   console.log('Filtrando PC:', game.platform);
      //   return game.platform.toLowerCase().includes('pc');
      // }
      // );

      this.playstationGames = gamesWithPrices; // Temporariamente atribui todos os jogos para a seção PlayStation
      this.xboxGames = gamesWithPrices;
      this.nintendoGames = gamesWithPrices;
      this.pcGames = gamesWithPrices;

      console.log('Jogos filtrados por plataforma:', {
        playstation: this.playstationGames,
        xbox: this.xboxGames,
        nintendo: this.nintendoGames,
        pc: this.pcGames
      });

      this.loading = false;
    } catch (err) {
      console.error('Erro detalhado:', err);
      this.error = err instanceof Error ? err.message : 'Erro ao carregar os jogos';
      this.loading = false;
    }
  }

  // Função para lidar com erro de carregamento de imagem
  handleImageError(event: any) {
    event.target.src = 'assets/img/games/default-game.jpg';
  }
}
