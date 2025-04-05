const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const port = 3003;
const API_BASE_URL = 'http://localhost:3003';
const cors = require('cors');
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Allow requests from your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(session({
    secret: 'cfms_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// MySQL Connection
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'cfms_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all products
// Update your API endpoint handlers to include better error handling

// Get all products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM product';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (!results || results.length === 0) {
            // Return empty array instead of error if no products
            return res.json([]);
        }
        
        res.json(results);
    });
});

// Similarly update other endpoint handlers with better error handling

// Get all services
app.get('/api/services', (req, res) => {
    const query = 'SELECT * FROM service';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (!results || results.length === 0) {
            // Return empty array instead of error if no products
            return res.json([]);
        }
        
        res.json(results);
    });
});

// Customer login/registration
// Customer login/registration with improved error handling
app.post('/api/customer', (req, res) => {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if customer exists
    const checkQuery = 'SELECT * FROM customer WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (results && results.length > 0) {
            // Customer exists, return customer id
            return res.json({ customerId: results[0].cu_id });
        } else {
            // Generate a new customer ID (since you're not using AUTO_INCREMENT)
            // This is a simple approach - you might want to implement a more robust ID generation method
            const getMaxIdQuery = 'SELECT MAX(cu_id) as maxId FROM customer';
            db.query(getMaxIdQuery, (err, maxResults) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error', details: err.message });
                }
                
                const newId = (maxResults[0].maxId || 0) + 1;
                
                // Create new customer with the generated ID
                const insertQuery = 'INSERT INTO customer (cu_id, name, email) VALUES (?, ?, ?)';
                db.query(insertQuery, [newId, name, email], (err, insertResults) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Database error', details: err.message });
                    }
                    
                    // Insert phone number if provided
                    if (phone) {
                        const phoneQuery = 'INSERT INTO customer_ph (cu_id, phone_no) VALUES (?, ?)';
                        db.query(phoneQuery, [newId, phone], (phoneErr) => {
                            if (phoneErr) {
                                console.error('Error saving phone number:', phoneErr);
                                // Continue anyway since we have the customer ID
                            }
                        });
                    }
                    
                    res.json({ customerId: newId });
                });
            });
        }
    });
});

// Submit product feedback
app.post('/api/product-feedback', (req, res) => {
    const { 
        cu_id, prod_id, perform_rat, price_rat, p_qual_rat, 
        design_rat, comfort_rat, use_again, overall_rating, comments 
    } = req.body;

    if (!cu_id) {
        return res.status(400).json({ error: 'Missing customer ID' });
    }
    
    
    const query = `
        INSERT INTO product_rat 
        (cu_id, prod_id, created_date, perform_rat, price_rat, p_qual_rat, 
        design_rat, comfort_rat, use_again, overall_rating, comments)
        VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query, 
        [cu_id, prod_id, perform_rat, price_rat, p_qual_rat, 
        design_rat, comfort_rat, use_again, overall_rating, comments],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Update analytics table
            updateProductAnalytics(prod_id);
            
            res.json({ success: true, message: 'Product feedback submitted' });
        }
    );
});

// Submit service feedback
app.post('/api/service-feedback', (req, res) => {
    const { 
        cu_id, s_id, s_qual_rat, timeliness, communication,
        s_delivery, s_provider_knowledge, convenience, overall_rating, comments 
    } = req.body;
    
    if (!cu_id) {
        return res.status(400).json({ error: 'Missing customer ID' });
    }
    

    const query = `
        INSERT INTO service_rat 
        (cu_id, s_id, created_date, s_qual_rat, timeliness, communication,
        s_delivery, s_provider_knowledge, convenience, overall_rating, comments)
        VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query, 
        [cu_id, s_id, s_qual_rat, timeliness, communication,
        s_delivery, s_provider_knowledge, convenience, overall_rating, comments],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Update analytics table
            updateServiceAnalytics(s_id);
            
            res.json({ success: true, message: 'Service feedback submitted' });
        }
    );
});

// Admin login
app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    
    if (password === 'admin123') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Check admin authentication
function checkAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Not authorized' });
    }
}

// Get product feedback list
app.get('/api/admin/product-feedbacks', checkAdmin, (req, res) => {
    const query = `
        SELECT pr.*, p.prod_name, c.name as customer_name 
        FROM product_rat pr
        JOIN product p ON pr.prod_id = p.prod_id
        LEFT JOIN customer c ON pr.cu_id = c.cu_id
        ORDER BY pr.created_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get service feedback list
app.get('/api/admin/service-feedbacks', checkAdmin, (req, res) => {
    const query = `
        SELECT sr.*, s.s_type, c.name as customer_name 
        FROM service_rat sr
        JOIN service s ON sr.s_id = s.s_id
        LEFT JOIN customer c ON sr.cu_id = c.cu_id
        ORDER BY sr.created_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get product analytics
app.get('/api/admin/product-analytics', checkAdmin, (req, res) => {
    const query = `
        SELECT a.*, p.prod_name
        FROM analytics a
        JOIN product p ON a.prod_id = p.prod_id
        WHERE a.type = 'product'
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get service analytics
app.get('/api/admin/service-analytics', checkAdmin, (req, res) => {
    const query = `
        SELECT a.*, s.s_type
        FROM analytics a
        JOIN service s ON a.s_id = s.s_id
        WHERE a.type = 'service'
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Helper functions to update analytics
function updateProductAnalytics(prod_id) {
    const query = `
        UPDATE analytics
        SET p_count = (
                SELECT COUNT(*) FROM product_rat 
                WHERE prod_id = ? AND overall_rating > 3
            ),
            n_count = (
                SELECT COUNT(*) FROM product_rat 
                WHERE prod_id = ? AND overall_rating < 3
            ),
            avg_rat = (
                SELECT AVG(overall_rating) FROM product_rat 
                WHERE prod_id = ?
            )
        WHERE type = 'product' AND prod_id = ?
    `;
    
    db.query(query, [prod_id, prod_id, prod_id, prod_id], (err) => {
        if (err) {
            console.error('Error updating product analytics:', err);
        }
    });
}

function updateServiceAnalytics(s_id) {
    const query = `
        UPDATE analytics
        SET p_count = (
                SELECT COUNT(*) FROM service_rat 
                WHERE s_id = ? AND overall_rating > 3
            ),
            n_count = (
                SELECT COUNT(*) FROM service_rat 
                WHERE s_id = ? AND overall_rating < 3
            ),
            avg_rat = (
                SELECT AVG(overall_rating) FROM service_rat 
                WHERE s_id = ?
            )
        WHERE type = 'service' AND s_id = ?
    `;
    
    db.query(query, [s_id, s_id, s_id, s_id], (err) => {
        if (err) {
            console.error('Error updating service analytics:', err);
        }
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});