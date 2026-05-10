export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Catalog {
  id: string;
  userId: string;
  name: string;
  description?: string;
  products: Product[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
export const catalogs: Catalog[] = [];
export const products: Product[] = [];