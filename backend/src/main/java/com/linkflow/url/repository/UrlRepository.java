package com.linkflow.url.repository;

import com.linkflow.url.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    boolean existsByShortCode(String shortCode);
    boolean existsByCustomAlias(String customAlias);
    Optional<Url> findByShortCodeOrCustomAlias(String shortCode, String customAlias);
    List<Url> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("UPDATE Url u SET u.clickCount = u.clickCount + 1, u.lastAccessed = :now WHERE u.shortCode = :code OR u.customAlias = :code")
    void incrementClickCount(@Param("code") String code, @Param("now") LocalDateTime now);
}
