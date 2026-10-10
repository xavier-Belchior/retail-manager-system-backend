import express from "express";
import pool from "../db/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id,
         s.total, 
         s.payment_method,
          s.status, 
          s.created_at, 
          c.name AS customer
             FROM sales s  
             LEFT JOIN customers c ON s.customer_id = c.id
             ORDER BY s.created_at DESC `,
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching sales",
    });
  }
});



router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { customer_id, payment_method, items } = req.body;

    if (!payment_method || !items || items.length === 0) {
      return res.status(400).json({
        message: "payment_method and items are required",
      });
    }

    await client.query("BEGIN");

    let total = 0;
    const saleItems = [];

    // 1. Get products
    for (const item of items) {
      const { product_id, quantity } = item;

      const productResult = await client.query(
        `SELECT id, name, price, stock
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${product_id} not found`);
      }

      const product = productResult.rows[0];

      if (product.stock < quantity) {
        throw new Error(
          `Not enough stock for ${product.name}. Available: ${product.stock}`
        );
      }

      const subtotal = Number(product.price) * quantity;

      total += subtotal;

      saleItems.push({
        product_id: product.id,
        quantity,
        unit_price: product.price,
        subtotal,
      });
    }

    // 2. Create sale
    const saleResult = await client.query(
      `INSERT INTO sales
        (customer_id, total, payment_method)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [customer_id || null, total, payment_method]
    );

    // IMPORTANT
    const sale = saleResult.rows[0];

    // 3. Create sale items + decrease stock
    for (const item of saleItems) {
      await client.query(
        `INSERT INTO sale_items
          (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          sale.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
        ]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Sale created successfully",
      sale: sale,
      items: saleItems,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: error.message || "Error creating sale",
    });
  } finally {
    client.release();
  }
});

// GET sale by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const saleResult = await pool.query(
      `
      SELECT
        s.id,
        s.total,
        s.payment_method,
        s.status,
        s.created_at,
        c.name AS customer
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        si.id,
        si.product_id,
        p.name AS product,
        si.quantity,
        si.unit_price,
        si.subtotal
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = $1
      `,
      [id]
    );

    res.json({
      sale: saleResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching sale",
    });
  }
});
export default router;
