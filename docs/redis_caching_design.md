# LinkFlow Redis and Caching Design

## 1. Why Redis?
1. **What is Redis?** Redis (Remote Dictionary Server) is an open-source, in-memory key-value data store used primarily as a database cache and message broker.
2. **Why use Redis?** It drastically reduces latency and database load for read-heavy operations (like URL redirection) by serving data from RAM rather than disk.
3. **Why is Redis faster than PostgreSQL?** PostgreSQL reads from disk (though it utilizes memory caching internally), which involves I/O operations. Redis stores everything exclusively in memory, allowing for sub-millisecond response times.
4. **Real-world Use Cases:** Caching user sessions, leaderboard ranking, rate limiting, and URL shortener redirection tables.

---

## 2. PostgreSQL vs. Redis

| Feature | PostgreSQL | Redis |
| :--- | :--- | :--- |
| **Storage** | Disk-based (SSD/HDD) | Memory-based (RAM) |
| **Persistence** | Permanent (Durable) | Ephemeral (Volatile by default) |
| **Speed** | Fast (ms latency) | Ultra-fast (microsecond latency) |
| **Use Cases** | Relational data, source of truth, complex queries | Caching, rate limiting, pub/sub messaging |

**Conclusion**: PostgreSQL remains the source of truth because it guarantees ACID compliance and durable storage. If the server loses power, user accounts and URLs are safe in PostgreSQL. Redis is used purely as a disposable performance accelerator.

---

## 3. Cache Strategy: Cache-Aside Pattern

**What it means**: The application code acts as the mediator between the database and the cache. The cache does not interact with the database directly.
**Why it is used**: It is the most common caching strategy because of its simplicity and fault tolerance. If the cache goes down, the system still works.
**Benefits**: Ensures that only actually requested data is placed in memory (saving RAM). Robust against cache failures.
**Tradeoffs**: Code complexity (application must coordinate between both systems) and potential for data staleness (cache invalidation must be handled manually).

---

## 4. URL Redirect Flow

When a user visits `/{shortCode}` (e.g., `linkflow.com/abc123`), the flow is:

1. **Request arrives**: The backend receives the GET request for `abc123`.
2. **Check Redis**: The backend queries Redis for the key `url:abc123`.
3. **If Cache Hit**: 
   - Redis returns the original URL.
   - The backend immediately returns an HTTP `302 Found` to the browser.
   - *Result*: Ultra-fast redirect, PostgreSQL is completely bypassed.
4. **If Cache Miss**:
   - The backend queries PostgreSQL `SELECT original_url FROM urls WHERE short_code = 'abc123'`.
   - If found, the backend stores the mapping in Redis (`SET url:abc123 "https://..." EX 86400`).
   - The backend returns an HTTP `302 Found` to the browser.
   - *Result*: Slower first redirect, but subsequent redirects are lightning fast.

---

## 5. Cache Keys & URL Cache Design

**Naming Convention**: Prefix keys with entity names separated by a colon to create "namespaces".
- Redirect mapping: `url:{shortCode}` (e.g., `url:abc123`).
- Rate limiting: `rate:user:{userId}`.

**Value Design**:
What should be stored in `url:abc123`?
- *Option 1*: The entire URL JSON object.
- *Option 2*: Just the string of the `originalUrl`.
**Recommendation**: Just the `originalUrl` string. Redirection is the only operation using this cache. Storing metadata (like `createdAt`) wastes expensive RAM and slows down serialization/deserialization.

---

## 6. Cache Expiration Strategy (TTL)

Should cache entries expire? Yes. RAM is expensive and finite.

- **No expiration**: Will eventually cause Out-Of-Memory (OOM) errors unless eviction policies like LRU are set.
- **1 hour**: Forces frequent DB lookups for moderately active links.
- **24 hours**: **Recommended**. A 24-hour Time-To-Live (TTL) is an excellent balance. Highly active links stay hot in memory. Links that stop receiving traffic naturally evict themselves after a day, freeing up RAM.

---

## 7. Cache Invalidation

What happens when a URL is deleted by a user?
If a user deletes `abc123`, the database row is removed. If the cache is not invalidated, visitors will still be successfully redirected for up to 24 hours (a "stale cache" issue).
**Solution**: Whenever a `DELETE /api/urls/{id}` succeeds, the backend must explicitly issue a `DEL url:{shortCode}` command to Redis.

---

## 8. Redis Failure Scenario

**What happens if Redis crashes?**
By utilizing the Cache-Aside pattern, the application achieves **graceful degradation**.
1. The backend attempts to connect to Redis and throws a `ConnectionException`.
2. The backend catches this exception, logs an error, and **falls back directly to PostgreSQL**.
3. **Does the app stop working?** No. Redirections will still function perfectly.
4. **The Impact**: Latency will increase (e.g., from 1ms to 20ms) and PostgreSQL CPU load will spike. Once Redis reboots, the application will automatically begin repopulating the cache on subsequent cache misses.

---

## 9. Analytics and Redis

Should Redis track `click_count`?
- **Option 1**: Update PostgreSQL directly on every click. Simple, but slow and causes locking at high scale.
- **Option 2**: Use Redis `INCR click:{shortCode}` and flush to DB via a scheduled task. Highly scalable.
**Determination**: For the scope of this project, analytics should remain in PostgreSQL using direct updates. While Redis is superior for high-velocity counters, keeping it in PostgreSQL initially reduces system complexity. Redis is strictly reserved for read-caching and rate-limiting at this stage.

---

## 10. Future Scaling Discussion

Assume LinkFlow grows to **1 Million URLs** and **10 Million Redirects** per day.
- **Database Pressure**: Without Redis, PostgreSQL would face 10 million reads daily. This would saturate disk I/O and CPU, requiring expensive database scaling.
- **Cache Benefits**: With Redis handling a 95% cache hit rate, PostgreSQL only sees 500,000 queries. Redis absorbs 9.5 million requests effortlessly in RAM.
- **Scalability**: By placing Redis in front, the bottleneck shifts from the database to network bandwidth. If Redis reaches capacity, a Redis Cluster can be deployed to shard keys across multiple nodes.

---

## 11. Interview Preparation

### Core Concepts to Know
1. **Cache-Aside Pattern**: The application sits between the cache and the DB.
2. **Cache Hit**: Requested data was found in Redis.
3. **Cache Miss**: Data was not in Redis; fetched from DB instead.
4. **Cache Invalidation**: The process of actively removing stale data from the cache.
5. **TTL (Time To Live)**: The lifespan of a cache key before it self-destructs.

### Common Interview Questions
- *Q: What happens if your cache goes down?*
  A: Because we use the Cache-Aside pattern, the application gracefully degrades by catching the Redis timeout exception and querying PostgreSQL directly.
- *Q: Why not use Redis as the primary database?*
  A: Redis stores data in RAM. While it has persistence options (AOF/RDB), it is not a fully relational database and lacks ACID guarantees compared to PostgreSQL. It is best used for ephemeral, easily reconstructable data.
- *Q: How do you prevent your cache from running out of memory?*
  A: Two ways: setting a TTL (e.g., 24 hours) on every key so inactive links expire, and configuring an eviction policy (like `allkeys-lru`) on the Redis server to drop the least recently used keys if memory hits 100%.
