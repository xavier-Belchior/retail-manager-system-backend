import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// GET dashboard summary
router.get("/", async (req, res) => {
  try {
    const productsResult = await pool.query(`
      SELECT COUNT(*) AS total_products
      FROM products
    `);

    const salesResult = await pool.query(`
      SELECT
        COUNT(*) AS total_sales,
        COALESCE(SUM(total), 0) AS total_revenue
      FROM sales
    `);

    const todaySalesResult = await pool.query(`
      SELECT
        COUNT(*) AS sales_today,
        COALESCE(SUM(total), 0) AS revenue_today
      FROM sales
      WHERE created_at >= CURRENT_DATE
    `);

    const lowStockResult = await pool.query(`
      SELECT COUNT(*) AS low_stock
      FROM products
      WHERE stock <= min_stock
    `);

    res.json({
      total_products: Number(productsResult.rows[0].total_products),

      total_sales: Number(salesResult.rows[0].total_sales),

      total_revenue: Number(salesResult.rows[0].total_revenue),

      sales_today: Number(todaySalesResult.rows[0].sales_today),

      revenue_today: Number(todaySalesResult.rows[0].revenue_today),

      low_stock: Number(lowStockResult.rows[0].low_stock),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching dashboard data",
    });
  }
});

export default router;