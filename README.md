# Microservices Mini Project (Uber-style)

Services:
- `frontend` (port 5173)
- `api-gateway` (port 4000)
- `auth-service` (port 4001)
- `user-service` (port 4002)
- `order-service` (port 4003)

Each business service has its own PostgreSQL database:
- `auth-db` -> `auth_db`
- `user-db` -> `user_db`
- `order-db` -> `order_db`

## Run

```bash
docker compose up --build
```

Frontend:
- URL: `http://localhost:5173`
- API base: `http://localhost:4000` (configured in `frontend/.env.example`)

## Quick flow via Gateway

1. Register user:
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"123456"}'
```

2. Login and get JWT token:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"123456"}'
```

3. Create profile (replace `TOKEN` and `authUserId`):
```bash
curl -X POST http://localhost:4000/users/profiles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"authUserId":1,"fullName":"Ali Valiyev","phone":"+998901234567"}'
```

4. Create order:
```bash
curl -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"authUserId":1,"pickupLocation":"Tashkent City","dropoffLocation":"Chorsu"}'
```

5. Get user orders:
```bash
curl http://localhost:4000/orders/user/1 \
  -H "Authorization: Bearer TOKEN"
```

## JWT Notes

- `/users/*` and `/orders/*` are protected by JWT at gateway level.
- `Authorization` header format: `Bearer <token>`
# uber
# uber
