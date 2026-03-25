# SRC.md — personal-finance

**Proyecto:** personal-finance
**Tipo:** API Backend / Gestión financiera personal
**Última actualización:** 2026-03-24

## 📌 Propósito

API backend para gestión de finanzas personales. Permite administrar cuentas, rastrear gastos, consultar saldos y métricas financieras. Proyecto relacionado con el broader SWAL de finanzas personales (personal-finance → financial-ai).

## 🏗️ Estructura

```
personal-finance/
├── src/
│   └── index.ts              # Entry point principal
├── routes/                   # Rutas API (Express)
│   ├── accounts.ts
│   ├── transactions.ts
│   └── budget.ts
├── services/                 # Lógica de negocio
│   ├── account.service.ts
│   ├── transaction.service.ts
│   └── budget.service.ts
├── db/                       # SQLite database
│   ├── schema.sql
│   └── migrations/
├── types/                    # TypeScript types
├── utils/                    # Helpers
└── scripts/                  # Scripts CLI / seeders
```

## 🔧 Stack

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Lenguaje | TypeScript |
| Database | SQLite (better-sqlite3) |
| Testing | Jest |

## 📦 Módulos Principales

| Módulo | Descripción |
|--------|-------------|
| accounts | Gestión de cuentas bancarias/carteras |
| transactions | Tracking de transacciones |
| budget | Presupuestos y alertas |
| ai_analyzer | Análisis AI de gastos |
| providers | Integración con providers de API |
| p2p | Sistema peer-to-peer (experimental) |

## 🚀 Uso

```bash
cd E:\scripts-python\personal-finance
npm install
npm run dev        # Desarrollo en puerto 3003
npm run build      # Build TypeScript
npm test           # Tests
```

## 📦 Dependencias

- express
- better-sqlite3
- typescript
- zod (validación)
- @types/*

## 🔗 Proyecto Relacionado

- **personal-finance** → **financial-ai** (complemento con AI)

---

*Generado automáticamente por GitCore Monitor*
