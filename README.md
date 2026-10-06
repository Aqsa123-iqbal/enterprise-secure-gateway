# Enterprise Secure Gateway

Multi-tenant secure API gateway with **Hybrid Authentication** (Local JWT + Google OAuth 2.0), **Refresh Token Rotation** via HttpOnly cookies, **Role-Based Access Control (RBAC)**, account lockout, rate limiting, and **OWASP security hardening**.

> **CSC337 - Advanced Web Technologies | Lab Assignment 05**
> **Author:** Aqsa Iqbal

---

## Live Links

|                      | URL                                                        |
| -------------------- | ---------------------------------------------------------- |
| **Live App**         | https://enterprise-secure-gateway.bonto.run                |
| **Backend API Base** | https://enterprise-secure-gateway.bonto.run/api/v1         |
| **GitHub Repo**      | https://github.com/Aqsa123-iqbal/enterprise-secure-gateway |

> **Hosting:** Bonto

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

* **Local authentication** with bcrypt password hashing and salted passwords.
* **Account lockout** after 5 failed login attempts for 15 minutes.
* **Login rate limiting** to reduce brute-force attacks.
* **Google OAuth 2.0** using Passport.js.
* **JWT Access Token** valid for 15 minutes.
* **Refresh Token** valid for 7 days.
* Refresh tokens are stored in **HttpOnly cookies**.
* **Refresh-token rotation** on every refresh request.
* **Refresh-token reuse detection** for suspicious token reuse.
* **Refresh-token revocation** on logout.
* **Role-Based Access Control (RBAC)** with three roles:

  * SuperAdmin
  * Manager
  * Employee
* **Helmet** for security-related HTTP headers.
* **Strict CORS** configuration.
* **NoSQL injection protection** using `express-mongo-sanitize`.
* **XSS protection** using `xss-clean`.
* Environment-based configuration using `.env`.
* MongoDB Atlas database integration.
* Deployed production application on Bonto.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB Atlas**
* **Mongoose**
* **Passport.js**
* **Google OAuth 2.0**
* **jsonwebtoken**
* **bcryptjs**
* **Helmet**
* **cors**
* **express-rate-limit**
* **express-mongo-sanitize**
* **xss-clean**
* **cookie-parser**

---

## Project Structure

```text
enterprise-secure-gateway/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── public/
│   ├── index.html
│   └── app.js
│
├── screenshots/
│
├── seed.js
├── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Important Files

**`server.js`**

Application entry point. It loads environment variables, connects to MongoDB, and starts the Express server.

**`src/app.js`**

Configures Express, security middleware, CORS, cookies, Passport, frontend serving, and API routes.

**`src/controllers/auth.controller.js`**

Handles registration, login, refresh-token rotation, logout, and OAuth callback.

**`src/middleware/auth.js`**

Verifies JWT access tokens for protected routes.

**`src/middleware/checkRole.js`**

Implements role-based authorization.

**`src/utils/tokens.js`**

Generates access and refresh tokens and hashes refresh tokens before database storage.

**`seed.js`**

Creates the SuperAdmin, Manager, and Employee test accounts.

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Aqsa123-iqbal/enterprise-secure-gateway.git
```

Go into the project directory:

```bash
cd enterprise-secure-gateway
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

For Windows CMD:

```cmd
copy .env.example .env
```

Fill in the required values inside `.env`.

Create the test users:

```bash
node seed.js
```

Start the application:

```bash
npm start
```

The server runs on:

```text
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file using `.env.example`.

**Never commit `.env` to GitHub.**

| Variable               | Description                                  |
| ---------------------- | -------------------------------------------- |
| `PORT`                 | Server port                                  |
| `NODE_ENV`             | `development` or `production`                |
| `MONGO_URI`            | MongoDB Atlas connection string              |
| `ACCESS_TOKEN_SECRET`  | Secret used to sign access tokens            |
| `REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens           |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                   |
| `CLIENT_URL`           | Allowed frontend origin                      |
| `BASE_URL`             | Application base URL used for OAuth callback |

### Production URLs

```text
CLIENT_URL=https://enterprise-secure-gateway.bonto.run
BASE_URL=https://enterprise-secure-gateway.bonto.run
```

---

## Authentication Flow

### Local Login

```text
User
  ↓
