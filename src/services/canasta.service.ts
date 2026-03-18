/**
 * Canasta Familiar - Price & Shopping Service
 * Sistema de precios para compras familiares con alertas y geolocalización
 */

import { db } from '../db/init';

// ==================== ALERTS ====================
export const alertService = {
  getAll(activeOnly: boolean = true) {
    let query = 'SELECT * FROM alerts';
    if (activeOnly) query += ' WHERE is_active = 1';
    query += ' ORDER BY created_at DESC';
    return db.prepare(query).all();
  },
  
  create(alert: any) {
    const result = db.prepare(`
      INSERT INTO alerts (type, product_id, store_id, condition, threshold, message, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      alert.type, alert.product_id, alert.store_id, alert.condition,
      alert.threshold, alert.message, alert.is_active !== false ? 1 : 0
    );
    return { id: result.lastInsertRowid, ...alert };
  },
  
  checkAlerts() {
    // Check all active alerts
    const alerts = this.getAll(true) as any[];
    const triggered: any[] = [];
    
    for (const alert of alerts) {
      let shouldTrigger = false;
      
      if (alert.type === 'price_drop') {
        // Check if price dropped below threshold
        const price = db.prepare(`
          SELECT price FROM prices 
          WHERE product_id = ? AND store_id = ?
          ORDER BY date DESC LIMIT 1
        `).get(alert.product_id, alert.store_id) as any;
        
        if (price && price.price <= alert.threshold) {
          shouldTrigger = true;
          alert.current_price = price.price;
        }
      } else if (alert.type === 'budget') {
        // Check budget threshold
        const spent = db.prepare(`
          SELECT COALESCE(SUM(total), 0) as total FROM purchases
          WHERE date >= date('now', 'start of month')
        `).get() as any;
        
        if (spent.total >= alert.threshold) {
          shouldTrigger = true;
          alert.current_spent = spent.total;
        }
      } else if (alert.type === 'promotion') {
        // Check for promotions
        const promo = db.prepare(`
          SELECT * FROM prices 
          WHERE product_id = ? AND promotion IS NOT NULL
          AND date >= date('now', '-7 days')
          ORDER BY date DESC LIMIT 1
        `).get(alert.product_id);
        
        if (promo) {
          shouldTrigger = true;
          alert.promotion = promo;
        }
      }
      
      if (shouldTrigger) {
        triggered.push(alert);
      }
    }
    
    return triggered;
  },
  
  deactivate(id: number) {
    return db.prepare('UPDATE alerts SET is_active = 0 WHERE id = ?').run(id);
  },
  
  delete(id: number) {
    return db.prepare('DELETE FROM alerts WHERE id = ?').run(id);
  }
};

// ==================== SAVINGS TRACKING ====================
export const savingsService = {
  // Calculate savings from promotions
  calculatePromoSavings(startDate?: string, endDate?: string) {
    const start = startDate || new Date().toISOString().substring(0, 7) + '-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    // Get all prices with promotions
    const result = db.prepare(`
      SELECT 
        pi.product_name,
        pi.quantity,
        pi.unit_price,
        pi.total as paid,
        p.promotion,
        p.promotion_price,
        p.promotion_type,
        (pi.unit_price * pi.quantity - pi.total) as savings
      FROM purchase_items pi
      JOIN purchases pur ON pi.purchase_id = pur.id
      LEFT JOIN prices p ON pi.product_id = p.product_id AND p.date = pur.date
      WHERE pur.date BETWEEN ? AND ?
      AND p.promotion IS NOT NULL
    `).all(start, end) as any[];
    
    const totalSavings = result.reduce((sum, item) => sum + (item.savings || 0), 0);
    
    return {
      totalSavings,
      transactions: result,
      count: result.length
    };
  },
  
  // Calculate savings from comparing prices (bought at lower price than usual)
  calculatePriceComparisonSavings(startDate?: string, endDate?: string) {
    const start = startDate || new Date().toISOString().substring(0, 7) + '-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    const result = db.prepare(`
      SELECT 
        pi.product_name,
        pi.quantity,
        pi.unit_price as paid_price,
        (SELECT MIN(price) FROM prices WHERE product_id = pi.product_id AND date <= ?) as min_price,
        ((SELECT MIN(price) FROM prices WHERE product_id = pi.product_id AND date <= ?) - pi.unit_price) * pi.quantity as savings
      FROM purchase_items pi
      JOIN purchases pur ON pi.purchase_id = pur.id
      WHERE pur.date BETWEEN ? AND ?
    `).all(end, end, start, end) as any[];
    
    const totalSavings = result.reduce((sum, item) => sum + (item.savings || 0), 0);
    
    return {
      totalSavings,
      transactions: result.filter(r => r.savings > 0),
      count: result.filter(r => r.savings > 0).length
    };
  },
  
  // Get total savings summary
  getTotalSavings(month?: string) {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const startDate = targetMonth + '-01';
    const endDate = targetMonth + '-31';
    
    const promo = this.calculatePromoSavings(startDate, endDate);
    const comparison = this.calculatePriceComparisonSavings(startDate, endDate);
    
    return {
      month: targetMonth,
      fromPromotions: promo.totalSavings,
      fromPriceComparison: comparison.totalSavings,
      total: promo.totalSavings + comparison.totalSavings,
      transactionsWithSavings: promo.count + comparison.count
    };
  },
  
  // Track monthly savings goal
  setSavingsGoal(amount: number, month: string) {
    const result = db.prepare(`
      INSERT OR REPLACE INTO savings_goals (month, goal_amount, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(month, amount);
    return { month, goal_amount: amount };
  },
  
  getSavingsGoal(month?: string) {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    return db.prepare('SELECT * FROM savings_goals WHERE month = ?').get(targetMonth);
  }
};

// ==================== GEOLOCATION ====================
export const geoService = {
  // Get stores near a location (lat, lng within radius in km)
  getNearbyStores(lat: number, lng: number, radiusKm: number = 5) {
    // Simple approximation: 1 degree ≈ 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / 111;
    
    return db.prepare(`
      SELECT * FROM stores 
      WHERE is_active = 1
      AND latitude BETWEEN ? AND ?
      AND longitude BETWEEN ? AND ?
      ORDER BY 
        ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?))
    `).all(
      lat - latDelta, lat + latDelta,
      lng - lngDelta, lng + lngDelta,
      lat, lat, lng, lng
    );
  },
  
  // Add coordinates to store
  setCoordinates(storeId: number, lat: number, lng: number) {
    return db.prepare(`
      UPDATE stores SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(lat, lng, storeId);
  },
  
  // Search stores by neighborhood/city
  searchByLocation(neighborhood?: string, city?: string) {
    let query = 'SELECT * FROM stores WHERE is_active = 1';
    const params: any[] = [];
    
    if (neighborhood) {
      query += ' AND neighborhood LIKE ?';
      params.push(`%${neighborhood}%`);
    }
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }
    
    query += ' ORDER BY name';
    return db.prepare(query).all(...params);
  },
  
  // Get all stores with coordinates for map
  getAllWithCoordinates() {
    return db.prepare(`
      SELECT id, name, address, neighborhood, city, latitude, longitude, type
      FROM stores 
      WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
    `).all();
  }
};

// ==================== STORES ====================
export const storeService = {
  getAll() {
    return db.prepare('SELECT * FROM stores WHERE is_active = 1 ORDER BY name').all();
  },
  
  getById(id: number) {
    return db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  },
  
  create(store: any) {
    const result = db.prepare(`
      INSERT INTO stores (name, address, neighborhood, city, phone, type, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      store.name, store.address, store.neighborhood, store.city || 'Bogotá',
      store.phone, store.type, store.latitude, store.longitude
    );
    return { id: result.lastInsertRowid, ...store };
  },
  
  update(id: number, store: any) {
    return db.prepare(`
      UPDATE stores SET name = ?, address = ?, neighborhood = ?, city = ?, phone = ?, type = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `).run(
      store.name, store.address, store.neighborhood, store.city,
      store.phone, store.type, store.latitude, store.longitude, id
    );
  },
  
  delete(id: number) {
    return db.prepare('UPDATE stores SET is_active = 0 WHERE id = ?').run(id);
  }
};

// ==================== PRODUCTS ====================
export const productService = {
  getAll(filters?: { categoryId?: number; search?: string }) {
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];
    
    if (filters?.categoryId) {
      query += ' AND p.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters?.search) {
      query += ' AND (p.name LIKE ? OR p.brand LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' ORDER BY p.name';
    return db.prepare(query).all(...params);
  },
  
  getById(id: number) {
    return db.prepare(`
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
  },
  
  create(product: any) {
    const result = db.prepare(`
      INSERT INTO products (name, brand, category_id, unit, default_unit_price, barcode)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(product.name, product.brand, product.category_id, product.unit, product.default_unit_price, product.barcode);
    return { id: result.lastInsertRowid, ...product };
  },
  
  search(query: string) {
    return db.prepare(`
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND (p.name LIKE ? OR p.brand LIKE ?)
      ORDER BY p.name
      LIMIT 20
    `).all(`%${query}%`, `%${query}%`);
  }
};

// ==================== PRICES ====================
export const priceService = {
  getCurrent(productId?: number, storeId?: number) {
    let query = `
      SELECT p.*, pr.name as product_name, pr.brand, pr.unit as product_unit,
             s.name as store_name, s.neighborhood, s.city
      FROM prices p
      JOIN products pr ON p.product_id = pr.id
      JOIN stores s ON p.store_id = s.id
      WHERE p.date = (SELECT MAX(date) FROM prices WHERE product_id = p.product_id AND store_id = p.store_id)
    `;
    const params: any[] = [];
    
    if (productId) {
      query += ' AND p.product_id = ?';
      params.push(productId);
    }
    if (storeId) {
      query += ' AND p.store_id = ?';
      params.push(storeId);
    }
    
    query += ' ORDER BY pr.name, s.name';
    return db.prepare(query).all(...params);
  },
  
  comparePrices(productId: number) {
    return db.prepare(`
      SELECT p.*, s.name as store_name, s.neighborhood, s.city, s.latitude, s.longitude
      FROM prices p
      JOIN stores s ON p.store_id = s.id
      WHERE p.product_id = ?
      AND p.date = (SELECT MAX(date) FROM prices WHERE product_id = ? AND store_id = p.store_id)
      ORDER BY p.price ASC
    `).all(productId, productId);
  },
  
  getBestPrice(productId: number) {
    return db.prepare(`
      SELECT p.*, s.name as store_name
      FROM prices p
      JOIN stores s ON p.store_id = s.id
      WHERE p.product_id = ?
      AND p.date = (SELECT MAX(date) FROM prices WHERE product_id = ? AND store_id = p.store_id)
      ORDER BY p.price ASC
      LIMIT 1
    `).get(productId, productId);
  },
  
  addPrice(price: any) {
    const result = db.prepare(`
      INSERT INTO prices (product_id, store_id, price, unit_price, promotion, promotion_type, promotion_quantity, promotion_price, observation, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      price.product_id, price.store_id, price.price, price.unit_price,
      price.promotion, price.promotion_type, price.promotion_quantity,
      price.promotion_price, price.observation, price.date || new Date().toISOString().split('T')[0]
    );
    return { id: result.lastInsertRowid, ...price };
  }
};

// ==================== SHOPPING LISTS ====================
export const listService = {
  getAll(status?: string) {
    let query = `
      SELECT sl.*, s.name as store_name, 
             (SELECT COUNT(*) FROM shopping_list_items WHERE list_id = sl.id AND is_checked = 0) as items_pending,
             (SELECT COUNT(*) FROM shopping_list_items WHERE list_id = sl.id) as total_items
      FROM shopping_lists sl
      LEFT JOIN stores s ON sl.store_id = s.id
    `;
    
    if (status) {
      query += ' WHERE sl.status = ?';
      return db.prepare(query).all(status);
    }
    
    query += ' ORDER BY sl.created_at DESC';
    return db.prepare(query).all();
  },
  
  getById(id: number) {
    const list = db.prepare(`
      SELECT sl.*, s.name as store_name
      FROM shopping_lists sl
      LEFT JOIN stores s ON sl.store_id = s.id
      WHERE sl.id = ?
    `).get(id);
    
    if (list) {
      (list as any).items = db.prepare(`
        SELECT sli.*, p.name as product_name, p.unit as product_unit, p.category_id, c.name as category_name, c.icon as category_icon
        FROM shopping_list_items sli
        LEFT JOIN products p ON sli.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE sli.list_id = ?
        ORDER BY sli.is_checked, c.name, sli.product_name
      `).all(id);
    }
    
    return list;
  },
  
  create(list: any) {
    const result = db.prepare(`
      INSERT INTO shopping_lists (name, description, store_id, total_estimated, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(list.name, list.description, list.store_id, list.total_estimated || 0, list.created_by || 'family');
    return { id: result.lastInsertRowid, ...list };
  },
  
  addItem(item: any) {
    const result = db.prepare(`
      INSERT INTO shopping_list_items (list_id, product_id, product_name, quantity, unit, estimated_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(item.list_id, item.product_id, item.product_name, item.quantity || 1, item.unit || 'un', item.estimated_price, item.notes);
    return { id: result.lastInsertRowid, ...item };
  },
  
  updateItem(id: number, updates: any) {
    const fields = [];
    const params = [];
    
    if (updates.quantity !== undefined) { fields.push('quantity = ?'); params.push(updates.quantity); }
    if (updates.estimated_price !== undefined) { fields.push('estimated_price = ?'); params.push(updates.estimated_price); }
    if (updates.actual_price !== undefined) { fields.push('actual_price = ?'); params.push(updates.actual_price); }
    if (updates.is_checked !== undefined) { fields.push('is_checked = ?'); params.push(updates.is_checked); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); params.push(updates.notes); }
    
    params.push(id);
    return db.prepare(`UPDATE shopping_list_items SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  },
  
  complete(id: number, total: number) {
    return db.prepare(`
      UPDATE shopping_lists SET status = 'completed', total_actual = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(total, id);
  }
};

// ==================== STATISTICS ====================
export const statsService = {
  getMonthlySpending(month?: string) {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const startDate = targetMonth + '-01';
    const endDate = targetMonth + '-31';
    
    const result = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as transactions
      FROM purchases
      WHERE date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;
    
    const byCategory = db.prepare(`
      SELECT c.name, c.icon, c.color, SUM(pi.total) as total
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      LEFT JOIN products pr ON pi.product_id = pr.id
      LEFT JOIN categories c ON pr.category_id = c.id
      WHERE p.date BETWEEN ? AND ?
      GROUP BY c.id
      ORDER BY total DESC
    `).all(startDate, endDate);
    
    const byStore = db.prepare(`
      SELECT s.name, SUM(p.total) as total, COUNT(*) as visits
      FROM purchases p
      JOIN stores s ON p.store_id = s.id
      WHERE p.date BETWEEN ? AND ?
      GROUP BY s.id
      ORDER BY total DESC
    `).all(startDate, endDate);
    
    return { ...result, byCategory, byStore };
  }
};
