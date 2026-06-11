package com.linkflow.analytics.service;

import com.linkflow.analytics.dto.AnalyticsResponse;
import com.linkflow.auth.entity.User;
import com.linkflow.common.exception.ResourceNotFoundException;
import com.linkflow.common.exception.UnauthorizedAccessException;
import com.linkflow.url.entity.Url;
import com.linkflow.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UrlRepository urlRepository;

    public AnalyticsResponse getAnalytics(Long urlId, User authenticatedUser) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL not found"));

        if (!url.getUser().getId().equals(authenticatedUser.getId())) {
            throw new UnauthorizedAccessException("Access denied");
        }

        return AnalyticsResponse.builder()
                .urlId(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getCustomAlias() != null ? url.getCustomAlias() : url.getShortCode())
                .clickCount(url.getClickCount())
                .createdAt(url.getCreatedAt())
                .lastAccessed(url.getLastAccessed())
                .build();
    }
}
