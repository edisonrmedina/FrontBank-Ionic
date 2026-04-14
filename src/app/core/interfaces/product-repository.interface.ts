import { Observable } from 'rxjs';
import { Product, ProductDeleteResponse, ProductMutationResponse, ProductResponse } from '../models/product.model';

/**
 * ISP + DIP: Interfaz abstracta del repositorio de productos.
 * Los consumidores dependen de esta abstracción, no de la implementación HTTP concreta.
 */
export abstract class ProductRepository {
  abstract getAll(): Observable<ProductResponse>;
  abstract getById(id: string): Observable<Product>;
  abstract create(product: Product): Observable<ProductMutationResponse>;
  abstract update(id: string, product: Partial<Product>): Observable<ProductMutationResponse>;
  abstract delete(id: string): Observable<ProductDeleteResponse>;
  abstract verifyId(id: string): Observable<boolean>;
}
