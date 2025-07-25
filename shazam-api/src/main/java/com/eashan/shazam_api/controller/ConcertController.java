package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.model.Concert;
import com.eashan.shazam_api.repository.ConcertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/concerts")
public class ConcertController {

    @Autowired
    private ConcertRepository concertRepository;

    @GetMapping
    public ResponseEntity<List<Concert>> getAllConcerts() {
        return ResponseEntity.ok(concertRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Concert> getConcertById(@PathVariable String id) {
        return concertRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Concert> createConcert(@RequestBody Concert concert) {
        return ResponseEntity.ok(concertRepository.save(concert));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Concert> updateConcert(@PathVariable String id, @RequestBody Concert concert) {
        if (!concertRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        concert.setId(id);
        return ResponseEntity.ok(concertRepository.save(concert));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConcert(@PathVariable String id) {
        if (!concertRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        concertRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 