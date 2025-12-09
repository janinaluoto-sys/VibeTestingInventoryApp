const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new Database('inventory.db');

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    description TEXT,
    image TEXT
  )
`);

// Check if database is empty and populate with sample data
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, quantity, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts = [
    ['English Saddle Premium', 'Saddles', 899.99, 12, 'High-quality leather English saddle, adjustable stirrups, multiple sizes', '🏇'],
    ['Western Saddle Classic', 'Saddles', 1299.99, 8, 'Hand-tooled leather Western saddle with silver accents', '🤠'],
    ['Dressage Saddle Pro', 'Saddles', 1499.99, 5, 'Professional dressage saddle, deep seat, extended billets', '🏇'],
    ['Leather Riding Boots', 'Footwear', 249.99, 35, 'Premium leather tall boots, waterproof, reinforced heel', '👢'],
    ['Paddock Boots', 'Footwear', 129.99, 48, 'Comfortable paddock boots, elastic side panels, lace-up', '👞'],
    ['Riding Helmet Safety Pro', 'Safety Gear', 179.99, 42, 'SEI-certified, adjustable fit, ventilated design', '🪖'],
    ['Safety Vest', 'Safety Gear', 159.99, 28, 'Impact-absorbing protective vest, adjustable straps', '🦺'],
    ['Leather Riding Gloves', 'Apparel', 45.99, 67, 'Flexible leather gloves, reinforced palm, touchscreen compatible', '🧤'],
    ['Breeches Competition', 'Apparel', 89.99, 55, 'Professional riding breeches, knee patches, multiple colors', '👖'],
    ['Saddle Pad All-Purpose', 'Tack', 59.99, 73, 'Quilted cotton saddle pad, moisture-wicking, machine washable', '🎯'],
    ['Bridle Leather Complete', 'Tack', 179.99, 22, 'Premium leather bridle with reins, brass hardware', '🐴'],
    ['Horse Blanket Medium', 'Horse Care', 119.99, 31, 'Waterproof turnout blanket, 200g fill, tail strap', '🧥'],
    ['Fly Mask UV Protection', 'Horse Care', 34.99, 95, 'Mesh fly mask with UV protection, comfortable fit', '😎'],
    ['Grooming Kit Complete', 'Horse Care', 49.99, 58, '8-piece grooming set with brushes, hoof pick, carrying case', '🧹'],
    ['Hoof Pick with Brush', 'Horse Care', 12.99, 125, 'Durable hoof pick with stiff brush, ergonomic handle', '🔧'],
    ['Lead Rope Heavy Duty', 'Tack', 24.99, 89, '10ft lead rope with panic snap, weather-resistant', '🪢'],
    ['Riding Crop', 'Training', 18.99, 104, 'Flexible riding crop, leather grip, wrist loop', '🏏'],
    ['Lunging Whip', 'Training', 39.99, 45, 'Professional lunging whip with long lash, balanced design', '〰️'],
    ['Bit Snaffle Stainless', 'Tack', 54.99, 62, 'Stainless steel snaffle bit, smooth mouthpiece, various sizes', '⭕'],
    ['Stirrups Safety Release', 'Tack', 79.99, 38, 'Safety stirrups with quick-release mechanism, stainless steel', '🔄']
  ];

  const insertMany = db.transaction((products) => {
    for (const product of products) {
      insert.run(...product);
    }
  });

  insertMany(sampleProducts);
  console.log('Database populated with 20 sample products');
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  try {
    const { name, category, price, quantity, description, image } = req.body;
    
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insert = db.prepare(`
      INSERT INTO products (name, category, price, quantity, description, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(name, category, price, quantity, description || '', image || '📦');
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { name, category, price, quantity, description, image } = req.body;
    
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const update = db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, price = ?, quantity = ?, description = ?, image = ?
      WHERE id = ?
    `);
    
    const result = update.run(name, category, price, quantity, description, image, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product quantity
app.patch('/api/products/:id/quantity', (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    
    const update = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
    const result = update.run(quantity, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/products`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
