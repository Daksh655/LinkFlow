package com.linkflow.url.service;

import com.linkflow.auth.entity.User;
import com.linkflow.url.dto.CreateUrlRequest;
import com.linkflow.url.dto.UrlResponse;
import com.linkflow.url.entity.Url;
import com.linkflow.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    
    private static final String ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    public UrlResponse createUrl(CreateUrlRequest request, User authenticatedUser) {
        
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
                .shortUrl("http://localhost:8080/" + finalCode)
                .clickCount(savedUrl.getClickCount())
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