Email + Password
  ↓
Login Route
  ↓
Login Controller
  ↓
Find User in MongoDB
  ↓
bcrypt Password Verification
  ↓
Generate Access Token
  ↓
Generate Refresh Token
  ↓
Store Refresh Token Hash
  ↓
Set HttpOnly Refresh Cookie
  ↓
Return Access Token
```

### Access Token

The access token is a JWT valid for **15 minutes**.

It is sent in the request header:

```text
Authorization: Bearer <access-token>
```

### Refresh Token

The refresh token is valid for **7 days** and is stored in an **HttpOnly cookie**.

When the access token expires:

```text
Client
  ↓
POST /api/v1/auth/refresh
  ↓
Verify Refresh Token
  ↓
Check Stored Token Hash
  ↓
Delete Old Refresh Token
  ↓
Generate New Refresh Token
  ↓
Store New Token Hash
  ↓
Return New Access Token
```

This process is called **Refresh Token Rotation**.

### Token Reuse Detection

If an old refresh token is used again after rotation, its hash will no longer exist in the database.

The server detects this as possible token reuse, invalidates the user's stored refresh tokens, clears the cookie, and requires the user to log in again.

---

## Google OAuth 2.0

Google login is implemented using **Passport.js** and the Google OAuth 2.0 strategy.

### Flow

```text
User
  ↓
Google Login
  ↓
Google Authentication
  ↓
OAuth Callback
  ↓
Passport Google Strategy
  ↓
Find or Create User
  ↓
Issue Application Tokens
  ↓
