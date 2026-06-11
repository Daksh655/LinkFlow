package com.linkflow.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_PREFIX = "url:";

    public String getCachedUrl(String shortCode) {
        String key = CACHE_PREFIX + shortCode;
        return (String) redisTemplate.opsForValue().get(key);
    }

    public void saveCachedUrl(String shortCode, String originalUrl) {
        String key = CACHE_PREFIX + shortCode;
        redisTemplate.opsForValue().set(key, originalUrl, Duration.ofHours(24));
    }

    public void removeCachedUrl(String shortCode) {
        String key = CACHE_PREFIX + shortCode;
        redisTemplate.delete(key);
    }
}
