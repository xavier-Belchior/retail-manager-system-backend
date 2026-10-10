import express from "express";
import pool from "../db/db.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.category_id,
        c.name AS category,
        p.price,
        p.stock,
        p.min_stock,
        p.supplier_id,
        s.name AS supplier,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to fetch products",
    });
  }
});
// Create product
router.post("/create", async (req, res) => {
  try {
    const {
      name,
      sku,
      barcode,
      category_id,
      supplier_id,
      price,
      stock,
      min_stock,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, sku, barcode, category_id, supplier_id, price, stock, min_stock) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
      [name, sku, barcode, category_id, supplier_id, price, stock, min_stock],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: " Error to create product",
    });
  }
});

// GET product by barcode
router.get("/barcode/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE barcode  = $1",
      [barcode],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to fetch product by barcode",
    });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: " Error to fetch product by id",
    });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      barcode,
      category_id,
      supplier_id,
      price,
      stock,
      min_stock,
    } = req.body;

    const result = await pool.query(
      `UPDATE products SET  name=$1, sku=$2, barcode=$3, category_id=$4, supplier_id=$5, price=$6, stock=$7, min_stock=$8,
       updated_at=CURRENT_TIMESTAMP WHERE id=$9 RETURNING *`,

      [
        name,
        sku,
        barcode,
        category_id,
        supplier_id,
        price,
        stock,
        min_stock,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: " Error updating product",
    });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM products WHERE id=$1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting product",
    });
  }
});

export default router;
