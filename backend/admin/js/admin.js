// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');

    if (isLoggedIn === 'true') {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        loadDashboardMetrics();
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        checkAuth();
    } else {
        alert('Invalid credentials! Please use admin/admin123');
    }
}

// Logout function
function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    checkAuth();
}

console.log(JSON.parse(localStorage.getItem('products')));

// Initialize local storage with sample data if empty
// Initialize local storage with sample data if empty
function initializeLocalStorage() {
    // Products are handled by data.js now
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
}

// ... (DOM Elements and Navigation remain same) ...

// Helper to populate category select
function populateCategorySelect(selectedCategory = '') {
    const categorySelect = document.getElementById('product-category');
    if (!categorySelect) return;

    // categories is globally available from data.js
    // Filter out 'All' as it's not a valid category for a single product
    const validCategories = categories.filter(c => c !== 'All');

    categorySelect.innerHTML = validCategories
        .map(c => `<option value="${c}" ${c === selectedCategory ? 'selected' : ''}>${c}</option>`)
        .join('');
}

function openAddProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';

    populateCategorySelect(); // Populate with default/first option

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];

    document.getElementById('product-id').value = index;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;

    populateCategorySelect(product.category); // Populate and select current category

    document.getElementById('product-image').value = product.imageUrl || '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function saveProduct() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productId = document.getElementById('product-id').value;

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        imageUrl: document.getElementById('product-image').value
    };

    if (productId === '') {
        products.push(productData);
        addNotification('New product added: ' + productData.name, 'fa-box');
    } else {
        products[parseInt(productId)] = productData;
        addNotification('Product updated: ' + productData.name, 'fa-box');
    }

    localStorage.setItem('products', JSON.stringify(products));
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
    loadDashboardMetrics();
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productName = products[index].name;
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        addNotification('Product deleted: ' + productName, 'fa-trash');
        loadProducts();
        loadDashboardMetrics();
    }
}

// Toggle product stock between in stock and out of stock
function toggleStock(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products[index];
    if (!product) return;

    if (product.stock > 0) {
        product.stock = 0;
        addNotification('Product marked as out of stock: ' + product.name, 'fa-box');
        showToast('Product marked as Out of Stock', 'warning');
    } else {
        product.stock = 1;
        addNotification('Product marked as in stock: ' + product.name, 'fa-box');
        showToast('Product marked as In Stock', 'success');
    }

    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    loadDashboardMetrics();
}

// Handle Image Error
function handleImageError(img) {
    if (img.getAttribute('data-error-handled')) return;
    img.setAttribute('data-error-handled', 'true');
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22%23f3f4f6%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22ui-sans-serif%2C%20system-ui%2C%20sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%3Eno%20image%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.style.opacity = '0.5';
}

function getValidImage(imageUrl) {
    if (!imageUrl || imageUrl.trim() === '') {
        return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20fill%3D%22%23f3f4f6%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22ui-sans-serif%2C%20system-ui%2C%20sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%239ca3af%22%3Eno%20image%3C%2Ftext%3E%3C%2Fsvg%3E';
    }
    return imageUrl;
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
    return container;
}

