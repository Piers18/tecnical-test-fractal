import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/api';
import type { Product } from '../types';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.unit_price.toString());
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice.trim()) {
      setError('Name and price are required');
      return;
    }
    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      setError('');
      if (editingProduct) {
        await updateProduct(editingProduct.id, { name: formName, unit_price: price });
      } else {
        await createProduct({ name: formName, unit_price: price });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <span className="material-icons btn-icon">add</span> Add Product
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="alert-close" onClick={() => setError('')}>
            <span className="material-icons">close</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">inventory_2</span>
          <h3>No products yet</h3>
          <p>Add your first product to get started.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            Add Product
          </button>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Unit Price</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="table-row-hover">
                  <td>{product.id}</td>
                  <td><strong>{product.name}</strong></td>
                  <td className="price">${Number(product.unit_price).toFixed(2)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEdit(product)}
                        title="Edit product"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        className="btn btn-sm btn-ghost btn-ghost-danger"
                        onClick={() => setDeleteId(product.id)}
                        title="Delete product"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            type="text"
            className="form-input"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Unit Price ($)</label>
          <input
            type="number"
            className="form-input"
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingProduct ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This may affect existing orders."
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default Products;
