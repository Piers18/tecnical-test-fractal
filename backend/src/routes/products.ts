import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET all products
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, unit_price } = req.body;
    if (!name || unit_price == null) {
      return res.status(400).json({ error: 'Name and unit_price are required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO products (name, unit_price) VALUES ($1, $2) RETURNING *',
      [name, unit_price]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, unit_price } = req.body;
    if (!name || unit_price == null) {
      return res.status(400).json({ error: 'Name and unit_price are required' });
    }
    const { rows } = await pool.query(
      'UPDATE products SET name = $1, unit_price = $2 WHERE id = $3 RETURNING *',
      [name, unit_price, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
