package com.linkflow.url.service;

import com.linkflow.cache.CacheService;
import com.linkflow.common.exception.ResourceNotFoundException;
import com.linkflow.url.entity.Url;
import com.linkflow.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedirectService {

    private final UrlRepository urlRepository;
    private final CacheService cacheService;

    @Transactional
    public String resolveAndTrack(String shortCode) {
        String cachedUrl = cacheService.getCachedUrl(shortCode);
        if (cachedUrl != null) {
            log.info("CACHE HIT: {}", shortCode);
            return cachedUrl;
        }

        log.info("CACHE MISS: {}", shortCode);
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode, shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL not found"));

        url.setClickCount(url.getClickCount() + 1);
        url.setLastAccessed(LocalDateTime.now());
        
        urlRepository.save(url);
        
        cacheService.saveCachedUrl(shortCode, url.getOriginalUrl());

        return url.getOriginalUrl();
    }
}
