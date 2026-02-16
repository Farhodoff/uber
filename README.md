# 🚗 Uber Mini

Full-stack ride-hailing ilovasi - Uber kabi. React + TypeScript + Node.js + PostgreSQL.

## Xususiyatlar

- 🎨 Zamonaviy dizayn (gradient + glassmorphism)
- 📱 Mobile uchun optimallashtirilgan
- � Real-time (Socket.io)
- ♿ Accessibility (WCAG 2.1)
- 🏗️ Microservices arxitektura

## Tehnologiyalar

**Front:** React 18, TypeScript, Tailwind CSS v4, Vite, Leaflet (xarita)  
**Back:** Node.js, Express, PostgreSQL, Socket.io, JWT  
**Deploy:** Vercel (frontend), Railway (backend)

## Ishga Tushirish

### 1. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Manzil: `http://localhost:5177`

### 2. Backend (Docker)
```bash
docker-compose up
```
API: `http://localhost:4000`

### Environment
**Frontend `.env`:**
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

## Imkoniyatlar

**Yo'lovchilar uchun:**
- Ro'yxatdan o'tish / Kirish
- Manzil tanlash va taksi chaqirish
- Xaritada jonli haydovchilarni ko'rish
- Sayohat tarixi

**Haydovchilar uchun:**
- Online/Offline status
- Buyurtmalarni qabul qilish
- Daromad hisobi
- Trip history

## Deployment

**Frontend (Vercel):**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
npm install -g @railway/cli
railway up
```

Batafsil: [deployment_guide.md](/.gemini/antigravity/brain/35ad33cf-925b-434e-a3da-dd6f60df1c5f/deployment_guide.md)

## Arxitektura

```
API Gateway (4000)
  ├─ Auth Service (4001)
  ├─ User Service (4002)
  ├─ Order Service (4003)
  ├─ Driver Service (4004)
  ├─ Socket Service (4005)
  └─ Location Service (4006)
```

## Muammolar va Yechimlar

**CSS ishlamasa:** Tailwind v4 syntax (`@import "tailwindcss"`)  
**Profile 404:** Avtomatik profile yaratish qo'shilgan

## Muallif

**Farhod** - [GitHub](https://github.com/Farhodoff)

---

_"Traktor"dan "Unicorn"ga sayohat_ 🚜 → 🦄
