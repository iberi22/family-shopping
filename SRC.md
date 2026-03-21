# SRC.md - Personal Finance (Family Shopping)

> Sistema open source de gestión de compras familiares y finanzas del hogar.

## Proyecto

- **Nombre:** Personal Finance / Family Shopping
- **Tipo:** Full-stack web application
- **Descripción:** Sistema open source para gestionar precios de supermercado, comparar precios entre tiendas, crear listas de compras, rastrear presupuesto familiar y encontrar mejores ofertas.
- **Tech Stack:** Node.js, TypeScript, base de datos (SQLite/PostgreSQL)
- **Repo:** github.com/iberi22/family-shopping

## Estructura

```
personal-finance/
├── db/                     # Base de datos y esquemas
├── routes/                 # Rutas API
├── services/               # Servicios de negocio
├── types/                  # Tipos TypeScript
├── utils/                  # Utilidades
├── src/                    # Código principal
├── scripts/                # Scripts de automatización
├── tests/                  # Tests
├── docs/                   # Documentación
├── data/                   # Datos de productos y precios
├── results/                # Resultados de evaluación
├── tasks/                  # Tareas programadas
├── .env                    # Variables de entorno
├── config.yaml             # Configuración
├── requirements.txt
├── package.json
├── DESIGN.md
├── README.md
├── SKILL.md
└── test_api.py
```

## Características

| Feature | Descripción |
|---------|-------------|
| 📊 Price Management | Registrar y comparar precios entre tiendas |
| 🛒 Shopping Lists | Crear y gestionar listas de compras |
| 📍 Geolocation | Encontrar tiendas cercanas |
| 🎯 Alerts | Notificaciones de precios y promociones |
| 💰 Savings Tracking | Rastrear cuánto ahorras |
| 🌐 Online Comparison | Buscar precios en tiendas online |

## API Endpoints (principales)

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/products | Listar productos |
| POST | /api/lists | Crear lista de compras |
| GET | /api/prices/:store | Precios por tienda |
| POST | /api/alerts | Configurar alerta de precio |

## Quick Start

```bash
# Clonar e instalar
git clone https://github.com/iberi22/family-shopping.git
cd family-shopping
npm install

# Configurar base de datos
npm run db:migrate

# Iniciar servidor
npm run dev
```

## Estado

- ✅ Activo
- 🛒 Listas de compras + comparación de precios
- 📍 Geolocalización de tiendas
- 💰 Savings tracking
- 🔧 Última comisión: 2026-03-20 (GitCore monitor update)

*Última actualización: 2026-03-20*
