import express from "express"
import pool from "../db/db.js";



const router=express.Router()


// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suppliers");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error to fetch suppliers",
    });
  }
});

export default router