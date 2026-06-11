package com.linkflow.ratelimit;

import com.linkflow.common.exception.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    private static final int MAX_REQUESTS_PER_HOUR = 100;

    public void checkAndConsumeLimit(Long userId) {
        String key = RATE_LIMIT_PREFIX + userId;
        
        Long currentCount = redisTemplate.opsForValue().increment(key);
        
        if (currentCount != null && currentCount == 1L) {
            // First request, set expiration window
            redisTemplate.expire(key, Duration.ofHours(1));
        }

        if (currentCount != null && currentCount > MAX_REQUESTS_PER_HOUR) {
            throw new RateLimitExceededException("Rate limit exceeded. Try again later.");
        }
    }
}
