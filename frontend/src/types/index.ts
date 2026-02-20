export type OrderStatus = 'Pending' | 'InProgress' | 'Completed';

export interface Product {
  id: number;
  name: string;
  unit_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  date: string;
  status: OrderStatus;
  num_products: number;
  final_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  product_name: string;
  unit_price: number;
  total_price: number;
}

export interface OrderDetail extends Order {
  products: OrderProduct[];
}
