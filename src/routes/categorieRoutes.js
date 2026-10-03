import express from "express"
import pool from "../db/db.js";

const router= express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to fetch categories from the database",
    });
  }
});

export default router
