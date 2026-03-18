---
name: family-shopping
description: Open source family shopping management system. Manages supermarket prices, shopping lists, price alerts, savings tracking, and store geolocation for Colombian supermarkets.
version: "2.0.0"
author: BeRi0n3
type: skill
tags: [family, shopping, prices, budget, groceries, supermarket, household, alerts, savings, geolocation, open-source]
homepage: https://github.com/iberi22/family-shopping
repository: https://github.com/iberi22/family-shopping
user-invocable: true
---

# Family Shopping - OpenClaw Skill

Open source family shopping management system for Colombian supermarkets.

## Features

- 📊 **Price Management**: Record and compare prices
- 🛒 **Shopping Lists**: Create and manage lists
- 📍 **Geolocation**: Find stores near you
- 🎯 **Alerts**: Price drop notifications
- 💰 **Savings**: Track your savings
- 🌐 **Online Search**: Compare real-time prices

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Start server
npm run dev
```

Server runs at `http://localhost:3003`

## Supported Stores

- Mercar, Ara, D1, Cañaveral
- Éxito, Jumbo, Carulla

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stores | List stores |
| GET | /api/stores/nearby | Nearby stores |
| GET | /api/prices/compare/:id | Price comparison |
| GET | /api/savings | Savings summary |
| POST | /api/alerts | Create alert |

## Privacy

All data stored locally in SQLite. No cloud sync by default.

---

*Skill for OpenClaw - AgentSkills compatible*
