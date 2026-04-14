export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ProductResponse {
  data: Product[];
}

export interface ProductMutationResponse {
  message: string;
  data: Product;
}

export interface ProductDeleteResponse {
  message: string;
}
