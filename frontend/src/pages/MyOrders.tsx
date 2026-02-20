import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, updateOrderStatus } from '../api/api';
import type { Order, OrderStatus } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const statusColors: Record<OrderStatus, string> = {
  Pending: 'status-pending',
  InProgress: 'status-inprogress',
  Completed: 'status-completed',
};

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete order');
    }
  };

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <button className="btn btn-primary" onClick={() => navigate('/add-order/new')}>
          <span className="material-icons btn-icon">add</span> Add Order
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
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons empty-icon">assignment</span>
          <h3>No orders yet</h3>
          <p>Create your first order to get started.</p>
          <button className="btn btn-primary" onClick={() => navigate('/add-order/new')}>
            Create Order
          </button>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order #</th>
                <th>Date</th>
                <th># Products</th>
                <th>Final Price</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="table-row-hover">
                  <td>{order.id}</td>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{formatDate(order.date)}</td>
                  <td>{order.num_products}</td>
                  <td className="price">${Number(order.final_price).toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-select ${statusColors[order.status]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={order.status === 'Completed'}
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => navigate(`/add-order/${order.id}`)}
                        title={order.status === 'Completed' ? 'View Order' : 'Edit Order'}
                      >
                        <span className="material-icons">
                          {order.status === 'Completed' ? 'visibility' : 'edit'}
                        </span>
                      </button>
                      <button
                        className="btn btn-sm btn-ghost btn-ghost-danger"
                        onClick={() => setDeleteId(order.id)}
                        disabled={order.status === 'Completed'}
                        title="Delete Order"
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

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default MyOrders;
