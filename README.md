# LinkFlow

## Project Summary

A production-inspired URL shortening platform built with Spring Boot, React, PostgreSQL, Redis, and JWT Authentication.

The system supports custom aliases, click analytics, Redis-based caching, and rate limiting to demonstrate scalable backend architecture concepts commonly used in modern web applications.

<div align="center">

### Full Stack URL Shortener Platform

Create, manage, and track shortened URLs with authentication, analytics, Redis caching, and rate limiting.

---

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge\&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green?style=for-the-badge\&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge\&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge\&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-red?style=for-the-badge\&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerization-blue?style=for-the-badge\&logo=docker)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge\&logo=jsonwebtokens)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automation-blue?style=for-the-badge\&logo=githubactions)

</div>

---

# Live Demo

### Frontend

https://linkflow-frontend.onrender.com

### Backend

https://linkflow-s98a.onrender.com

---

# Overview

LinkFlow is a full-stack URL shortening platform that allows users to create, manage, and track shortened links.

The platform implements modern backend engineering concepts including:

* JWT Authentication
* Redis Caching
* Rate Limiting
* REST API Development
* PostgreSQL Database Design
* Docker Containerization
* Cloud Deployment

The project was built to simulate real-world scalable backend systems while following industry-standard development practices.

---

# Key Engineering Highlights

* JWT-based Authentication & Authorization
* Redis Cache-Aside Pattern
* Redis-backed Rate Limiting
* PostgreSQL Relational Database Design
* RESTful API Architecture
* Dockerized Application
* Cloud Deployment
* Scalable URL Redirect Workflow

---

# Key Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Protected APIs
* BCrypt Password Encryption

---

## URL Management

* Create Short URLs
* Custom URL Aliases
* Delete URLs
* User-specific URL Dashboard

---

## Redirect System

* Fast URL Redirects
* Short Code Resolution
* Optimized Lookup Flow

---

## Redis Caching

* Cache-Aside Pattern
* Faster Redirect Performance
* Reduced Database Load

# Why Redis?

Redis is used to reduce database lookups during URL redirects and improve overall response time.

```text
Short URL Request
        │
        ▼
    Redis Cache
        │
 ┌──────┴──────┐
 │             │
 ▼             ▼

Cache Hit   Cache Miss
    │            │
    ▼            ▼
 Redirect   PostgreSQL Lookup
                 │
                 ▼
          Store in Redis
                 │
                 ▼
              Redirect

```

Benefits:

* Faster redirect performance
* Reduced PostgreSQL load
* Better scalability under high traffic
* Improved user experience through lower latency

---

## Analytics

* Click Count Tracking
* Last Accessed Tracking

---

## Rate Limiting

* Maximum 100 URL creations per user per hour
* Redis-backed Rate Limiting

---

## Security

* JWT Authentication
* BCrypt Password Hashing
* Input Validation
* Protected Routes
* Secure API Access

---

# System Architecture

```text
                ┌──────────────┐
                │     User     │
                └──────┬───────┘
                       │
                       ▼
            ┌─────────────────────┐
            │   React Frontend    │
            └─────────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │ Spring Boot Backend │
            └─────────┬───────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
 ┌───────────────┐       ┌────────────────┐
 │ Redis Cache   │       │ PostgreSQL DB  │
 └───────────────┘       └────────────────┘
```

---

# Project Screenshots

## Dashboard

<img width="100%" alt="Dashboard Screenshot" src="https://github.com/user-attachments/assets/76bd1590-14e2-4711-914c-31544a45658b" />


---

## Create URL

<img src="./docs/create-url.png" alt="Create URL Screenshot" width="100%"/>
<img width="100%" alt="Create URL Screenshot" src="https://github.com/user-attachments/assets/238c4fb4-3c08-4545-9a5b-58d0dd6ddd12" />


---

## Analytics

<img width="100%" alt="Analytics Screenshot" src="https://github.com/user-attachments/assets/bf7a3c6f-7c1c-457d-9f76-b3a6fe3197ed" />


---

## Authentication

<img width="100%"  alt="Authentication Screenshot" src="https://github.com/user-attachments/assets/8db4e8cc-38da-40a8-82b1-051e42d4a9c8" />


---

# Database Design

## users

| Column     | Type      |
| ---------- | --------- |
| id         | BIGINT    |
| name       | VARCHAR   |
| email      | VARCHAR   |
| password   | VARCHAR   |
| role       | VARCHAR   |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## urls

| Column        | Type      |
| ------------- | --------- |
| id            | BIGINT    |
| original_url  | TEXT      |
| short_code    | VARCHAR   |
| custom_alias  | VARCHAR   |
| click_count   | BIGINT    |
| last_accessed | TIMESTAMP |
| created_at    | TIMESTAMP |
| user_id       | BIGINT    |

---

### Relationship

```text
User (1)
   |
   |
   ▼
URLs (Many)
```

One user can own multiple shortened URLs.

---

# API Endpoints

## Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |

---

## URLs

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /api/urls      |
| GET    | /api/urls      |
| DELETE | /api/urls/{id} |

---

## Analytics

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/analytics/{urlId} |

---

## Redirect

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /{shortCode} |

---

# Folder Structure

```text
LinkFlow
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   ├── pom.xml
│   └── Dockerfile
│
├── docs
│   ├── dashboard.png
│   ├── create-url.png
│   ├── analytics.png
│   └── auth.png
│
├── .github
│
└── README.md
```

---

#  Local Setup

## Backend Setup

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Docker Setup

```bash
docker-compose up --build
```

---

#  Deployment Workflow

```text
Developer Pushes Code
          │
          ▼
     GitHub Repository
          │
          ▼
     GitHub Actions
          │
          ▼
        Build
          │
          ▼
       Deploy
          │
          ▼
     Production
```

---

#  Redis Caching Flow

```text
Request
   │
   ▼
Redis Cache
   │
   ├── Cache Hit
   │       │
   │       ▼
   │    Redirect
   │
   ▼
Cache Miss
   │
   ▼
PostgreSQL
   │
   ▼
Store In Redis
   │
   ▼
Redirect
```

---

#  Security Features

### JWT Authentication

* Secure token-based authentication
* Stateless sessions

### BCrypt Password Encryption

* Password hashing before storage

### Protected Routes

* Authenticated access to APIs

### Input Validation

* Request validation using Spring Validation

### Rate Limiting

* Prevents abuse and excessive API usage

---

#  Learning Outcomes

Through this project, I gained hands-on experience with:

* Spring Boot Development
* REST API Design
* JWT Authentication
* Spring Security
* Redis Caching
* PostgreSQL Database Design
* Docker Containerization
* Cloud Deployment
* System Design Fundamentals
* Full Stack Development

---

#  Future Enhancements

* QR Code Generation
* URL Expiration Support
* Custom Domains
* Advanced Analytics Dashboard
* Team Collaboration Features
* User Activity Reports
* Link Sharing Insights

---

#  Author

### [GitHub]([url](https://github.com/Daksh655))

https://github.com/Daksh655

### LinkedIn

https://linkedin.com/in/YOUR_LINKEDIN](https://www.linkedin.com/in/daksh-tiwari-723964361

### Email

daskh.tiwari655@gmail.com

---
