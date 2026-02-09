-- Link work orders to maintenance tasks
CREATE TABLE IF NOT EXISTS work_order_tasks (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    maintenance_task_id INTEGER REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(work_order_id, maintenance_task_id)
);
