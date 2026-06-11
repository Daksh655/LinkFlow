# LinkFlow Rate Limiting Design

## 1. Objective & Business Requirement
The goal is to design an educational, production-style rate-limiting architecture to prevent abuse of the URL creation APIs. 
**Core Requirement**: A user may create a maximum of 100 URLs per hour. Exceeding this limit returns HTTP `429 Too Many Requests`.

---

## 2. Why Rate Limiting?
**What is it?** Rate limiting is a mechanism that controls the rate of traffic sent or received by a network interface or API.
**Why use it?** Modern applications are exposed to the internet and vulnerable to automated scripts. Rate limiting ensures fair resource distribution.
**Problems Solved**:
- **API Abuse & Bot Attacks**: Prevents a single malicious script from creating millions of garbage URLs and exhausting database storage.
- **DDoS Mitigation**: Helps absorb volumetric attacks by rejecting excessive traffic early in the request lifecycle.
- **Cost Control**: Reduces unnecessary server compute, database writes, and bandwidth consumption.

---

## 3. Why Redis?
To enforce rate limiting, the backend must check a counter *on every single request*. 
- **Why not PostgreSQL?**: Doing an `UPDATE counter = counter + 1` in PostgreSQL for every request causes severe database locking, high CPU usage, and slows down the entire application.
- **Why Redis?**: Redis is strictly in-memory. Incrementing a counter in Redis takes less than a millisecond. Redis processes commands synchronously on a single thread, guaranteeing atomic increments without race conditions.

---

## 4. Rate Limiting Strategies

1. **Fixed Window**: Tracks requests in discrete time blocks (e.g., 1:00 PM to 2:00 PM). 
   - *Pros*: Simplest to build. 
   - *Cons*: "Thundering herd" problem at window boundaries (user could make 100 requests at 1:59 and 100 at 2:01).
2. **Sliding Window Log**: Stores timestamps of every request.
   - *Pros*: 100% accurate. 
   - *Cons*: High memory footprint.
3. **Token Bucket**: A bucket holds tokens; every request removes a token. Tokens refill at a steady rate.
   - *Pros*: Allows bursts of traffic while enforcing a long-term rate.
   - *Cons*: Complex to implement correctly.

**Recommendation for LinkFlow**: **Fixed Window Counter**. Because this project prioritizes educational value and beginner-friendliness, Fixed Window is the perfect choice. It uses basic Redis commands (`INCR`, `EXPIRE`) while accurately satisfying the business requirement.

---

## 5. Request Flow

1. **User Creates URL**: The authenticated user sends `POST /api/urls`.
2. **Check Redis**: The backend checks the user's specific rate limit key in Redis.
3. **If Count >= 100**:
   - The backend halts the request process immediately.
   - Returns `429 Too Many Requests`.
4. **If Count < 100**:
   - The backend executes `INCR` on the Redis key.
   - If the key is newly created (value is 1), the backend executes `EXPIRE` to set the TTL to 1 hour.
   - The request proceeds to the controller to save the URL to PostgreSQL.

---

## 6. Redis Key Design

**Format**: `rate:{action}:{userId}`
**Example**: `rate:url_create:550e8400-e29b-41d4-a716-446655440000`

- **Why this naming convention?**: Namespaces keep Redis organized. If we later want to rate limit logins (`rate:login:{email}`), the keys won't collide.
- **Why user-specific keys?**: We are limiting by authenticated identity, not by IP address. IP-based rate limiting can accidentally block an entire office building or university sharing a single NAT router.

---

## 7. Counter Expiration Strategy

**Why expire?**: Without expiration, counters would go up infinitely, and users would eventually reach 100 URLs and be banned forever.
**Duration**: 3600 seconds (1 Hour). 
**Automatic Reset**: By using the Redis `EXPIRE` command, the database handles the reset automatically. Exactly one hour after the user's first request, the key deletes itself. The next request creates a fresh key starting at 1.

---

## 8. Error Response Design

When the limit is reached, the API must return a structured response so the frontend can display a helpful message.

**Status Code**: `429 Too Many Requests`
**Response Body**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have reached the maximum limit of 100 URLs per hour. Please try again later."
  }
}
```
*(Optional Best Practice: Include `X-RateLimit-Reset` in the HTTP Headers so the frontend knows exactly when the user can try again).*

---

## 9. Redis Failure Scenario

If Redis crashes or goes offline:
1. **What happens?**: The backend attempts to increment the key and throws a Redis Connection Exception.
2. **Fail Closed vs. Fail Open**:
   - *Fail Closed (Block requests)*: Prevents abuse but completely breaks the application for legitimate users.
   - *Fail Open (Allow requests)*: Disables rate-limiting but keeps the core business functioning.
3. **Recommended Behavior**: **Fail Open**. Availability is generally preferred over strict limits for a URL shortener MVP. The application should catch the exception, log a `WARNING`, and allow the URL creation to proceed.

---

## 10. Scalability Discussion

**100 Users -> 10,000 Users**: Redis will easily handle 10,000 users. A standard Redis instance can comfortably process over 100,000 operations per second. Memory usage for 10,000 integer keys is negligible (a few megabytes).
**1 Million Users**: 
- **Memory**: Still highly manageable in a single Redis node due to the 1-hour expiration. Stale users automatically disappear from RAM.
- **CPU/Throughput**: If throughput exceeds a single node's capacity, we can shard the Redis cluster using the `{userId}` as the hash tag, distributing the rate-limit load across multiple Redis instances.

---

## 11. Interview Preparation

### Common Interview Questions & Answers
1. *Q: What is rate limiting and why did you implement it?*
   A: It is a mechanism to control traffic velocity. I implemented it to prevent malicious bots from overwhelming the database with garbage URLs.
2. *Q: Why use Redis for rate limiting instead of PostgreSQL?*
   A: Rate limiting requires intercepting every single request. Using PostgreSQL would cause high lock contention and disk I/O. Redis is in-memory and handles atomic increments (`INCR`) in sub-milliseconds.
3. *Q: You chose Fixed Window. What is the main drawback of this approach?*
   A: The "Thundering Herd" or boundary problem. A user could create 100 URLs at 1:59 PM, the counter resets at 2:00 PM, and they create another 100 URLs at 2:01 PM, effectively creating 200 URLs in two minutes. For a strictly accurate limit, I would use a Sliding Window algorithm.
4. *Q: What happens to your app if Redis crashes?*
   A: I designed the system to "Fail Open". If Redis throws a connection error, the application logs the error and allows the request through. This ensures our legitimate users can still create URLs, prioritizing availability over strict security.
