import { FormEvent, useMemo, useState } from 'react';

type AuthData = {
  token: string;
  userId: number;
  email: string;
};

type Order = {
  id: number;
  auth_user_id: number;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : {};
  } catch (_e) {
    body = text;
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message?: string }).message)
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState<AuthData | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  const [message, setMessage] = useState('Ready');
  const [loading, setLoading] = useState(false);

  const token = auth?.token;
  const userId = auth?.userId;
  const isAuthed = Boolean(auth);

  const messageClass = useMemo(() => {
    const normalized = message.toLowerCase();
    if (normalized.includes('invalid') || normalized.includes('failed') || normalized.includes('required')) {
      return 'alert error';
    }
    if (normalized.includes('success') || normalized.includes('created') || normalized.includes('loaded')) {
      return 'alert success';
    }
    return 'alert';
  }, [message]);

  async function handleRegister() {
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setMessage('Registered successfully. Now login.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    try {
      const data = (await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })) as AuthData;
      setAuth(data);
      setMessage('Login successful.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId || !token) {
      setMessage('Login required.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch(
        '/users/profiles',
        {
          method: 'POST',
          body: JSON.stringify({ authUserId: userId, fullName, phone })
        },
        token
      );
      setMessage('Profile created.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrder(e: FormEvent) {
    e.preventDefault();
    if (!userId || !token) {
      setMessage('Login required.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({ authUserId: userId, pickupLocation: pickup, dropoffLocation: dropoff })
        },
        token
      );
      setMessage('Order created.');
      await handleLoadOrders();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadOrders() {
    if (!userId || !token) {
      setMessage('Login required.');
      return;
    }

    setLoading(true);
    try {
      const data = (await apiFetch(`/orders/user/${userId}`, {}, token)) as Order[];
      setOrders(data);
      setMessage(`Loaded ${data.length} orders.`);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>Uber Console</h1>
          <p>Clean flow: login, create profile, create order.</p>
        </div>
        <div className="status-box">
          <span>{isAuthed ? 'Authorized' : 'Guest'}</span>
          <strong>{isAuthed ? auth?.email : 'Not logged in'}</strong>
        </div>
      </header>

      <p className={messageClass}>{message}</p>

      <main className="grid">
        <section className="card">
          <h2>1. Authentication</h2>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin();
            }}
          >
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
            />
            <div className="actions">
              <button type="button" className="secondary" onClick={() => void handleRegister()} disabled={loading}>
                Register
              </button>
              <button type="submit" disabled={loading}>
                Login
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>2. Profile</h2>
          <form className="form" onSubmit={handleCreateProfile}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              required
              disabled={!isAuthed}
            />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" disabled={!isAuthed} />
            <button type="submit" disabled={loading || !isAuthed}>
              Create Profile
            </button>
          </form>
        </section>

        <section className="card card-wide">
          <h2>3. Orders</h2>
          <form className="form" onSubmit={handleCreateOrder}>
            <div className="cols-2">
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup location"
                required
                disabled={!isAuthed}
              />
              <input
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Dropoff location"
                required
                disabled={!isAuthed}
              />
            </div>
            <div className="actions">
              <button type="submit" disabled={loading || !isAuthed}>
                Create Order
              </button>
              <button type="button" className="secondary" onClick={handleLoadOrders} disabled={loading || !isAuthed}>
                Load Orders
              </button>
            </div>
          </form>

          <ul className="orders">
            {orders.length === 0 ? (
              <li className="empty">No orders yet</li>
            ) : (
              orders.map((order) => (
                <li key={order.id}>
                  <span>#{order.id}</span>
                  <span>
                    {order.pickup_location} {'->'} {order.dropoff_location}
                  </span>
                  <strong>{order.status}</strong>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
