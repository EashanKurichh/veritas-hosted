package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.service.SpotifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/charts")
@CrossOrigin(origins = "http://localhost:5173")
public class ChartController {

    private static final Logger logger = LoggerFactory.getLogger(ChartController.class);

    @Autowired
    private SpotifyService spotifyService;

    private final Map<String, String> chartPlaylistMap = Map.of(
            "global", "0sURHP3sYFA3f3yxmhjJ2Q",
            "india","6F9taO4OFuIISLP3MXCpl5",
            "viral", "2NmeR5z0r1J9HsaNgXq3n3",
            "punjabi","7koVsRAg6t3JYimqAz3lOV"


    );

    @GetMapping("/{type}")
    public ResponseEntity<?> getChart(@PathVariable String type) {
        try {
            logger.info("Received request for chart type: {}", type);

            if (!chartPlaylistMap.containsKey(type)) {
                logger.warn("Chart type '{}' not found. Available types: {}", type, chartPlaylistMap.keySet());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Chart type not found");
                errorResponse.put("availableTypes", chartPlaylistMap.keySet());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            String playlistId = chartPlaylistMap.get(type);
            logger.info("Fetching playlist with ID: {}", playlistId);

            List<Map<String, Object>> tracks = spotifyService.fetchPlaylistTracks(playlistId);

            logger.info("Successfully retrieved {} tracks for chart type '{}'", tracks.size(), type);
            return ResponseEntity.ok(tracks);

        } catch (Exception e) {
            logger.error("Error processing chart request for type '{}': {}", type, e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}