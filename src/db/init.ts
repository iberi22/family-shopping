/**
 * Canasta Familiar - Price Tracker Database Schema
 * Sistema de precios para compras familiares con alertas y geolocalización
 */

import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'canasta.db');

export const db = new Database(DB_PATH);

// Initialize tables
db.exec(`
  -- Stores/Supermarkets
  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Bogotá',
    phone TEXT,
    type TEXT CHECK(type IN ('supermarket', 'department_store', 'pharmacy', 'wholesale', 'local')),
    latitude REAL,
    longitude REAL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Product Categories
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES categories(id),
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Products
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    category_id INTEGER REFERENCES categories(id),
    unit TEXT NOT NULL CHECK(unit IN ('kg', 'g', 'lb', 'l', 'ml', 'un', 'paq', 'pza', 'lata', 'botella', 'bolsa', 'otro')),
    default_unit_price REAL,
    image_url TEXT,
    barcode TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Price History
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id),
    store_id INTEGER NOT NULL REFERENCES stores(id),
    price REAL NOT NULL,
    unit_price REAL,
    promotion TEXT,
    promotion_type TEXT CHECK(promotion_type IN ('discount', 'bogo', 'package', 'card', null)),
    promotion_quantity INTEGER,
    promotion_price REAL,
    observation TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, store_id, date)
  );

  -- Shopping Lists
  CREATE TABLE IF NOT EXISTS shopping_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    store_id INTEGER REFERENCES stores(id),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
    total_estimated REAL DEFAULT 0,
    total_actual REAL DEFAULT 0,
    created_by TEXT DEFAULT 'family',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  -- Shopping List Items
  CREATE TABLE IF NOT EXISTS shopping_list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL REFERENCES shopping_lists(id),
    product_id INTEGER REFERENCES products(id),
    product_name TEXT,
    quantity REAL DEFAULT 1,
    unit TEXT DEFAULT 'un',
    estimated_price REAL,
    actual_price REAL,
    is_checked INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Purchases (history)
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER REFERENCES shopping_lists(id),
    store_id INTEGER REFERENCES stores(id),
    date DATE NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'transfer', 'credit', 'other')),
    receipt_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Purchase Items
  CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id),
    product_id INTEGER REFERENCES products(id),
    product_name TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total REAL NOT NULL
  );

  -- Family Members
  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK(role IN ('admin', 'member', 'guest')),
    color TEXT DEFAULT '#6366f1',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Budgets
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id),
    amount REAL NOT NULL,
    period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly', 'quarterly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- ==================== NEW TABLES FOR ALERTS & SAVINGS ====================
  
  -- Alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('price_drop', 'budget', 'promotion', 'price_increase')),
    product_id INTEGER REFERENCES products(id),
    store_id INTEGER REFERENCES stores(id),
    condition TEXT NOT NULL,
    threshold REAL NOT NULL,
    message TEXT,
    is_active INTEGER DEFAULT 1,
    last_triggered DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Savings Goals
  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL UNIQUE,
    goal_amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Price Alerts History
  CREATE TABLE IF NOT EXISTS price_alerts_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER REFERENCES alerts(id),
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_price REAL,
    new_price REAL,
    message TEXT
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
  CREATE INDEX IF NOT EXISTS idx_prices_store ON prices(store_id);
  CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
`);

// Insert default categories
const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, icon, color) VALUES (?, ?, ?)
`);

const defaultCategories = [
  // Aseo y limpieza
  ['Detergentes', '🧴', '#3b82f6'],
  ['Jabones', '🧼', '#8b5cf6'],
  ['Limpiadores', '🧽', '#06b6d4'],
  ['Papeles', '🧻', '#f59e0b'],
  ['Ambientadores', '🌸', '#ec4899'],
  
  // Abarrotes
  ['Lácteos', '🥛', '#22c55e'],
  ['Carnes', '🥩', '#ef4444'],
  ['Frutas', '🍎', '#10b981'],
  ['Verduras', '🥬', '#14b8a6'],
  ['Granos', '🌾', '#f97316'],
  ['Cereales', '🥣', '#eab308'],
  ['Enlatados', '🥫', '#78716c'],
  ['Condimentos', '🧂', '#f59e0b'],
  ['Bebidas', '🧃', '#06b6d4'],
  ['Snacks', '🍿', '#f472b6'],
  ['Panadería', '🍞', '#d97706'],
  
  // Hogar
  ['Electrodomésticos', '🔌', '#6366f1'],
  ['Utensilios', '🍳', '#8b5cf6'],
  ['Decoración', '🛋️', '#ec4899'],
  
  // Salud
  ['Medicamentos', '💊', '#ef4444'],
  ['Cuidado Personal', '🧴', '#f472b6'],
  ['Primeros Auxilios', '🩹', '#22c55e'],
];

for (const cat of defaultCategories) {
  insertCategory.run(...cat);
}

// Insert default family member
db.prepare(`INSERT OR IGNORE INTO family_members (name, role, color) VALUES (?, ?, ?)`)
  .run('Belal', 'admin', '#6366f1');

// Insert sample stores with coordinates (Bogotá neighborhoods)
const insertStore = db.prepare(`
  INSERT OR IGNORE INTO stores (name, neighborhood, city, type, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)
`);

const sampleStores = [
  ['Éxito Calle 80', 'Calle 80', 'Bogotá', 'supermarket', 4.7500, -74.0500],
  ['Carrefour Chapinero', 'Chapinero', 'Bogotá', 'supermarket', 4.6300, -74.0600],
  ['Jumbo Santa Ana', 'Santa Ana', 'Bogotá', 'supermarket', 4.7100, -74.0300],
  ['D1 Chapinero', 'Chapinero', 'Bogotá', 'local', 4.6350, -74.0550],
  ['Aldi Zona Rosa', 'Zona Rosa', 'Bogotá', 'supermarket', 4.6700, -74.0450],
  [' Olímpica 93', 'Barrios Unidos', 'Bogotá', 'supermarket', 4.6850, -74.0750],
];

for (const store of sampleStores) {
  insertStore.run(...store);
}

console.log('✅ Canasta Familiar Database initialized at:', DB_PATH);
