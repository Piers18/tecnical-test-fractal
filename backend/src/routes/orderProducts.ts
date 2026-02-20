import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router({ mergeParams: true });

// GET products in an order
router.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
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
    res.json(rows);
  } catch (error) {
    console.error('Error fetching order products:', error);
    res.status(500).json({ error: 'Failed to fetch order products' });
  }
});

// POST add product to order
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if order is completed
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot modify a completed order' });
    }

    const { product_id, qty } = req.body;
    if (!product_id || !qty || qty < 1) {
      return res.status(400).json({ error: 'product_id and qty (>= 1) are required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO order_products (order_id, product_id, qty) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, product_id, qty]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Product already added to this order. Use PUT to update quantity.' });
    }
    console.error('Error adding product to order:', error);
    res.status(500).json({ error: 'Failed to add product to order' });
  }
});

// PUT update product qty in order
router.put('/:productId', async (req: Request, res: Response) => {
  try {
    // Check if order is completed
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot modify a completed order' });
    }

    const { qty } = req.body;
    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'qty (>= 1) is required' });
    }

    const { rows } = await pool.query(
      'UPDATE order_products SET qty = $1 WHERE order_id = $2 AND product_id = $3 RETURNING *',
      [qty, req.params.id, req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in this order' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating order product:', error);
    res.status(500).json({ error: 'Failed to update order product' });
  }
});

// DELETE remove product from order
router.delete('/:productId', async (req: Request, res: Response) => {
  try {
    // Check if order is completed
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status === 'Completed') {
      return res.status(403).json({ error: 'Cannot modify a completed order' });
    }

    const { rows } = await pool.query(
      'DELETE FROM order_products WHERE order_id = $1 AND product_id = $2 RETURNING *',
      [req.params.id, req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in this order' });
    }
    res.json({ message: 'Product removed from order' });
  } catch (error) {
    console.error('Error removing product from order:', error);
    res.status(500).json({ error: 'Failed to remove product from order' });
  }
});

export default router;
