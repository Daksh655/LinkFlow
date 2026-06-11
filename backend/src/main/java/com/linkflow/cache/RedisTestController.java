package com.linkflow.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
public class RedisTestController {

    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> pingRedis() {
        String testKey = "ping:test";
        String testValue = "Redis connection successful at " + LocalDateTime.now();

        // Store value with 1 minute expiration
        redisTemplate.opsForValue().set(testKey, testValue, 1, TimeUnit.MINUTES);

        // Retrieve value
        Object retrievedValue = redisTemplate.opsForValue().get(testKey);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("stored", true);
        response.put("retrieved", retrievedValue);

        return ResponseEntity.ok(response);
    }
}
