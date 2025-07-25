package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.model.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "http://localhost:3000")
public class SongManagementController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAllSongs() {
        Map<String, Object> response = new HashMap<>();

        try {
            String sql = "SELECT id, title, artist, album, cover_path FROM songs ORDER BY title";
            List<Map<String, Object>> songs = jdbcTemplate.queryForList(sql);

            // Add cover URLs
            songs.forEach(song -> {
                String coverPath = (String) song.get("cover_path");
                if (coverPath != null && !coverPath.isEmpty()) {
                    song.put("coverUrl", "http://localhost:8080/covers/" + coverPath);
                }
            });

            response.put("status", "success");
            response.put("songs", songs);
            response.put("total", songs.size());
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> deleteSong(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Delete fingerprints first (foreign key constraint)
            jdbcTemplate.update("DELETE FROM fingerprints WHERE song_id = ?", id);

            // Delete song
            int rowsAffected = jdbcTemplate.update("DELETE FROM songs WHERE id = ?", id);

            if (rowsAffected > 0) {
                response.put("status", "success");
                response.put("message", "Song deleted successfully");
            } else {
                response.put("status", "error");
                response.put("message", "Song not found");
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }
}