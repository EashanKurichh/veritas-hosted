package com.eashan.shazam_api.repository;

import com.eashan.shazam_api.model.Concert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConcertRepository extends JpaRepository<Concert, String> {
    // Add custom query methods if needed
} 