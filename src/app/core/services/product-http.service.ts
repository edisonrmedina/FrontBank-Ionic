import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductDeleteResponse, ProductMutationResponse, ProductResponse } from '../models/product.model';
import { ProductRepository } from '../interfaces/product-repository.interface';
import { environment } from '../../../environments/environment';

/**
 * SRP: Solo se encarga de la comunicación HTTP con la API de productos.
 * DIP: Implementa la abstracción ProductRepository.
 */
@Injectable({ providedIn: 'root' })
export class ProductHttpService extends ProductRepository {
  private readonly baseUrl = `${environment.apiUrl}/bp/products`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAll(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.baseUrl);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(product: Product): Observable<ProductMutationResponse> {
    return this.http.post<ProductMutationResponse>(this.baseUrl, product);
  }

  update(id: string, product: Partial<Product>): Observable<ProductMutationResponse> {
    return this.http.put<ProductMutationResponse>(`${this.baseUrl}/${id}`, product);
  }

  delete(id: string): Observable<ProductDeleteResponse> {
    return this.http.delete<ProductDeleteResponse>(`${this.baseUrl}/${id}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }
}
