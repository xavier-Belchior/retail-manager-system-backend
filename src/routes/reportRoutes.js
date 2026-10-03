import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Sales report
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_sales,
        COALESCE(SUM(total), 0) AS total_revenue
      FROM sales
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching sales report",
    });
  }
});

export default router;