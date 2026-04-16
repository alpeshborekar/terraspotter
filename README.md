# # 🌱 TerraSpotter Backend

## 🚀 Overview

TerraSpotter backend is a scalable server built using Node.js and Express, designed to manage land, plantations, and future AI-based recommendations.

This project focuses on building a strong backend foundation using Docker, Prisma, and clean architecture principles.

---

## 🛠 Tech Stack

* Node.js
* Express.js
* PostgreSQL (Docker)
* Prisma ORM
* Redis (Docker)
* Nodemon

---

## 📦 Features Implemented

* Express server setup with middleware
* MVC-based project structure (initial setup)
* PostgreSQL database using Docker
* Redis setup using Docker
* Prisma ORM integration
* Database schema and migrations
* Global error handling middleware
* Health check API (`/health`)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/alpeshborekar/terraspotter.git
cd terraspotter/Backend
```

---

### 2️⃣ Start Docker Services

```bash
docker compose up -d
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Setup Database

```bash
npx prisma migrate dev
```

---

### 5️⃣ Run Server

```bash
npm run dev
```

---

## 🔍 API Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-16T..."
}
```

---

## 🗄 Database

* PostgreSQL running via Docker
* Managed using Prisma ORM
* Includes models:

  * User
  * Land
  * Plantation
  * Review

---

## 📂 Project Structure

```
Backend/
│
├── prisma/              # Prisma schema & migrations
├── src/
│   ├── middleware/      # Error handling middleware
│   ├── app.js           # Express app configuration
│   └── server.js        # Entry point
│
├── docker-compose.yml   # PostgreSQL + Redis setup
├── prisma.config.ts     # Prisma configuration
└── .env                 # Environment variables
```

---

## 🧠 Architecture

This project follows the **MVC (Model-View-Controller)** pattern:

* **Model** → Prisma schema (database layer)
* **Controller** → (to be implemented next)
* **View** → Frontend (separate layer)

---

## 📌 Current Status

✅ Backend setup complete
✅ Database connected and migrated
✅ Server running successfully

🚧 Upcoming Features:

* Authentication (JWT)
* Controllers & Routes
* Role-based access control
* AI-based recommendations

---

## 🧑‍💻 Author

Alpesh Borekar