Redirect to Application
```

### Google Callback URL

For the deployed application:

```text
https://enterprise-secure-gateway.bonto.run/api/v1/auth/google/callback
```

This URL must be registered in Google Cloud Console as an **Authorized redirect URI**.

---

## API Endpoints

### Base URL

```text
https://enterprise-secure-gateway.bonto.run/api/v1
```

| Method | Route                   | Access                  |
| ------ | ----------------------- | ----------------------- |
| POST   | `/auth/register`        | Public                  |
| POST   | `/auth/login`           | Public                  |
| POST   | `/auth/refresh`         | Public + Refresh Cookie |
| POST   | `/auth/logout`          | Public + Refresh Cookie |
| GET    | `/auth/google`          | Public                  |
| GET    | `/auth/google/callback` | OAuth Callback          |
| GET    | `/employee/profile`     | Authenticated Users     |
| POST   | `/payroll/approve`      | Manager, SuperAdmin     |
| DELETE | `/users/:id`            | SuperAdmin              |

### Live API URLs

**Login**

```text
POST https://enterprise-secure-gateway.bonto.run/api/v1/auth/login
```

**Register**

```text
POST https://enterprise-secure-gateway.bonto.run/api/v1/auth/register
```

**Refresh**

```text
POST https://enterprise-secure-gateway.bonto.run/api/v1/auth/refresh
```

**Logout**

```text
POST https://enterprise-secure-gateway.bonto.run/api/v1/auth/logout
```

**Google Login**

```text
GET https://enterprise-secure-gateway.bonto.run/api/v1/auth/google
```

**Profile**

```text
GET https://enterprise-secure-gateway.bonto.run/api/v1/employee/profile
```

**Payroll Approval**

```text
POST https://enterprise-secure-gateway.bonto.run/api/v1/payroll/approve
```

---

## Test Credentials

The `seed.js` script creates three test users:

| Role       | Email                    | Password         |
| ---------- | ------------------------ | ---------------- |
| SuperAdmin | `superadmin@gateway.com` | `SuperAdmin@123` |
| Manager    | `manager@gateway.com`    | `Manager@123`    |
| Employee   | `employee@gateway.com`   | `Employee@123`   |

> These credentials are intended for testing the assignment. They should not be used as production credentials.

---

## RBAC Matrix

| Action          | SuperAdmin | Manager             | Employee            |
| --------------- | ---------- | ------------------- | ------------------- |
| View Profile    | ✅ Allowed  | ✅ Allowed           | ✅ Allowed           |
| Approve Payroll | ✅ Allowed  | ✅ Allowed           | ❌ **403 Forbidden** |
| Delete User     | ✅ Allowed  | ❌ **403 Forbidden** | ❌ **403 Forbidden** |

### RBAC Example

For payroll approval, the route allows:

```js
checkRole(['Manager', 'SuperAdmin'])
```

Therefore:

```text
Employee    → 403 Forbidden
Manager     → 200 OK
SuperAdmin  → 200 OK
```

---

## Security Measures

| Security Measure       | Implementation                        |
| ---------------------- | ------------------------------------- |
| Password Protection    | bcrypt password hashing               |
| Brute-Force Protection | Account lockout + login rate limiting |
| Account Lockout        | 5 failed attempts → 15-minute lock    |
| Access Token           | JWT, 15-minute lifetime               |
| Refresh Token          | 7-day lifetime                        |
| Refresh Security       | Rotation + reuse detection            |
| Cookie Security        | HttpOnly + Secure + SameSite          |
| HTTP Security          | Helmet                                |
| CORS                   | Restricted frontend origin            |
| NoSQL Injection        | `express-mongo-sanitize`              |
| XSS Protection         | `xss-clean`                           |
| Secret Management      | Environment variables                 |
| Database               | MongoDB Atlas                         |
| OAuth                  | Google OAuth 2.0                      |
| Production Transport   | HTTPS                                 |

---

## Authentication vs Authorization

**Authentication** answers:

> Who are you?

Example:

```text
Email + Password
Google Login
JWT Verification
```

**Authorization** answers:

> What are you allowed to do?

Example:

```text
Employee → Cannot approve payroll
Manager → Can approve payroll
SuperAdmin → Can approve payroll
```

---

## HTTP Status Codes Used

| Status | Meaning      | Example                             |
| ------ | ------------ | ----------------------------------- |
| `200`  | Success      | Successful login / payroll approval |
| `201`  | Created      | Successful registration             |
| `400`  | Bad Request  | Invalid input                       |
| `401`  | Unauthorized | Missing or invalid authentication   |
| `403`  | Forbidden    | Authenticated user lacks permission |
| `409`  | Conflict     | Email already registered            |
| `423`  | Locked       | Account temporarily locked          |

### 401 vs 403

**401 Unauthorized**

The user is not properly authenticated.

**403 Forbidden**

The user is authenticated but does not have permission.

Example:

```text
Employee + valid JWT + payroll request
                    ↓
                  403
```

---

## Screenshots and Test Evidence

### 1. Google Cloud Console

OAuth credentials and authorized redirect URI configuration.

```text
screenshots/google-cloud-credentials.png
screenshots/google-cloud-redirect-uris.png
```

> Client secrets are hidden in screenshots.

### 2. OAuth Login

```text
screenshots/oauth-login.png
screenshots/oauth-login-success.png
```

### 3. Local Login and Tokens

```text
screenshots/login-success.png
screenshots/refresh-token.png
```

### 4. Account Lockout and Rate Limiting

```text
screenshots/account-lockout.png
screenshots/rate-limit.png
```

### 5. RBAC Tests

Employee attempts payroll approval:

```text
screenshots/rbac-employee-approve-403.png
```

Manager successfully approves payroll:

```text
screenshots/rbac-manager-approve-200.png
```

Employee attempts user deletion:

```text
screenshots/rbac-employee-delete-403.png
```

Manager attempts user deletion:

```text
screenshots/rbac-manager-delete-403.png
```

SuperAdmin successfully deletes a user:

```text
screenshots/rbac-superadmin-delete-200.png
```

Request without authentication:

```text
screenshots/rbac-no-token-401.png
```

### 6. Deployment

```text
screenshots/deployment-bonto.png
```

---

## Author

**Aqsa Iqbal**
CSC337 - Advanced Web Technologies
Lab Assignment 05
