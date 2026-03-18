---
name: canasta-familiar
description: Sistema de precios y administración de compras familiares. Gestiona precios de supermercado, listas de compras, comparación de precios, alertas de precios, seguimiento de ahorro y geolocalización de tiendas.
version: "2.0.0"
author: BeRi0n3
type: skill
tags: [family, shopping, prices, budget, groceries, supermarket, household, alerts, savings, geolocation, open-source]
homepage: https://github.com/iberi22/canasta-familiar
repository: https://github.com/iberi22/canasta-familiar
---

# Canasta Familiar Skill v2.0

Sistema de precios y administración de compras familiares con alertas, geolocalización y comparación online.

## Características

- 📊 Gestión de precios por tienda
- 🛒 Listas de compras
- 📍 Geolocalización de tiendas
- 🎯 Alertas de precios
- 💰 Seguimiento de ahorro
- 🌐 Comparación online de precios

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/iberi22/canasta-familiar.git
cd canasta-familiar

# Instalar dependencias
npm install

# Inicializar base de datos
npm run db:init

# Iniciar servidor
npm run dev
```

## API

El servidor corre en `http://localhost:3003`

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/stores | Listar tiendas |
| GET | /api/stores/nearby | Tiendas cercanas |
| GET | /api/prices/compare/:id | Comparar precios |
| GET | /api/scrape/search | Buscar online |
| GET | /api/savings | Ahorro del mes |
| POST | /api/alerts | Crear alerta |

## Documentación Completa

Ver [README.md](README.md) para documentación más detallada.

## Licencia

MIT - Ver [LICENSE](LICENSE)

## Autor

BeRi0n3 - https://github.com/BeRi0n3
