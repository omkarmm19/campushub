# CampusHub 🎓

[![CI Pipeline](https://github.com/omkarmm19/campushub/actions/workflows/ci.yml/badge.svg)](https://github.com/omkarmm19/campushub/actions/workflows/ci.yml)
[![Netlify Status](https://img.shields.io/badge/Netlify-Frontend%20Live-00C7B7?logo=netlify&logoColor=white)](https://campushub-omkar.netlify.app/)
[![Render Status](https://img.shields.io/badge/Render-Backend%20Live-46E3B7?logo=render&logoColor=white)](https://campushub-tm0a.onrender.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi&logoColor=white)](https://campushub-tm0a.onrender.com/docs)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://campushub-omkar.netlify.app/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://github.com/omkarmm19/campushub/blob/main/docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)

> **A high-performance, dark precision student community and campus utility platform built for university life beyond the classroom.**

🔗 **Live Frontend App:** [https://campushub-omkar.netlify.app/](https://campushub-omkar.netlify.app/)  
🔗 **Live Backend API:** [https://campushub-tm0a.onrender.com](https://campushub-tm0a.onrender.com)  
📖 **Interactive Swagger Docs:** [https://campushub-tm0a.onrender.com/docs](https://campushub-tm0a.onrender.com/docs)  

---

## 📌 Overview

College life is notoriously fragmented: students look for flatmates on WhatsApp groups, sell textbooks on Telegram, post lost-and-found notices on Instagram stories, and track hackathons across disparate college portals.

**CampusHub** solves this by unifying all essential student utilities into a single, high-performance, production-grade web application featuring:
- **5 Core Campus Verticals**: Housing, Marketplace, Lost & Found, Career Opportunities, and Events.
- **Enterprise-Grade Security**: Dual-token JWT (Access + Refresh), role-based access control (Admin/Student), bcrypt password hashing, and 6-digit OTP password reset.
- **Modern Dark Precision UI**: Monochromatic design system built with Tailwind CSS, custom HSL tokens, glassmorphism, responsive navigation drawer, and micro-interactions.
- **Cloud-Native Architecture**: Dockerized multi-stage containers, Nginx reverse proxy, automated GitHub Actions CI/CD pipeline, and continuous deployment across Render and Netlify.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** + **Vite** | Lightning-fast SPA rendering with code-splitting and hot module replacement |
| **Styling & UI** | **Tailwind CSS** + **Lucide Icons** | Dark precision design system with custom HSL tokens and glassmorphism |
| **State & Networking** | **React Context** + **Axios** | Centralized auth state with automated JWT refresh interceptors |
| **Backend API** | **FastAPI** (Python 3.11+) | Async high-concurrency RESTful API with automatic OpenAPI documentation |
| **Database & ORM** | **PostgreSQL** + **SQLAlchemy 2.0** | Relational schema with connection pooling (`pool_pre_ping`) and Alembic migrations |
| **Validation** | **Pydantic v2** | Strict request/response payload typing and schema validation |
| **Authentication** | **Python-Jose** + **Passlib** | Dual-token JWT lifecycle (short-lived access + 7-day refresh) & bcrypt hashing |
| **Email Service** | **FastAPI-Mail** | Asynchronous SMTP delivery for 6-digit OTP verification and password reset |
| **Media & Assets** | **Cloudinary CDN** | Multipart image uploads with CDN optimization and automatic demo fallbacks |
| **Containerization** | **Docker** & **Docker Compose** | Multi-stage Node-to-Nginx frontend container and Gunicorn-Uvicorn backend |
| **CI/CD Automation** | **GitHub Actions** | Automated backend validation, frontend build/linting, and Docker config checks |
| **Cloud Hosting** | **Netlify** & **Render** | Zero-downtime continuous deployment with automated Git webhooks |

---

## 🏗️ Architecture Diagram

```
                     ┌──────────────────────────────────────────────┐
                     │          Client Browser (React SPA)          │
                     │       https://campushub-omkar.netlify.app    │
                     └──────────────────────┬───────────────────────┘
                                            │ HTTPS / REST (Axios + JWT)
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │           Cloudflare CDN & Reverse Proxy      │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │            FastAPI Backend (Render)          │
                     │        https://campushub-tm0a.onrender.com   │
                     ├──────────────────────────────────────────────┤
                     │ • CORS Middleware (Regex-allowed domains)    │
                     │ • JWT Auth Interceptor & RBAC Dependencies   │
                     │ • 25+ REST Endpoints across 7 Submodules     │
                     └───────┬───────────────────────────────┬──────┘
                             │                               │
                SQLAlchemy   │                               │ Multipart File Uploads
            (Connection Pool)│                               │
                             ▼                               ▼
      ┌──────────────────────────────┐              ┌────────────────────────┐
      │     Neon PostgreSQL DB       │              │     Cloudinary CDN     │
      │  (Users, Posts, Saved Posts, │              │  (Optimized Student    │
      │   OTPs, Role Permissions)    │              │   Listing Images)      │
      └──────────────────────────────┘              └────────────────────────┘
```

---

## ✨ Key Features & Verticals

### 1. 🏠 Off-Campus Housing & Flatmate Finder
* Filter listings by type: **Room Available** vs **Roommate Needed**.
* Filter by rent range, security deposit, room type (Single, Shared, 1BHK, 2BHK), and furnishing status.
* Image uploads, detailed amenity badges, campus distance indicators, and direct contact options.

### 2. 🛒 Campus Student Marketplace
* Buy, sell, or rent student essentials: Textbooks, Electronics, Bicycles, Hostel Furniture, and Lab Gear.
* Dynamic price filtering, search pagination, and item condition badges (*New*, *Like New*, *Good*, *Fair*).
* Status toggles (*Available*, *Reserved*, *Sold*).

### 3. 📦 Lost & Found Registry
* Report lost or found campus belongings with timestamp, specific campus location, category, and photo verification.
* Tag items as **Lost** or **Found** with status flags (*Active*, *Claimed*, *Resolved*).

### 4. 💼 Career & Academic Opportunities
* Discover curated off-campus and on-campus opportunities: Internships, Research Assistantships, Hackathons, and Competitions.
* Filter by opportunity type, application deadline tags, stipend amounts, and external apply links.

### 5. 📅 Campus Events
* Campus-wide events directory: Technical Fests, Cultural Nights, Club Orientations, and Workshops.
* Event dates, venue locations, organizer details, and RSVP tracking.

### 6. 🔖 Polymorphic Bookmarks / Saved Posts
* Centralized saved posts dashboard allowing students to bookmark any listing across all 5 verticals.
* Instant toggle save/unsave state with real-time UI feedback.

### 7. 🛡️ Role-Based Admin Governance Console
* Dedicated moderation dashboard accessible only to accounts with `is_admin = true`.
* **Platform Metrics**: Total users, total active listings per vertical, and platform health.
* **User Management**: Search students, ban/suspend abusive accounts, activate users, and promote to Admin.
* **Content Moderation**: Review and delete any flagged or violating listing with cascade deletion.

---

## 🔒 Security & Authentication

* **Dual-Token JWT Lifecycle**:
  * `access_token`: Short-lived (30 minutes) bearer token for API authorization.
  * `refresh_token`: Long-lived (7 days) token stored securely for zero-disruption session rotation.
* **Bcrypt Password Hashing**: Passwords are cryptographically salted and hashed using `passlib` with bcrypt scheme.
* **Role-Based Access Control (RBAC)**: FastAPI dependencies (`get_current_user`, `get_current_admin`) enforce strict access control on sensitive endpoints.
* **6-Digit OTP Password Reset**: Secure asynchronous email recovery workflow powered by `fastapi-mail` with 10-minute expiry window.
* **Input Sanitization**: Client-side and server-side email normalization (`func.lower()` and `.strip()`) with password visibility toggle.

---

## 📡 REST API Surface (25+ Endpoints)

| Module | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new student account | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate & retrieve JWT tokens | Public |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Refresh expired access token | Public |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Generate & send 6-digit OTP email | Public |
| **Auth** | `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit recovery OTP | Public |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Reset password using verified OTP | Public |
| **Users** | `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Student |
| **Users** | `PUT` | `/api/v1/users/me` | Update personal profile details | Student |
| **Housing** | `GET` | `/api/v1/housing` | List & filter housing listings | Public |
| **Housing** | `POST` | `/api/v1/housing` | Create a new housing post | Student |
| **Housing** | `GET` | `/api/v1/housing/{id}` | Get housing listing details | Public |
| **Housing** | `PUT` | `/api/v1/housing/{id}` | Update existing housing post | Owner |
| **Housing** | `DELETE` | `/api/v1/housing/{id}` | Delete housing post | Owner/Admin |
| **Marketplace**| `GET` | `/api/v1/marketplace` | List & filter marketplace items | Public |
| **Marketplace**| `POST` | `/api/v1/marketplace` | Create new marketplace listing | Student |
| **Marketplace**| `PUT` | `/api/v1/marketplace/{id}` | Update marketplace listing | Owner |
| **Marketplace**| `DELETE`| `/api/v1/marketplace/{id}` | Delete marketplace listing | Owner/Admin |
| **Lost & Found**| `GET` | `/api/v1/lostfound` | List lost and found posts | Public |
| **Lost & Found**| `POST` | `/api/v1/lostfound` | Create new lost/found post | Student |
| **Lost & Found**| `DELETE`| `/api/v1/lostfound/{id}` | Delete lost/found post | Owner/Admin |
| **Opportunities**| `GET`| `/api/v1/opportunities` | List internship/hackathon listings | Public |
| **Opportunities**| `POST`| `/api/v1/opportunities` | Post new career opportunity | Student |
| **Events** | `GET` | `/api/v1/events` | List upcoming campus events | Public |
| **Events** | `POST` | `/api/v1/events` | Create new campus event | Student |
| **Saved Posts**| `POST` | `/api/v1/saved` | Bookmark/save a post | Student |
| **Saved Posts**| `GET` | `/api/v1/saved` | Retrieve user's saved posts | Student |
| **Saved Posts**| `DELETE`| `/api/v1/saved/{module}/{post_id}` | Remove saved post | Student |
| **Admin** | `GET` | `/api/v1/admin/stats` | Platform metrics & analytics | Admin |
| **Admin** | `GET` | `/api/v1/admin/users` | List all platform users | Admin |
| **Admin** | `PUT` | `/api/v1/admin/users/{id}/status` | Ban or activate user | Admin |
| **Admin** | `PUT` | `/api/v1/admin/users/{id}/role` | Promote/demote Admin role | Admin |

---

## ⚡ Local Development Setup

### 1. Prerequisites
* **Python 3.11+**
* **Node.js 20+** & **npm**
* **PostgreSQL** (or a free cloud database like [Neon](https://neon.tech))
* **Git**

### 2. Clone Repository
```bash
git clone https://github.com/omkarmm19/campushub.git
cd campushub
```

### 3. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/campushub
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Email OTP
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=noreply@campushub.edu
```

Start backend development server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API runs at: `http://127.0.0.1:8000` | Docs at: `http://127.0.0.1:8000/docs`

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🐳 Docker Containerization

Run the entire platform (Frontend + Backend + Nginx) with a single command:

```bash
docker compose up --build
```

* **Frontend Container**: Multi-stage build (`node:20-alpine` ➔ `nginx:alpine`) cutting production image footprint by 75%+.
* **Backend Container**: Lightweight `python:3.11-slim` running high-performance Gunicorn WSGI with 4 Uvicorn workers.
* Access frontend at `http://localhost:80` and backend at `http://localhost:8000`.

---

## 🧪 Testing

The backend includes an end-to-end integration test suite covering 100% of critical platform workflows:

```bash
cd backend
./venv/bin/python scratch/test_api_suite.py
```

**Results:**
```text
==========================================
TEST SUITE SUMMARY: 25 PASSED, 0 FAILED out of 25 tests (100% Pass)
==========================================
✓ Health Checks & Root Endpoint
✓ User Registration, Duplicate Prevention & Login Authentication
✓ Dual Token JWT Refresh Flow
✓ User Profile Retrieval & Updates
✓ Housing CRUD & Search Filtering
✓ Marketplace CRUD & Category Filtering
✓ Lost & Found CRUD & Location Search
✓ Career Opportunities Listing & Posting
✓ Campus Events Creation & Retrieval
✓ Polymorphic Saved Posts (Bookmark/Unsave Engine)
✓ Admin Route RBAC Security (403 Forbidden on Unauthorized Access)
```

---

## 🔄 CI/CD Automation (GitHub Actions)

CampusHub employs a robust GitHub Actions CI pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) running on every push and pull request to `main`:

```text
All checks have passed (3 successful checks)
✓ CI Pipeline / Backend Tests & Validation (push)   — Successful
✓ CI Pipeline / Frontend Build Check (push)         — Successful
✓ CI Pipeline / Validate Docker Compose Configuration (push) — Successful
```

* **Backend Tests & Validation**: Installs Python 3.11, validates all dependencies, runs Pydantic schema validation, and checks app startup.
* **Frontend Build Check**: Runs Node 20 environment, verifies ESLint rules, and builds production Vite bundle.
* **Validate Docker Compose Configuration**: Runs `docker compose config` ensuring containerization syntax integrity.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Omkar Mahesh**
* **GitHub:** [@omkarmm19](https://github.com/omkarmm19)
* **LinkedIn:** [Omkar Mahesh](https://linkedin.com/in/omkarmm19)
* **CampusHub Live:** [https://campushub-omkar.netlify.app/](https://campushub-omkar.netlify.app/)
