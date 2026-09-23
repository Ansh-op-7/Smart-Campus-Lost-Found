# FindIt – Smart Campus Lost & Found Platform

> **"Lost something on campus? Find it faster. Return it smarter."**

FindIt is a full-stack, enterprise-grade Lost and Found platform purpose-built for university campuses. It connects students who have lost personal belongings with finders and campus administration through automated verification workflows, smart similarity matching, real-time in-app notifications, and role-protected administration portals.

---

## 🌟 Key Features

- 🔐 **Secure Authentication & RBAC**: JWT-based stateless authentication with BCrypt password hashing, role-based access control (`ROLE_STUDENT`, `ROLE_ADMIN`), and auto-redirect route guards.
- 📦 **Lost & Found Reporting**: Rich multi-section reporting flow with location tagging, timestamps, categories, and client/server-side image upload validation.
- 🖼️ **Local Image Storage**: File size limits (5MB), MIME verification, UUID-based file isolation, and path traversal protection.
- 🔍 **Marketplace Search & Filter**: Real-time debounce search across titles, descriptions, categories, status badges (`ACTIVE`, `CLAIMED`, `RETURNED`), and campus locations.
- 🤝 **Claims & Handover Workflow**: Two-step claim verification system where claimants submit proof of ownership, reporters approve/reject, and items transition seamlessly to `CLAIMED` and `RETURNED`.
- 🔔 **In-App Notification Center**: Real-time unread badges with polling, single-click read markers, bulk "Mark all as read", and direct action deep-links.
- 🧠 **Smart Lost ↔ Found Item Matching**: Explainable rule-based scoring engine calculating composite match confidence (0–100%) across category, title keywords, location, date proximity, and descriptions with actionable match reason tags.
- 🛡️ **Comprehensive Admin Portal**: Protected `/admin` control center for real-time KPI monitoring, user role management (`STUDENT` $\leftrightarrow$ `ADMIN`), item moderation, claim dispute resolution, and category taxonomy editing.
- 📱 **Responsive & Accessible UI**: Dark-themed aesthetic built with Tailwind CSS, accessible `:focus-visible` rings, custom slim scrollbars, unified toast notification system, and dedicated skeleton loading / empty / error fallback states (optimized from 375px mobile to 1920px desktop).

---

## 🛠️ Technology Stack

### Backend
- **Language:** Java 17+
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security 6 & JJWT (JSON Web Token)
- **Persistence:** Spring Data JPA & Hibernate
- **Database:** MySQL 8.0 (with H2 in-memory for automated tests)
- **Validation:** Jakarta Validation / Hibernate Validator
- **File Storage:** Local multipart storage (`uploads/items/`)
- **Build Tool:** Maven 3.9+ (Maven Wrapper included)

### Frontend
- **Framework:** React 18+
- **Tooling & Bundler:** Vite 6.x
- **Styling:** Tailwind CSS & PostCSS
- **Routing:** React Router v6
- **State Management:** React Context API (`AuthContext`, `NotificationContext`, `ToastContext`)
- **HTTP Client:** Axios (with Bearer request interceptors and global 401 response handling)
- **Icons:** Lucide React

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│   (AuthContext | ToastContext | NotificationContext | SPA)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST (JSON / Multipart)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot REST API Layer                 │
│  AuthController | ItemController | ClaimController | Admin  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│    Spring Security (JWT)    │ │   FileStorageService        │
│  BCrypt | RBAC | AuthFilter │ │  (uploads/items/ storage)   │
└─────────────────────────────┘ └─────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Service & Matching Layer                    │
│   MatchService (Weighted Scoring Engine) | Business Logic   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Spring Data JPA
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MySQL 8.0 Database                      │
│     (users | items | categories | claims | notifications)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Local Development Setup

### Prerequisites
- **JDK 17+** installed (`java -version`)
- **Node.js 18+** & **npm** installed (`node -v`, `npm -v`)
- **MySQL Server 8.0** running locally on port `3306`

---

### Step 1: Database Setup
Ensure MySQL is running and create the database (if not automatically created):
```sql
CREATE DATABASE IF NOT EXISTS findit_db;
```

---

### Step 2: Backend Setup & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Configure environment variables:
   Copy `.env.example` to `.env` or set environment variables:
   - `DB_URL=jdbc:mysql://localhost:3306/findit_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=your_mysql_password`
   - `JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
   - `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`

3. Run the automated test suite:
   ```powershell
   .\mvnw.cmd clean test
   ```

4. Start the Spring Boot application:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *The backend will start at `http://localhost:8080`.*

---

### Step 3: Frontend Setup & Execution

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will open at `http://localhost:5173`.*

---

## 🐳 Docker Deployment Setup

FindIt includes production-ready Dockerfiles and a root `docker-compose.yml` that orchestrates MySQL, Spring Boot, and Nginx.

### Run with Docker Compose

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Build and start all containers:
   ```bash
   docker compose up --build
   ```

3. Services started:
   - **Frontend (React + Nginx):** `http://localhost:80` (or `http://localhost`)
   - **Backend (Spring Boot):** `http://localhost:8080`
   - **Database (MySQL 8.0):** `localhost:3306`

