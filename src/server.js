import express from "express"
import cors from "cors"
import pool from "./db/db.js"


const app=express()
const PORT=process.env.PORT || 4000


app.use(cors())
app.use(express.json())

// ROUTES 

// GET all products
app.get('/api/products', async(req, res)=>{
    try{
        const result =await pool.query('SELECT * FROM products')
        res.json(result.rows)
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"Error to fetch products from the database"
        })
    }
})

app.listen(PORT, ()=> console.log('API is running on port '+ PORT))