# Resilient Node.js API System

A production-grade demonstration of fault tolerance patterns used in real-world distributed systems — built with Node.js and TypeScript.

## What This Project Demonstrates

Most backend systems fail silently when a dependent service goes down. This project implements three industry-standard resilience patterns that prevent cascading failures:

- **Circuit Breaker** — Detects failing services and stops calling them, allowing recovery time
- **Retry with Exponential Backoff + Jitter** — Intelligently retries transient failures without overwhelming recovering services  
- **Bulkhead** — Isolates resources per service so one failure cannot consume everything

## Live Demo

The system includes a real-time dashboard where you can:
- Inject failures into mock services (0–100% failure rate)
- Watch circuit breakers trip from CLOSED → OPEN → HALF_OPEN → CLOSED
- See bulkheads reject excess concurrent requests
- Bombard the system with 20 simultaneous requests and observe fault isolation

## Architecture
Client Request
      │
      ▼
API Gateway (Express)
      │
      ├───────────────┬───────────────┐
      ▼               ▼
Payment Service   Inventory Service
      │               │
      ▼               ▼
Resilience Layer (per service):
  • Bulkhead (concurrency isolation)
  • Retry Manager (with backoff + jitter)
  • Circuit Breaker (failure detection)
      │
      ▼
Mock External Services

## Tech Stack

- Node.js + TypeScript
- Express.js
- Custom implementations of all 3 resilience patterns (no external libraries)

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Open dashboard
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order` | Place an order (goes through all 3 patterns) |
| GET | `/health` | Live metrics for all circuit breakers and bulkheads |
| POST | `/admin/payment/failure-rate` | Set payment service failure rate (0–1) |
| POST | `/admin/inventory/failure-rate` | Set inventory service failure rate (0–1) |
| POST | `/admin/reset` | Restore all services to full health |

## How to Trigger Each Pattern

### Circuit Breaker
1. Set payment failure rate to 90% via dashboard
2. Click Bombard 20x
3. After 3 failures, PaymentCB flips to OPEN
4. All subsequent requests are instantly blocked
5. After 30s, transitions to HALF_OPEN and tests recovery

### Bulkhead
1. Click Bombard 20x with high concurrency
2. PaymentBulkhead allows max 3 concurrent requests
3. Excess requests are immediately rejected
4. InventoryBulkhead (max 8) remains unaffected — isolation working

### Retry with Backoff
1. Set failure rate to 30–50%
2. Watch terminal logs — failed requests retry with increasing delays
3. Retries only happen on server errors (503) — not client errors (404)

## Key Design Decisions

- **No external resilience libraries** — all patterns implemented from scratch to demonstrate deep understanding
- **Separate circuit breakers per service** — payment failures don't affect inventory
- **Jitter on retries** — prevents thundering herd when multiple clients retry simultaneously
- **Non-retryable errors** — 400/404 errors are never retried, only 5xx/network errors

## Patterns Used In Production By

Netflix (Hystrix), Amazon AWS SDK, Google Cloud libraries, Uber, and virtually every company running microservices at scale.
