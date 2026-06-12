package com.linkflow.url.service;

import com.linkflow.auth.entity.User;
import com.linkflow.cache.CacheService;
import com.linkflow.common.exception.ResourceNotFoundException;
import com.linkflow.common.exception.UnauthorizedAccessException;
import com.linkflow.ratelimit.RateLimitService;
import com.linkflow.url.dto.CreateUrlRequest;
import com.linkflow.url.dto.UrlDashboardResponse;
import com.linkflow.url.dto.UrlResponse;
import com.linkflow.url.entity.Url;
import com.linkflow.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final CacheService cacheService;
    private final RateLimitService rateLimitService;

    @Value("${APP_BASE_URL}")
    private String appBaseUrl;
    
    private static final String ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    public UrlResponse createUrl(CreateUrlRequest request, User authenticatedUser) {
        
        rateLimitService.checkAndConsumeLimit(authenticatedUser.getId());
        
        if (request.getCustomAlias() != null && !request.getCustomAlias().isBlank()) {
            if (urlRepository.existsByCustomAlias(request.getCustomAlias())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Custom alias already exists");
            }
        }

        String shortCode = generateUniqueShortCode();
        
        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .customAlias(request.getCustomAlias() != null && !request.getCustomAlias().isBlank() ? request.getCustomAlias() : null)
                .user(authenticatedUser)
                .build();

        Url savedUrl = urlRepository.save(url);

        String finalCode = savedUrl.getCustomAlias() != null ? savedUrl.getCustomAlias() : savedUrl.getShortCode();
        
        return UrlResponse.builder()
                .id(savedUrl.getId())
                .originalUrl(savedUrl.getOriginalUrl())
                .shortCode(finalCode)
                .shortUrl(appBaseUrl + "/" + finalCode)
                .clickCount(savedUrl.getClickCount())
                .build();
    }

    public List<UrlDashboardResponse> getUserUrls(User authenticatedUser) {
        return urlRepository.findByUserIdOrderByCreatedAtDesc(authenticatedUser.getId())
                .stream()
                .map(this::mapToDashboardResponse)
                .toList();
    }

    public UrlDashboardResponse getUrlDetails(Long urlId, User authenticatedUser) {
        Url url = getUrlAndVerifyOwnership(urlId, authenticatedUser);
        return mapToDashboardResponse(url);
    }

    public void deleteUrl(Long urlId, User authenticatedUser) {
        Url url = getUrlAndVerifyOwnership(urlId, authenticatedUser);
        
        String finalCode = url.getCustomAlias() != null ? url.getCustomAlias() : url.getShortCode();
        cacheService.removeCachedUrl(finalCode);
        if (url.getCustomAlias() != null) {
            cacheService.removeCachedUrl(url.getShortCode());
        }
        
        urlRepository.delete(url);
    }

    private Url getUrlAndVerifyOwnership(Long urlId, User authenticatedUser) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found"));

        if (!url.getUser().getId().equals(authenticatedUser.getId())) {
            throw new UnauthorizedAccessException("Access denied");
        }
        return url;
    }

    private UrlDashboardResponse mapToDashboardResponse(Url url) {
        String finalCode = url.getCustomAlias() != null ? url.getCustomAlias() : url.getShortCode();
        return UrlDashboardResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(finalCode)
                .shortUrl(appBaseUrl + "/" + finalCode)
                .clickCount(url.getClickCount())
                .createdAt(url.getCreatedAt())
                .lastAccessed(url.getLastAccessed())
                .build();
    }

    private String generateUniqueShortCode() {
        String shortCode;
        do {
            shortCode = generateRandomString(SHORT_CODE_LENGTH);
        } while (urlRepository.existsByShortCode(shortCode));
        return shortCode;
    }

    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALLOWED_CHARACTERS.charAt(random.nextInt(ALLOWED_CHARACTERS.length())));
        }
        return sb.toString();
    }
}
