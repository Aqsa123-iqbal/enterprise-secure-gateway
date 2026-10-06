# Enterprise Secure Gateway

Multi-Tenant Secure Gateway with Hybrid Authentication (Local JWT + OAuth 2.0), Token Rotation using HttpOnly cookies, Role-Based Access Control (RBAC) and OWASP hardening.

**CSC337 - Advanced Web Technologies | Lab Assignment 05**

## Live Links
- Live App: <your-live-url>
- Backend API: <your-live-url>/api/v1
- GitHub: https://github.com/Aqsa123-iqbal/enterprise-secure-gateway

## Features
- Local authentication with password hashing (Bcrypt), no plaintext passwords stored
- Account lockout: 5 failed attempts = 15 minute lock
- OAuth 2.0 social login (<Google / GitHub>) using Passport.js
- JWT Access Token (15 minutes, sent via Authorization: Bearer header)
- Refresh Token (7 days, HttpOnly + Secure + SameSite=Strict cookie)
- Refresh token rotation and revocation on logout
- RBAC with 3 roles: SuperAdmin, Manager, Employee
- Security hardening: Helmet, strict CORS, rate limiting, input sanitization (NoSQL injection and XSS)

## Tech Stack
Node.js, Express.js, MongoDB (Atlas), Mongoose, Passport.js, JWT, Bcrypt, Helmet, express-rate-limit, express-mongo-sanitize, xss-clean

## Local Setup
```bash
git clone https://github.com/Aqsa123-iqbal/enterprise-secure-gateway.git
cd enterprise-secure-gateway
npm install
cp .env.example .env
npm run seed    # creates test users (if seed script exists)
npm start
```

## Environment Variables
Create a `.env` file (see `.env.example`):

| Variable | Description |
|---|---|
| PORT | Server port |
| MONGO_URI | MongoDB connection string |
| JWT_ACCESS_SECRET | Secret for access tokens |
| JWT_REFRESH_SECRET | Secret for refresh tokens |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Google OAuth credentials |
| GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET | GitHub OAuth credentials |
| CLIENT_URL | Allowed frontend origin (CORS) |
| NODE_ENV | development / production |

## API Endpoints
| Method | Route | Access |
|---|---|---|
| POST | /api/v1/auth/login | Public |
| POST | /api/v1/auth/refresh | Public (needs refresh cookie) |
| POST | /api/v1/auth/logout | Authenticated |
| GET | /api/v1/auth/google | Public (OAuth) |
| GET | /api/v1/employee/profile | SuperAdmin, Manager, Employee |
| POST | /api/v1/admin/approve | Manager, SuperAdmin |
| DELETE | /api/v1/users/:id | SuperAdmin only |

## Test Credentials
| Role | Email | Password |
|---|---|---|
| SuperAdmin | superadmin@test.com | Super@123 |
| Manager | manager@test.com | Manager@123 |
| Employee | employee@test.com | Employee@123 |

## RBAC Matrix
| Action | SuperAdmin | Manager | Employee |
|---|---|---|---|
| View profile | Yes | Yes | Yes |
| Approve | Yes | Yes | No (403) |
| Delete user | Yes | No (403) | No (403) |

## Security Measures
- Passwords hashed with Bcrypt (salted)
- HttpOnly, Secure, SameSite=Strict refresh cookie
- Rate limiting on auth routes
- Helmet security headers and strict CORS policy
- Sanitization against NoSQL injection and XSS

## Author
Aqsa Iqbal
