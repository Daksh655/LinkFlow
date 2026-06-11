# LinkFlow Security & JWT Authentication Design

## 1. Security Goals
The LinkFlow application must adhere to industry-standard security practices to ensure data privacy and integrity. The core goals are:
- Securely authenticate users without retaining server-side state.
- Strictly authorize access to private resources (URLs and analytics).
- Prevent unauthorized access or modification of other users' data.
- Provide a robust, interview-ready architecture that demonstrates a deep understanding of modern web security.

---

## 2. Authentication Strategy: JWT (JSON Web Tokens)

### Why JWT over Session-Based Authentication?
- **Statelessness**: JWTs carry the authenticated user's identity within the token itself. The backend does not need to store active sessions in database tables or memory, greatly reducing server overhead.
- **Scalability**: Because the server is stateless, horizontal scaling is trivial. Any backend node can verify the JWT independently using a shared secret key.
- **Microservices Compatibility**: If LinkFlow ever splits into a frontend-backend-analytics microservice architecture, the JWT can be easily passed and validated across services without querying a central session store.
- **Cross-Domain Ready (CORS)**: Sessions rely on cookies which are tightly bound to domains. JWTs are usually sent via the `Authorization: Bearer <token>` header, bypassing strict cookie restrictions for single-page applications (SPAs).

---

## 3. User Authentication Flow

The complete lifecycle of authentication in LinkFlow:

1. **User Registration**: The user submits their email and password. The backend hashes the password using BCrypt and saves the user to the PostgreSQL database.
2. **User Login**: The user submits their email and raw password to `/api/auth/login`.
3. **Password Verification**: The backend retrieves the hashed password from the DB and verifies it against the raw input.
4. **JWT Generation**: Upon successful verification, the backend creates a JWT containing the user's ID, signs it with a secret key, and issues it.
5. **JWT Returned to Frontend**: The server returns the JWT in the JSON response payload.
6. **Frontend Stores Token**: The React frontend securely stores the token (e.g., in `localStorage`).
7. **Frontend Sends Token**: For every subsequent request to a protected route, the frontend attaches the token in the HTTP Header: `Authorization: Bearer <token>`.
8. **Backend Validates Token**: The Spring Boot backend intercepts the request, verifies the JWT signature, extracts the User ID, and places the user into the current security context.
9. **Access Granted/Denied**: If the token is valid, the request proceeds to the controller. If invalid or expired, a `401 Unauthorized` is returned.

---

## 4. Registration and Password Security

### Registration Validation
- **Email Uniqueness**: Must be enforced at the database level (`UNIQUE` constraint) and application level to prevent duplicate accounts.
- **Input Validation**: Passwords should enforce a minimum length (e.g., 8 characters) and complexity (numbers, mixed case) to prevent brute force attacks on weak passwords.

### BCrypt Password Hashing
- **Why no plain text?**: If the database is compromised, plain text passwords would allow attackers to steal user identities, often leading to credential stuffing attacks on other websites where users reused their passwords.
- **Why BCrypt?**: BCrypt is a cryptographic hash function specifically designed for passwords. It is computationally slow by design and incorporates a random "salt" for every hash. This defeats rainbow table attacks and slows down brute-force cracking.
- **Verification**: The backend never decrypts the hash. Instead, it hashes the incoming login password with the same salt and compares the two hashes.

---

## 5. JWT Token Design

### Token Payload (Claims)
The payload should contain only essential identity information. It must **never** contain sensitive data like passwords, because the payload is Base64 encoded and easily readable by anyone.
- **`sub` (Subject)**: The User ID (UUID).
- **`email`**: The user's email address.
- **`role`**: The user's role (e.g., `ROLE_USER`).
- **`exp` (ExpirationTime)**: When the token expires.
- **`iat` (IssuedAt)**: When the token was created.

