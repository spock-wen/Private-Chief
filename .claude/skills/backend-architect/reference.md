# Backend Architect Reference

Detailed patterns and examples for backend system design.

---

## API Design Details

### REST Resource Naming

```
✅ GET    /users              # List users
✅ GET    /users/{id}         # Get user
✅ POST   /users              # Create user
✅ PUT    /users/{id}         # Full update
✅ PATCH  /users/{id}         # Partial update
✅ DELETE /users/{id}         # Delete user
✅ GET    /users/{id}/orders  # Nested resource

❌ GET    /getUsers
❌ POST   /createUser
❌ GET    /users/list
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "message": "Invalid format" }
    ],
    "request_id": "abc-123"
  }
}
```

### Rate Limiting Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60  # When 429 returned
```

---

## Database Index Strategies

### When to Index

- Columns in WHERE, JOIN, ORDER BY
- Foreign keys
- Unique constraints
- Composite indexes for multi-column queries (order matters)

### Composite Index Order

For query `WHERE status = 'active' AND created_at > ? ORDER BY created_at DESC`:
```sql
CREATE INDEX idx_status_created ON orders (status, created_at DESC);
```

### Index Anti-Patterns

- Too many indexes on high-write tables
- Indexing low-cardinality columns alone (e.g., boolean)
- Redundant indexes

---

## Security Implementation Examples

### JWT Best Practices

- Short expiry (15 min access, 7 day refresh)
- Store refresh tokens hashed
- Include `jti` for revocation
- Validate `iss`, `aud`, `exp`, `iat`

### Input Validation (Node.js/Express)

```javascript
// Use validation library (Joi, Zod, etc.)
const schema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150)
});
const { error, value } = schema.validate(req.body);
```

### Parameterized Queries

```javascript
// ✅ Safe
db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ SQL Injection risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

---

## Circuit Breaker Pattern

| State | Behavior |
|-------|----------|
| Closed | Requests pass through |
| Open | Fail fast; no requests to downstream |
| Half-Open | Allow trial requests; transition based on success |

Typical thresholds: 5 failures in 10s → Open; 30s → Half-Open.

---

## Message Queue Patterns

### At-Least-Once Delivery

- Consumer acknowledges after processing
- Idempotent handling (check if already processed)
- Dead-letter queue for failed messages

### Event Sourcing Considerations

- Append-only event store
- Projections for read models
- Snapshot for long aggregates

---

## Deployment Checklist

1. Environment variables documented and secret
2. Database migrations run before app startup
3. Health endpoint (`/health`) checks DB, cache, critical deps
4. Graceful shutdown: stop accepting, finish in-flight, exit
5. Log aggregation configured
6. Alerts on error rate, latency, disk, memory
