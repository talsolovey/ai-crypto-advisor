# 🧠 AI Crypto Advisor

AI Crypto Advisor is a full-stack web application that serves as a personalized crypto investor dashboard.  
The app learns about users through a short onboarding flow and then presents daily, AI-curated content tailored to their interests, along with real-time market data and interactive feedback.

---

## 🌐 Live Demo

https://ai-crypto-advisor-flax.vercel.app

> You can test the app by signing up with a new user account.

---

## ✨ Features

### Authentication
- User registration and login using email and password
- JWT-based authentication

### Onboarding
After first login, users complete a short onboarding quiz:
- Crypto assets of interest
- Investor type (e.g. HODLer, Day Trader)
- Preferred content types  
Preferences are saved in the database and used to personalize the dashboard.

### Personalized Dashboard
The dashboard displays four sections, based on user preferences:
1. **Market News** (CryptoPanic API)
2. **Coin Prices** (CoinGecko API)
3. **AI Insight of the Day** (LLM-generated summary)
4. **Fun Crypto Meme** (dynamic content)

Each section includes **thumbs up / thumbs down voting**, which is stored in the database for future recommendation improvements.

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Fetch-based API client
- Deployed on Vercel

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Deployed on Render

### External APIs & Tools
- CoinGecko – crypto prices
- CryptoPanic – market news
- OpenRouter / Hugging Face – AI insight generation

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL (or SQLite for local testing)

### Backend
```bash
cd apps/backend
npm install
npm run dev
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend
```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
CRYPTOPANIC_API_KEY=
```

### Frontend
```env
VITE_API_BASE_URL=
```

---

## 🗄️ Database Access
The project uses Prisma ORM.
To inspect the database locally:
```bash
cd apps/backend
npx prisma studio
```
In production, the database is managed via the hosting provider (Render).
