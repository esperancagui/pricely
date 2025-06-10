import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Adiciona headers para CORS
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      // Configuração para CORS
      withCredentials: false
    });

    // Interceptor para logging de requisições
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (environment.debug) {
          console.log('Requisição:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            headers: config.headers
          });
        }
        return config;
      },
      (error) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de respostas
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (environment.debug) {
          console.log('Resposta:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
            headers: response.headers
          });
        }
        return response;
      },
      (error: AxiosError) => {
        console.error('Erro na resposta:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          headers: error.response?.headers
        });

        // Tratamento específico para erros de CORS
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          console.error('Erro de CORS detectado. Verifique a configuração do servidor.');
        }

        // Tratamento específico para erros de autenticação
        if (error.response?.status === 401) {
          console.error('Erro de autenticação. Verifique as credenciais.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP básicos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.error(`Endpoint não encontrado: ${url}`);
        } else if (error.code === 'ECONNREFUSED') {
          console.error('Servidor não está respondendo. Verifique se o servidor está rodando.');
        } else if (error.message.includes('CORS')) {
          console.error('Erro de CORS. Verifique a configuração do servidor.');
        }
      }
      throw error;
    }
  }
} 