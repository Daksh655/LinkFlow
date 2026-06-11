package com.linkflow.analytics.controller;

import com.linkflow.analytics.dto.AnalyticsResponse;
import com.linkflow.analytics.service.AnalyticsService;
import com.linkflow.auth.entity.User;
import com.linkflow.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping("/{urlId}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long urlId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User authenticatedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(analyticsService.getAnalytics(urlId, authenticatedUser));
    }
}
