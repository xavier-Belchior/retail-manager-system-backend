import express from "express"
import pool from "../db/db.js"



const router=express.Router()

// Get inventory
router.get("/",async(req, res)=>{
    try{
        const result=await pool.query(`
            SELECT p.id,
            p.name,
            p.sku,
            p.price,
            p.stock,
            p.min_stock,
            c.name AS category,
            s.name AS supplier
            FROM products p LEFT JOIN categories c ON p.category_id=c.id 
            LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.id`)

        res.json({
            message:"Inventory fetched successfully",
            product:result.rows
        })
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"Error fetching inventory"
        })
    }
})

// Adjust product stock

router.post('/adjust-stock', async(req, res)=>{
    try{
        const {product_id, quantity}=req.body


        if(!product_id || quantity  === undefined){
            return res.status(400).json({
                message:"product_id and quantity are required"
            })
        }

        const result=await pool.query( `
            UPDATE products SET stock = stock + $1, updated_at=CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [quantity, product_id])
            

            if(result.rows.length === 0){
                return res.status(404).json({
                    message:"Product not found"
                })
            }
        res.json({
            message:"Stock adjusted successfully",
            product:result.rows[0]
        })
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"Error adjusting stock"
        })
    }
})

export default router