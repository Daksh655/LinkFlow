# LinkFlow Database Design and Data Modeling

## 1. Overview and Design Rationale

LinkFlow is a production-style URL Shortener application utilizing PostgreSQL as the primary source of truth and Redis for caching and rate limiting. The database design emphasizes simplicity, data integrity, and future scalability while avoiding premature optimization.

### Tradeoff Discussion: PostgreSQL vs. Redis
- **PostgreSQL**: Chosen for persistent data storage because it guarantees ACID compliance, strict data integrity (via constraints and foreign keys), and powerful querying capabilities. Critical data like user accounts, relationships, and URL configurations belong here.
- **Redis**: An in-memory data store that excels at high-speed key-value lookups. It is ideal for caching the `short_code -> original_url` mapping to achieve sub-millisecond redirection times and for implementing rate-limiting. It should not replace PostgreSQL as the primary database because it lacks robust relational constraints and is vulnerable to data loss without complex persistence configurations.

---

## 2. Final Table Design and Field Definitions

To keep the architecture simple and aligned with the current requirements, we will start with exactly two tables: `users` and `urls`.

### Table: `users`
Purpose: Stores authentication credentials, authorization roles, and acts as the owner entity for created URLs.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (or BIGSERIAL) | Primary Key. UUID is recommended for distributed systems to prevent ID guessing. |
| `name` | VARCHAR(100) | Full name of the user. |
| `email` | VARCHAR(255) | User's email address, used for login. |
| `password` | VARCHAR(255) | Bcrypt hashed password. |
| `role` | VARCHAR(20) | e.g., 'ROLE_USER', 'ROLE_ADMIN'. |
| `created_at` | TIMESTAMP | Timestamp of account creation. |
| `updated_at` | TIMESTAMP | Timestamp of the last profile update. |

### Table: `urls`
Purpose: Stores the core URL shortening data, aliases, ownership, and basic analytics.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (or BIGSERIAL) | Primary Key. |
| `original_url` | TEXT | The destination URL. TEXT is used as URLs can exceed 255 characters. |
| `short_code` | VARCHAR(20) | The auto-generated short identifier (e.g., Base62 string). |
| `custom_alias` | VARCHAR(50) | Optional user-defined alias. |
| `click_count` | BIGINT | Running total of times the short link was accessed. |
| `last_accessed` | TIMESTAMP | Timestamp of the most recent redirection. |
| `created_at` | TIMESTAMP | Timestamp of link creation. |
| `user_id` | UUID (or BIGINT) | Foreign Key referencing `users(id)`. |

*Note: While `updated_at` is common, it's omitted here unless we plan to allow editing the `original_url` or `custom_alias` after creation.*

---

## 3. Relationships

**`users` (1) to `urls` (N)**
- **Cardinality**: One-to-Many. A single user can create multiple URLs. A URL belongs to exactly one user.
- **Ownership Rules**: The `user_id` in the `urls` table establishes ownership. Operations like updating or deleting a URL must verify that the requesting user's ID matches the `user_id` of the URL.
- **Data Integrity Requirements**: 
  - The `user_id` foreign key should be set up with `ON DELETE CASCADE` (if deleting a user should delete all their URLs) or `ON DELETE SET NULL` (if URLs should become anonymous, though less common for authenticated platforms). 

---

## 4. Constraints Design

### `users` Constraints
- `id`: NOT NULL, PRIMARY KEY.
- `name`: NOT NULL.
- `email`: NOT NULL, UNIQUE (Crucial for preventing duplicate accounts).
- `password`: NOT NULL.
- `role`: NOT NULL, default to 'ROLE_USER'.
- `created_at`: NOT NULL, default to `CURRENT_TIMESTAMP`.
- `updated_at`: NOT NULL, default to `CURRENT_TIMESTAMP`.

