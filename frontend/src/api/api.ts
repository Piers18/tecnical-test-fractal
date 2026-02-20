import axios from 'axios';
import type { Product, Order, OrderDetail, OrderProduct, OrderStatus } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Products
export const getProducts = () => api.get<Product[]>('/products').then(res => res.data);
export const createProduct = (data: { name: string; unit_price: number }) =>
  api.post<Product>('/products', data).then(res => res.data);
export const updateProduct = (id: number, data: { name: string; unit_price: number }) =>
  api.put<Product>(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`).then(res => res.data);

// Orders
export const getOrders = () => api.get<Order[]>('/orders').then(res => res.data);
export const getOrder = (id: number) => api.get<OrderDetail>(`/orders/${id}`).then(res => res.data);
export const createOrder = (data: { order_number: string; date: string }) =>
  api.post<Order>('/orders', data).then(res => res.data);
export const updateOrder = (id: number, data: { order_number: string }) =>
  api.put<Order>(`/orders/${id}`, data).then(res => res.data);
export const deleteOrder = (id: number) =>
  api.delete(`/orders/${id}`).then(res => res.data);
export const updateOrderStatus = (id: number, status: OrderStatus) =>
  api.patch<Order>(`/orders/${id}/status`, { status }).then(res => res.data);

// Order Products
export const getOrderProducts = (orderId: number) =>
  api.get<OrderProduct[]>(`/orders/${orderId}/products`).then(res => res.data);
export const addOrderProduct = (orderId: number, data: { product_id: number; qty: number }) =>
  api.post<OrderProduct>(`/orders/${orderId}/products`, data).then(res => res.data);
export const updateOrderProduct = (orderId: number, productId: number, data: { qty: number }) =>
  api.put<OrderProduct>(`/orders/${orderId}/products/${productId}`, data).then(res => res.data);
export const removeOrderProduct = (orderId: number, productId: number) =>
  api.delete(`/orders/${orderId}/products/${productId}`).then(res => res.data);
