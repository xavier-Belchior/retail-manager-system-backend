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
import authRoutes from "./routes/authRoutes.js"
import authenticateToken from "./middleware/authMiddleware.js"

const app=express()
const PORT=process.env.PORT || 4000


app.use(cors())
app.use(express.json())

// API health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// ROUTES 

// authRoutes
app.use("/api/auth", authRoutes)

// protect the remain API routes.
app.use("/api", authenticateToken)
// get product
app.use('/api/products',productRoutes)
// add product
app.use('/api/products/create',productRoutes)
//update and delete products and barcode
app.use('/api/products/',productRoutes)
// Get all categories
app.use('/api/categories', categorieRoutes)

// Get all suppliers
app.use('/api/suppliers', supplierRoutes)

// Get inventory
app.use('/api/inventory', inventoryRoutes)
app.use('/api/inventory/adjust', inventoryRoutes)

// Get all customers
app.use('/api/customers', customerRoutes)

// Get all sales
app.use('/api/sales', saleRoutes)
app.use('/api/sales/:id', saleRoutes)
app.use('/api/sales/create', saleRoutes)

// Gell dashbordDatas
app.use("/api/dashboard", dashboardRoutes);
// Get Report Sales
app.use("/api/reports/sales", reportRoutes);

app.listen(PORT, ()=> console.log('API is running on port '+ PORT))