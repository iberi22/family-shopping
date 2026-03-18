/**
 * Canasta Familiar API Server
 * Sistema de precios para compras familiares con alertas y geolocalización
 */

import express from 'express';
import cors from 'cors';
import { 
  storeService, 
  productService, 
  priceService, 
  listService, 
  categoryService,
  statsService,
  alertService,
  savingsService,
  geoService
} from './services/canasta.service';
import { priceScraper } from './services/scraper.service';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Canasta Familiar', 
    version: '2.0',
    features: ['alerts', 'savings', 'geolocation'],
    timestamp: new Date().toISOString() 
  });
});

// ==================== STORES ====================
app.get('/api/stores', (req, res) => {
  try {
    res.json(storeService.getAll());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/nearby', (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }
    res.json(geoService.getNearbyStores(
      Number(lat), 
      Number(lng), 
      Number(radius) || 5
    ));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/search', (req, res) => {
  try {
    const { neighborhood, city } = req.query;
    res.json(geoService.searchByLocation(neighborhood as string, city as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/map', (req, res) => {
  try {
    res.json(geoService.getAllWithCoordinates());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/:id', (req, res) => {
  try {
    const store = storeService.getById(Number(req.params.id));
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stores', (req, res) => {
  try {
    const store = storeService.create(req.body);
    res.status(201).json(store);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/stores/:id', (req, res) => {
  try {
    storeService.update(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PRODUCTS ====================
app.get('/api/products', (req, res) => {
  try {
    const { categoryId, search } = req.query;
    res.json(productService.getAll({
      categoryId: categoryId ? Number(categoryId) : undefined,
      search: search as string
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    res.json(productService.search(q as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productService.getById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    (product as any).priceComparison = priceService.comparePrices(Number(req.params.id));
    (product as any).bestPrice = priceService.getBestPrice(Number(req.params.id));
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const product = productService.create(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PRICES ====================
app.get('/api/prices', (req, res) => {
  try {
    const { productId, storeId } = req.query;
    res.json(priceService.getCurrent(
      productId ? Number(productId) : undefined,
      storeId ? Number(storeId) : undefined
    ));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prices/compare/:productId', (req, res) => {
  try {
    res.json(priceService.comparePrices(Number(req.params.productId)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/prices/best/:productId', (req, res) => {
  try {
    res.json(priceService.getBestPrice(Number(req.params.productId)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prices', (req, res) => {
  try {
    const price = priceService.addPrice(req.body);
    res.status(201).json(price);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ALERTS ====================
app.get('/api/alerts', (req, res) => {
  try {
    const { active } = req.query;
    res.json(alertService.getAll(active !== 'false'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alerts', (req, res) => {
  try {
    const alert = alertService.create(req.body);
    res.status(201).json(alert);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/alerts/check', (req, res) => {
  try {
    const triggered = alertService.checkAlerts();
    res.json({ triggered, count: triggered.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/alerts/:id', (req, res) => {
  try {
    alertService.delete(Number(req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== SAVINGS ====================
app.get('/api/savings', (req, res) => {
  try {
    const { month } = req.query;
    res.json(savingsService.getTotalSavings(month as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/savings/promotions', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    res.json(savingsService.calculatePromoSavings(startDate as string, endDate as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/savings/comparison', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    res.json(savingsService.calculatePriceComparisonSavings(startDate as string, endDate as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/savings/goal', (req, res) => {
  try {
    const { amount, month } = req.body;
    res.json(savingsService.setSavingsGoal(amount, month));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/savings/goal', (req, res) => {
  try {
    const { month } = req.query;
    res.json(savingsService.getSavingsGoal(month as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SHOPPING LISTS ====================
app.get('/api/lists', (req, res) => {
  try {
    const { status } = req.query;
    res.json(listService.getAll(status as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lists/:id', (req, res) => {
  try {
    const list = listService.getById(Number(req.params.id));
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lists', (req, res) => {
  try {
    const list = listService.create(req.body);
    res.status(201).json(list);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/lists/:id/items', (req, res) => {
  try {
    const item = listService.addItem({ ...req.body, list_id: Number(req.params.id) });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/lists/items/:id', (req, res) => {
  try {
    listService.updateItem(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/lists/:id/complete', (req, res) => {
  try {
    const { total } = req.body;
    listService.complete(Number(req.params.id), total);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== CATEGORIES ====================
app.get('/api/categories', (req, res) => {
  try {
    res.json(categoryService.getAll());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTICS ====================
app.get('/api/stats/monthly', (req, res) => {
  try {
    const { month } = req.query;
    res.json(statsService.getMonthlySpending(month as string));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEB SCRAPER ====================
app.get('/api/scrape/search', async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) {
      return res.status(400).json({ error: 'Product name required' });
    }
    
    const result = await priceScraper.searchProduct(product as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scrape/recommend', async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) {
      return res.status(400).json({ error: 'Product name required' });
    }
    
    const recommendation = await priceScraper.getSavingsRecommendation(product as string);
    res.json(recommendation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/scrape/compare', async (req, res) => {
  try {
    const { products } = req.query;
    if (!products) {
      return res.status(400).json({ error: 'Products list required (comma-separated)' });
    }
    
    const productList = (products as string).split(',').map(p => p.trim());
    const results = await Promise.all(
      productList.map(p => priceScraper.getSavingsRecommendation(p))
    );
    
    // Calculate total potential savings
    const totalSavings = results.reduce((sum, r) => sum + r.potentialSavings, 0);
    
    res.json({
      products: results,
      totalPotentialSavings: totalSavings,
      tip: totalSavings > 50000 
        ? '¡Gran oportunidad de ahorro! Considera comprar en línea.'
        : 'Compara precios regularmente para mejores ahorros.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🛒 Canasta Familiar API v2.0 running on port ${PORT}`);
  console.log(`📍 Features: Alerts, Savings Tracking, Geolocation`);
});

export default app;
