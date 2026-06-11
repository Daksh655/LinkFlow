package com.linkflow.url.controller;

import com.linkflow.auth.entity.User;
import com.linkflow.auth.repository.UserRepository;
import com.linkflow.url.dto.CreateUrlRequest;
import com.linkflow.url.dto.UrlDashboardResponse;
import com.linkflow.url.dto.UrlResponse;
import com.linkflow.url.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<UrlResponse> createUrl(
            @Valid @RequestBody CreateUrlRequest request,
            Authentication authentication
    ) {
        User authenticatedUser = getAuthenticatedUser(authentication);
        UrlResponse response = urlService.createUrl(request, authenticatedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UrlDashboardResponse>> getUserUrls(Authentication authentication) {
        User authenticatedUser = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(urlService.getUserUrls(authenticatedUser));
    }

    @GetMapping("/{urlId}")
    public ResponseEntity<UrlDashboardResponse> getUrlDetails(
            @PathVariable Long urlId, 
            Authentication authentication
    ) {
        User authenticatedUser = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(urlService.getUrlDetails(urlId, authenticatedUser));
    }

    @DeleteMapping("/{urlId}")
    public ResponseEntity<Void> deleteUrl(
            @PathVariable Long urlId, 
            Authentication authentication
    ) {
        User authenticatedUser = getAuthenticatedUser(authentication);
        urlService.deleteUrl(urlId, authenticatedUser);
        return ResponseEntity.noContent().build();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
