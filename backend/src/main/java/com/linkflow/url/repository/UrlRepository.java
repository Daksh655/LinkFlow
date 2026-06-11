package com.linkflow.url.repository;

import com.linkflow.url.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    boolean existsByShortCode(String shortCode);
    boolean existsByCustomAlias(String customAlias);
    Optional<Url> findByShortCodeOrCustomAlias(String shortCode, String customAlias);
}