4. Uploads persistence:
   - Uploaded item images are automatically persisted inside the Docker named volume `uploads_data` mapped to `/app/uploads/items`.

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SERVER_PORT` | Backend HTTP port | `8080` |
| `DB_URL` | JDBC Database Connection URL | `jdbc:mysql://localhost:3306/findit_db` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | HMAC-SHA256 signing secret key (≥ 256 bits) | *Configured in environment* |
| `JWT_EXPIRATION` | Token validity duration in milliseconds | `86400000` (24 Hours) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://localhost:3000` |
| `APP_UPLOAD_DIR` | Directory path for local image storage | `uploads/items` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8080` |

---

## 📡 REST API Overview

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account.
- `POST /api/auth/login` — Authenticate and receive a JWT Bearer token.

### 2. Lost & Found Items (`/api/items`)
- `GET /api/items` — Browse items with optional search and filters (`type`, `categoryId`, `query`, `status`, `location`).
- `GET /api/items/{id}` — Fetch detailed item metadata including reporter info.
- `POST /api/items` — Create a new item (JSON payload).
- `POST /api/items/with-image` — Create a new item with multipart image upload.
- `PUT /api/items/{id}` — Update an existing item (Owner or Admin).
- `DELETE /api/items/{id}` — Delete an item and its associated photo (Owner or Admin).
- `GET /api/items/my` — Fetch all items reported by the authenticated user.
- `GET /api/items/{id}/matches` — Run the smart matching engine and fetch candidate matches.

### 3. Claims & Handover (`/api/claims`)
- `POST /api/claims` — Submit an ownership claim for a found item with proof description.
- `GET /api/claims/my` — View claims submitted by the logged-in user.
- `GET /api/claims/received` — View claims received for items reported by the logged-in user.
- `PUT /api/claims/{id}/status` — Approve or reject a claim (`APPROVED`, `REJECTED`).
- `PUT /api/claims/{id}/complete` — Confirm physical handover and mark item as `RETURNED`.

### 4. Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch all notifications for the authenticated user.
- `GET /api/notifications/unread-count` — Real-time count of unread notifications.
- `PUT /api/notifications/{id}/read` — Mark a single notification as read.
- `PUT /api/notifications/read-all` — Bulk mark all notifications as read.

### 5. Categories (`/api/categories`)
- `GET /api/categories` — List all classification categories.
- `POST /api/categories` — Create category (Admin only).
- `PUT /api/categories/{id}` — Update category (Admin only).
- `DELETE /api/categories/{id}` — Delete category (Admin only).

### 6. Admin Portal (`/api/admin`)
- `GET /api/admin/dashboard` — Global platform statistics (total users, items, claims, resolution rate).
- `GET /api/admin/users` — List and search all registered platform accounts.
- `PUT /api/admin/users/{id}/role` — Promote or demote user role (`ROLE_STUDENT` $\leftrightarrow$ `ROLE_ADMIN`).
- `GET /api/admin/items` — Moderate all items across the campus.
- `GET /api/admin/claims` — Oversee and audit all ownership claims.

### 7. System Health (`/api/health`)
- `GET /api/health` — Returns application status and uptime health (`{"status": "UP"}`).

---

## 👥 User Roles & Demo Accounts

### 1. Student Account
- Register any standard user through the frontend UI (`/register`) or API (`POST /api/auth/register`).
- By default, all newly registered accounts receive `ROLE_STUDENT`.

### 2. Admin Account Setup
To assign `ROLE_ADMIN` to an account:
1. Register a user via the registration screen (e.g. `admin@campus.edu`).
2. Run the following SQL command directly on your MySQL database:
   ```sql
   UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'admin@campus.edu';
   ```
3. Log in with the updated account. The top navigation bar will automatically display the **Admin Portal** button leading to `/admin`.

---

## 🧪 Testing & Quality Assurance

FindIt maintains a comprehensive automated unit and integration test suite with **104 tests passing**:

```powershell
cd backend
.\mvnw.cmd clean test
```

### Test Suite Summary
- **Authentication & Security Tests:** JWT token generation, expiration, validation, BCrypt password verification, and Spring Security filters.
- **Service Layer Tests:** `AuthServiceTests`, `ItemServiceTests`, `ClaimServiceTests`, `NotificationServiceTests`, `AdminServiceTests`, `MatchServiceTests`, `CategoryServiceTests`.
- **Repository Tests:** `UserRepositoryTests`, `ItemRepositoryTests`, `ClaimRepositoryTests`, `NotificationRepositoryTests`.
- **Controller Integration Tests:** `HealthControllerTests`, `MatchControllerTests`, `ItemControllerTests`, `AdminControllerTests`.

---

## 📦 Production Builds

- **Backend Package Build:**
  ```powershell
  cd backend
  .\mvnw.cmd clean package -DskipTests
  ```
  *Generates executable JAR in `backend/target/findit-backend-0.0.1-SNAPSHOT.jar`.*

- **Frontend Production Build:**
  ```powershell
  cd frontend
  npm run build
  ```
  *Generates optimized production bundle in `frontend/dist/`.*
