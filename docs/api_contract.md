# LinkFlow API Contract Design

## 1. Overview
This document defines the complete RESTful API contract for the LinkFlow URL Shortener platform. It outlines the request/response structures, error handling, status code conventions, and security rules. 

---

## 2. Standard Response Design

### Success Response Design
**Approach**: We will use **Wrapped JSON Responses** for consistency. 
**Rationale**: While returning raw JSON arrays or objects is simpler, wrapping responses in a standard structure (e.g., `{"data": ...}`) provides uniformity. It ensures the frontend always knows where to look for the payload, and it provides a safe place to inject metadata (like pagination details) without altering the shape of the domain object.

**Format**:
```json
{
  "success": true,
  "data": { ... } 
  // "meta": { ... } (optional for pagination)
}
```

### Error Response Design
Errors must have a consistent shape so the frontend can predictably parse them, map them to UI alerts, or highlight specific form fields.

**Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": {
      "email": "Email must be a valid format"
    }
  }
}
```
**Common Error Codes**: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `DUPLICATE_ALIAS`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_SERVER_ERROR`.

---

## 3. Status Code Strategy

We adhere strictly to HTTP semantics:
- **`200 OK`**: Successful GET, PUT, or POST (if not creating).
- **`201 Created`**: Successful POST resulting in a new resource (e.g., Register, Create URL).
- **`204 No Content`**: Successful DELETE (the resource is gone, no body needed).
- **`400 Bad Request`**: Validation errors, malformed JSON, or missing required fields.
- **`401 Unauthorized`**: Missing or invalid JWT token.
- **`403 Forbidden`**: Valid JWT, but the user does not own the requested resource.
- **`404 Not Found`**: The resource (e.g., short code or URL ID) does not exist.
- **`409 Conflict`**: Attempting to use a `custom_alias` or `email` that is already taken.
- **`429 Too Many Requests`**: Rate limiting triggered (useful for public redirects or aggressive creation).
- **`500 Internal Server Error`**: Unhandled backend exceptions.

---

## 4. Endpoints

### 4.1. AUTH MODULE

#### Register User
- **Endpoint**: `POST /api/auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com" }
  }
  ```
- **Error Responses**: `400 Bad Request` (Validation), `409 Conflict` (Email exists).

#### Login User
- **Endpoint**: `POST /api/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1...",
      "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" }
    }
  }
  ```
- **Error Responses**: `401 Unauthorized` (Invalid credentials), `400 Bad Request`.

---

### 4.2. URL MODULE

#### Create Short URL
- **Endpoint**: `POST /api/urls`
- **Auth**: Protected (JWT required)
- **Request Body**:
  ```json
  {
    "originalUrl": "https://www.example.com/very/long/path",
    "customAlias": "my-custom-link" // optional
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "originalUrl": "https://www.example.com/very/long/path",
      "shortCode": "my-custom-link",
      "createdAt": "2026-06-11T12:00:00Z"
    }
  }
  ```
- **Error Responses**: `400 Bad Request` (Invalid URL format), `409 Conflict` (Custom alias already in use), `401 Unauthorized`.

