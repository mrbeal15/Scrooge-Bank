# 🏦 Scrooge Bank API

**A simple banking API demo built with NestJS, Prisma, and PostgreSQL**

This project implements a lightweight banking service with support for **checking accounts**, **personal loans**, and **basic transactions** (deposits, withdrawals, and payments).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | [NestJS](https://nestjs.com/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Database | PostgreSQL |
| Validation | [Zod](https://github.com/colinhacks/zod) |
| Testing | Jest + Supertest |

---

## 📋 Features & User Stories

### ✅ Core Functionality

#### General
- **Operator can view total bank balance.**
- Bank starts with **$250,000** cash on hand and may leverage **25% of customer balances** for loans.

#### Accounts
- Users can **open** or **close** an account.
- A user can only have **one open account** of a given type.
- Account types: `checking` or `personal loan`.

#### Deposits
- Users can **deposit** into their own account.
- Cannot deposit into another user’s account.
- Cannot deposit if the account is closed or missing.

#### Withdrawals
- Users can **withdraw** from their own account.
- Cannot withdraw if insufficient funds.
- Cannot withdraw from another user’s account.

#### Loans
- Users can **apply for personal loans**.
- Bank approves loans it can afford (cash on hand + 25% deposits).
- Loan payments reduce loan balance and restore bank cash.

#### Authentication *(Self-directed story)*
- Simple JWT-based authentication using hashed passwords.
- Users must log in to make account or transaction requests.
- Operators must log in to view bank totals.

---

## 🧩 Data Models

```prisma
model User {
  id         Int       @id @default(autoincrement())
  first_name String
  last_name  String
  role       String
  Account    Account[]
}

model Account {
  id       Int     @id @default(autoincrement())
  user     User?   @relation(fields: [user_id], references: [id])
  user_id  Int
  type     String
  status   String
  balance  Int
}

model Transaction {
  id         Int    @id @default(autoincrement())
  user_id    Int
  account_id Int
  type       String
  amount     Int
}
```

All balances are stored in **cents** for accuracy.

---

## ⚙️ Setup & Installation

### 1️⃣ Install dependencies
```bash
pnpm install
```

### 2️⃣ Configure environment variables

Copy the example file and update it as needed:

```bash
cp .env.example .env
```

Example contents:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scrooge_bank?schema=public"
PORT=3000
```

> The app expects a local PostgreSQL database with a `postgres` user (`postgres:postgres`).
> To create it manually:
> ```bash
> psql -h localhost -U $(whoami) -d postgres
> CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
> CREATE DATABASE scrooge_bank OWNER postgres;
> ```

### 3️⃣ Initialize Prisma and the database
```bash
npx prisma migrate dev --name init
```

### 4️⃣ Run the application
```bash
pnpm start:dev
```

Visit [http://localhost:3000/health](http://localhost:3000/health) for a quick check.

---

## 🧠 API Overview

| Endpoint | Method | Payload | Description |
|-----------|---------|-------|-------------|
| `/health` | GET | | Service health check |
| `/accounts/new` | POST | { first_name: string, last_name: string, role: 'customer , account_type: 'checking' \| 'personal loan' } | Create a new account (and user if needed) |
| `/accounts/close` | POST | { account_id: number } | Close an account |
| `/transactions/deposit` | POST | Deposit into account |
| `/transactions/withdrawal` | POST | Withdraw from account |
| `/transactions/payment` | POST | Make a loan payment |
| `/admin/totals` | GET | View bank totals (operator only) |
| `/login` | POST | Authenticate user and get JWT |

---

## 🧪 Testing

This project includes both **integration** and **unit** tests using Jest and Supertest.

### Run all tests
```bash
pnpm test
```

### Example tests
- `account.controller.spec.ts`: Validates controller behavior, request validation, and HTTP responses.
- `account.service.spec.ts`: Unit tests for database interactions and business logic.

---

## 🧱 Project Tasks & Progress

| Task | Description | Status |
|------|--------------|--------|
| 1. Scaffold project | NestJS + Prisma + Jest setup | ✅ |
| 2. Account creation | `/accounts/new` endpoint + tests | ✅ |
| 3. Account closure | `/accounts/close` endpoint + tests | ✅ |
| 4. Transactions (deposits) | Endpoint + balance updates |  |
| 5. Transactions (withdrawals) | Endpoint + fund checks |  |
| 6. Admin totals | Operator endpoint + access control |  |
| 7. Self-directed (Auth) | JWT login + role validation |  |

---

## 🧾 Design & Implementation Notes

- **Validation:** All request bodies are validated at the controller layer using Zod. Invalid inputs produce structured 400 responses with field-level messages.
- **Separation of Concerns:** Controllers handle validation and routing; services handle business logic and database calls.
- **Transactions:** All deposits/withdrawals update both user and bank balances atomically.
- **Testing Focus:** Exhaustive integration tests for account creation and closure, and unit tests for account service logic.
- **Scalability:** Prisma ORM and NestJS modular architecture make it easy to extend (e.g., new account types, loan rules).

---

## 💡 Future Enhancements

- Introduce transaction history and audit trail.
- Implement more granular account statuses (e.g., `pending`, `approved`).
- Add rate limiting and request logging middleware.
- Support multiple currencies.
- Dockerize environment for instant onboarding.

---

## 📚 Author Notes

This implementation was intentionally timeboxed (~4 hours) per the recruiter's instructions.
Unimplemented stories are documented and prioritized in the repo's issues and project board.
The focus was on correctness, validation, test coverage, and clean API design rather than feature completeness.

---

**Author:** Matt Beal
**Framework:** NestJS + Prisma + PostgreSQL
**License:** MIT
