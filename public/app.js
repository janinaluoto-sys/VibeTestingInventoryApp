const API_URL = 'http://localhost:3001/api/products';

let allProducts = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load all products from API
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        allProducts = await response.json();
        displayProducts(allProducts);
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = `
            <div class="empty-state">
                <h2>⚠️ Error Loading Products</h2>
                <p>Please make sure the server is running on port 3001</p>
            </div>
        `;
    }
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h2>📦 No Products Found</h2>
                <p>Add some products to get started!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-icon">${product.image}</div>
            <div class="product-header">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <span class="product-category">${escapeHtml(product.category)}</span>
            </div>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <div class="product-details">
                <div class="detail-item">
                    <div class="detail-label">Price</div>
                    <div class="detail-value">$${product.price.toFixed(2)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">In Stock</div>
                    <div class="detail-value ${product.quantity < 20 ? 'low-stock' : 'in-stock'}">
                        ${product.quantity}
                    </div>
                </div>
            </div>
            <div class="quantity-control">
                <label>Quantity:</label>
                <input type="number" 
                       id="qty-${product.id}" 
                       value="${product.quantity}" 
                       min="0">
                <button class="btn btn-success" onclick="updateQuantity(${product.id})">
                    Update
                </button>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="openEditModal(${product.id})">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalProducts = allProducts.length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalItems = allProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('totalItems').textContent = totalItems;
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    displayProducts(filtered);
}

// Add new product
async function addProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        description: formData.get('description') || '',
        image: formData.get('image') || '📦'
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Failed to add product');
        
        closeAddModal();
        form.reset();
        await loadProducts();
        showNotification('Product added successfully!', 'success');
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Failed to add product', 'error');
    }
}

// Update product
async function updateProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const id = formData.get('id');
    const product = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        description: formData.get('description') || '',
        image: formData.get('image') || '📦'
    };
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        closeEditModal();
        await loadProducts();
        showNotification('Product updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Failed to update product', 'error');
    }
}

// Update product quantity
async function updateQuantity(id) {
    const input = document.getElementById(`qty-${id}`);
    const quantity = parseInt(input.value);
    
    if (isNaN(quantity) || quantity < 0) {
        showNotification('Please enter a valid quantity', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}/quantity`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) throw new Error('Failed to update quantity');
        
        await loadProducts();
        showNotification('Quantity updated!', 'success');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Failed to update quantity', 'error');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        await loadProducts();
        showNotification('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// Modal functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
}

function openEditModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    const form = document.getElementById('editProductForm');
    form.elements['id'].value = product.id;
    form.elements['name'].value = product.name;
    form.elements['category'].value = product.category;
    form.elements['price'].value = product.price;
    form.elements['quantity'].value = product.quantity;
    form.elements['description'].value = product.description;
    form.elements['image'].value = product.image;
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    
    if (event.target === addModal) {
        closeAddModal();
    }
    if (event.target === editModal) {
        closeEditModal();
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#2e7d32' : '#c62828'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
