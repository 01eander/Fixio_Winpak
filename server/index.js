const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- CATALOGS: DEPARTMENTS ---
app.get('/api/departments', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/departments', async (req, res) => {
    try {
        const { name } = req.body;
        const { rows } = await db.query('INSERT INTO departments (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { rows } = await db.query('UPDATE departments SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM departments WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATALOGS: ROLES ---
app.get('/api/roles', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM user_roles ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const { name } = req.body;
        const { rows } = await db.query('INSERT INTO user_roles (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { rows } = await db.query('UPDATE user_roles SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM user_roles WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATALOGS: ASSET CATEGORIES ---
app.get('/api/asset-categories', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM asset_categories ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/asset-categories', async (req, res) => {
    try {
        const { name } = req.body;
        const { rows } = await db.query('INSERT INTO asset_categories (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/asset-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { rows } = await db.query('UPDATE asset_categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/asset-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM asset_categories WHERE id = $1', [id]); // Will fail if referenced
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATALOGS: INVENTORY CATEGORIES ---
app.get('/api/inventory-categories', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM inventory_categories ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory-categories', async (req, res) => {
    try {
        const { name } = req.body;
        const { rows } = await db.query('INSERT INTO inventory_categories (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventory-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { rows } = await db.query('UPDATE inventory_categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventory-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM inventory_categories WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- USERS (with departments, roles, and default warehouse) ---
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT u.*, d.name as department_name, r.name as role_name, w.name as default_warehouse_name, s.name as shift_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN user_roles r ON u.role_id = r.id
            LEFT JOIN warehouses w ON u.default_warehouse_id = w.id
            LEFT JOIN shifts s ON u.shift_id = s.id
            WHERE u.is_active = true 
            ORDER BY u.full_name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT u.*, d.name as department_name, r.name as role_name, w.name as default_warehouse_name, s.name as shift_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN user_roles r ON u.role_id = r.id
            LEFT JOIN warehouses w ON u.default_warehouse_id = w.id
            LEFT JOIN shifts s ON u.shift_id = s.id
            WHERE u.id = $1
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { email, full_name, role_id, department_id, password_hash, default_warehouse_id, shift_id } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO users (email, full_name, role_id, department_id, password_hash, default_warehouse_id, shift_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                email,
                full_name,
                role_id === '' ? null : role_id,
                department_id === '' ? null : department_id,
                password_hash || 'default_hash',
                default_warehouse_id === '' ? null : default_warehouse_id,
                shift_id === '' ? null : shift_id
            ]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, full_name, role_id, department_id, is_active, default_warehouse_id, shift_id } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE users SET email = $1, full_name = $2, role_id = $3, department_id = $4, is_active = $5, default_warehouse_id = $6, shift_id = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [
                email,
                full_name,
                role_id === '' ? null : role_id,
                department_id === '' ? null : department_id,
                is_active,
                default_warehouse_id === '' ? null : default_warehouse_id,
                shift_id === '' ? null : shift_id,
                id
            ]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
        res.json({ message: 'User deactivated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- USER TOOLS (Tools assigned to mechanics) ---
app.get('/api/users/:id/tools', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT ut.*, a.name as tool_name, a.model 
            FROM user_tools ut
            JOIN assets a ON ut.asset_id = a.id
            WHERE ut.user_id = $1
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/:id/tools', async (req, res) => {
    const { id } = req.params;
    const { asset_id, quantity, notes } = req.body;
    try {
        const { rows } = await db.query(
            `INSERT INTO user_tools (user_id, asset_id, quantity, notes) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (user_id, asset_id) 
             DO UPDATE SET quantity = $3, notes = $4, assigned_at = NOW()
             RETURNING *`,
            [id, asset_id, quantity || 1, notes]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id/tools/:asset_id', async (req, res) => {
    const { id, asset_id } = req.params;
    try {
        await db.query('DELETE FROM user_tools WHERE user_id = $1 AND asset_id = $2', [id, asset_id]);
        res.json({ message: 'Tool unassigned' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ASSETS (Equipos/Áreas with new Categories) ---
app.get('/api/assets', async (req, res) => {
    const { category, category_id } = req.query;
    try {
        let query = `
            SELECT a.*, c.name as category_name 
            FROM assets a 
            LEFT JOIN asset_categories c ON a.category_id = c.id
            WHERE a.status != 'SCRAPPED'
        `;
        const params = [];
        if (category_id) {
            query += ' AND a.category_id = $1';
            params.push(category_id);
        } else if (category) {
            // Deprecated: verify if we still support string category
            query += ' AND (a.category = $1 OR c.name = $1)'; // Support both for transition
            params.push(category);
        }

        query += ' ORDER BY a.name';
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/assets', async (req, res) => {
    const { name, category_id, status, model, serial_number, parent_id, category } = req.body;
    try {
        // If category_id not provided, try to find it via category name for backward compat? Or enforce category_id
        // Let's assume frontend sends category_id now.
        const { rows } = await db.query(
            'INSERT INTO assets (name, category_id, status, model, serial_number, parent_id, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, category_id, status || 'ACTIVE', model, serial_number, parent_id, category] // keeping 'category' string for safety if column exists
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/assets/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category_id, status, model, serial_number, parent_id } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE assets SET name = $1, category_id = $2, status = $3, model = $4, serial_number = $5, parent_id = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [name, category_id, status, model, serial_number, parent_id, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... (Delete asset as before)

// --- WAREHOUSES (with Area) ---
app.get('/api/warehouses', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT w.*, a.name as area_name 
            FROM warehouses w
            LEFT JOIN assets a ON w.area_id = a.id
            ORDER BY w.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/warehouses', async (req, res) => {
    const { name, area_id, is_personal } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO warehouses (name, area_id, is_personal) VALUES ($1, $2, $3) RETURNING *',
            [name, area_id || null, is_personal || false]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/warehouses/:id', async (req, res) => {
    const { id } = req.params;
    const { name, area_id, is_personal } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE warehouses SET name = $1, area_id = $2, is_personal = $3 WHERE id = $4 RETURNING *',
            [name, area_id || null, is_personal || false, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... (Warehouses GET/POST/PUT/DELETE above)

// --- MAINTENANCE TASKS (Jobs) ---
app.get('/api/maintenance-tasks', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM maintenance_tasks ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maintenance-tasks', async (req, res) => {
    const { name, type, estimated_time, base_cost } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO maintenance_tasks (name, type, estimated_time, base_cost) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, type, estimated_time || 0, base_cost || 0]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maintenance-tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, estimated_time, base_cost } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE maintenance_tasks SET name = $1, type = $2, estimated_time = $3, base_cost = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [name, type, estimated_time, base_cost, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/maintenance-tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM maintenance_tasks WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maintenance-tasks/:id/tools', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT a.id as asset_id, a.name, a.model, jt.quantity 
            FROM assets a
            JOIN job_tools jt ON a.id = jt.asset_id
            WHERE jt.maintenance_task_id = $1
            ORDER BY a.name
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maintenance-tasks/:id/tools', async (req, res) => {
    const { id } = req.params;
    const { tools } = req.body; // Array of { asset_id, quantity }
    try {
        await db.query('BEGIN');
        // Clear existing
        await db.query('DELETE FROM job_tools WHERE maintenance_task_id = $1', [id]);

        // Insert new
        if (tools && tools.length > 0) {
            for (const tool of tools) {
                await db.query(
                    'INSERT INTO job_tools (maintenance_task_id, asset_id, quantity) VALUES ($1, $2, $3)',
                    [id, tool.asset_id, tool.quantity]
                );
            }
        }
        await db.query('COMMIT');
        res.json({ message: 'Tools updated' });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventory', async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT i.*, 
                   c.name as category_name,
                   COALESCE(SUM(iw.quantity), 0) as stock,
                   MAX(iw.aisle) as aisle,
                   MAX(iw.shelf) as shelf,
                   MAX(iw.bin) as bin
            FROM inventory_items i 
            LEFT JOIN inventory_categories c ON i.category_id = c.id
            LEFT JOIN item_warehouses iw ON i.id = iw.inventory_item_id 
            WHERE i.is_active = true
            GROUP BY i.id, c.name, i.manufacturer
            ORDER BY i.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/inventory/:id/stock', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(`
            SELECT w.id as warehouse_id, w.name as warehouse_name, 
                   COALESCE(iw.quantity, 0) as quantity,
                   COALESCE(iw.location_in_warehouse, '') as location_in_warehouse,
                   COALESCE(iw.aisle, '') as aisle,
                   COALESCE(iw.shelf, '') as shelf,
                   COALESCE(iw.bin, '') as bin
            FROM warehouses w
            LEFT JOIN item_warehouses iw ON w.id = iw.warehouse_id AND iw.inventory_item_id = $1
            ORDER BY w.name
        `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    const { sku, name, description, min_stock, unit_cost, category_id, manufacturer, stocks } = req.body;
    console.log('Creating Item:', req.body); // Log request
    try {
        await db.query('BEGIN');
        // Insert item 
        const { rows } = await db.query(
            'INSERT INTO inventory_items (sku, name, description, min_stock, unit_cost, category_id, bin_location, manufacturer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [sku, name, description, min_stock, unit_cost, category_id || null, '', manufacturer]
        );
        const newItem = rows[0];
        console.log('Item Created:', newItem.id);

        // Insert multiple warehouse stocks
        if (stocks && Array.isArray(stocks)) {
            for (const stock of stocks) {
                if (stock.warehouse_id && (stock.quantity > 0 || stock.aisle || stock.shelf || stock.bin)) {
                    console.log('Inserting Stock for Warehouse:', stock.warehouse_id);
                    await db.query(
                        `INSERT INTO item_warehouses (inventory_item_id, warehouse_id, quantity, location_in_warehouse, aisle, shelf, bin) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7) 
                         ON CONFLICT (inventory_item_id, warehouse_id) DO UPDATE SET quantity = $3`,
                        [newItem.id, stock.warehouse_id, stock.quantity || 0, '', stock.aisle, stock.shelf, stock.bin]
                    );
                }
            }
        }

        await db.query('COMMIT');
        res.status(201).json(newItem);
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error Creating Item:', err);
        const fs = require('fs');
        fs.appendFileSync('server_error.log', new Date().toISOString() + ' ' + err.message + '\n' + JSON.stringify(req.body) + '\n');
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { warehouse_id, quantity, location_in_warehouse, aisle, shelf, bin } = req.body;
    try {
        await db.query(
            `INSERT INTO item_warehouses (inventory_item_id, warehouse_id, quantity, location_in_warehouse, aisle, shelf, bin) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             ON CONFLICT (inventory_item_id, warehouse_id) 
             DO UPDATE SET quantity = $3, location_in_warehouse = $4, aisle = $5, shelf = $6, bin = $7, updated_at = NOW()`,
            [id, warehouse_id, quantity, location_in_warehouse || '', aisle, shelf, bin]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, min_stock, unit_cost, category_id, manufacturer, aisle, shelf, bin } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE inventory_items SET sku = $1, name = $2, description = $3, min_stock = $4, unit_cost = $5, category_id = $6, manufacturer = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [sku, name, description, min_stock, unit_cost, category_id, manufacturer, id]
        );

        // Optionally update location if provided (heuristic: update all locations for this item or just the first one?)
        // For simplicity, we update location details in all warehouses where this item exists, OR we can ignore it here.
        // User requested "modificacion", so we should try to update.
        if (aisle || shelf || bin) {
            await db.query(
                'UPDATE item_warehouses SET aisle = COALESCE($1, aisle), shelf = COALESCE($2, shelf), bin = COALESCE($3, bin) WHERE inventory_item_id = $4',
                [aisle, shelf, bin, id]
            );
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.delete('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE inventory_items SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
        res.json({ message: 'Item deactivated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- WORK ORDERS & SURTIR ORDEN ---
app.get('/api/work-orders/:id/requirements', async (req, res) => {
    const { id } = req.params;
    try {
        // Get work order details
        const woResult = await db.query('SELECT * FROM work_orders WHERE id = $1', [id]);
        if (woResult.rows.length === 0) {
            return res.status(404).json({ error: 'Work order not found' });
        }

        // Get all tasks for this work order and their required tools
        const toolsResult = await db.query(`
            SELECT 
                jt.asset_id,
                a.name as tool_name,
                a.model,
                SUM(jt.quantity) as total_quantity
            FROM work_order_tasks wot
            JOIN job_tools jt ON wot.maintenance_task_id = jt.maintenance_task_id
            JOIN assets a ON jt.asset_id = a.id
            WHERE wot.work_order_id = $1
            GROUP BY jt.asset_id, a.name, a.model
            ORDER BY a.name
        `, [id]);

        res.json({
            work_order: woResult.rows[0],
            required_tools: toolsResult.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stock of tools in a specific warehouse
app.post('/api/warehouses/check-stock', async (req, res) => {
    const { warehouse_id, tool_ids } = req.body;
    try {
        const { rows } = await db.query(`
            SELECT 
                a.id as asset_id,
                a.name as tool_name,
                COALESCE(ut.quantity, 0) as available_quantity
            FROM assets a
            LEFT JOIN user_tools ut ON a.id = ut.asset_id 
                AND ut.user_id = (SELECT id FROM users WHERE default_warehouse_id = $1 LIMIT 1)
            WHERE a.id = ANY($2::int[])
        `, [warehouse_id, tool_ids]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Transfer tool to mechanic (add to user_tools)
app.post('/api/warehouses/fulfill-tool', async (req, res) => {
    const { user_id, asset_id, quantity, source_warehouse_id } = req.body;
    try {
        await db.query('BEGIN');

        // Add/update tool in user_tools
        await db.query(`
            INSERT INTO user_tools (user_id, asset_id, quantity, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, asset_id)
            DO UPDATE SET quantity = user_tools.quantity + $3, assigned_at = NOW()
        `, [user_id, asset_id, quantity, `Surtido desde almacén ${source_warehouse_id}`]);

        await db.query('COMMIT');
        res.json({ message: 'Tool fulfilled successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// --- SHIFTS (Turnos) ---
app.get('/api/shifts', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM shifts ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/shifts', async (req, res) => {
    const { name, description, daily_hours } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO shifts (name, description, daily_hours) VALUES ($1, $2, $3) RETURNING *',
            [name, description || '', daily_hours]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/shifts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, daily_hours } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE shifts SET name = $1, description = $2, daily_hours = $3 WHERE id = $4 RETURNING *',
            [name, description || '', daily_hours, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/shifts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM shifts WHERE id = $1', [id]);
        res.json({ message: 'Shift deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SETTINGS: ASSET IMAGE UPLOAD ---
app.post('/api/assets/:id/image', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    try {
        await db.query('UPDATE assets SET image_url = $1 WHERE id = $2', [imageUrl, id]);
        res.json({ image_url: imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SETTINGS: PHOTO UPLOAD ---
app.post('/api/users/:id/photo', upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct URL (assuming server runs on localhost:3000)
    // In production, use env var for base URL
    const photoUrl = `/uploads/${req.file.filename}`;

    try {
        await db.query('UPDATE users SET photo_url = $1 WHERE id = $2', [photoUrl, id]);
        res.json({ photo_url: photoUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SETTINGS: BULK IMPORT ---
app.post('/api/upload-catalog/:type', upload.single('file'), async (req, res) => {
    const { type } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    try {
        const fileContent = fs.readFileSync(req.file.path);
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        let insertedCount = 0;
        let errors = [];

        await db.query('BEGIN');

        for (const record of records) {
            try {
                if (type === 'departments') {
                    if (record.name) {
                        await db.query('INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                        insertedCount++;
                    }
                } else if (type === 'roles') {
                    if (record.name) {
                        await db.query('INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [record.name, record.description || '']);
                        insertedCount++;
                    }
                } else if (type === 'shifts') {
                    if (record.name) {
                        await db.query('INSERT INTO shifts (name, description, daily_hours) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
                            [record.name, record.description || '', parseFloat(record.daily_hours) || 8.0]);
                        insertedCount++;
                    }
                } else if (type === 'areas') {
                    if (record.name) {
                        const catRes = await db.query("SELECT id FROM asset_categories WHERE name = 'Área'");
                        const catId = catRes.rows[0]?.id;
                        if (catId) {
                            const exist = await db.query("SELECT id FROM assets WHERE name = $1 AND category_id = $2", [record.name, catId]);
                            if (exist.rows.length === 0) {
                                await db.query('INSERT INTO assets (name, category_id, status) VALUES ($1, $2, $3)', [record.name, catId, 'ACTIVE']);
                                insertedCount++;
                            }
                        }
                    }
                } else if (type === 'asset-categories') {
                    if (record.name) {
                        await db.query('INSERT INTO asset_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                        insertedCount++;
                    }
                } else if (type === 'warehouses') {
                    if (record.name) {
                        const areaRes = await db.query("SELECT a.id FROM assets a JOIN asset_categories c ON a.category_id = c.id WHERE a.name = $1 AND c.name = 'Área'", [record.area_name]);
                        const areaId = areaRes.rows[0]?.id || null;
                        await db.query('INSERT INTO warehouses (name, area_id, is_personal) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                            [record.name, areaId, record.is_personal?.toString().toUpperCase() === 'TRUE']);
                        insertedCount++;
                    }
                } else if (type === 'assets' || type === 'equipos') {
                    if (record.name) {
                        const catRes = await db.query("SELECT id FROM asset_categories WHERE name = $1", [record.category_name]);
                        const areaRes = await db.query("SELECT a.id FROM assets a JOIN asset_categories c ON a.category_id = c.id WHERE a.name = $1 AND c.name = 'Área'", [record.area_name]);
                        await db.query(
                            'INSERT INTO assets (name, model, serial_number, category_id, parent_id, status, installation_date, acquisition_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
                            [record.name, record.model, record.serial_number, catRes.rows[0]?.id, areaRes.rows[0]?.id, record.status || 'ACTIVE', record.acquisition_date, record.acquisition_date]
                        );
                        insertedCount++;
                    }
                } else if (type === 'inventory-categories') {
                    if (record.name) {
                        await db.query('INSERT INTO inventory_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [record.name]);
                        insertedCount++;
                    }
                } else if (type === 'inventory-items') {
                    if (record.sku && record.name) {
                        const catRes = await db.query("SELECT id FROM inventory_categories WHERE name = $1", [record.category_name]);
                        const itemRes = await db.query(
                            'INSERT INTO inventory_items (sku, name, description, category_id, unit_of_measure, min_stock, max_stock, manufacturer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (sku) DO UPDATE SET name = $2, description = $3 RETURNING id',
                            [record.sku, record.name, record.description, catRes.rows[0]?.id, record.unit_of_measure, parseInt(record.min_stock) || 0, parseInt(record.max_stock) || 0, record.Manufacturer || record.manufacturer]
                        );
                        const itemId = itemRes.rows[0].id;
                        if (record.Aisle || record.Shelf || record.Bin || record.aisle || record.shelf || record.bin) {
                            const whRes = await db.query("SELECT id FROM warehouses WHERE name = 'Almacén Central' LIMIT 1");
                            const whId = whRes.rows[0]?.id;
                            if (whId) {
                                await db.query(
                                    `INSERT INTO item_warehouses (inventory_item_id, warehouse_id, quantity, aisle, shelf, bin) 
                                     VALUES ($1, $2, $3, $4, $5, $6) 
                                     ON CONFLICT (inventory_item_id, warehouse_id) DO UPDATE SET aisle = $4, shelf = $5, bin = $6`,
                                    [itemId, whId, 0, record.Aisle || record.aisle, record.Shelf || record.shelf, record.Bin || record.bin]
                                );
                            }
                        }
                        insertedCount++;
                    }
                } else if (type === 'users') {
                    if (record.email) {
                        const roleRes = await db.query("SELECT id FROM roles WHERE name = $1", [record.role_name]);
                        const deptRes = await db.query("SELECT id FROM departments WHERE name = $1", [record.department_name]);
                        const whRes = await db.query("SELECT id FROM warehouses WHERE name = $1", [record.default_warehouse_name]);
                        await db.query(
                            'INSERT INTO users (full_name, email, role_id, department_id, default_warehouse_id, password_hash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
                            [record.full_name, record.email, roleRes.rows[0]?.id, deptRes.rows[0]?.id, whRes.rows[0]?.id, record.password || 'default_pass']
                        );
                        insertedCount++;
                    }
                } else if (type === 'maintenance-tasks') {
                    if (record.name) {
                        await db.query(
                            'INSERT INTO maintenance_tasks (name, description, frequency_days, estimated_duration_hours) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
                            [record.name, record.description, parseInt(record.frequency_days) || 0, parseFloat(record.estimated_duration_hours) || 0]
                        );
                        insertedCount++;
                    }
                }
            } catch (innerErr) {
                console.error(`Error importing record of type ${type}:`, innerErr);
                errors.push({ record, error: innerErr.message });
            }
        }

        await db.query('COMMIT');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({
            message: `Processed ${records.length} records. Inserted ${insertedCount}.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err) {
        await db.query('ROLLBACK');
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});


// --- USER SETTINGS ---
app.get('/api/user-settings/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
        if (rows.length === 0) {
            return res.json({
                user_id: userId,
                theme: 'dark',
                language: 'es',
                notifications_enabled: true,
                preferences: {}
            });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/user-settings/:userId', async (req, res) => {
    const { userId } = req.params;
    const { theme, language, notifications_enabled, preferences } = req.body;
    try {
        const { rows } = await db.query(`
            INSERT INTO user_settings (user_id, theme, language, notifications_enabled, preferences, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                theme = COALESCE($2, user_settings.theme), 
                language = COALESCE($3, user_settings.language), 
                notifications_enabled = COALESCE($4, user_settings.notifications_enabled),
                preferences = COALESCE($5, user_settings.preferences),
                updated_at = NOW()
            RETURNING *
        `, [userId, theme, language, notifications_enabled, preferences]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/:id/change-password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPassword, id]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/system-info', async (req, res) => {
    try {
        const dbRes = await db.query('SELECT version()');
        res.json({
            version: '1.0.0',
            status: 'Operational',
            dbStatus: 'Connected',
            dbVersion: dbRes.rows[0].version,
            uptime: process.uptime()
        });
    } catch (error) {
        res.json({
            version: '1.0.0',
            status: 'Degraded',
            dbStatus: 'Disconnected',
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
