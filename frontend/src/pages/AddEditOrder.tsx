import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOrder,
  createOrder,
  updateOrder,
  getProducts,
  addOrderProduct,
  updateOrderProduct,
  removeOrderProduct,
} from '../api/api';
import type { Product, OrderProduct } from '../types';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const AddEditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  const orderId = isEdit ? parseInt(id!) : null;

  const [orderNumber, setOrderNumber] = useState('');
  const [date, setDate] = useState(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  );
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OrderProduct | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedQty, setSelectedQty] = useState<number>(1);

  // Delete product modal state
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
    if (isEdit && orderId) {
      loadOrder(orderId);
    }
  }, [id]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setAllProducts(data);
      if (data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch {
      setError('Failed to load products');
    }
  };

  const loadOrder = async (oid: number) => {
    try {
      setLoading(true);
      const data = await getOrder(oid);
      setOrderNumber(data.order_number);
      setDate(
        new Date(data.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      );
      setOrderProducts(data.products || []);
      setIsCompleted(data.status === 'Completed');
    } catch {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const numProducts = orderProducts.reduce((sum, p) => sum + p.qty, 0);
  const finalPrice = orderProducts.reduce((sum, p) => sum + Number(p.total_price), 0);

  const handleSave = async () => {
    if (!orderNumber.trim()) {
      setError('Order number is required');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (isEdit && orderId) {
        await updateOrder(orderId, { order_number: orderNumber });
      } else {
        const newOrder = await createOrder({
          order_number: orderNumber,
          date: new Date().toISOString().split('T')[0],
        });
        // Add all products to the new order
        for (const op of orderProducts) {
          await addOrderProduct(newOrder.id, {
            product_id: op.product_id,
            qty: op.qty,
          });
        }
      }
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setSelectedQty(1);
    // Default to first product not already in the order
    const usedIds = orderProducts.map(op => op.product_id);
    const available = allProducts.filter(p => !usedIds.includes(p.id));
    if (available.length > 0) {
      setSelectedProductId(available[0].id);
    } else if (allProducts.length > 0) {
      setSelectedProductId(allProducts[0].id);
    }
    setShowProductModal(true);
  };

  const openEditProduct = (op: OrderProduct) => {
    setEditingProduct(op);
    setSelectedProductId(op.product_id);
    setSelectedQty(op.qty);
    setShowProductModal(true);
  };

  const handleProductConfirm = async () => {
    if (selectedQty < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    const product = allProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    if (isEdit && orderId) {
      // Directly call API for existing orders
      try {
        if (editingProduct) {
          await updateOrderProduct(orderId, selectedProductId, { qty: selectedQty });
        } else {
          await addOrderProduct(orderId, { product_id: selectedProductId, qty: selectedQty });
        }
        await loadOrder(orderId);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update product');
      }
    } else {
      // For new orders, manage in local state
      if (editingProduct) {
        setOrderProducts(prev =>
          prev.map(op =>
            op.product_id === editingProduct.product_id
              ? {
                  ...op,
                  qty: selectedQty,
                  total_price: selectedQty * product.unit_price,
                }
              : op
          )
        );
      } else {
        const existing = orderProducts.find(op => op.product_id === selectedProductId);
        if (existing) {
          setError('Product already added. Edit it instead.');
          setShowProductModal(false);
          return;
        }
        setOrderProducts(prev => [
          ...prev,
          {
            id: Date.now(),
            order_id: 0,
            product_id: product.id,
            qty: selectedQty,
            product_name: product.name,
            unit_price: product.unit_price,
            total_price: selectedQty * product.unit_price,
          },
        ]);
      }
    }
    setShowProductModal(false);
  };

  const handleRemoveProduct = async (productId: number) => {
    if (isEdit && orderId) {
      try {
        await removeOrderProduct(orderId, productId);
        await loadOrder(orderId);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to remove product');
      }
    } else {
      setOrderProducts(prev => prev.filter(op => op.product_id !== productId));
    }
  };

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  const availableProducts = allProducts.filter(
    p => !orderProducts.some(op => op.product_id === p.id) || editingProduct?.product_id === p.id
  );

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <span className="material-icons title-icon">
            {isCompleted ? 'visibility' : isEdit ? 'edit_note' : 'add_circle'}
          </span>
          {isCompleted ? 'View Order' : isEdit ? 'Edit Order' : 'Add Order'}
        </h1>
        <button className="btn btn-secondary" onClick={() => navigate('/my-orders')}>
          <span className="material-icons btn-icon">arrow_back</span> Back to Orders
        </button>
      </div>

      {isCompleted && (
        <div className="alert alert-warning">
          <span className="material-icons alert-icon">lock</span>
          This order is completed and cannot be modified.
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="alert-close" onClick={() => setError('')}>
            <span className="material-icons">close</span>
          </button>
        </div>
      )}

      <div className="form-card glass-card">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Order #</label>
            <input
              type="text"
              className="form-input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number"
              disabled={isCompleted}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="text"
              className="form-input"
              value={date}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label"># Products</label>
            <input
              type="text"
              className="form-input"
              value={numProducts}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Final Price</label>
            <input
              type="text"
              className="form-input"
              value={`$${finalPrice.toFixed(2)}`}
              disabled
            />
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Order Products</h2>
        {!isCompleted && (
          <button className="btn btn-primary btn-sm" onClick={openAddProduct}>
            <span className="material-icons btn-icon">add</span> Add Product
          </button>
        )}
      </div>

      {orderProducts.length === 0 ? (
        <div className="empty-state small">
          <span className="material-icons empty-icon">shopping_cart</span>
          <p>No products added yet.</p>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Total Price</th>
                {!isCompleted && <th>Options</th>}
              </tr>
            </thead>
            <tbody>
              {orderProducts.map(op => (
                <tr key={op.product_id} className="table-row-hover">
                  <td>{op.product_id}</td>
                  <td><strong>{op.product_name}</strong></td>
                  <td className="price">${Number(op.unit_price).toFixed(2)}</td>
                  <td>{op.qty}</td>
                  <td className="price">${Number(op.total_price).toFixed(2)}</td>
                  {!isCompleted && (
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => openEditProduct(op)}
                          title="Edit quantity"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="btn btn-sm btn-ghost btn-ghost-danger"
                          onClick={() => setDeleteProductId(op.product_id)}
                          title="Remove product"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isCompleted && (
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/my-orders')}>
            Cancel
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            <span className="material-icons btn-icon">{saving ? 'hourglass_empty' : 'save'}</span>
            {saving ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <div className="form-group">
          <label className="form-label">Product</label>
          <select
            className="form-input"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
            disabled={!!editingProduct}
          >
            {(editingProduct ? allProducts : availableProducts).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ${Number(p.unit_price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            className="form-input"
            value={selectedQty}
            onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleProductConfirm}>
            {editingProduct ? 'Update' : 'Add'}
          </button>
        </div>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteProductId !== null}
        onClose={() => setDeleteProductId(null)}
        onConfirm={() => deleteProductId && handleRemoveProduct(deleteProductId)}
        title="Remove Product"
        message="Are you sure you want to remove this product from the order?"
        confirmText="Remove"
        danger
      />
    </div>
  );
};

export default AddEditOrder;
