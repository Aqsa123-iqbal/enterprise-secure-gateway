# Enterprise Secure Gateway

Multi-tenant secure API gateway with **Hybrid Authentication** (Local JWT + OAuth 2.0), **Refresh Token Rotation** via HttpOnly cookies, **Role-Based Access Control (RBAC)** and **OWASP hardening**.

> CSC337 - Advanced Web Technologies | Lab Assignment 05
> Author: Aqsa Iqbal

## Live Links

| | URL |
|---|---|
| Live App | `<your-live-url>` |
| Backend API Base | `<your-live-url>/api/v1` |
| GitHub Repo | https://github.com/Aqsa123-iqbal/enterprise-secure-gateway |

> Hosted on Render (free tier). The first request may take 30-50 seconds to wake the server.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Authentication Flow](#authentication-flow)
7. [API Endpoints](#api-endpoints)
8. [Test Credentials](#test-credentials)
9. [RBAC Matrix](#rbac-matrix)
10. [Security Measures](#security-measures)
11. [Screenshots and Test Evidence](#screenshots-and-test-evidence)

---

## Features

- **Local authentication** with Bcrypt hashing (salted). No plaintext password is ever stored.
- **Account lockout**: 5 failed login attempts locks the account for 15 minutes.
- **OAuth 2.0 social login** (`<Google / GitHub>`) using Passport.js. On success, the app issues its own tokens.
- **Access Token**: JWT, valid 15 minutes, sent in the `Authorization: Bearer <token>` header.
- **Refresh Token**: valid 7 days, stored only in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Refresh endpoint** with token rotation, and **revocation on logout**.
- **RBAC** with three roles: `SuperAdmin`, `Manager`, `Employee`.
- **OWASP hardening**: Helmet, strict CORS, rate limiting, NoSQL injection and XSS sanitization.

## Tech Stack

Node.js, Express.js, MongoDB Atlas, Mongoose, Passport.js, jsonwebtoken, bcrypt, Helmet, cors, express-rate-limit, express-mongo-sanitize, xss-clean, cookie-parser

## Project Structure

```
security-gateway/
├── src/            # routes, controllers, middleware, models
├── public/         # frontend pages
├── screenshots/    # test evidence used in this README
├── seed.js         # creates test users (SuperAdmin, Manager, Employee)
├── server.js       # app entry point
├── .env.example    # environment variable template
└── package.json
```

## Local Setup

```bash
git clone https://github.com/Aqsa123-iqbal/enterprise-secure-gateway.git
cd enterprise-secure-gateway
npm install
cp .env.example .env      # Windows CMD: copy .env.example .env
# fill the values in .env
node seed.js              # creates the test users
npm start
```

The server runs on `http://localhost:<PORT>`.

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values. **Never commit `.env`.**

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials |
| `CLIENT_URL` | Allowed frontend origin for CORS |

## Authentication Flow

1. User logs in (local credentials or OAuth).
2. Server returns a short-lived **Access Token** (15 min) in the response body.
3. Server sets a long-lived **Refresh Token** (7 days) in an HttpOnly cookie.
4. When the access token expires, the client calls `POST /api/v1/auth/refresh`. The server verifies the cookie, issues a new access token and rotates the refresh token.
5. On logout, the refresh token is revoked and the cookie is cleared.

## API Endpoints

Base path: `/api/v1`

| Method | Route | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public (needs refresh cookie) |
| POST | `/auth/logout` | Authenticated |
| GET | `/auth/google` | Public (starts OAuth) |
| GET | `/auth/google/callback` | Public (OAuth callback) |
| GET | `/employee/profile` | SuperAdmin, Manager, Employee |
| POST | `/admin/approve` | Manager, SuperAdmin |
| DELETE | `/users/:id` | SuperAdmin only |

## Test Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | `superadmin@test.com` | `Super@123` |
| Manager | `manager@test.com` | `Manager@123` |
| Employee | `employee@test.com` | `Employee@123` |

> These accounts are created by `seed.js` and exist in the deployed database as well.

## RBAC Matrix

| Action | SuperAdmin | Manager | Employee |
|---|---|---|---|
| View profile (`GET /employee/profile`) | Allowed | Allowed | Allowed |
| Approve (`POST /admin/approve`) | Allowed | Allowed | **403 Forbidden** |
| Delete user (`DELETE /users/:id`) | Allowed | **403 Forbidden** | **403 Forbidden** |

## Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | Bcrypt with salt, no plaintext storage |
| Brute force protection | Account lockout after 5 failed attempts (15 min) + rate limiting |
| Token security | Short-lived access token, rotating refresh token in HttpOnly + Secure + SameSite=Strict cookie |
| HTTP headers | Helmet |
| CORS | Strict origin whitelist |
| Injection protection | express-mongo-sanitize (NoSQL), xss-clean (XSS) |
| Secrets | Stored in environment variables, `.env` is git-ignored |

---

## Screenshots and Test Evidence

### 1. Google Cloud Console (OAuth Setup)

**OAuth consent screen / credentials configured**

![Google Cloud OAuth credentials](screenshots/google-cloud-credentials.png)

**Authorized redirect URIs (local and live)**

![Google Cloud redirect URIs](screenshots/google-cloud-redirect-uris.png)

> Client secret is hidden in all screenshots.

### 2. OAuth Login

![OAuth login page](screenshots/oauth-login.png)

![OAuth login success](screenshots/oauth-login-success.png)

### 3. Local Login and Tokens

![Login success in Postman](screenshots/login-success.png)

![Refresh token rotation](screenshots/refresh-token.png)

### 4. Account Lockout and Rate Limiting

![Account lockout after 5 failed attempts](screenshots/account-lockout.png)

![Rate limit response](screenshots/rate-limit.png)

### 5. RBAC Tests (Postman)

**Employee tries to delete a user: 403 Forbidden**

![Employee delete 403](screenshots/rbac-employee-delete-403.png)

**Manager tries to delete a user: 403 Forbidden**

![Manager delete 403](screenshots/rbac-manager-delete-403.png)

**Employee tries to approve: 403 Forbidden**

![Employee approve 403](screenshots/rbac-employee-approve-403.png)

**Manager approves: 200 OK**

![Manager approve 200](screenshots/rbac-manager-approve-200.png)

**SuperAdmin deletes a user: 200 OK**

![SuperAdmin delete 200](screenshots/rbac-superadmin-delete-200.png)

**Request without token: 401 Unauthorized**

![No token 401](screenshots/rbac-no-token-401.png)

### 6. Deployment

![Live deployment on Render](screenshots/deployment-render.png)

---

## Author

**Aqsa Iqbal** - CSC337 Lab 05
