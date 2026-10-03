import express from "express"
import cors from "cors"
import productRoutes from './routes/productRoutes.js'
import categorieRoutes from './routes/categorieRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import saleRoutes from "./routes/saleRoutes.js"
import dashboardRoutes from "./routes/dashbordRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"



const app=express()
const PORT=process.env.PORT || 4000


app.use(cors())
app.use(express.json())

// ROUTES 

// GET all products
app.use('/api/products',productRoutes)
app.use('/api/products/create',productRoutes)
app.use('/api/products/:id',productRoutes)
app.use('/api/products/barcode/:barcode',productRoutes)
// Get all categories
app.use('/api/categories', categorieRoutes)

// Get all suppliers
app.use('/api/suppliers', supplierRoutes)

// Get inventory
app.use('/api/inventory', inventoryRoutes)
app.use('/api/inventory/adjust-stock', inventoryRoutes)

// Get all customers
app.use('/api/customers', customerRoutes)
app.use('/api/customers/create', customerRoutes)

// Get all sales
app.use('/api/sales', saleRoutes)
app.use('/api/sales/:id', saleRoutes)
app.use('/api/sales/create', saleRoutes)

// Gell dashbordDatas
app.use("/api/dashboard", dashboardRoutes);
// Get Report Sales
app.use("/api/reports/sales", reportRoutes);

app.listen(PORT, ()=> console.log('API is running on port '+ PORT))