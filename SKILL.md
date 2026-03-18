---
name: canasta-familiar
description: Sistema de precios y administración de compras familiares. Gestiona precios de supermercado, listas de compras, comparación de precios, alertas de precios, seguimiento de ahorro y geolocalización de tiendas. NOTE: Usa SQLite en E:\scripts-python\personal-finance\data\canasta.db - SEPARADO de memorias de proyectos.
version: "2.0.0"
author: SWAL Labs
type: skill
tags: [family, shopping, prices, budget, groceries, supermarket, household, alerts, savings, geolocation]
homepage: https://github.com/southwest-ai-labs/canasta-familiar
---

# Canasta Familiar Skill v2.0

Sistema de precios y administración de compras familiares con alertas y geolocalización.

## IMPORTANTE - Base de Datos Separada

**Este skill usa una base de datos SEPARADA de las memorias de proyectos:**
- Base de datos: `E:\scripts-python\personal-finance\data\canasta.db`
- NO en: `C:\Users\belal\clawd\memory\*.md` o Cortex

Todos los datos financieros stays local y privado.

## Nuevas Funcionalidades v2.0

### 🎯 Alertas
- Alertas de caída de precios
- Alertas de presupuesto
- Alertas de promociones
- Alertas de aumento de precios

### 💰 Seguimiento de Ahorro
- Ahorro por promociones
- Ahorro por comparación de precios
- Metas de ahorro mensual
- Registro histórico de ahorros

### 📍 Geolocalización
- Tiendas cerca de tu ubicación
- Búsqueda por barrio/ciudad
- Mapa de tiendas con coordenadas

## Inicio Rápido

```bash
# Iniciar el servidor API
cd E:\scripts-python\personal-finance
npm install
npm run db:init
npm run dev

# Servidor en puerto 3003
```

## API Endpoints

### Tiendas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/stores | Listar tiendas |
| GET | /api/stores/nearby?lat=4.75&lng=-74.05 | Tiendas cercanas |
| GET | /api/stores/search?neighborhood=Chapinero | Buscar por ubicación |
| GET | /api/stores/map | Tiendas con coordenadas |
| POST | /api/stores | Crear tienda |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/products | Listar productos |
| GET | /api/products/search?q=leche | Buscar productos |
| GET | /api/products/:id | Ver producto + precios |
| POST | /api/products | Crear producto |

### Precios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/prices | Precios actuales |
| GET | /api/prices/compare/:id | Comparar precios |
| GET | /api/prices/best/:id | Mejor precio |
| POST | /api/prices | Agregar precio |

### Alertas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/alerts | Ver alertas |
| POST | /api/alerts | Crear alerta |
| POST | /api/alerts/check | Verificar alertas |
| DELETE | /api/alerts/:id | Eliminar alerta |

### Ahorro
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/savings | Total ahorros |
| GET | /api/savings/promotions | Ahorro por promociones |
| GET | /api/savings/comparison | Ahorro por comparación |
| POST | /api/savings/goal | Establecer meta |
| GET | /api/savings/goal | Ver meta |

### Listas de Compras
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/lists | Ver listas |
| POST | /api/lists | Crear lista |
| POST | /api/lists/:id/items | Agregar item |
| POST | /api/lists/:id/complete | Completar lista |

### Estadísticas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/stats/monthly | Gastos mensuales |

## Ejemplos de Uso

### 1. Encontrar tiendas cerca de ti
```json
GET /api/stores/nearby?lat=4.75&lng=-74.05&radius=3
```
Retorna tiendas dentro de 3km de las coordenadas.

### 2. Crear alerta de precio
```json
POST /api/alerts
{
  "type": "price_drop",
  "product_id": 1,
  "store_id": 1,
  "condition": "below",
  "threshold": 4000,
  "message": "Leche降价了!"
}
```

### 3. Ver ahorro total del mes
```json
GET /api/savings?month=2026-03
```
Retorna:
```json
{
  "month": "2026-03",
  "fromPromotions": 25000,
  "fromPriceComparison": 15000,
  "total": 40000
}
```

### 4. Establecer meta de ahorro
```json
POST /api/savings/goal
{
  "amount": 200000,
  "month": "2026-04"
}
```

### 5. Comparar precios de un producto
```json
GET /api/prices/compare/1
```
Retorna precios en todas las tiendas, ordenado por precio.

### 6. Buscar tiendas en un barrio
```json
GET /api/stores/search?neighborhood=Chapinero
```

## Tipos de Alertas

| Tipo | Descripción | Condición |
|------|-------------|------------|
| `price_drop` | Precio bajó | threshold = precio máximo |
| `price_increase` | Precio subió | threshold = precio mínimo |
| `budget` | Presupuesto alcanzado | threshold = monto |
| `promotion` | Promoción disponible | Cuando hay promo |

## Seguimiento de Ahorro

### Ahorro por Promociones
- 2x1 (BOGO)
- Descuento directo
- Precio especial con tarjeta
- Paquete promocional

### Ahorro por Comparación
- Compraste más barato que el promedio
- Encontraste el mejor precio
- Compraste en tienda más económica

## Geolocalización

### Agregar coordenadas a tienda
```json
PATCH /api/stores/1
{
  "latitude": 4.7500,
  "longitude": -74.0500
}
```

### Tiendas de ejemplo (Bogotá)
- Éxito Calle 80 (4.7500, -74.0500)
- Carrefour Chapinero (4.6300, -74.0600)
- Jumbo Santa Ana (4.7100, -74.0300)

## Privacidad de Datos

- ✅ Datos almacenados localmente en SQLite
- ✅ No en memorias de proyectos
- ✅ No en Cortex
- ✅ Sin sync a cloud (a menos que se configure)
