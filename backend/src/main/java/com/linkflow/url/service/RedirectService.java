package com.linkflow.url.service;

import com.linkflow.common.exception.ResourceNotFoundException;
import com.linkflow.url.entity.Url;
import com.linkflow.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RedirectService {

    private final UrlRepository urlRepository;

    @Transactional
    public String resolveAndTrack(String shortCode) {
        Url url = urlRepository.findByShortCodeOrCustomAlias(shortCode, shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("Short URL not found"));

        url.setClickCount(url.getClickCount() + 1);
        url.setLastAccessed(LocalDateTime.now());
        
        urlRepository.save(url);

        return url.getOriginalUrl();
    }
}
