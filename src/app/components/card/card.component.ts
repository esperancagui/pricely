import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService } from '../../services/test.service';
import { ProductPlaceholder } from '../../models/productPlaceholder.model';
import { Product } from '../../models/product.model';

interface GameWithPrice extends ProductPlaceholder {
  price: number;
  discount_price: number;
  url: string;
}

interface PlatformDisplayData {
  name: string;
  games: GameWithPrice[]; // Jogos atualmente exibidos para esta plataforma
  allGamesForPlatform: GameWithPrice[]; // Todos os jogos disponíveis para esta plataforma
  currentPage: number;
  itemsPerPage: number;
  hasMore: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  private allGamesCombined: GameWithPrice[] = []; // Armazenará todos os jogos combinados da API

  platformData: {
    playstation: PlatformDisplayData;
    xbox: PlatformDisplayData;
    nintendo: PlatformDisplayData;
    pc: PlatformDisplayData;
  };

  loading: boolean = true;
  error: string | null = null;

  constructor(private testService: TestService) {
    const initialItemsPerPage = 10; // Exibe 10 por plataforma inicialmente
    this.platformData = {
      playstation: {
        name: 'PlayStation',
        games: [],
        allGamesForPlatform: [],
        currentPage: 0,
        itemsPerPage: initialItemsPerPage,
        hasMore: true
      },
      xbox: {
        name: 'Xbox',
        games: [],
        allGamesForPlatform: [],
        currentPage: 0,
        itemsPerPage: initialItemsPerPage,
        hasMore: true
      },
      nintendo: {
        name: 'Nintendo',
        games: [],
        allGamesForPlatform: [],
        currentPage: 0,
        itemsPerPage: initialItemsPerPage,
        hasMore: true
      },
      pc: {
        name: 'PC',
        games: [],
        allGamesForPlatform: [],
        currentPage: 0,
        itemsPerPage: initialItemsPerPage,
        hasMore: true
      }
    };
  }

  ngOnInit() {
    this.loadAllGamesAndInitializeDisplay();
  }

  private async loadAllGamesAndInitializeDisplay() {
    this.loading = true;
    this.error = null;
    try {
      const [placeholdersResponse, productsResponse] = await Promise.all([
        this.testService.getAllProducts(),
        this.testService.getAllProductsWithPrices()
      ]);

      console.log('Placeholders Response (All):', placeholdersResponse);
      console.log('Products Response (All):', productsResponse);

      const placeholders = Array.isArray(placeholdersResponse) ? placeholdersResponse : [];
      const products = Array.isArray(productsResponse) ? productsResponse : [];

      if (placeholders.length === 0 || products.length === 0) {
        throw new Error('Nenhum dado recebido da API para combinação inicial');
      }

      this.allGamesCombined = products.map(product => {
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

      console.log('All Games combined (após combinação inicial):', this.allGamesCombined);

      if (this.allGamesCombined.length === 0) {
        throw new Error('Nenhum jogo encontrado após combinar os dados');
      }

      // Preenche allGamesForPlatform para cada categoria
      this.platformData.playstation.allGamesForPlatform = this.allGamesCombined.filter(game =>
        game.platforms && game.platforms.toLowerCase().includes('playstation')
      );
      this.platformData.xbox.allGamesForPlatform = this.allGamesCombined.filter(game =>
        game.platforms && game.platforms.toLowerCase().includes('xbox')
      );
      this.platformData.nintendo.allGamesForPlatform = this.allGamesCombined.filter(game =>
        game.platforms && game.platforms.toLowerCase().includes('nintendo')
      );
      this.platformData.pc.allGamesForPlatform = this.allGamesCombined.filter(game =>
        game.platforms && game.platforms.toLowerCase().includes('pc')
      );

      // Exibe a primeira página para cada plataforma
      for (const key in this.platformData) {
        if (Object.prototype.hasOwnProperty.call(this.platformData, key)) {
          const platform: PlatformDisplayData = this.platformData[key as keyof typeof this.platformData];
          this.displayNextGamesForPlatform(platform);
        }
      }

      this.loading = false;
    } catch (err) {
      console.error('Erro detalhado em loadAllGamesAndInitializeDisplay:', err);
      this.error = err instanceof Error ? err.message : 'Erro ao carregar os jogos';
      this.loading = false;
      // this.hasMoreGames = false; // Não aplicável diretamente aqui, pois é por plataforma
    }
  }

  loadMore(platformName: 'playstation' | 'xbox' | 'nintendo' | 'pc') {
    const platform = this.platformData[platformName];
    if (!this.loading && platform.hasMore) {
      // this.loading = true; // Opcional: exibir spinner por plataforma
      this.displayNextGamesForPlatform(platform);
      // this.loading = false;
    }
  }

  private displayNextGamesForPlatform(platform: PlatformDisplayData) {
    const startIndex = platform.currentPage * platform.itemsPerPage;
    const endIndex = startIndex + platform.itemsPerPage;
    const gamesToDisplay = platform.allGamesForPlatform.slice(startIndex, endIndex);

    if (gamesToDisplay.length === 0) {
      platform.hasMore = false;
      return;
    }

    platform.games = [...platform.games, ...gamesToDisplay];
    platform.hasMore = platform.allGamesForPlatform.length > endIndex;
    platform.currentPage++;

    console.log(`Exibindo jogos para ${platform.name} - Página:`, platform.currentPage, 'Total exibido:', platform.games.length);
  }

  // Função para lidar com erro de carregamento de imagem
  handleImageError(event: any) {
    event.target.src = 'assets/img/games/default-game.jpg';
  }
}
