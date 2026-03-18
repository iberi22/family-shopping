# Canasta Familiar

Sistema de precios y administración de compras familiares de código abierto.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/iberi22/canasta-familiar)](https://github.com/iberi22/canasta-familiar/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/iberi22/canasta-familiar)](https://github.com/iberi22/canasta-familiar/issues)

## 📋 Acerca del Proyecto

Canasta Familiar es un sistema de código abierto para gestionar precios de productos de supermercado, comparar precios entre tiendas, crear listas de compras, seguir el presupuesto familiar y encontrar las mejores ofertas.

## ✨ Características

- 📊 **Gestión de Precios**: Registra y compara precios entre diferentes tiendas
- 🛒 **Listas de Compras**: Crea y gestiona listas de compras
- 📍 **Geolocalización**: Encuentra tiendas cerca de tu ubicación
- 🎯 **Alertas**: Notificaciones de precios y promociones
- 💰 **Seguimiento de Ahorro**: Controla cuánto ahorras
- 🌐 **Comparación Online**: Busca precios en tiendas online
- 📱 **API REST**: Integración fácil con otras apps

## 🚀 Inicio Rápido

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

El servidor correrá en `http://localhost:3003`

## � API

Ver la [documentación completa de API](SKILL.md) para todos los endpoints disponibles.

### Ejemplos

```bash
# Obtener tiendas cercanas
curl "http://localhost:3003/api/stores/nearby?lat=4.75&lng=-74.05&radius=3"

# Buscar producto online
curl "http://localhost:3003/api/scrape/recommend?product=leche+entera"

# Ver ahorro del mes
curl "http://localhost:3003/api/savings?month=2026-03"
```

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite (better-sqlite3)
- **Lenguaje**: TypeScript
- **Scraping**: Undici HTTP client

## 📁 Estructura del Proyecto

```
canasta-familiar/
├── src/
│   ├── db/           # Esquema de base de datos
│   └── services/      # Lógica de negocio
├── data/             # Base de datos SQLite
├── .github/
│   └── workflows/    # CI/CD
├── SKILL.md          # Documentación del skill
├── README.md         # Este archivo
└── package.json
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👤 Autor

- **Belal** - [BeRi0n3](https://github.com/BeRi0n3)

## 🌟 Contribuidores

¡Gracias a todos los que han contribuido a este proyecto!

---

⭐️ Si te gusta este proyecto, no olvides darle una estrella en GitHub!
