export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number | null;
  category_id?: string | null;
  category?: Category | null;
  stock: number;
  colors: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  created_at?: string;
};

export type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  category_id?: string | null;
  stock: number;
  colors: string[];
  images: string[];
  featured: boolean;
  active: boolean;
};
