# Canasta Familiar - Family Shopping & Finance Tracker

Open source family shopping management system with budget tracking, savings analysis, and smart price comparisons for Colombian supermarkets.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/iberi22/family-shopping)](https://github.com/iberi22/family-shopping/stargazers)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](package.json)

## About

**Canasta Familiar** helps families manage their grocery shopping and track finances by:
- Comparing prices across supermarkets in Colombia
- Tracking monthly budgets and spending
- Analyzing savings from promotions and price comparisons
- Managing shopping lists with cost estimates
- Finding stores near you with geolocation

## Finance Tracking Features

### 💰 Savings Tracking
- **Promotion Savings**: Calculate savings from promotional prices vs regular prices
- **Price Comparison Savings**: Track savings by buying at lower prices than average
- **Monthly Goals**: Set and track monthly savings goals
- **Savings Reports**: View detailed savings reports by date range

### 📊 Budget Management
- Set category-based budgets (weekly, monthly, quarterly)
- Track spending by category and store
- Budget alerts when thresholds are exceeded
- Monthly spending statistics

### 🎯 Alerts System
- **Price Drop Alerts**: Get notified when products reach target prices
- **Budget Alerts**: Alert when monthly spending exceeds threshold
- **Promotion Alerts**: Get notified about ongoing promotions

## Supported Stores (Colombia)

| Store | Type |
|-------|------|
| Éxito | Supermarket |
| Jumbo | Supermarket |
| Carulla | Supermarket |
| D1 | Discount store |
| Ara | Discount store |
| Cañaveral | Local |
| Olímpica | Supermarket |

## Quick Start

```bash
# Clone repository
git clone https://github.com/iberi22/family-shopping.git
cd family-shopping

# Install dependencies
npm install

# Initialize database (creates SQLite DB in ./data/)
npm run db:init

# Start development server
npm run dev
```

Server runs at `http://localhost:3003`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3003` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `DB_PATH` | `./data/canasta.db` | SQLite database path |

## API Endpoints

### Savings & Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings` | Get total savings for a month |
| GET | `/api/savings/promotions` | Savings from promotions |
| GET | `/api/savings/comparison` | Savings from price comparisons |
| POST | `/api/savings/goal` | Set monthly savings goal |
| GET | `/api/savings/goal` | Get current savings goal |

### Budget & Spending
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/monthly` | Monthly spending statistics |
| GET | `/api/alerts` | List active alerts |
| POST | `/api/alerts` | Create new alert |
| POST | `/api/alerts/check` | Check and trigger alerts |

### Price Comparison
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prices/compare/:productId` | Compare prices across stores |
| GET | `/api/prices/best/:productId` | Get best price for product |
| GET | `/api/scrape/search` | Search online prices |
| GET | `/api/scrape/compare` | Compare prices for multiple products |

Full API documentation: [SKILL.md](SKILL.md)

## Technologies

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Language**: TypeScript
- **Validation**: Zod
- **HTTP Client**: Undici

## Project Structure

```
src/
├── index.ts           # Express server & API routes
├── db/
│   └── init.ts       # Database schema & initialization
└── services/
    ├── canasta.service.ts  # Core business logic (savings, alerts, stores, etc.)
    └── scraper.service.ts # Web scraping for online prices
```

## Security Considerations

- All data stored locally in SQLite by default
- No cloud sync - data stays on your machine
- Input validation using Zod schemas
- Parameterized SQL queries (SQL injection protection)
- CORS enabled for local development

## Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)

## Author

iberi22 - https://github.com/iberi22

---

⭐️ If you like this project, don't forget to star it!