// Expose functions to window for HTML onclick access
window.toggleStock = toggleStock;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Order Management Functions
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersContainer = document.getElementById('orders-container');

    ordersContainer.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Orders Management</h5>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" onclick="filterOrders('all')">All</button>
                    <button class="btn btn-outline-warning btn-sm" onclick="filterOrders('pending')">Pending</button>
                    <button class="btn btn-outline-info btn-sm" onclick="filterOrders('processing')">Processing</button>
                    <button class="btn btn-outline-primary btn-sm" onclick="filterOrders('shipped')">Shipped</button>
                    <button class="btn btn-outline-success btn-sm" onclick="filterOrders('delivered')">Delivered</button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const tableBody = document.getElementById('orders-table-body');
    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="fw-medium">${order.orderId}</span>
                <br>
                <small class="text-muted">${new Date(order.orderDate).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-medium">${order.shipping.fullName}</div>
                        <div class="text-muted small">${order.shipping.address}</div>
                        <div class="text-muted small">${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="text-muted small">
                    <div><i class="fas fa-envelope me-1"></i>${order.shipping.email}</div>
                    <div><i class="fas fa-phone me-1"></i>${order.shipping.phone}</div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="badge bg-light text-dark">${order.items.length} items</span>
                    <button class="btn btn-link btn-sm" onclick="viewOrderItems(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="fw-medium">₹${order.payment.total.toFixed(2)}</div>
                <small class="text-muted">
                    ${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                </small>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="text-muted small">
                    <div>Ordered: ${new Date(order.orderDate).toLocaleString()}</div>
                    ${order.lastUpdated ? `<div>Updated: ${new Date(order.lastUpdated).toLocaleString()}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="viewOrderDetails(${index})" class="btn btn-info btn-sm" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus(${index})" class="btn btn-primary btn-sm" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="printOrderInvoice(${index})" class="btn btn-secondary btn-sm" title="Print Invoice">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'processing': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

function viewOrderDetails(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Details - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="fw-bold">Customer Information</h6>
                            <p><strong>Name:</strong> ${order.shipping.fullName}</p>
                            <p><strong>Email:</strong> ${order.shipping.email}</p>
                            <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold">Shipping Address</h6>
                            <p>${order.shipping.address}</p>
                            <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</p>
                            <p><strong>Delivery Option:</strong> ${order.shipping.deliveryOption}</p>
                        </div>
                    </div>
                    
                    <h6 class="fw-bold mt-4">Order Items</h6>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td><img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover"></td>
                                        <td>${item.name}</td>
                                        <td>₹${item.price.toFixed(2)}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h6 class="fw-bold">Order Status</h6>
                            <span class="badge bg-${getStatusColor(order.status)}">
                                ${order.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold">Payment Summary</h6>
                            <p><strong>Subtotal:</strong> ₹${order.payment.subtotal.toFixed(2)}</p>
                            <p><strong>Shipping:</strong> ₹${order.payment.shipping.toFixed(2)}</p>
                            <p><strong>Total:</strong> ₹${order.payment.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function viewOrderItems(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Items - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>
                                            <img src="${item.image}" alt="${item.name}" 
                                                class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                                        </td>
                                        <td>${item.name}</td>
                                        <td>₹${item.price.toFixed(2)}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Subtotal:</td>
                                    <td>₹${order.payment.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Shipping:</td>
                                    <td>₹${order.payment.shipping.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-end fw-bold">Total:</td>
                                    <td>₹${order.payment.total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function printOrderInvoice(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${order.orderId}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="row mb-4">
                    <div class="col">
                        <h2>INVOICE</h2>
                        <p class="mb-0">Order ID: ${order.orderId}</p>
                        <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div class="col text-end">
                        <button onclick="window.print()" class="btn btn-primary no-print">Print Invoice</button>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6 class="fw-bold">Customer Information</h6>
                        <p><strong>Name:</strong> ${order.shipping.fullName}</p>
                        <p><strong>Email:</strong> ${order.shipping.email}</p>
                        <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div class="col-md-6 text-end">
                        <h6 class="fw-bold">Shipping Method:</h6>
                        <p>${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}</p>
                    </div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-end">Price</th>
                            <th class="text-end">Quantity</th>
                            <th class="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-end">₹${item.price.toFixed(2)}</td>
                                <td class="text-end">${item.quantity}</td>
                                <td class="text-end">₹${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                            <td class="text-end">₹${order.payment.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Shipping:</td>
                            <td class="text-end">₹${order.payment.shipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Total:</td>
                            <td class="text-end fw-bold">₹${order.payment.total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="row mt-4">
                    <div class="col">
                        <h6 class="fw-bold">Notes:</h6>
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Server Status Check
async function checkServerStatus() {
    const statusDot = document.getElementById('server-status-dot');
    const statusText = document.getElementById('server-status-text');

    if (!statusDot || !statusText) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/api/health', {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            statusDot.classList.remove('bg-red-500', 'bg-gray-400');
            statusDot.classList.add('bg-green-500');
            statusText.textContent = 'Server Online';
            statusText.classList.remove('text-red-500', 'text-gray-500');
            statusText.classList.add('text-green-600');
        } else {
            throw new Error('Server returned error');
        }
    } catch (error) {
        statusDot.classList.remove('bg-green-500', 'bg-gray-400');
        statusDot.classList.add('bg-red-500');
        statusText.textContent = 'Server Offline';
        statusText.classList.remove('text-green-600', 'text-gray-500');
        statusText.classList.add('text-red-500');
    }
}

// Poll server status every 30 seconds
setInterval(checkServerStatus, 30000);

function filterOrders(status) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const filteredOrders = status === 'all' ? orders : orders.filter(order => order.status === status);
    renderOrdersTable(filteredOrders);
}

function renderOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '';

    orders.forEach((order, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="fw-medium">${order.orderId}</span>
                <br>
                <small class="text-muted">${new Date(order.orderDate).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-medium">${order.shipping.fullName}</div>
                        <div class="text-muted small">${order.shipping.address}</div>
                        <div class="text-muted small">${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="text-muted small">
                    <div><i class="fas fa-envelope me-1"></i>${order.shipping.email}</div>
                    <div><i class="fas fa-phone me-1"></i>${order.shipping.phone}</div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="badge bg-light text-dark">${order.items.length} items</span>
                    <button class="btn btn-link btn-sm" onclick="viewOrderItems(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="fw-medium">$${order.payment.total.toFixed(2)}</div>
                <small class="text-muted">
                    ${order.shipping.deliveryOption === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                </small>
            </td>
            <td>
                <span class="badge bg-${getStatusColor(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="text-muted small">
                    <div>Ordered: ${new Date(order.orderDate).toLocaleString()}</div>
                    ${order.lastUpdated ? `<div>Updated: ${new Date(order.lastUpdated).toLocaleString()}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="viewOrderDetails(${index})" class="btn btn-info btn-sm" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateOrderStatus(${index})" class="btn btn-primary btn-sm" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="printOrderInvoice(${index})" class="btn btn-secondary btn-sm" title="Print Invoice">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateOrderStatus(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[index];

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Order Status - ${order.orderId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Order Status</label>
                        <select class="form-select" id="orderStatus">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="saveOrderStatus(${index})">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function saveOrderStatus(index) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const newStatus = document.getElementById('orderStatus').value;

    orders[index].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));

    // Add admin notification
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `Order ${orders[index].orderId} status updated to ${newStatus}`,
        icon: 'fa-truck',
        timestamp: new Date().toISOString(),
        type: 'order'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Add customer notification for key status changes
    try {
        const customerNotifications = JSON.parse(localStorage.getItem('customer_notifications')) || [];
        let title = '';
        let message = '';

        if (newStatus === 'processing') {
            title = 'Order Confirmed';
            message = `Your order ${orders[index].orderId} is confirmed and being prepared.`;
        } else if (newStatus === 'shipped') {
            title = 'Order Shipped';
            message = `Your order ${orders[index].orderId} is on the way.`;
        } else if (newStatus === 'delivered') {
            title = 'Order Delivered';
            message = `Your order ${orders[index].orderId} has been delivered.`;
        }

        if (title) {
            customerNotifications.unshift({
                id: Date.now(),
                type: 'order',
                title,
                message,
                timestamp: new Date().toISOString(),
                isRead: false,
                icon: 'fa-box',
                color: 'green'
            });

            if (customerNotifications.length > 50) {
                customerNotifications.pop();
            }

            localStorage.setItem('customer_notifications', JSON.stringify(customerNotifications));
        }
    } catch (e) {
        console.error('Customer notification error:', e);
    }

    // Close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
    modal.hide();
    loadOrders();
    loadNotifications();
}

// Add users section to admin navigation
function renderAdminNav() {
    return `
        <div class="bg-white shadow-sm">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center">
                    <div class="flex space-x-8">
                        <button onclick="renderOrders()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                            Orders
                        </button>
                        <button onclick="renderUsers()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                            Users
                        </button>
                        <button onclick="renderProducts()" class="px-3 py-4 text-sm font-medium text-gray-700 border-b-2 hover:text-gray-900 hover:border-gray-300">
                            Products
                        </button>
                    </div>
                    
                    <!-- Server Status Indicator -->
                    <div class="flex items-center space-x-2">
                        <div id="server-status-dot" class="w-3 h-3 rounded-full bg-gray-400 transition-colors duration-300"></div>
                        <span id="server-status-text" class="text-xs font-medium text-gray-500">Checking...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// User Management Functions
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users from server');
        const users = await response.json();

        // Save to local storage for backward compatibility with view logic
        localStorage.setItem('users', JSON.stringify(users));

        const usersContainer = document.getElementById('users-container');
        usersContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="users-table-body"></tbody>
            </table>
        `;

        const tableBody = document.getElementById('users-table-body');
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover">
                </td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <span class="badge ${user.isAdmin ? 'bg-primary' : 'bg-secondary'}">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button onclick="viewUserDetails(${index})" class="btn btn-info" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="promoteUser(${index})" class="btn ${user.isAdmin ? 'btn-dark' : 'btn-outline-primary'}" title="${user.isAdmin ? 'Demote from Admin' : 'Promote to Admin'}">
                            <i class="fas ${user.isAdmin ? 'fa-user-minus' : 'fa-user-shield'}"></i>
                        </button>
                        <button onclick="toggleUserStatus(${index})" class="btn ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" title="${user.status === 'active' ? 'Block User' : 'Unblock User'}">
                            <i class="fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                        <button onclick="deleteUser(${index})" class="btn btn-danger" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function viewUserDetails(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">User Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <img src="${user.avatar}" alt="${user.name}" class="w-20 h-20 rounded-full mx-auto">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Name:</label>
                        <p>${user.name}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Email:</label>
                        <p>${user.email}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Phone:</label>
                        <p>${user.phone || 'Not provided'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Address:</label>
                        <p>${user.address || 'Not provided'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Status:</label>
                        <p>${user.status || 'active'}</p>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700">Joined:</label>
                        <p>${new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    ${user.updatedAt ? `
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-gray-700">Last Updated:</label>
                            <p>${new Date(user.updatedAt).toLocaleString()}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

async function promoteUser(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];

    if (!user || !user._id) return;

    if (confirm(`Are you sure you want to ${user.isAdmin ? 'demote' : 'promote'} ${user.name}?`)) {
        try {
            const response = await fetch(`/api/admin/users/${user._id}/promote`, {
                method: 'PUT'
            });

            if (response.ok) {
                const data = await response.json();
                showToast(data.message, 'success');

                // Add notification
                const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
                notifications.unshift({
                    message: `User ${user.name} ${data.user.isAdmin ? 'promoted to admin' : 'demoted from admin'}`,
                    icon: data.user.isAdmin ? 'fa-user-shield' : 'fa-user-minus',
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('notifications', JSON.stringify(notifications));

                loadUsers();
                if (typeof loadNotifications === 'function') loadNotifications();
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to update admin status', 'danger');
            }
        } catch (err) {
            console.error('API Error:', err);
            showToast('Network error while promoting user', 'danger');
        }
    }
}

async function toggleUserStatus(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];

    if (!user || !user._id) return;

    try {
        const response = await fetch(`/api/admin/users/${user._id}/suspend`, {
            method: 'PUT'
        });

        if (response.ok) {
            const data = await response.json();
            showToast(data.message, 'success');

            // Add notification
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            notifications.unshift({
                message: `User ${user.name} ${data.user.status === 'active' ? 'activated' : 'suspended'}`,
                icon: data.user.status === 'active' ? 'fa-check-circle' : 'fa-ban',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));

            loadUsers(); // Refresh the list from the server
            // Cannot use loadNotifications immediately if it relies on DOM elements but it's safe to run
            if (typeof loadNotifications === 'function') loadNotifications();
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Failed to update user status', 'danger');
        }
    } catch (err) {
        console.error('API Error:', err);
        showToast('Network error while updating user status', 'danger');
    }
}

async function deleteUser(index) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users[index];
        if (!user || !user._id) return;

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('User deleted successfully', 'success');
                // Add notification
                if (typeof addNotification === 'function') {
                    addNotification('User deleted: ' + user.name, 'fa-user-times');
                } else {
                    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
                    notifications.unshift({
                        message: `User ${user.name} deleted`,
                        icon: 'fa-user-times',
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('notifications', JSON.stringify(notifications));
                }
                loadUsers(); // Refresh users from backend
                loadDashboardMetrics();
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to delete user', 'danger');
            }
        } catch (err) {
            console.error('API Error:', err);
            showToast('Network error while deleting user', 'danger');
        }
    }
}

// Dashboard Functions
function loadSectionData(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.add('active');
    }

    // Load specific data
    switch (sectionId) {
        case 'dashboard':
            loadDashboardMetrics();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'reviews':
            loadReviews();
            break;
    }
}

function loadDashboardMetrics() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Calculate metrics
    const totalSales = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.payment.total, 0);

    const activeOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;

    // Update UI elements directly
    const totalProductsEl = document.getElementById('total-products');
    const activeOrdersEl = document.getElementById('active-orders');
    const registeredUsersEl = document.getElementById('registered-users');

    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (activeOrdersEl) activeOrdersEl.textContent = activeOrders;
    if (registeredUsersEl) registeredUsersEl.textContent = users.length;
}

function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const container = document.getElementById('notifications-list');

    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent notifications</p>';
        return;
    }

    container.innerHTML = `
        <div class="list-group">
            ${notifications.slice(0, 10).map(note => `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">
                            <i class="fas ${note.icon} me-2 text-primary"></i>
                            ${note.message}
                        </h6>
                        <small class="text-muted">${new Date(note.timestamp).toLocaleTimeString()}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || (typeof defaultProducts !== 'undefined' ? defaultProducts : []);
    const container = document.getElementById('products-container');

    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map((p, i) => `
                                <tr class="${p.stock === 0 ? 'table-danger' : ''}">
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${getValidImage(p.image)}" 
                                                 class="rounded me-2" 
                                                 style="width: 40px; height: 40px; object-fit: cover;"
                                                 onerror="handleImageError(this)">
                                            <div>
                                                <div class="fw-bold">${p.name}</div>
                                                <div class="small text-mutedID">${p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${p.category}</td>
                                    <td>₹${p.price}</td>
                                    <td>
                                        <span class="badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}">
                                            ${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" onclick="editProduct(${i})" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-outline-danger" onclick="deleteProduct(${i})" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                            <button class="btn ${p.stock > 0 ? 'btn-warning' : 'btn-success'}" 
                                                    onclick="toggleStock(${i})" 
                                                    title="${p.stock > 0 ? 'Mark Out of Stock' : 'Mark In Stock'}"
                                                    style="min-width: 120px;">
                                                <i class="fas ${p.stock > 0 ? 'fa-ban' : 'fa-check'} me-1"></i>
                                                ${p.stock > 0 ? 'Set Out of Stock' : 'Set In Stock'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Mobile menu toggle
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        mainContent.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });

        // Close sidebar when clicking a link (mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar nav a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }
}

// Add event listener for real-time updates
// Add event listener for real-time updates
window.addEventListener('storage', (e) => {
    if (e.key === 'users' || e.key === 'notifications') {
        loadUsers();
        loadNotifications();
        loadDashboardMetrics();
    }
    if (e.key === 'orders' || e.key === 'notifications') {
        loadOrders();
        loadNotifications();
        loadDashboardMetrics();
    }
    if (e.key === 'products') {
        loadProducts();
        loadDashboardMetrics();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }

    // Add logout functionality to the "Back to Store" button
    const logoutBtn = document.querySelector('a[href="../index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            window.location.href = '../index.html';
        });
    }

    // Check authentication status
    checkAuth();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize dashboard if logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        initializeLocalStorage();

        // Handle hash navigation (defaults to dashboard if no hash or invalid hash)
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            const validSections = ['dashboard', 'products', 'orders', 'users', 'reviews'];
            const sectionToLoad = validSections.includes(hash) ? hash : 'dashboard';
            loadSectionData(sectionToLoad);

            // Update active link in sidebar
            document.querySelectorAll('.sidebar nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionToLoad}`) {
                    link.classList.add('active');
                }
            });
        };

        // Initial load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Check server status after render
        setTimeout(checkServerStatus, 100);
    }
});

// Improved Local Storage Initialization
function initializeLocalStorage() {
    // Force reseed if products are missing or empty
    const currentProducts = JSON.parse(localStorage.getItem('products'));
    if (!currentProducts || currentProducts.length === 0) {
        if (typeof defaultProducts !== 'undefined') {
            localStorage.setItem('products', JSON.stringify(defaultProducts));
            console.log('Reseeded products from defaultProducts');
        }
    }

    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('notifications')) {
        // Sample notifications for demo
        const sampleNotifications = [
            {
                message: 'System initialized',
                icon: 'fa-info-circle',
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    }
}

// Reviews Management
async function loadReviews() {
    try {
        const response = await fetch('/api/admin/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const reviews = await response.json();
        renderReviewsTable(reviews, 'All Reviews');
    } catch (error) {
        console.error('Error loading reviews:', error);
        showToast('Error loading reviews', 'danger');
    }
}

async function loadAlertReviews() {
    try {
        const response = await fetch('/api/admin/reviews/alerts');
        if (!response.ok) throw new Error('Failed to fetch alert reviews');
        const reviews = await response.json();
        renderReviewsTable(reviews, 'Alerts (Reported/Low Rating)');
    } catch (error) {
        console.error('Error loading alert reviews:', error);
        showToast('Error loading alert reviews', 'danger');
    }
}

function renderReviewsTable(reviews, title = 'Reviews') {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${title}</h5>
                <span class="badge bg-primary">${reviews.length} total</span>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Status</th>
                                <th>Flags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reviews.map(review => `
                                <tr class="${review.reported ? 'table-warning' : ''}">
                                    <td>
                                        <div class="fw-bold">${review.product?.name || 'Unknown Product'}</div>
                                    </td>
                                    <td>
                                        <div class="fw-medium">${review.user?.name || 'Anonymous'}</div>
                                        <div class="small text-muted">${new Date(review.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div class="text-warning">
                                            ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
                                            ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="fw-bold text-truncate" style="max-width: 200px;" title="${review.title}">${review.title}</div>
                                        <div class="small text-truncate" style="max-width: 200px;" title="${review.comment}">${review.comment}</div>
                                    </td>
                                    <td>
                                        <span class="badge bg-${review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'danger' : 'warning'}">
                                            ${review.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        ${review.reported ? '<span class="badge bg-danger me-1">Reported</span>' : ''}
                                        ${review.sentiment && review.sentiment !== 'Unclassified' ? `<span class="badge bg-info">${review.sentiment}</span>` : ''}
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            ${review.status !== 'approved' ? `
                                                <button class="btn btn-success" onclick="updateReviewStatus('${review._id}', 'approved')" title="Approve">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                            ` : ''}
                                            ${review.status !== 'rejected' ? `
                                                <button class="btn btn-warning" onclick="updateReviewStatus('${review._id}', 'rejected')" title="Reject">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-danger" onclick="deleteReview('${review._id}')" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                            ${reviews.length === 0 ? '<tr><td colspan="7" class="text-center text-muted py-4">No reviews found</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function updateReviewStatus(id, status) {
    if (confirm(`Are you sure you want to mark this review as ${status}?`)) {
        try {
            const response = await fetch(`/api/admin/reviews/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                showToast(`Review ${status} successfully`, 'success');
                // Could be coming from alerts or all reviews
                if (document.querySelector('.card-header h5').innerText.includes('Alerts')) {
                    loadAlertReviews();
                } else {
                    loadReviews();
                }
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to update review status', 'danger');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            showToast('Network error while updating review', 'danger');
        }
    }
}

async function deleteReview(id) {
    if (confirm('Are you sure you want to completely delete this review? This cannot be undone.')) {
        try {
            // First try admin specific delete, fallback to general if it 404s
            let response = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
            if (response.status === 404) {
                response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            }

            if (response.ok) {
                showToast('Review deleted successfully', 'success');
                if (document.querySelector('.card-header h5').innerText.includes('Alerts')) {
                    loadAlertReviews();
                } else {
                    loadReviews();
                }
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to delete review', 'danger');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showToast('Network error while deleting review', 'danger');
        }
    }
}

