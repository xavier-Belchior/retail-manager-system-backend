import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// Get all customer
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM customers ORDER BY id DESC`);

    res.json(result.rows)
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching customers",
    });
  }
});


// Create customer
router.post('/', async(req, res)=>{
    try{
        const {name, phone, email}=req.body

        const result =await pool.query(
            `INSERT INTO customers (name, phone, email) 
            VALUES ($1, $2 ,$3) RETURNING *`, 
        [name, phone, email]
    )
        res.status(201).json(result.rows[0])
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"Error creating customer"
        })

    }
})

export default router