### Security Tradeoffs & Expiration
JWTs cannot be easily revoked before they expire unless you build a "blacklist" (which defeats the purpose of statelessness). 
**Solution**: Use a short expiration time (e.g., 1 to 24 hours). If a token is stolen, the window of vulnerability is limited.

---

## 6. Protected vs. Public Endpoints

### Public Endpoints
No authentication required.
- `POST /api/auth/register`: Users must be able to sign up.
- `POST /api/auth/login`: Users must be able to authenticate.
- `GET /{shortCode}`: The core feature of the app; visitors must be able to click links without logging in.

### Protected Endpoints
Requires a valid JWT.
- `POST /api/urls`: To associate the created URL with an owner.
- `GET /api/urls`: To fetch the specific user's dashboard data.
- `DELETE /api/urls/{id}`: To prevent malicious deletion.
- `GET /api/analytics/{id}`: Private analytics.

---

## 7. Authorization Design (Ownership)

**Authentication** answers: *"Are you logged in?"* (401 Unauthorized)
**Authorization** answers: *"Are you allowed to touch this specific resource?"* (403 Forbidden)

### Ownership Rules
If User A creates URL A, User B must never be able to view, edit, or delete URL A.
- **Enforcement**: When User B requests `DELETE /api/urls/{id}`, the backend first extracts User B's ID from the JWT. It then fetches the URL from the database. If `url.userId != User B's ID`, the backend immediately throws a `403 Forbidden` exception.

---

## 8. Frontend Authentication Strategy

### Token Storage: `localStorage` vs. `sessionStorage`
- **`sessionStorage`**: Cleared when the tab closes. Highly secure against physical device access, but frustrating for users who want to stay logged in.
- **`localStorage`**: Persists across tabs and browser restarts. 
**Recommendation**: For a LinkFlow MVP, `localStorage` is the best choice. It provides a better User Experience (UX) by keeping the user logged in. 
*(Note: To defend against XSS attacks stealing localStorage tokens, React's built-in JSX escaping mitigates most XSS vectors, but developers must still avoid dangerously setting inner HTML).*

### Route Protection
React Router will use a `<ProtectedRoute>` wrapper. If the `AuthContext` does not contain a valid JWT, the wrapper redirects the user to the `/login` page immediately.

---

## 9. Error Handling

- **`401 Unauthorized`**: Returned when the JWT is missing, malformed, expired, or tampered with. It strictly means the user's identity is unknown.
- **`403 Forbidden`**: Returned when the JWT is perfectly valid (identity is known), but the user lacks the permission or ownership rights to perform the action.

---

## 10. Future Improvements

These features are **not needed now** for the MVP, but represent the evolution of the system:
- **Refresh Tokens**: When the short-lived JWT expires, a long-lived Refresh Token (stored in a secure HTTP-only cookie) is used to silently fetch a new JWT. This maximizes security and UX.
- **OAuth Login**: Allowing "Login with Google/GitHub" to reduce onboarding friction.
- **Role-Based Access Control (RBAC)**: Introducing a `ROLE_ADMIN` that can delete any URL across the platform to moderate abuse.

---

## 11. Interview Preparation

### Common Interview Questions
- *Q: Why use BCrypt instead of SHA-256?*
  A: SHA-256 is fast, making it vulnerable to brute-force attacks via modern GPUs. BCrypt uses a tunable "work factor" to intentionally slow down hashing, protecting against brute-force.
- *Q: How do you revoke a JWT if a user logs out?*
  A: Because JWTs are stateless, they can't natively be revoked. You either rely on short expiration times, or you must build a stateful token blacklist (e.g., in Redis) which somewhat defeats the stateless advantage.
- *Q: What is the difference between Authentication and Authorization?*
  A: Authentication validates identity (401). Authorization validates permissions (403).
- *Q: If I steal your JWT, can I see your password?*
  A: No. The payload only contains the User ID and Email. However, I can *impersonate* you until the token expires, which is why HTTPS is mandatory to prevent interception.
