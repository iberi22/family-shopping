/**
 * Web Scraper Service
 * Extrae precios de supermercados online para comparación
 */

import { fetch } from 'undici';

// Supermarket URLs (Colombia)
const SUPERMARKET_URLS = {
  'exito': 'https://www.exito.com',
  'carrefour': 'https://www.carrefour.com.co',
  'jumbo': 'https://www.jumbo.com.co',
  'olimpica': 'https://www.olimpica.com',
  'falabella': 'https://www.falabella.com.co/falabella-co',
  'linio': 'https://www.linio.com.co',
  'mercadolibre': 'https://www.mercadolibre.com.co'
};

export interface ProductSearchResult {
  product: string;
  source: string;
  url: string;
  price: number | null;
  originalPrice: number | null;
  discount: number | null;
  inStock: boolean;
  timestamp: string;
}

export interface PriceComparisonResult {
  product: string;
  results: ProductSearchResult[];
  bestPrice: ProductSearchResult | null;
  totalStores: number;
  avgPrice: number | null;
}

class PriceScraperService {
  private searchTimeout = 10000; // 10 seconds
  
  /**
   * Search product across multiple stores
   */
  async searchProduct(productName: string): Promise<PriceComparisonResult> {
    const results: ProductSearchResult[] = [];
    
    // Search in parallel across stores
    const searches = [
      this.searchExito(productName),
      this.searchJumbo(productName),
      this.searchOlmpica(productName),
      this.searchMercadoLibre(productName),
    ];
    
    const settled = await Promise.allSettled(searches);
    
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
    
    // Calculate best price
    const validResults = results.filter(r => r.price !== null);
    const bestPrice = validResults.length > 0 
      ? validResults.reduce((best, current) => 
          current.price! < best.price! ? current : best
        )
      : null;
    
    const prices = validResults.map(r => r.price!);
    const avgPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : null;
    
    return {
      product: productName,
      results,
      bestPrice,
      totalStores: results.length,
      avgPrice
    };
  }

  /**
   * Search in Éxito
   */
  async searchExito(product: string): Promise<ProductSearchResult | null> {
    try {
      const query = encodeURIComponent(product);
      const url = `https://www.exito.com/ecom-api/v1/ search/products?searchTerm=${query}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.searchTimeout)
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const firstProduct = data?.items?.[0];
      
      if (!firstProduct) return null;
      
      return {
        product,
        source: 'Éxito',
        url: firstProduct.productUrl || `https://www.exito.com${firstProduct.url}`,
        price: firstProduct.price?.salePrice || firstProduct.price?.price,
        originalPrice: firstProduct.price?.listPrice,
        discount: firstProduct.price?.discount,
        inStock: firstProduct.availability?.isAvailable ?? true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Éxito search error:', error);
      return null;
    }
  }

  /**
   * Search in Jumbo
   */
  async searchJumbo(product: string): Promise<ProductSearchResult | null> {
    try {
      const query = encodeURIComponent(product);
      const url = `https://www.jumbo.com.co/api/catalog_system/pub/products/search?ft=${query}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.searchTimeout)
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const firstProduct = data?.items?.[0];
      
      if (!firstProduct) return null;
      
      return {
        product,
        source: 'Jumbo',
        url: firstProduct.link,
        price: firstProduct.priceInfo?.price?.value,
        originalPrice: firstProduct.priceInfo?.listPrice?.value,
        discount: firstProduct.priceInfo?.discountPercentage,
        inStock: firstProduct.inventory?.availableQuantity > 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Jumbo search error:', error);
      return null;
    }
  }

  /**
   * Search in Olímpica
   */
  async searchOlmpica(product: string): Promise<ProductSearchResult | null> {
    try {
      const query = encodeURIComponent(product);
      const url = `https://www.olimpica.com.co/api/catalog_system/pub/products/search?ft=${query}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.searchTimeout)
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const firstProduct = data?.items?.[0];
      
      if (!firstProduct) return null;
      
      return {
        product,
        source: 'Olímpica',
        url: firstProduct.link,
        price: firstProduct.priceInfo?.price?.value,
        originalPrice: firstProduct.priceInfo?.listPrice?.value,
        discount: firstProduct.priceInfo?.discountPercentage,
        inStock: firstProduct.inventory?.availableQuantity > 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Olímpica search error:', error);
      return null;
    }
  }

  /**
   * Search in Mercado Libre
   */
  async searchMercadoLibre(product: string): Promise<ProductSearchResult | null> {
    try {
      const query = encodeURIComponent(product);
      const url = `https://api.mercadolibre.com/sites/MCO/search?q=${query}&limit=1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.searchTimeout)
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const firstProduct = data?.results?.[0];
      
      if (!firstProduct) return null;
      
      return {
        product,
        source: 'Mercado Libre',
        url: firstProduct.permalink,
        price: firstProduct.price,
        originalPrice: firstProduct.original_price,
        discount: firstProduct.discount_percentage,
        inStock: firstProduct.available_quantity > 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Mercado Libre search error:', error);
      return null;
    }
  }

  /**
   * Get savings recommendation
   */
  async getSavingsRecommendation(productName: string): Promise<{
    recommendation: string;
    bestStore: string;
    potentialSavings: number;
    tips: string[];
  }> {
    const comparison = await this.searchProduct(productName);
    
    if (!comparison.bestPrice || !comparison.avgPrice) {
      return {
        recommendation: 'No se encontraron precios disponibles',
        bestStore: 'N/A',
        potentialSavings: 0,
        tips: ['Intenta con otro producto', 'Verifica tu conexión a internet']
      };
    }
    
    const potentialSavings = comparison.avgPrice - comparison.bestPrice.price!;
    const savingsPercent = (potentialSavings / comparison.avgPrice) * 100;
    
    const tips: string[] = [];
    
    if (savingsPercent > 20) {
      tips.push(`💰 ¡Gran ahorro! Puedes ahorrar ${Math.round(savingsPercent)}%`);
    }
    
    if (comparison.bestPrice.discount) {
      tips.push(`🏷️ Tiene ${comparison.bestPrice.discount}% de descuento`);
    }
    
    if (!comparison.bestPrice.inStock) {
      tips.push('⚠️ Verifica disponibilidad antes de ir');
    }
    
    tips.push(`📍 Compara en tienda física vs online`);
    tips.push(`🛒 Algunos precios incluyen delivery`);
    
    return {
      recommendation: `El mejor precio está en ${comparison.bestPrice.source}`,
      bestStore: comparison.bestPrice.source,
      potentialSavings: Math.round(potentialSavings),
      tips
    };
  }
}

export const priceScraper = new PriceScraperService();
