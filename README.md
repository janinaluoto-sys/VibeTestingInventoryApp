# VibeTestingInventoryApp

🐴 **Equestrian Gear Inventory Management System**

A modern web application for managing inventory of horseback riding equipment and gear. Built with Node.js, Express, SQLite, and vanilla JavaScript with a beautiful, responsive UI.

## Features

- 📦 **Browse Products** - View all equestrian products with detailed information
- ➕ **Add Products** - Easy-to-use form for adding new items to inventory
- ✏️ **Edit Products** - Update product details including name, price, quantity, and description
- 🗑️ **Delete Products** - Remove items from inventory with confirmation
- 🔢 **Quantity Management** - Quick update of product quantities
- 🔍 **Search & Filter** - Search products and filter by category
- 📊 **Statistics Dashboard** - View total products, inventory value, and items in stock
- 🎨 **Modern UI** - Clean, professional design with equestrian theme

## Categories

- Saddles
- Footwear
- Safety Gear
- Apparel
- Tack
- Horse Care
- Training

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with CSS Grid and Flexbox

## Installation

1. Clone the repository:
```bash
git clone https://github.com/janinaluoto-sys/VibeTestingInventoryApp.git
cd VibeTestingInventoryApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3001
```

## Database

The application uses SQLite for data storage. On first run, it automatically:
- Creates a `products` table
- Populates the database with 20 sample horseback riding products

The database file (`inventory.db`) is created automatically in the project root directory.

## API Endpoints

### Get all products
```
GET /api/products
```

### Get single product
```
GET /api/products/:id
```

### Add new product
```
POST /api/products
Body: { name, category, price, quantity, description, image }
```

### Update product
```
PUT /api/products/:id
Body: { name, category, price, quantity, description, image }
```

### Update product quantity
```
PATCH /api/products/:id/quantity
Body: { quantity }
```

### Delete product
```
DELETE /api/products/:id
```

## Sample Data

The application comes pre-populated with 20 horseback riding products including:
- English, Western, and Dressage saddles
- Riding boots and paddock boots
- Safety helmets and vests
- Riding gloves and breeches
- Saddle pads and bridles
- Horse blankets and fly masks
- Grooming kits and hoof picks
- Training equipment and more

## Usage

### Adding a Product
1. Click the "Add New Product" button in the header
2. Fill in the product details (name, category, price, quantity, description, icon)
3. Click "Add Product"

### Editing a Product
1. Click the "Edit" button on any product card
2. Update the desired fields
3. Click "Update Product"

### Updating Quantity
1. Change the quantity in the input field on the product card
2. Click the "Update" button

### Deleting a Product
1. Click the "Delete" button on any product card
2. Confirm the deletion

### Searching and Filtering
- Use the search box to find products by name, description, or category
- Use the category dropdown to filter products by specific categories

## License

ISC

## Author

Janina Luoto Systems