#### Get User URLs
- **Endpoint**: `GET /api/urls`
- **Auth**: Protected (JWT required)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "originalUrl": "https://example.com",
        "shortCode": "abc12",
        "clickCount": 14,
        "createdAt": "2026-06-11T12:00:00Z"
      }
    ],
    "meta": { "page": 1, "size": 20, "total": 1 }
  }
  ```
- **Notes**: Returns *only* the URLs owned by the authenticated user. Uses pagination (`?page=1&size=20`).

#### Delete URL
- **Endpoint**: `DELETE /api/urls/{id}`
- **Auth**: Protected (JWT required)
- **Success Response (`204 No Content`)**: No body.
- **Error Responses**: `401 Unauthorized` (No JWT), `403 Forbidden` (URL belongs to a different user), `404 Not Found`.

---

### 4.3. REDIRECT MODULE

#### Redirect to Original URL
- **Endpoint**: `GET /{shortCode}`
- **Auth**: Public
- **Action**: Backend queries DB/Redis for `shortCode`. If found, returns a `302 Found` or `301 Moved Permanently` redirect header containing the `originalUrl`.
- **Error Responses**: `404 Not Found` (Custom 404 HTML page or JSON depending on Accept header), `429 Too Many Requests`.

---

### 4.4. ANALYTICS MODULE

#### Get URL Analytics
- **Endpoint**: `GET /api/analytics/{urlId}`
- **Auth**: Protected (JWT required)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "urlId": "uuid",
      "clickCount": 150,
      "createdAt": "2026-06-01T12:00:00Z",
      "lastAccessed": "2026-06-11T10:30:00Z"
    }
  }
  ```
- **Error Responses**: `403 Forbidden` (User does not own this URL), `404 Not Found`.

---

## 5. Security Considerations

- **Public vs Protected**: Redirection (`/{shortCode}`) and Auth (`/api/auth/*`) are public. Everything else requires an Authorization header: `Bearer <token>`.
- **Ownership Validation**: Simply passing a valid JWT is not enough. The backend must explicitly verify that the `{id}` parameter in `/api/urls/{id}` or `/api/analytics/{urlId}` corresponds to a row where `user_id` matches the ID inside the decoded JWT. If it doesn't match, return `403 Forbidden` (not 404, though 404 is sometimes used to obfuscate existence; 403 is more precise).
- **Statelessness**: The backend will not use sessions. The JWT entirely encapsulates the authenticated state.

---

## 6. Frontend Integration

1. **Authentication Flow**: 
   - Frontend calls `POST /api/auth/login`.
   - Saves the returned JWT in `localStorage` or memory using `token.js`.
   - Saves the user object in `AuthContext`.
   - The `api.js` Axios interceptor attaches `Authorization: Bearer <token>` to all subsequent requests.
2. **URL Management Flow**:
   - `DashboardPage` calls `GET /api/urls` on mount and stores data in state.
   - Submitting `UrlForm` triggers `POST /api/urls`, and on `201 Created`, the frontend appends the new URL to the table state.
   - Deleting triggers `DELETE /api/urls/{id}`. On `204`, the frontend filters the row out of the state without refreshing.
3. **Analytics Flow**:
   - Clicking an "Analytics" button on `UrlRow` opens `AnalyticsModal`, which fires `GET /api/analytics/{urlId}` and displays the resulting data.

---

## 7. Interview Discussion

1. **Why does this follow REST principles?**
   - It utilizes noun-based resource paths (`/api/urls`, `/api/auth`).
   - It leverages standard HTTP methods (`GET` for reading, `POST` for creating, `DELETE` for removing) matching CRUD operations.
   - It relies on standard HTTP status codes rather than returning `200 OK` with an `"error"` field.
2. **Common Interview Questions:**
   - *Q: Why use `302 Found` instead of `301 Moved Permanently` for redirects?* 
     A: `301` tells the browser to cache the redirect forever. This breaks analytics (the server won't see subsequent clicks from that user). `302` forces the browser to hit our server every time.
   - *Q: How do you handle pagination on the frontend and backend?* 
     A: We use `page` and `size` query params, returning a `meta` block with total records to render a pagination UI.
3. **Tradeoffs:**
   - *Wrapped Responses*: Adds a tiny bit of payload size overhead but vastly simplifies frontend generic error handling and meta-data injection.
   - *Analytics Endpoint*: Keeping `/api/analytics` separate from `/api/urls` ensures the main URL list query stays fast, but requires an extra network request when opening the modal.
4. **Future Improvements:**
   - Add bulk delete (`DELETE /api/urls`).
   - Add an endpoint for more detailed time-series analytics (e.g., `GET /api/analytics/{urlId}/timeseries`).
