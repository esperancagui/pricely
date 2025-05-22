export const environment = {
  production: true,
  apiUrl: 'https://api.pricely.com/api', // Substitua pela URL real da sua API em produção
  version: '1.0.0',
  appName: 'Pricely',
  debug: false,
  // Configurações específicas de produção
  features: {
    enableDebugTools: false,
    enableLogging: false,
    enableMockData: false
  }
}; 