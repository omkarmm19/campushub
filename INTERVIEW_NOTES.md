# CampusHub — Comprehensive Technical Interview Preparation Notes

> **Target Roles:** Full-Stack Engineer, Backend Engineer, DevOps / Cloud Engineer  
> **Repository:** [omkarmm19/campushub](https://github.com/omkarmm19/campushub)  
> **Tech Stack:** FastAPI (Python 3.11), React 19 / React 18 + Vite, PostgreSQL (Neon Serverless), SQLAlchemy 2.0, Alembic Migrations, Cloudinary CDN, FastAPI-Mail (SMTP OTP), Docker, Docker Compose, Nginx, GitHub Actions, Netlify, Render  
> **Live App:** [https://campushub-omkar.netlify.app/](https://campushub-omkar.netlify.app/)  
> **API Docs (Swagger):** [https://campushub-tm0a.onrender.com/docs](https://campushub-tm0a.onrender.com/docs)  

---

## Table of Contents
1. [One-Line Project Pitch & 30-Second Elevator Pitch](#1-one-line-project-pitch--30-second-elevator-pitch)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Database Schema & Alembic Migrations Deep-Dive](#3-database-schema--alembic-migrations-deep-dive)
4. [End-to-End Request Flow (Listing Creation + Image Upload)](#4-end-to-end-request-flow-listing-creation--image-upload)
5. [Backend Deep-Dive (FastAPI & Architecture Patterns)](#5-backend-deep-dive-fastapi--architecture-patterns)
6. [Authentication: Dual-Token JWT & RBAC Security](#6-authentication-dual-token-jwt--rbac-security)
7. [OTP-Based Password Reset via Asynchronous Email](#7-otp-based-password-reset-via-asynchronous-email)
8. [Cloudinary Media Upload Integration & Fallback Engine](#8-cloudinary-media-upload-integration--fallback-engine)
9. [Multi-Vertical CRUD Pattern & Polymorphic Saved Posts](#9-multi-vertical-crud-pattern--polymorphic-saved-posts)
10. [Frontend Overview (React + Vite + Dark Precision UI)](#10-frontend-overview-react--vite--dark-precision-ui)
11. [Docker & Containerization Strategy](#11-docker--containerization-strategy)
12. [CI/CD Pipeline (Automated Quality Gate & Git Deploys)](#12-cicd-pipeline-automated-quality-gate--git-deploys)
13. [Production Deployment Setup](#13-production-deployment-setup)
14. [Common Technical Interview Q&A (20 Curated Questions)](#14-common-technical-interview-qa-20-curated-questions)
15. [Buzzwords & Keywords Cheat-Sheet](#15-buzzwords--keywords-cheat-sheet)

---

## 1. One-Line Project Pitch & 30-Second Elevator Pitch

### One-Line Pitch:
> "CampusHub ek production-ready, modular student community aur campus utility platform hai jo university life ke 5 core verticals — Housing, Marketplace, Lost & Found, Career Opportunities, aur Events — ko unify karta hai, complete with Alembic database migrations, dual-token JWT authentication, 6-digit email OTP recovery, Cloudinary media CDN, aur zero-secret automated CI/CD."

### 30-Second Elevator Pitch (Interview me bolne ke liye):
> "Maine **CampusHub** develop kiya hai — ek full-stack modular campus platform jo college students ke fragmented communication channels (WhatsApp, Telegram, notice boards) ko single hub me replace karta hai. 
> 
> Backend me **FastAPI (Python 3.11)** aur **SQLAlchemy 2.0** use kiya hai with resilient connection pooling connected to **Neon Serverless PostgreSQL**, jahan schema changes ko industry-standard **Alembic migrations** ke through version-control kiya gaya hai. 
> 
> Security layer me **Dual-Token JWT (short-lived access + 7-day refresh token)** with Axios auto-refresh interceptors, bcrypt salting, student vs admin Role-Based Access Control (RBAC), aur **FastAPI-Mail** se 6-digit OTP password reset workflow implement kiya hai. Media assets direct server disk par save karne ke bajaye **Cloudinary CDN** par stream hote hain with resilient demo fallbacks. 
> 
> Frontend **React + Vite** with custom monochromatic Dark Precision UI tokens par built hai. Poora platform **Docker Compose** containerized hai aur **GitHub Actions CI** ke saath **Netlify + Render** par continuously deployed hai."

---

## 2. High-Level Architecture

System multi-tier decoupled cloud architecture follow karta hai:

```text
+-----------------------------------------------------------------------------------+
|                            Client Web Browser (SPA)                               |
| - React 18/19 + Vite 8 + React Router v7 + Tailwind CSS v4                        |
| - Monochromatic Dark Precision Design System (#0A0A0B Canvas, #22D3EE Accent)    |
| - Axios Centralized Instance with Request / Response Auto-Refresh Interceptor     |
| - Reusable Polymorphic SaveButton & Module Filter Shells                          |
+-----------------------------------------+-----------------------------------------+
                                          │
                         HTTPS / REST (JSON + Dual JWT / Multipart Form)
                                          │
                                          v
+-----------------------------------------------------------------------------------+
|                               Hosting & CDN Edge Layer                            |
| - Netlify: Hosts Frontend SPA (`netlify.toml` SPA rewrite `/*` -> `/index.html`)  |
| - Render: Hosts Containerized / Native Python FastAPI Web Service                |
+-----------------------------------------+-----------------------------------------+
                                          │
                                          v
+-----------------------------------------------------------------------------------+
|                             FastAPI Backend (Render)                              |
| - Uvicorn / Gunicorn ASGI Server (Python 3.11-slim)                               |
| - CORS Middleware: Whitelisted Localhost + Regex for Netlify/Render/Vercel        |
| - Security & RBAC: OAuth2PasswordBearer, Dual-Token JWT, require_admin Guard     |
| - 25+ REST Endpoints across 9 Modular Routers (/api/v1 prefix)                    |
+-------+--------------------+---------------------+--------------------+-----------+
        │                    │                     │                    │
        ▼                    ▼                     ▼                    ▼
+---------------+    +---------------+     +---------------+    +---------------+
| Neon Postgres |    |   Cloudinary  |     | FastAPI-Mail  |    | Alembic Vers. |
| Serverless DB |    |    Media CDN  |     |  (SMTP Email) |    |  Track Engine |
| - Users & OTP |    | - Housing     |     | - 6-Digit OTP |    | - alembic_    |
| - 5 Verticals |    | - Marketplace |     |   Generation  |    |   version     |
| - Saved Posts |    | - Lost&Found  |     | - 10-Min TTL  |    | - 5 Revisions |
| - Cascade Del |    | - Fallback Img|     | - Password Res|    |   Head Upgrd  |
+---------------+    +---------------+     +---------------+    +---------------+
```

### 5 Core Verticals at a Glance:
1. **Housing (`/housing`):** Off-campus room search & flatmate finder (rent, distance from campus in km, sharing type, diet/smoking/sleep preferences, photo gallery).
2. **Marketplace (`/marketplace`):** Peer-to-peer campus commerce (buy, sell, rent textbooks, lab gear, cycles with condition tags and price filters).
3. **Lost & Found (`/lost-found`):** Campus belongings registry with incident dates, campus locations, resolution flags, and image verification.
4. **Career Opportunities (`/opportunities`):** Curated internships, hackathons, research positions with application deadlines and direct external apply links.
5. **Campus Events (`/events`):** University-wide technical symposiums, workshops, and cultural fests with venue, date/time, and registration links.

---

## 3. Database Schema & Alembic Migrations Deep-Dive

### Declarative Relational Models Overview

Har model modern **SQLAlchemy 2.0 (`Mapped`, `mapped_column`)** syntax follow karta hai:

```text
 [users] ──< 1:N (cascade) >── [housing_listings]      ──< 1:N >── [housing_images]
    │    ──< 1:N (cascade) >── [marketplace_items]     ──< 1:N >── [marketplace_images]
    │    ──< 1:N (cascade) >── [lostfound_posts]       ──< 1:N >── [lostfound_images]
    │    ──< 1:N (cascade) >── [opportunities]
    │    ──< 1:N (cascade) >── [events]
    └───< 1:N (cascade) >── [saved_posts] (Polymorphic: module + post_id)
```

#### 1. `users` Table ([user.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/user.py))
* `id`: Integer, Primary Key, Index
* `name`: String(100), non-nullable
* `reg_number`: String(20), unique, indexed, non-nullable (e.g. `21BCE1042`)
* `college_email`: String(150), unique, indexed, non-nullable (e.g. `student@college.edu`)
* `phone`: String(15), non-nullable
* `block_number`: String(10), non-nullable & `room_number`: String(10), non-nullable
* `password_hash`: String, non-nullable (bcrypt hash)
* `is_admin`: Boolean, default `False`
* `is_suspended`: Boolean, default `False` (moderation flag)
* `otp`: String(6), nullable (temporary reset code)
* `otp_expires_at`: DateTime(timezone=True), nullable (10-minute expiry)
* `created_at`: DateTime(timezone=True), server_default `func.now()`
* `saved_posts`: relationship to `SavedPost`, cascade `"all, delete-orphan"`

#### 2. `housing_listings` & `housing_images` Tables ([housing.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/housing.py))
* `housing_listings`:
  * `id`: Integer PK | `user_id`: FK `users.id` (`ondelete="CASCADE"`, index)
  * `listing_type`: String(30), indexed (`room_available` | `roommate_needed`)
  * `rent_per_person`: Integer, indexed | `security_deposit`: Integer, nullable
  * `location`: String(255) | `distance_km`: Float, indexed
  * `sharing_type`: String(20) (`single`, `double`, `triple`, `other`)
  * `available_from`: Date | `amenities`: JSON array (e.g. `["WiFi", "AC", "Power Backup"]`)
  * `description`: Text | `whatsapp`: String(15) (validated 10-digit number)
  * Preferences: `pref_veg`: Boolean | `pref_smoking`: Boolean | `pref_study_friendly`: Boolean | `pref_sleep_schedule`: String(20)
  * `is_active`: Boolean, default `True`, indexed
* `housing_images`:
  * `id`: Integer PK | `listing_id`: FK `housing_listings.id` (`ondelete="CASCADE"`, index)
  * `image_url`: String (Cloudinary CDN URL) | `display_order`: Integer, default 0

#### 3. `marketplace_items` & `marketplace_images` Tables ([marketplace.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/marketplace.py))
* `marketplace_items`:
  * `id`: Integer PK | `user_id`: FK `users.id` (`ondelete="CASCADE"`, index)
  * `title`: String(200), indexed | `description`: Text
  * `category`: String(30), indexed (`book`, `gadget`, `clothing`, `furniture`, `stationary`, `other`)
  * `condition`: String(20) (`new`, `good`, `fair`, `poor`)
  * `price`: Integer, indexed | `listing_type`: String(20) (`sell`, `rent`, `free`)
  * `whatsapp`: String(15) | `is_sold`: Boolean, default `False` | `is_active`: Boolean, default `True`
* `marketplace_images`: `id`, `item_id` (FK cascade), `image_url`, `display_order`.

#### 4. `lostfound_posts` & `lostfound_images` Tables ([lostfound.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/lostfound.py))
* `lostfound_posts`:
  * `id`: Integer PK | `user_id`: FK `users.id` (`ondelete="CASCADE"`, index)
  * `post_type`: String(10), indexed (`lost` | `found`)
  * `title`: String(200), indexed | `description`: Text | `location`: String(255)
  * `incident_date`: Date, nullable | `whatsapp`: String(15)
  * `is_resolved`: Boolean, default `False`, indexed | `is_active`: Boolean, default `True`
* `lostfound_images`: `id`, `post_id` (FK cascade), `image_url`, `display_order`.

#### 5. `opportunities` Table ([opportunity.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/opportunity.py))
* `id`: Integer PK | `user_id`: FK `users.id` (`ondelete="CASCADE"`, index)
* `title`: String(200), indexed | `opp_type`: String(30), indexed (`internship`, `hackathon`, `workshop`, `competition`, `other`)
* `organization`: String(200) | `description`: Text | `deadline`: Date, indexed | `apply_link`: String(500) | `is_active`: Boolean

#### 6. `events` Table ([event.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/event.py))
* `id`: Integer PK | `user_id`: FK `users.id` (`ondelete="CASCADE"`, index)
* `title`: String(200), indexed | `event_type`: String(30), indexed (`technical`, `cultural`, `sports`, `seminar`, `other`)
* `description`: Text | `venue`: String(255) | `event_date`: Date, indexed | `event_time`: Time | `registration_link`: String(500) | `poster_url`: String(500)

#### 7. `saved_posts` Table ([saved.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/models/saved.py))
* `id`: Integer PK
* `user_id`: Integer, FK `users.id` (`ondelete="CASCADE"`, index)
* `module`: String, indexed (`housing`, `marketplace`, `lostfound`, `opportunities`, `events`)
* `post_id`: Integer, indexed
* `created_at`: DateTime(timezone=True), server_default `func.now()`
* **Composite Constraint:** `UniqueConstraint("user_id", "module", "post_id", name="uq_saved_post_per_user")` — prevents duplicate saves at DB level!

---

### Alembic Migrations Deep-Dive (Why & How)

#### ❓ Interview me poochha jaye: *"Alembic kya hai aur `Base.metadata.create_all()` ke upar ise kyu use kiya?"*

**Core Problem with `create_all()`:**
* `create_all()` sirf tab kaam karta hai jab database table **exist hi nahi karti**. Agar kal aap production me `users` table me `otp_expires_at` column ya nayi index add karte ho, to `create_all()` silently use ignore kar deta hai!
* Existing data ko drop kiye bina schema modify karne ka koi option `create_all()` ke paas nahi hota. Production me raw SQL manual scripts chalana risky, error-prone aur non-reproducible hota hai.

**Alembic ka Role:**
* Alembic Python ka official database migration tool hai jo SQLAlchemy models ke code diff ko inspect karke automated, incremental migration scripts generate karta hai.
* Database me ek special table banti hai: `alembic_version` (single column: `version_num`). Har migration ek unique hash (e.g. `ab6aeceeb114`) carry karti hai. Alembic check karta hai ki database kis revision par hai aur strictly pending scripts apply karta hai.

#### Alembic Configuration in This Project ([env.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/alembic/env.py))
1. **Dynamic Model Registration:** `import app.models` automatically registers every declarative class with `Base.metadata`.
2. **Postgres Protocol Normalization:** 
   ```python
   db_url = settings.DATABASE_URL
   if db_url.startswith("postgres://"):
       db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
   elif db_url.startswith("postgresql://"):
       db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
   config.set_main_option("sqlalchemy.url", db_url)
   ```
3. **Target Metadata:** `target_metadata = Base.metadata` gives Alembic the blueprint of our models to compare against the live DB engine.

#### Actual Migration History Chain in CampusHub ([alembic/versions/](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/alembic/versions))

```text
[Base / None]
     │
     ▼ (Revision: ab6aeceeb114)
1. create_users_table.py (users table + indexes on reg_number, email)
     │
     ▼ (Revision: 75ae883e2491, Revises: ab6aeceeb114)
2. create_housing_listings_and_images_.py (housing_listings + housing_images tables)
     │
     ▼ (Revision: 6d47f7bd5a0c, Revises: 75ae883e2491)
3. add_marketplace_tables.py (marketplace_items + marketplace_images tables)
     │
     ▼ (Revision: 8cdb00560ef3, Revises: 6d47f7bd5a0c)
4. add_lostfound_opportunities_events_.py (3 verticals added in single clean revision)
     │
     ▼ (Revision: bc163fcae207, Revises: 8cdb00560ef3)
5. add_saved_posts_table.py (saved_posts table with uq_saved_post_per_user constraint)
```

#### Real Migration Code Example ([bc163fcae207_add_saved_posts_table.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/alembic/versions/bc163fcae207_add_saved_posts_table.py)):

```python
revision: str = 'bc163fcae207'
down_revision: Union[str, None] = '8cdb00560ef3'

def upgrade() -> None:
    op.create_table('saved_posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('module', sa.String(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'module', 'post_id', name='uq_saved_post_per_user')
    )
    op.create_index(op.f('ix_saved_posts_id'), 'saved_posts', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_saved_posts_id'), table_name='saved_posts')
    op.drop_table('saved_posts')
```

#### Standard Alembic Workflow Commands (Interview me bolne ke liye):
* `alembic revision --autogenerate -m "add_column_name"`: Inspects current SQLAlchemy models, compares with DB schema, and generates new migration script in `versions/`.
* `alembic upgrade head`: Applies all unapplied migration scripts up to the latest revision.
* `alembic downgrade -1`: Rollback one migration step if something goes wrong.
* `alembic current`: Shows currently applied revision ID in the target database.

---

## 4. End-to-End Request Flow (Listing Creation + Image Upload)

Detailed lifecycle jab ek student room listing create karta hai with images:

```text
[Browser: HousingCreate.jsx]
│ User fills form: rent: 8500, type: "room_available", amenities: ["WiFi", "AC"]
│ Selects 2 property images from file picker
▼
[Step 1: POST /api/v1/housing (JSON Payload)]
├── Axios Request Interceptor attaches: `Authorization: Bearer <access_token>`
│
▼
[FastAPI Gateway: main.py]
├── CORS Middleware verifies Origin against allowed list / regex
│
▼
[Router: housing.py -> create_housing()]
├── 1. `Depends(get_current_user)`:
│      ├── Reads `Authorization: Bearer <token>` via OAuth2PasswordBearer
│      ├── Decodes JWT via `decode_token(token)`
│      ├── Verifies `payload.get("type") == "access"` (rejects refresh tokens)
│      ├── Queries DB: `db.query(User).filter(User.id == int(user_id)).first()`
│      └── Checks `if user.is_suspended: raise 403 Forbidden`
├── 2. `Depends(get_db)`:
│      └── Injects active SQLAlchemy Session from `SessionLocal()` (pool_pre_ping=True)
├── 3. Pydantic validation:
│      └── `HousingListingCreate` validates fields; runs `@field_validator("whatsapp")`
│          which calls `normalize_phone_number(v)` ensuring clean 10-digit number
├── 4. Database write:
│      ├── `listing = HousingListing(user_id=current_user.id, ...)`
│      ├── `db.add(listing); db.commit(); db.refresh(listing)`
└── 5. Returns HTTP 201 Created with JSON (`HousingListingResponse`) containing `listing.id`
│
▼
[Step 2: POST /api/v1/housing/{id}/images (Multipart Form-Data)]
[Browser: HousingCreate.jsx appends files to FormData]
│
▼
[Router: housing.py -> upload_housing_images()]
├── 6. Authenticates `current_user` again via `Depends(get_current_user)`
├── 7. Queries DB: `listing = db.query(HousingListing).filter(HousingListing.id == id).first()`
├── 8. Ownership verification:
│      └── `if listing.user_id != current_user.id and not current_user.is_admin: raise 403`
├── 9. For each file in `files: List[UploadFile]`:
│      ├── Reads bytes asynchronously: `content = await file.read()`
│      ├── Calls `upload_image_to_cloudinary(content, folder_type="housing")`
│      │   ├── Checks `is_dummy_cloudinary_config()`
│      │   ├── If keys configured -> `cloudinary.uploader.upload(content, folder="campushub/housing")`
│      │   └── If keys absent / fail -> returns curated Unsplash fallback URL
│      ├── Constructs `HousingImage(listing_id=listing.id, image_url=image_url, display_order=idx)`
│      └── `db.add(image_record)`
├── 10. `db.commit()` persists all image records with Foreign Key to housing listing
└── 11. Returns `List[HousingImageSchema]` to frontend
│
▼
[FastAPI Generator Lifecycle]
└── 12. `get_db` finally block triggers `db.close()`, safely returning connection to pool
```

### Exact Core Function Signatures in Pipeline:
* `def create_housing(listing_in: HousingListingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HousingListingResponse`
* `async def upload_housing_images(id: int, files: List[UploadFile] = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> List[HousingImageSchema]`
* `def upload_image_to_cloudinary(file_bytes: bytes, folder_type: str = "housing") -> str`
* `def normalize_phone_number(v: Optional[str]) -> Optional[str]`

---

## 5. Backend Deep-Dive (FastAPI & Architecture Patterns)

### Folder Structure & Separation of Concerns:
```text
backend/app/
├── main.py                  # App entrypoint, CORS config, health check, router aggregation
├── core/
│   ├── config.py            # Pydantic BaseSettings singleton (.env parser)
│   ├── security.py          # Password hashing (bcrypt) & Dual JWT encode/decode
│   ├── email.py             # FastAPI-Mail SMTP client & 6-digit OTP engine
│   └── cloudinary.py        # Cloudinary SDK client, folder routing & demo fallbacks
├── db/
│   ├── base.py              # SQLAlchemy 2.0 DeclarativeBase
│   └── session.py           # Engine factory, psycopg3 prefix normalization, get_db generator
├── dependencies.py          # get_current_user & get_admin_user RBAC guards
├── models/                  # Declarative ORM models (User, Housing, Market, LostFound, Opp, Event, Saved)
├── schemas/                 # Pydantic v2 schemas (Auth, User, Housing, Market, LostFound, Opp, Event)
└── api/v1/                  # 9 dedicated sub-routers grouped by vertical
    ├── auth.py              # Register, login, refresh, forgot/verify/reset-password, logout
    ├── users.py             # Profile get/update (/users/me)
    ├── housing.py           # Housing CRUD + multipart image uploads
    ├── marketplace.py       # Marketplace CRUD + multipart image uploads
    ├── lostfound.py         # Lost & Found CRUD + multipart image uploads
    ├── opportunities.py     # Career opportunities CRUD
    ├── events.py            # Campus events directory CRUD
    ├── saved.py             # Polymorphic bookmarks (save/unsave/check/list)
    └── admin.py             # Moderation console, stats, user toggle/delete, cascade cleanup
```

### Key Technical Highlights:

#### 1. CORS Configuration ([main.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/main.py))
Combines explicit localhost whitelist with dynamic cloud origin regex:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.netlify\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
* **Benefit:** Local development (`5173`, `3000`, `4173`) easily connects, while preview branch deployments on Netlify/Vercel communicate without CORS blockages.

#### 2. Settings Management with Pydantic Settings ([core/config.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/core/config.py))
```python
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = ""
    ENVIRONMENT: str = "development"
    CLOUDINARY_CLOUD_NAME: str = ""
    # ...
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
```
* Strongly typed, automatically loads from `.env`, ignores surplus environment variables (`extra="ignore"`), and provides a single thread-safe `settings` instance.

#### 3. Database Engine & Session Management ([db/session.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/db/session.py))
* **psycopg 3 Protocol Fix:** Standard Postgres URLs start with `postgres://` or `postgresql://`. But psycopg 3 (the modern Python driver) requires the `postgresql+psycopg://` dialect identifier. `session.py` auto-corrects this at startup:
  ```python
  if db_url.startswith("postgres://"):
      db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
  elif db_url.startswith("postgresql://"):
      db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
  ```
* **Connection Resilience:** `create_engine(db_url, pool_pre_ping=True)`. In serverless cloud setups like Neon, compute engines spin down after 5 minutes of inactivity. `pool_pre_ping=True` sends a lightweight ping (`SELECT 1`) before executing queries, preventing dropped connection crashes.
* **Safe Session Generator:** `get_db()` yields `db = SessionLocal()` and guarantees `db.close()` in its `finally:` block.

#### 4. Reusable Dependency Injection Guards ([dependencies.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/dependencies.py))
* `get_current_user`: Checks token format, verifies `payload.get("type") == "access"`, decodes `sub` (user ID), queries DB, and verifies `not user.is_suspended`.
* `get_admin_user`: Wraps `current_user = Depends(get_current_user)` and verifies `current_user.is_admin`. If false, immediately throws `HTTP 403 Forbidden`.

#### 5. Why Vertical Sub-Routers? (Modular Monolith Benefit)
Rather than a giant monolithic `routes.py`, splitting each campus vertical into its own file (`housing.py`, `marketplace.py`, `events.py`, etc.) provides:
* **Separation of Concerns:** Developers can work on Housing without touching Marketplace logic.
* **Granular Query Optimization:** Custom indexes and specific filters are isolated to that vertical.
* **Microservices Migration Ready:** Kal agar Marketplace traffic 10x ho jaye, to `marketplace.py` + `models/marketplace.py` ko easily standalone microservice me carve out kiya ja sakta hai.

---

## 6. Authentication: Dual-Token JWT & RBAC Security

### Dual-Token JWT System vs Single-Token JWT

> [!IMPORTANT]
> **Pichle projects me sirf Single JWT tha (24-hour ya 7-day expiry). Is project me Dual-Token system kyu use kiya?**
> 
> * **Security Risk with Long-Lived Single Token:** Agar 24-hour ya 7-day token kisi network sniff ya client XSS se leak ho jaye, to attacker ke paas 7 din tak platform ka poora access rehta hai bina kisi revocation option ke.
> * **UX Frustration with Short-Lived Single Token:** Agar single token ki expiry 15-30 minute rakhein, to student har 30 minute baad logout ho jayega aur form fill karte waqt session lose ho jayega.
> * **The Dual-Token Solution:**
>   1. `access_token` (Short-Lived: 30 minutes) — API authorization ke liye memory / short storage me rehta hai.
>   2. `refresh_token` (Long-Lived: 7 days) — Stored securely (in `httpOnly` cookie and client storage). Iska use sirf naya access token claim karne ke liye hota hai. Agar access token chori ho bhi jaye, to 30 min me automatically invalid ho jata hai!

```text
[Client]                                           [Server: auth.py]
   │                                                       │
   ├────── POST /api/v1/auth/login (email, password) ────►│
   │                                                       │ Verify bcrypt hash
   │                                                       │ Generate access_token (exp: 30m)
   │                                                       │ Generate refresh_token (exp: 7d)
   │◄───── Return tokens in JSON + set httpOnly cookie ────┤
   │                                                       │
   │  ... 30 minutes pass (Access Token Expired) ...       │
   │                                                       │
   ├────── GET /api/v1/housing (Bearer expired_access) ───►│
   │◄───── HTTP 401 Unauthorized ("Could not validate") ───┤
   │                                                       │
   │  [Axios Interceptor Catches 401 Automatically]        │
   ├────── POST /api/v1/auth/refresh (refresh_token) ─────►│
   │                                                       │ Verify type == "refresh"
   │                                                       │ Verify user not suspended
   │                                                       │ Issue fresh access_token
   │◄───── Return {"access_token": new_access, ...} ───────┤
   │                                                       │
   ├────── Retries Original GET /api/v1/housing ──────────►│
   │◄───── HTTP 200 OK with Data (Zero User Disruption) ───┤
```

### Password Hashing Implementation ([core/security.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/core/security.py))
* Uses `passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`.
* `get_password_hash(password: str) -> str`: Generates high-entropy cryptographic salt and hashes password.
* `verify_password(plain_password: str, hashed_password: str) -> bool`: Safe timing-attack resistant comparison.
* Plaintext passwords database me kabhi touch ya store nahi hote.

### Role-Based Access Control (RBAC) & Admin Protection ([admin.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/api/v1/admin.py))
* `User` model me do critical boolean flags hain:
  * `is_admin: bool` (default `False`)
  * `is_suspended: bool` (default `False`)
* Router-level protection:
  ```python
  def require_admin(current_user: User = Depends(get_current_user)) -> User:
      if not current_user.is_admin:
          raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
      return current_user
  ```
* **Self-Preservation Security Guards:**
  * Admin cannot revoke their own admin status (`if user.id == current_user.id: raise 400 "Cannot modify your own admin status"`).
  * Admin cannot delete their own account (`if user.id == current_user.id: raise 400 "Cannot delete yourself"`).
* **Platform Analytics Endpoint (`GET /admin/stats`):** Single query aggregation calculating counts for `users`, `housing`, `marketplace`, `lostfound`, `opportunities`, `events`.

---

## 7. OTP-Based Password Reset via Asynchronous Email

Traditional email reset links me security token URL me expose hota hai aur email template rendering complex hoti hai. CampusHub **6-digit numeric OTP** pattern use karta hai powered by `fastapi-mail` ([core/email.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/core/email.py)).

### Configuration & SMTP Settings
```python
mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME or "noreply@campushub.edu",
    MAIL_PASSWORD=settings.MAIL_PASSWORD or "dummy_password",
    MAIL_FROM=mail_from,
    MAIL_PORT=settings.MAIL_PORT or 587,
    MAIL_SERVER=settings.MAIL_SERVER or "smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=has_smtp_credentials,
    VALIDATE_CERTS=True,
)
```

### End-to-End Recovery Flow:

```text
[User forgets password on /forgot-password]
                   │
                   ▼ (POST /api/v1/auth/forgot-password)
[Backend auth.py: forgot_password()]
├── Checks user existence: `db.query(User).filter(User.college_email == email).first()`
├── Anti-Enumeration Defense: If user not found, returns success message anyway:
│   "If the email is registered, an OTP has been sent." (Prevents email harvesting!)
├── Generates 6-digit numeric OTP: `otp = "".join(random.choices(string.digits, k=6))`
├── Stores OTP in DB: `user.otp = otp`
├── Enforces 10-Minute Window: `user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)`
├── `db.commit()`
└── Calls `await send_otp_email(user.college_email, otp)`
    ├── If SMTP credentials present -> Sends branded HTML email with bold 28px OTP
    └── If SMTP credentials missing -> Logs OTP to console for frictionless local testing!
                   │
                   ▼ (User receives 6-digit OTP in inbox)
[User enters OTP on /verify-otp]
                   │
                   ▼ (POST /api/v1/auth/verify-otp)
[Backend auth.py: verify_otp()]
├── Checks `user.otp != request_data.otp` -> HTTP 400 ("Invalid OTP code.")
├── Checks `user.otp_expires_at < datetime.now(timezone.utc)` -> HTTP 400 ("OTP code has expired.")
└── Returns HTTP 200 {"message": "OTP verified successfully."}
                   │
                   ▼
[User submits new password on /reset-password]
                   │
                   ▼ (POST /api/v1/auth/reset-password)
[Backend auth.py: reset_password()]
├── Re-verifies OTP & expiry (defense-in-depth: prevents skipping verification step)
├── Hashes new password: `user.password_hash = get_password_hash(request_data.new_password)`
├── Burns OTP: `user.otp = None`, `user.otp_expires_at = None` (One-Time Use Guaranteed)
└── `db.commit()` -> Returns HTTP 200 OK
```

---

## 8. Cloudinary Media Upload Integration & Fallback Engine

Server disk par user media save karna modern containerized/cloud applications me antipattern hota hai, kyunki Render ya Heroku jaisi services par container restart hote hi local filesystem wipe ho jata hai (**Ephemeral Filesystem**).

CampusHub provides dedicated Cloudinary CDN image pipelines ([core/cloudinary.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/core/cloudinary.py)).

### Configuration & Namespace Isolation
```python
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

FOLDERS = {
    "housing": "campushub/housing",
    "marketplace": "campushub/marketplace",
    "lost_found": "campushub/lost_found",
    "opportunities": "campushub/opportunities",
    "events": "campushub/events",
}
```

### Resilient Fallback Engine (`is_dummy_cloudinary_config`):
Agar developer ne `.env` me Cloudinary keys configure nahi ki hain ya dummy values (`your_api_key`) chhod di hain, to system crash hone ya 500 error throw karne ke bajaye high-quality Unsplash fallbacks return karta hai:
```python
FALLBACK_IMAGES = {
    "housing": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    "marketplace": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    "lost_found": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
    "opportunities": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    "events": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
}
```
* **Production Advantage:** Local testing, CI checks, aur recruiter demo review ke waqt kabhi bhi broken images ya failed uploads nahi aate.

---

## 9. Multi-Vertical CRUD Pattern & Polymorphic Saved Posts

### Generic Multi-Vertical CRUD Pattern
Across Housing, Marketplace, Lost & Found, Opportunities, aur Events — backend ek highly consistent, predictable REST architecture follow karta hai:

| Operation | HTTP Verb | Endpoint | Access Level | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| **List & Filter** | `GET` | `/api/v1/<vertical>` | Public | `200 OK` |
| **Get Detail** | `GET` | `/api/v1/<vertical>/{id}` | Public | `200 OK` (or `404`) |
| **Create** | `POST` | `/api/v1/<vertical>` | Authenticated Student | `201 Created` |
| **Upload Images** | `POST` | `/api/v1/<vertical>/{id}/images` | Owner / Admin | `200 OK` (Multipart) |
| **Update** | `PUT` | `/api/v1/<vertical>/{id}` | Owner / Admin | `200 OK` (or `403`) |
| **Delete** | `DELETE` | `/api/v1/<vertical>/{id}` | Owner / Admin | `204 No Content` |

### Polymorphic Saved Posts / Bookmarks Engine ([saved.py](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/app/api/v1/saved.py))

#### ❓ Problem: 
Agar 5 alag verticals hain, to kya 5 alag bookmark tables (`saved_housing`, `saved_marketplace`, `saved_events`...) banayein?
* **Nahi!** Isse schema clutter hota hai, redundant queries likhni padti hain, aur UI me centralized "Saved" tab banana painful ho jata hai.

#### 💡 Solution (Polymorphic Module-Based Bookmarking):
Ek single table `saved_posts` banayi gayi hai jo generic fields store karti hai:
* `user_id` (Student)
* `module` (e.g. `'housing' | 'marketplace' | 'lostfound' | 'opportunities' | 'events'`)
* `post_id` (Target entity ID)
* `UniqueConstraint("user_id", "module", "post_id", name="uq_saved_post_per_user")`

#### Key Architectural Implementations:
1. **Idempotent Save (`POST /api/v1/saved`):**
   ```python
   saved = SavedPost(user_id=current_user.id, module=body.module, post_id=body.post_id)
   db.add(saved)
   try:
       db.commit()
       db.refresh(saved)
   except IntegrityError:
       db.rollback()
       # Already saved — return existing record seamlessly
       saved = db.query(SavedPost).filter_by(user_id=current_user.id, module=body.module, post_id=body.post_id).first()
   return saved
   ```
2. **Instant Status Check (`GET /api/v1/saved/check/{module}/{post_id}`):**
   Returns `{"saved": true/false}` in milliseconds so listing cards can immediately render the active bookmark icon.
3. **Frontend Universal Component (`SaveButton.jsx`):**
   A self-contained button accepting `{ module, postId }`. Yeh internally check karta hai ki post bookmarked hai ya nahi, aur click karne par optimistic toggle trigger karta hai!

---

## 10. Frontend Overview (React + Vite + Dark Precision UI)

### Tech Stack & Libraries
* **Framework:** React 19 / React 18 with Vite 8 bundler.
* **Routing:** React Router v7 (`react-router-dom`).
* **Networking:** Axios with automated request & response interceptors.
* **Icons:** Lucide React (`Home`, `ShoppingBag`, `Search`, `Briefcase`, `Calendar`, `Bookmark`, `ShieldCheck`).
* **Linter:** `oxlint` (Ultra-fast Rust-based linter).

### Axios Refresh Interceptor ([axiosInstance.js](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/src/api/axiosInstance.js))
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint && storedRefreshToken) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: storedRefreshToken },
          { withCredentials: true }
        );
        const newAccessToken = refreshResponse.data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### Route Protection Hierarchy ([ProtectedRoute.jsx](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/src/components/common/ProtectedRoute.jsx) & [App.jsx](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/src/App.jsx))
* `ProtectedRoute` handles 3 discrete states:
  1. `loading`: Displays spinner while session is being verified against `/api/v1/users/me`.
  2. `!user`: Redirects unauthenticated guests to `/login`.
  3. `adminOnly && !user.is_admin`: Redirects regular students back to `/` preventing access to `/admin`.
* **Page Hierarchy Pattern:**
  * Every vertical implements: `/<vertical>` (List), `/<vertical>/:id` (Detail), `/<vertical>/create` (Protected), `/<vertical>/:id/edit` (Protected).

### Monochromatic Dark Precision Design System ([index.css](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/src/index.css))
* Canvas: `#0A0A0B` (Deep obsidian dark)
* Surface levels: Surface 1 (`#111113`), Surface 2 (`#17171A`), Surface 3 (`#1E1E22`)
* Borders: Subtle (`#1F1F24`), Default (`#26262B`), Hover (`#3A3A42`)
* Primary Accent: Electric Cyan (`#22D3EE`) with hover (`#0EA5C4`)
* Typography: `Plus Jakarta Sans` for UI prose, `JetBrains Mono` for metadata tags and registration numbers.

---

## 11. Docker & Containerization Strategy

### 1. Backend Dockerfile ([backend/Dockerfile](file:///Users/omkar/Documents/VsCode/Projects/campushub/backend/Dockerfile))
```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```
* **Production ASGI Process Model:** Runs **Gunicorn** master process managing **4 UvicornWorker** worker processes (`-w 4 -k uvicorn.workers.UvicornWorker`). Agar ek worker CPU-intensive cryptographic task (bcrypt) ya image streaming me busy ho, baki 3 workers incoming HTTP requests smoothly serve karte rehte hain.
* **System Headers:** `gcc` aur `libpq-dev` install kiye gaye hain taaki C-extensions (psycopg) seamlessly compile ho sakein.

### 2. Frontend Dockerfile (2-Stage Multi-Stage Build) ([frontend/Dockerfile](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/Dockerfile))
```dockerfile
# Stage 1: Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Production Stage with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
* **Container Optimization:** Node.js runtime (~450MB) aur raw sources ko discard kar diya jata hai. Production image sirf **25MB Alpine Nginx** container banti hai jo pre-compiled static assets serve karti hai.

### 3. Nginx SPA Routing Fallback ([frontend/nginx.conf](file:///Users/omkar/Documents/VsCode/Projects/campushub/frontend/nginx.conf))
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```
* `try_files $uri $uri/ /index.html;`: Client-side routing me jab user direct `/housing` ya `/marketplace/4` refresh karta hai, Nginx 404 return karne ke bajaye `index.html` return karta hai taaki React Router route ko safely mount kare.

### 4. Docker Compose Orchestration ([docker-compose.yml](file:///Users/omkar/Documents/VsCode/Projects/campushub/docker-compose.yml))
* Binds `backend` to port `8000` with `./backend/.env` file.
* Binds `frontend` to port `80` passing `VITE_API_URL` build arg.
* Defines `depends_on: - backend` and `restart: always`.

---

## 12. CI/CD Pipeline (Automated Quality Gate & Git Deploys)

### Workflow Breakdown ([.github/workflows/ci.yml](file:///Users/omkar/Documents/VsCode/Projects/campushub/.github/workflows/ci.yml))
Triggers on `push` and `pull_request` to `main` branch. 3 jobs parallel me execute hoti hain:

```text
                           [ GitHub Push / PR to main ]
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
[Job 1: backend]                [Job 2: frontend]               [Job 3: docker]
- Ubuntu Latest                 - Ubuntu Latest                 - Ubuntu Latest
- Set up Python 3.11 (pip cache)- Set up Node 20 (npm cache)    - Checkout code
- Install requirements.txt      - npm ci                        - Create dummy backend/.env
- Smoke Validation:             - Run ESLint / oxlint           - Validate syntax:
  python -c "import app.main;     (npm run lint)                  docker compose config
  print('Loaded!')"             - Vite Production Build:        
  (Uses sqlite test DB & dummy    (npm run build)                 
  SECRET_KEY env vars)
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        ▼
                         [ All 3 Checks Pass: Green Check ✓ ]
```

### 🔍 Crucial Comparison: CampusHub vs Pichle Projects (DocuCraft & Forge Todo)

> [!NOTE]
> **Pichle projects me Docker Hub build & push tha aur curl se Deploy Hooks trigger hote the. CampusHub me wo kyu nahi hai?**
> 
> * **Pichle Projects (DocuCraft / Forge Todo):** GitHub Actions ke andar `docker/build-push-action` ke zariye Docker images build karke Docker Hub (`omkarmm19/...:latest`) par push ki jaati thi, aur fir `curl -X POST $RENDER_DEPLOY_HOOK` chalaya jata tha. Iske liye GitHub Secrets (`DOCKERHUB_TOKEN`, deploy hook URLs) zaroori the.
> * **CampusHub Approach (Git-Based Auto-Deploy):**
>   * CampusHub me CI pipeline ka kaam strictly **Quality Gate / Smoke Testing** hai. Isme **zero GitHub secrets** ki zaroorat hoti hai.
>   * Cloud hosts (**Render** aur **Netlify**) directly GitHub repository se webhook-linked hain. Jaise hi `main` branch par commit push hota hai, Render aur Netlify khud code pull karke build initiate kar dete hain (**Direct Git-Based Auto-Deploy**).
>   * **Trade-off Analysis:**
>     * *Git-Based Auto-Deploy (CampusHub):* Simpler setup, zero credentials maintenance in GitHub, automatic build rollbacks on host platform UI.
>     * *Registry-Based CD (DocuCraft):* Artifact immutability, image caching on Docker Hub, multi-cloud portability (AWS/DigitalOcean par same image run kar sakte hain).

---

## 13. Production Deployment Setup

| Layer | Provider | Configuration File | Live Production URL & Setup |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | **Netlify** | [`netlify.toml`](file:///Users/omkar/Documents/VsCode/Projects/campushub/netlify.toml) | [https://campushub-omkar.netlify.app/](https://campushub-omkar.netlify.app/)<br>• Base: `frontend`, Publish: `dist`<br>• Command: `npm run build`<br>• SPA redirect: `/* -> /index.html 200` |
| **Backend API** | **Render** | [`render.yaml`](file:///Users/omkar/Documents/VsCode/Projects/campushub/render.yaml) | [https://campushub-tm0a.onrender.com](https://campushub-tm0a.onrender.com)<br>• Web Service (Python 3.11.9)<br>• Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`<br>• Auto-Deploy enabled on Git push |
| **Interactive API Docs** | **Swagger UI** | Auto-generated by FastAPI | [https://campushub-tm0a.onrender.com/docs](https://campushub-tm0a.onrender.com/docs) |
| **Database** | **Neon** | Serverless PostgreSQL | PostgreSQL 16 instance with SSL (`sslmode=require`), connection pooling, auto-wake via `pool_pre_ping=True` |
| **Media Assets** | **Cloudinary** | Cloud CDN | Subfolders: `campushub/housing`, `marketplace`, `lost_found`, etc. with Unsplash fallback |
| **Email Service** | **FastAPI-Mail** | Google SMTP (Port 587) | TLS-enabled asynchronous delivery for 6-digit OTP verification codes |

---

## 14. Common Technical Interview Q&A (20 Curated Questions)

### Q1: Is project me Dual-Token JWT (Access + Refresh) kyu implement kiya single JWT ke bajaye?
**Answer:** "Single JWT token system me security aur user experience ke beech direct conflict hota hai: agar token ki expiry lambi rakhein (e.g. 7 din) to token leak hone par attack surface bohot bada ho jata hai bina kisi revocation option ke; agar token short-lived rakhein (e.g. 15 minute) to student bar-bar logout ho jata hai. 
Dual-token architecture me humne **Access Token** ko short-lived (30 minutes) rakha hai jo API authorization ke liye use hota hai, aur **Refresh Token** ko long-lived (7 days) rakha hai jo `httpOnly` cookie aur secure storage me save rehta hai. Axios response interceptor 401 aane par background me silently naya access token fetch kar leta hai without interrupting the student."  
*Interviewer Follow-up: "Token refresh endpoint me kya checks lagaye gaye hain?"*  
**Answer:** "`auth.py: refresh_token()` endpoint verify karta hai ki token ka payload claim `type == 'refresh'` ho (taaki koi access token se refresh na kar sake), user database me exist kare, aur user banned/suspended na ho (`user.is_suspended == False`)."

---

### Q2: Alembic Migrations kyu zaroori hain jabki SQLAlchemy me `Base.metadata.create_all()` already hota hai?
**Answer:** "`create_all()` sirf tab tables banata hai jab database empty ho ya table exist na karti ho. Agar production database live hai jisme students ka data stored hai, aur hum kisi existing model me naya column (jaise `otp_expires_at`) ya index add karte hain, to `create_all()` us schema change ko live DB par apply nahi kar sakta — wo silently skip ho jata hai.
Alembic model definitions aur database schema ka differential analyze karta hai, incremental versioned migration scripts (`versions/*.py`) generate karta hai, aur `alembic_version` table ke through exact schema state track karta hai. Isse zero data loss ke sath schema upgrades aur rollbacks possible hote hain."  
*Interviewer Follow-up: "Alembic ko kaise pata chalta hai ki kaunse models migrate karne hain?"*  
**Answer:** "`alembic/env.py` me hum `target_metadata = Base.metadata` assign karte hain aur `import app.models` run karte hain. Isse saare models (`User`, `HousingListing`, `SavedPost`, etc.) metadata registry me load ho jaate hain aur Alembic auto-generation ke waqt unhe inspect kar pata hai."

---

### Q3: Media uploads ke liye Cloudinary CDN kyu choose kiya local server disk storage ke bajaye?
**Answer:** "PaaS cloud providers (Render, Heroku) **ephemeral filesystem** follow karte hain. Har deployment, restart, ya container spin-down par server disk wipe ho jati hai. Agar hum images `/app/static/` me store karte, to deployment ke agle hi minute student ki housing photos delete ho jaati.
Cloudinary media assets ko globally distributed CDN par store karta hai, automatic format/quality optimization (`auto=format, q=80`) provide karta hai, aur secure public URLs deta hai jo PostgreSQL me store hoti hain."  
*Interviewer Follow-up: "Agar Cloudinary API down ho jaye ya keys expire ho jayein to system crash hoga?"*  
**Answer:** "`core/cloudinary.py` me `is_dummy_cloudinary_config()` aur resilient fallback logic implement kiya hai. Agar upload call fail hoti hai ya credentials dummy hote hain, to backend category-specific high-quality Unsplash fallbacks return kar deta hai. Form submission ya UI rendering kabhi fail nahi hoti."

---

### Q4: OTP-Based Password Reset ka security design kaisa hai? Timing attacks aur enumeration kaise roke?
**Answer:** "OTP system 4 security layers follow karta hai:
1. **Anti-Enumeration Response:** `/auth/forgot-password` endpoint par agar unregistered email daali jaye, tab bhi API HTTP 200 ke sath 'If the email is registered, an OTP has been sent' return karti hai, taaki attacker college emails harvest na kar sake.
2. **Strict Expiry Window:** OTP ke sath `otp_expires_at = now + 10 mins` save hota hai. 10 minute baad token automatically expire ho jata hai.
3. **One-Time Use (Burning OTP):** Password reset successful hone ke turant baad `user.otp = None` aur `user.otp_expires_at = None` set ho jata hai.
4. **Defense-in-Depth in Reset:** `/reset-password` endpoint direct call hone par bhi dobara OTP aur expiry verify karta hai taaki koi client step bypass karke password reset na kar sake."

---

### Q5: Role-Based Access Control (RBAC) kaise implement kiya gaya hai? Student aur Admin me kya difference hai?
**Answer:** "`User` model me `is_admin: bool` attribute define hai. FastAPI dependency injection pattern use karke humne `get_admin_user` dependency banayi hai:
```python
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user
```
Admin router (`/api/v1/admin/*`) ke har endpoint par ye dependency inject hoti hai. Agar koi standard student admin stats ya user moderation endpoint hit karega to use directly HTTP 403 Forbidden return hoga. Frontend me `ProtectedRoute` me `adminOnly={true}` flag client-side navigation block karta hai."  
*Interviewer Follow-up: "Admin moderation me cascade deletion kaise kaam karta hai?"*  
**Answer:** "SQLAlchemy models me ForeignKeys par `ondelete="CASCADE"` aur relationships me `cascade="all, delete-orphan"` configure hai. Jab Admin kisi abusive student ko delete karta hai, to uske saare housing posts, marketplace items, lost&found reports aur saved bookmarks database se automatically safely purge ho jaate hain."

---

### Q6: Git-Based Auto-Deploy (Render/Netlify) vs Docker Hub Registry + Webhook Deploy me kya trade-off hai?
**Answer:** 
* **Git-Based Auto-Deploy (CampusHub):** Render aur Netlify direct GitHub repository ke commits listen karte hain. Iska fayda ye hai ki GitHub Actions me koi sensitive credentials (`DOCKER_USERNAME`, `RENDER_DEPLOY_HOOK`) store nahi karne padte, setup compact rehta hai, aur cloud platform build logs natively display karta hai.
* **Docker Hub + Webhook (Pichle projects):** GitHub Actions runner par image compile karke Docker Hub par tag ke sath push hoti hai. Iska benefit container immutability aur multi-cloud portability hai (kal agar Render se AWS ECS par migrate karna ho to same container image directly deploy ho sakti hai).
* **Interview Justification:** 'CampusHub jaisi agile university platforms ke liye Git-based zero-secret pipeline maintenance overhead reduce karti hai, jabki large enterprise microservices ke liye centralized container registry preferable hoti hai.'"

---

### Q7: Saved Posts / Bookmarks feature ko polymorphic database structure me kyu design kiya?
**Answer:** "Platform me 5 alag verticals hain (Housing, Marketplace, Lost & Found, Opportunities, Events). Agar hum har vertical ke liye separate join table banate (`saved_housing`, `saved_marketplace`, etc.), to 5 separate tables, 5 models, aur 5 CRUD endpoints likhne padte.
Humne single `saved_posts` table banayi with columns `(user_id, module, post_id)` aur composite unique constraint `UniqueConstraint("user_id", "module", "post_id")`.
Isse student ke saare saved items single query me fetch ho jaate hain, aur frontend ek hi universal `<SaveButton module="housing" postId={item.id} />` component har jagah reuse kar pata hai."  
*Interviewer Follow-up: "Race conditions ya duplicate saves kaise handle hote hain?"*  
**Answer:** "Backend `POST /saved` endpoint database-level `IntegrityError` catch karta hai. Agar student ne double-click kiya ya concurrent request aayi, to backend crash hone ke bajaye rollback karke existing record return kar deta hai — operation 100% idempotent hai."

---

### Q8: Phone number aur WhatsApp fields ke liye Pydantic v2 me custom validation kaise ki gayi?
**Answer:** "Campus listings me students alag-alag format me phone number input karte hain (e.g. `+91 98765 43210`, `09876543210`, `98765-43210`). Agar ye raw database me chala jaye to WhatsApp click-to-chat links (`https://wa.me/...`) break ho jaati hain.
Humne `normalize_phone_number()` helper banaya jo regex `re.sub(r'\D', '', v)` se non-digits strip karta hai, leading `91` ya `0` ko clean karta hai, aur Pydantic v2 `@field_validator('phone')` ke through strictly 10-digit number enforce karta hai. Invalid phone numbers par API client ko standard 422 Unprocessable Entity throw karti hai."

---

### Q9: Axios me 401 response interceptor simultaneous multiple requests par token refresh race condition kaise prevent karta hai?
**Answer:** "`axiosInstance.js` me response interceptor `originalRequest._retry` boolean flag use karta hai. Jab pehli request 401 return karti hai, interceptor `_retry = true` mark karke `authAPI.refresh()` call karta hai. Agar refresh fail ho jaye, to infinite loop se bachne ke liye interceptor retry nahi karta, local storage purge karta hai (`access_token`, `refresh_token`, `user`), aur user ko `/login` par route kar deta hai."  
*Interviewer Follow-up: "Agar ek sath 4 requests 401 maar dein to kya 4 refresh requests jayengi?"*  
**Answer:** "Current implementation me `_retry` flag per-request check hota hai. Enterprise scale par hum ek global `isRefreshing` promise lock pattern implement karte hain jahan subsequent failed requests ek single refresh promise ke resolve hone ka wait karti hain in a queue."

---

### Q10: Backend Dockerfile me Gunicorn ke sath UvicornWorker kyu configure kiya direct Uvicorn ke bajaye?
**Answer:** "Standalone `uvicorn app.main:app` single process me chalta hai. Agar kisi request me bcrypt hashing (CPU-heavy) ya multiple image payloads process ho rahe hon, to event loop briefly choke ho sakti hai.
Dockerfile me humne Gunicorn ko master process banaya hai with 4 Uvicorn workers:
`gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000`
Gunicorn master process worker lifecycles monitor karta hai (dead worker auto-restart), signals handle karta hai, aur Uvicorn workers asynchronous event-loop throughput provide karte hain. Isse multicore concurrency exploit hoti hai."

---

### Q11: Frontend SPA me Nginx aur Netlify dono me special redirect config kyu chahiye hoti hai?
**Answer:** "React 19 Vite app ek Single Page Application (SPA) hai jisme HTML5 History API (`BrowserRouter`) client-side routing karti hai. Jab student browser me direct `https://campushub-omkar.netlify.app/housing/create` open karta hai ya page refresh karta hai, to browser server se `/housing/create/index.html` file mangta hai jo disk par exist nahi karti.
* Netlify me: `netlify.toml` me `[[redirects]] from = "/*" to = "/index.html" status = 200` configure hai.
* Nginx (Docker) me: `try_files $uri $uri/ /index.html;` configure hai.
Dono web servers ko instruct karte hain ki har unknown path par `index.html` serve kare, jisse React Router boot hokar correct sub-component render kar sake."

---

### Q12: Database session lifecycle me `get_db` generator function ka kya role hai?
**Answer:** "`db/session.py` me `get_db()` ek Python generator function hai jo FastAPI dependency injection ke through use hota hai:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
Jab client request aati hai, FastAPI `get_db()` execute karke naya SQLAlchemy database session allocate karta hai aur handler ko yield karta hai. Request poori hone ke baad (chahe success ho ya exception raise ho), `finally:` block guaranteed execute hota hai aur `db.close()` connection ko safely pool me wapas return kar deta hai, preventing connection leaks."

---

### Q13: Serverless Neon PostgreSQL ke sath `pool_pre_ping=True` lagana kyu mandatory hai?
**Answer:** "Neon Serverless compute instances cost aur resource optimization ke liye 5 minutes of inactivity ke baad compute engine ko 'suspend' (sleep) kar dete hain. 
Agar pool me purana connection rakha ho aur agla user request bhej de, to raw engine closed socket par query fire karne ki koshish karega jisse `OperationalError: SSL connection has been closed unexpectedly` crash hota hai.
`pool_pre_ping=True` har checkout par ek lightweight `SELECT 1` ping bhejta hai; agar socket dead mile to pool connection silently discard karke fresh connection establish karta hai, making serverless cold-starts completely transparent."

---

### Q14: psycopg 3 aur psycopg2 me kya antar hai aur connection string me `postgresql+psycopg://` kyu kiya gaya?
**Answer:** "`psycopg` (version 3) Python ka modern, complete rewrite hai jo async support (`async with`), binary protocol optimization, Python type hints, aur faster pipeline mode provide karta hai.
SQLAlchemy me standard `postgresql://` protocol by default purane `psycopg2` driver ko dhoondhta hai. Is project ke `requirements.txt` me modern `psycopg[binary]>=3.2.3` use hua hai, isliye connection string ko explicitly `postgresql+psycopg://` me normalize karna zaroori hota hai taaki SQLAlchemy correct psycopg 3 dialect load kare."

---

### Q15: Agar CampusHub ko 50,000 active students ke liye scale karna ho, to top 3 bottlenecks kya honge aur unka architecture fix kya hoga?
**Answer:**
1. **Synchronous Email & Image Upload:** Currently image uploads aur email dispatch request-response cycle ke andar execute hote hain. High concurrency par workers network I/O me block honge.
   * *Fix:* **Celery / ARQ background task queue** with Redis broker introduce karenge. API turant `202 Accepted` return karegi aur worker image upload & email delivery asynchronously karega.
2. **Database Read Load Spikes (Events & Housing):** Campus fest ya hostel shifting ke time listing queries DB par spike karengi.
   * *Fix:* **Redis Caching Layer** with 5-minute TTL for public listing feeds, and **PostgreSQL Read Replicas** via PgBouncer.
3. **Database Connection Pool Exhaustion:** Neon free tier connection limits hit ho sakti hain.
   * *Fix:* Neon Connection Pooler (PgBouncer mode on port 6543) connect karenge to multiplex 1000s of app connections over 20 Postgres processes.

---

### Q16: Agar 5 verticals (Housing, Marketplace, LostFound, Opportunities, Events) ko microservices me split karna ho to kaise karoge?
**Answer:**
1. **Shared Auth & User Service:** Auth, Users, aur OTP logic ko ek central Auth Microservice banayenge jo signed JWTs issue karegi (public key / private key RSA-256 pair se, taaki downstream services bina DB hit kiye token verify kar sakein).
2. **Domain-Specific Services:** Har vertical (`Housing Service`, `Marketplace Service`, etc.) apna dedicated database/schema rakhegi.
3. **Event-Driven Communication:** User delete hone par cascade deletion ke liye **RabbitMQ / Kafka event bus** use karenge — Auth service `UserDeleted` event publish karegi, aur sabhi vertical services apne corresponding records purge kar dengi.
4. **API Gateway:** Traefik ya Kong API Gateway front par rakhenge jo `/api/v1/housing` ko Housing service aur `/api/v1/marketplace` ko Marketplace service par reverse-proxy karega.

---

### Q17: CI pipeline me `import app.main` smoke test ka kya purpose hai unit tests ke comparison me?
**Answer:** "Smoke tests fast validation check hote hain jo verify karte hain ki:
1. Saari required production dependencies (`requirements.txt`) bina conflict ke successfully install ho rahi hain.
2. Codebase me koi Python syntax errors, circular imports, ya missing environment variable crashes nahi hain.
3. FastAPI application factory aur saare 9 sub-routers properly wire ho rahe hain.
Ye test ~15 seconds me run ho jata hai bina external database ya real SMTP secrets ke, catching 90% of deployment-breaking integration bugs early before cloud deployments."

---

### Q18: Dark Precision UI me custom CSS variables aur Tailwind v4 ka design strategy kya hai?
**Answer:** "Tailwind CSS v4 me `@import "tailwindcss";` aur `@theme` inline directive use hoti hai. `index.css` me monochromatic dark surface tokens define kiye gaye hain (`--canvas: #0A0A0B`, `--surface-1: #111113`, `--border-default: #26262B`, `--accent: #22D3EE`).
Isse pure platform par consistent dark precision aesthetics milti hai, browser default blue outlines remove hoti hain (`outline: none` with custom focus rings), aur accessible custom scrollbars render hote hain. Component styling maintainable aur modular rehti hai."

---

### Q19: Delete housing/marketplace listing me authorization check kaise enforce hota hai?
**Answer:** "Ownership verification code-level par double check hoti hai:
```python
listing = db.query(HousingListing).filter(HousingListing.id == id).first()
if not listing:
    raise HTTPException(status_code=404, detail="Listing not found.")

if listing.user_id != current_user.id and not current_user.is_admin:
    raise HTTPException(status_code=403, detail="Not authorized to delete this listing.")
```
Record sirf tabhi delete ho sakta hai jab request karne wala user ya to post ka **original creator** ho (`listing.user_id == current_user.id`) ya **platform Admin** ho (`current_user.is_admin == True`). Unauthorized attempts par HTTP 403 Forbidden return hota hai."

---

### Q20: Password hashing me Bcrypt kyu use kiya standard SHA-256 ya MD5 ke bajaye?
**Answer:** "SHA-256 aur MD5 general-purpose cryptographic hash functions hain jo fast execution ke liye optimize hote hain (modern GPUs billions of hashes per second compute kar sakte hain). Attacker precomputed rainbow tables ya brute-force dictionary attacks se plain passwords seconds me crack kar sakta hai.
Bcrypt ek adaptive, computationally slow hashing algorithm hai jisme configurable **work factor (rounds)** aur built-in unique random salt hota hai. Isse rainbow table attacks completely useless ho jaate hain aur brute-force search mathematically infeasible ho jata hai."

---

## 15. Buzzwords & Keywords Cheat-Sheet

| Technical Term | CampusHub Codebase me Kaha Use Hua? | 1-Line Simple Meaning |
| :--- | :--- | :--- |
| **Alembic Migrations** | `backend/alembic/` & `alembic_version` | Database schema ko version control karna taaki production me bina data loss ke table changes apply ho sakein. |
| **Dual-Token JWT** | `core/security.py`, `api/v1/auth.py` | Short-lived Access Token (30m) + Long-lived Refresh Token (7d) jo security aur UX dono balance karta hai. |
| **Silent Refresh Interceptor** | `frontend/src/api/axiosInstance.js` | Client-side HTTP handler jo 401 Unauthorized aane par background me naya token fetch karke failed request replay karta hai. |
| **Polymorphic Bookmarks** | `models/saved.py`, `api/v1/saved.py` | Single table me `module` + `post_id` store karke sabhi 5 verticals ke items ko generically bookmark karna. |
| **Role-Based Access (RBAC)**| `dependencies.py` (`get_admin_user`) | User roles (Student vs Admin) ke basis par sensitive endpoints (analytics, moderation) ko restrict karna. |
| **6-Digit Email OTP** | `core/email.py`, `auth.py` (`fastapi-mail`) | Asynchronous SMTP delivery se 10-minute validity wala password recovery code generate aur verify karna. |
| **Cloudinary Media CDN** | `core/cloudinary.py`, `housing.py` | Student image uploads ko global cloud CDN par stream karna taaki ephemeral server disk wipe se bacha ja sake. |
| **Demo Fallback Engine** | `core/cloudinary.py` (`FALLBACK_IMAGES`)| Cloud credentials missing ya fail hone par curated Unsplash images supply karna taaki app crash na ho. |
| **psycopg 3 Protocol** | `db/session.py` (`postgresql+psycopg://`)| Modern Python PostgreSQL driver jo async efficiency aur binary serialization offer karta hai. |
| **Connection Pre-Ping** | `db/session.py` (`pool_pre_ping=True`) | Query run karne se pehle connection test karna taaki Neon serverless DB sleep hone par socket crash na ho. |
| **Gunicorn + UvicornWorker**| `backend/Dockerfile` (`-w 4 -k uvicorn`)| Multi-worker process model jo CPU-bound tasks me event loop blocking prevent karta hai. |
| **Multi-Stage Docker Build** | `frontend/Dockerfile` (Node -> Nginx) | Build tooling ko discard karke sirf 25MB Alpine Nginx image me static production bundle serve karna. |
| **SPA Fallback Routing** | `frontend/nginx.conf`, `netlify.toml` | Browser reload par 404 aane ke bajaye server se hamesha `index.html` serve karwana. |
| **Anti-Enumeration Defense**| `auth.py` (`/forgot-password`) | User email database me na milne par bhi generic success message return karna taaki email sniffing na ho sake. |
| **Idempotent DB Operation**| `api/v1/saved.py` (`try-commit-Integrity`)| Duplicate save requests aane par crash hone ke bajaye existing record return karna without side-effects. |
| **Git-Based Auto-Deploy** | `render.yaml`, `netlify.toml` | CI pipeline me Docker Hub push ke bajaye direct GitHub webhook trigger se zero-secret deployment chalana. |
| **Cascade Deletion** | `models/*.py` (`ondelete="CASCADE"`) | Parent user delete hone par uske housing listings, marketplace posts aur images ko DB engine se auto-cleanup karna. |
| **Dark Precision UI** | `frontend/src/index.css` | Monochromatic black/charcoal surface tokens with electric cyan accents built on Tailwind CSS v4. |
