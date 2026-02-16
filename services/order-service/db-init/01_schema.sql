CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  auth_user_id INTEGER NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);
