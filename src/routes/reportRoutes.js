import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Sales report
router.get("/", async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    let query;

    if (period === "today") {
      query = `
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS total_sales,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM sales
        WHERE created_at >= CURRENT_DATE
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    } else if (period === "7d") {
      query = `
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS total_sales,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM sales
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    } else if (period === "30d") {
      query = `
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS total_sales,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM sales
        WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    } else if (period === "year") {
      query = `
        SELECT
          DATE_TRUNC('month', created_at) AS date,
          COUNT(*) AS total_sales,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM sales
        WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY date ASC
      `;
    } else {
      return res.status(400).json({
        message: "Invalid period. Use today, 7d, 30d or year",
      });
    }

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error fetching sales report",
    });
  }
});
export default router;