### `urls` Constraints
- `id`: NOT NULL, PRIMARY KEY.
- `original_url`: NOT NULL. Length unbounded (`TEXT`) or validated via application logic to prevent malicious payloads.
- `short_code`: NOT NULL, UNIQUE. Must be unique system-wide to ensure accurate redirection.
- `custom_alias`: NULLABLE, UNIQUE. Only unique if provided. Requires careful application logic to handle unique constraint violations gracefully.
- `click_count`: NOT NULL, default to 0.
- `last_accessed`: NULLABLE.
- `created_at`: NOT NULL, default to `CURRENT_TIMESTAMP`.
- `user_id`: NOT NULL, FOREIGN KEY referencing `users(id)`.

---

## 5. Indexing Strategy

Indexing is critical for read-heavy operations, which a URL shortener fundamentally is.

1. **`users(email)`**: 
   - *Why*: Authentication requires looking up users by email during every login attempt. A unique index speeds this up to O(log N).
2. **`urls(short_code)`**: 
   - *Why*: The primary redirection workflow involves looking up the original URL via the short code. This is an extremely read-heavy operation (though often fronted by Redis).
3. **`urls(custom_alias)`**: 
   - *Why*: Similar to `short_code`, custom aliases act as lookup keys for redirection.
4. **`urls(user_id)`**: 
   - *Why*: To populate the user Dashboard. Queries like `SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC` will rely heavily on this index.

---

## 6. Analytics Strategy & Scalability

### Current Implementation vs. Future Needs
Currently, `click_count` and `last_accessed` reside in the `urls` table.
- **Why it works now**: It avoids the complexity of JOINs and secondary tables. For an initial MVP, updating a counter in PostgreSQL (or deferring it via a Redis queue) is sufficient.
- **The Tradeoff**: Every redirection requires an `UPDATE` to the `urls` table. This causes row-level locking and MVCC (Multi-Version Concurrency Control) bloat in PostgreSQL, which scales poorly under high write-throughput.

### Future Evolution
If the system scales to millions of clicks per day, or if advanced analytics (e.g., referrer, browser, geolocation, timestamp of each click) are required:
1. **Separate Analytics Table**: Introduce a `click_events` table (e.g., `id`, `url_id`, `clicked_at`, `ip_hash`, `user_agent`). This converts `UPDATE` bottlenecks into faster, append-only `INSERT` operations.
2. **Data Aggregation**: Raw click events can be aggregated nightly into a `daily_url_stats` table to keep dashboard queries fast.

### Other Future Scalability Considerations
- **Expiring URLs**: Easily supported by adding an `expires_at` TIMESTAMP column to `urls`. Application logic or a cron job would handle enforcement.
- **Link Status**: Adding an `is_active` BOOLEAN column allows users to pause links without deleting them.
- **QR Codes**: No database change is needed; the frontend/backend can generate a QR code dynamically based on the short link.

---

## 7. Interview Perspective

1. **Why is this schema appropriate?**
   It strictly follows YAGNI (You Aren't Gonna Need It). It achieves the exact business requirements using a normalized structure without over-engineering complex analytics pipelines on day one.

2. **Common Interview Questions:**
   - *Q: How do you handle high read concurrency for redirections?*
     A: Redis caching. The `short_code -> original_url` mapping is loaded into Redis. PostgreSQL handles the durable writes.
   - *Q: How do you handle unique constraint collisions for the `short_code`?*
     A: Implementing a Base62 encoding on a unique numeric ID (like Twitter Snowflake or PostgreSQL sequences) guarantees uniqueness by design, avoiding trial-and-error database inserts.
   - *Q: Isn't updating `click_count` on every redirect going to cause database lag?*
     A: Yes, it causes lock contention. The tradeoff is simple implementation vs. scalability. For scale, we buffer clicks in Redis or Kafka and flush them to PostgreSQL in async batches.

3. **Tradeoffs Made:**
   - Appending analytics to the `urls` table trades write-performance for query simplicity and reduced storage overhead.
   - Using `VARCHAR(255)` for passwords assumes standard bcrypt/argon2 output.

4. **Evolution to Millions of URLs:**
   - If user growth explodes, we might shard the `urls` table by `user_id` (if dashboards are the bottleneck) or by a hash of the `short_code` (if writes/analytics are the bottleneck).
   - Read replicas will be added to PostgreSQL to handle dashboard queries, while Redis handles redirection reads.
