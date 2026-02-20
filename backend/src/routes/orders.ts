import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET all orders (with product count and total price)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.date,
        o.status,
        o.created_at,
        o.updated_at,
        COALESCE(SUM(op.qty), 0)::int AS num_products,
        COALESCE(SUM(op.qty * p.unit_price), 0)::numeric(10,2) AS final_price
      FROM orders o
      LEFT JOIN order_products op ON o.id = op.order_id
      LEFT JOIN products p ON op.product_id = p.id
      GROUP BY o.id
      ORDER BY o.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order with its products
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const productsResult = await pool.query(`
      SELECT 
        op.id,
        op.order_id,
        op.product_id,
        op.qty,
        p.name AS product_name,
        p.unit_price,
        (op.qty * p.unit_price)::numeric(10,2) AS total_price
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = $1
      ORDER BY op.id
    `, [req.params.id]);

    res.json({
      ...orderResult.rows[0],
      products: productsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST create order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { order_number, date } = req.body;
    if (!order_number) {
      return res.status(400).json({ error: 'order_number is required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO orders (order_number, date) VALUES ($1, $2) RETURNING *',
      [order_number, date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Order number already exists' });
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // Check if order is completed
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot modify a completed order' });
    }

    const { order_number } = req.body;
    if (!order_number) {
      return res.status(400).json({ error: 'order_number is required' });
    }
    const { rows } = await pool.query(
      'UPDATE orders SET order_number = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [order_number, req.params.id]
    );
    res.json(rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Order number already exists' });
    }
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// PATCH update order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'InProgress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: Pending, InProgress, or Completed' });
    }

    // Check current status
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot modify a completed order' });
    }

    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// DELETE order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Check if order is completed
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot delete a completed order' });
    }

    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
