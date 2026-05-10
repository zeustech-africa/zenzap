import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { products, catalogs, Product, Catalog } from '../models/Catalog';

const router = express.Router();
const upload = multer({ dest: 'uploads/csv/' });

// Get all products for user
router.get('/catalog/products', (req, res) => {
  const userId = req.query.userId as string;
  const userProducts = products.filter(p => p.userId === userId);
  res.json(userProducts);
});

// Get single product
router.get('/catalog/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Create product (manual entry)
router.post('/catalog/products', (req, res) => {
  const { userId, name, description, price, currency, imageUrl, category, stock } = req.body;
  
  const newProduct: Product = {
    id: uuidv4(),
    userId,
    name,
    description: description || '',
    price: parseFloat(price),
    currency: currency || 'ZAR',
    imageUrl,
    category: category || 'General',
    stock: parseInt(stock) || 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Bulk upload via CSV (Simplified)
router.post('/catalog/upload', upload.single('file'), (req, res) => {
  const userId = req.body.userId;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const results: any[] = [];
  const filePath = file.path;
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const newProducts: Product[] = [];
      
      for (const row of results) {
        const newProduct: Product = {
          id: uuidv4(),
          userId,
          name: row.name || row.product_name,
          description: row.description || '',
          price: parseFloat(row.price || row.cost || 0),
          currency: row.currency || 'ZAR',
          imageUrl: row.image_url || row.image,
          category: row.category || 'General',
          stock: parseInt(row.stock) || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newProducts.push(newProduct);
        products.push(newProduct);
      }
      
      // Cleanup temp file
      fs.unlinkSync(filePath);
      
      res.json({ 
        success: true, 
        count: newProducts.length,
        products: newProducts,
        message: `Imported ${newProducts.length} products`
      });
    });
});

// Update product
router.put('/catalog/products/:id', (req, res) => {
  const { name, description, price, currency, imageUrl, category, stock, isActive } = req.body;
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (currency !== undefined) product.currency = currency;
  if (imageUrl !== undefined) product.imageUrl = imageUrl;
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = parseInt(stock);
  if (isActive !== undefined) product.isActive = isActive;
  product.updatedAt = new Date().toISOString();
  
  res.json(product);
});

// Delete product
router.delete('/catalog/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products.splice(index, 1);
  res.json({ success: true });
});

// Get catalog (grouped by category)
router.get('/catalog', (req, res) => {
  const userId = req.query.userId as string;
  const userProducts = products.filter(p => p.userId === userId && p.isActive);
  
  const grouped = userProducts.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
  
  res.json(grouped);
});

export default router;