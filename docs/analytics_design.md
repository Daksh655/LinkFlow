# LinkFlow Analytics Design

## 1. Objective & Business Requirements
The analytics system provides users with actionable insights into the performance of their shortened URLs. 
**Current Requirements**: Track `click_count`, `created_at`, and `last_accessed_at`.
**Business Questions Answered**: 
- How many times was my URL opened?
- When was the URL created?
- When was it last accessed?

---

## 2. Analytics Storage Design

**Option A: Inside the `urls` table**
- Add `click_count` (BIGINT) and `last_accessed` (TIMESTAMP) directly to the URL entity.

**Option B: Separate `analytics` table**
- A 1:1 table storing counts, OR a 1:N `click_events` table storing individual timestamped clicks.

**Recommendation**: **Option A**. 
For this fresher-level MVP, storing the analytics directly inside the `urls` table is the best approach. It is simple, requires zero `JOIN` operations to load the dashboard, and satisfies all current business requirements perfectly without over-engineering.

---

## 3. Click Tracking Flow

1. **Visitor opens short URL**: `GET /{shortCode}`
2. **Redirect request received**: Backend verifies rate limits and fetches the original URL from Redis or PostgreSQL.
3. **Analytics updated**: The backend dispatches an instruction to increment the click count and update the timestamp.
4. **Redirect executed**: The backend returns the `302 Found` response to the visitor's browser.

---

## 4. Redirect Performance Consideration

When should the analytics update occur?
1. *Before Redirect*: Slows down the redirect. The user stares at a blank screen while the database updates.
2. *After Redirect (Synchronous)*: Blocked until completion; keeps the HTTP thread alive unnecessarily.
3. **Asynchronously (Recommended)**: The backend immediately returns the `302 Found` response to the user, and simultaneously fires a background thread (e.g., using Spring's `@Async`) to update the database.

**Tradeoffs**: Asynchronous updates mean if the server crashes exactly between returning the redirect and writing to the database, a click is lost. For a simple URL shortener, dropping a single click is an acceptable tradeoff for lightning-fast user redirection.

---

## 5. Click Counter & Last Accessed Design

**Click Counter (`click_count`)**:
- Must be updated using atomic database queries (e.g., `UPDATE urls SET click_count = click_count + 1 WHERE id = ?`). 
- Do *not* fetch the URL, increment the count in Java, and save it back; this creates race conditions where simultaneous clicks overwrite each other.

**Last Accessed (`last_accessed`)**:
- Updated simultaneously with the click counter: `last_accessed = CURRENT_TIMESTAMP`.
- *Benefits*: Helps administrators identify "dead" links that haven't been clicked in years, allowing for safe database cleanup/purging to save storage.

---

## 6. Analytics API Design

**Endpoint**: `GET /api/analytics/{urlId}`
The backend will return a concise JSON structure directly fulfilling the dashboard UI requirements.

```json
{
  "success": true,
  "data": {
    "urlId": "uuid",
    "clickCount": 1542,
    "createdAt": "2026-06-01T12:00:00Z",
    "lastAccessed": "2026-06-11T13:15:00Z"
  }
}
```

---

## 7. Future Analytics Expansion

If the business later requests tracking for **Daily Clicks, Country, Device, Browser, or Referrer**, Option A will no longer suffice. 
- **Evolution**: We would create a `click_events` table: `(id, url_id, ip_address, user_agent, referrer, clicked_at)`. 
- **Can the current design support this?** No. The current design aggregates data into a single counter. However, it serves as a solid foundation. Future expansions simply require migrating from an `UPDATE` counter strategy to an `INSERT` event strategy.

---

## 8. Database Impact

**Write Frequency**: Extremely high. A viral URL might receive 1,000 clicks per second.
**Read Frequency**: Low to Moderate (only when users view their dashboard).
**Bottleneck**: PostgreSQL uses MVCC (Multi-Version Concurrency Control). Every time you run `UPDATE urls SET click_count = click_count + 1`, PostgreSQL creates a completely new row version and marks the old one as "dead". For highly viral links, this causes massive database bloat and requires aggressive `VACUUM` processes to clean up.

---

## 9. Redis and Analytics

Could we use Redis for analytics?
- **Click Counters**: Redis `INCR` is perfect for fast, atomic counting.
- **Aggregation**: We could buffer clicks in Redis and run a cron job every minute to flush the total sum to PostgreSQL (e.g., "Add 500 clicks to URL A").
- **Recommendation**: To keep the architecture beginner-friendly and minimize moving parts, we will **not** use Redis for analytics buffering right now. We will use direct asynchronous PostgreSQL updates. However, it is vital to mention this Redis buffering strategy in technical interviews.

---

## 10. Scalability Discussion

**At 1 Million URLs & 10 Million Redirects**:
- 10 Million Redirects = 10 Million `UPDATE` statements on the PostgreSQL `urls` table.
- **Database Pressure**: The database will suffer from lock contention (multiple threads trying to update the same row) and MVCC bloat.
- **Future Architecture**: Production systems at this scale utilize a Message Queue (like Apache Kafka). The redirect server simply publishes a "Clicked" message to Kafka and returns the redirect. A separate fleet of Analytics worker nodes consumes Kafka, batches the clicks together, and performs bulk writes to an OLAP (Online Analytical Processing) database like ClickHouse.

---

## 11. Interview Preparation

### Common Interview Questions & Answers
1. *Q: How do you ensure redirect performance isn't impacted by analytics tracking?*
   A: By completely decoupling them. I use asynchronous processing (like `@Async` or a message queue) so the `302 Redirect` is returned to the user instantly, while the database write happens in the background.
2. *Q: You chose to put `click_count` directly in the `urls` table. What is the tradeoff?*
   A: The tradeoff is database bloat due to PostgreSQL's MVCC handling of `UPDATE` statements. It's the simplest design for a low-traffic MVP, but scales poorly for highly viral links compared to appending events to a separate table or using a cache-buffer.
3. *Q: How do you prevent race conditions when updating the click counter?*
   A: By executing an atomic database query (`SET click_count = click_count + 1`) rather than calculating the new value in the application layer.
4. *Q: What if the application crashes before the async analytics update finishes?*
   A: We lose that specific click count. In a URL shortener, strict accuracy of clicks is usually less critical than redirect speed and availability. If 100% accuracy was mandated, we would have to use a durable message queue or synchronous updates.
