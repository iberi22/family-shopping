# Canasta Familiar - Arquitectura

**Última actualización:** 2026-03-17

## Visión General

Sistema de precios y administración de compras familiares.

## Arquitectura

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (better-sqlite3)
- **Lenguaje:** TypeScript

## Componentes Clave

| Componente | Descripción |
|------------|-------------|
| `src/db/init.ts` | Esquema de base de datos |
| `src/services/canasta.service.ts` | Lógica de precios y compras |
| `src/index.ts` | Servidor Express |

## Esquema de Base de Datos

- **stores** - Supermercados y tiendas
- **categories** - Categorías de productos
- **products** - Catálogo de productos
- **prices** - Historial de precios
- **shopping_lists** - Listas de compras
- **shopping_list_items** - Items en listas
- **purchases** - Historial de compras
- **family_members** - Miembros de la familia
- **budgets** - Presupuestos

## API Endpoints

- `/api/stores` - Gestión de tiendas
- `/api/products` - Catálogo de productos
- `/api/prices` - Precios y comparaciones
- `/api/lists` - Listas de compras
- `/api/categories` - Categorías
- `/api/stats` - Estadísticas

## Privacidad de Datos

- ✅ Base de datos SQLite local
- ✅ Separada de memorias de proyectos
- ✅ No sincronizada a Cortex
- ✅ Sin cloud por defecto
