# 🚗 Uber Mini

Ushbu loyiha zamonaviy mikroxizmatlar (microservices) arxitekturasi asosida qurilgan bo'lib, yuqori darajada kengayuvchanlik va real vaqt rejimida ishlash imkoniyatini ta'minlaydi.

## 🚀 Texnologiyalar (Tech Stack)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer--Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

### Backend & Services
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

### Infrastructure & DevOps
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

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


