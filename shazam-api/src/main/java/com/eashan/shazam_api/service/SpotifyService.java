package com.eashan.shazam_api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.util.*;

@Service
public class SpotifyService {

    private static final Logger logger = LoggerFactory.getLogger(SpotifyService.class);

    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    private String accessToken;
    private Instant tokenExpiration;

    private synchronized String getAccessToken() {
        // Check if token exists and is not expired (with 1-minute buffer)
        if (accessToken != null && tokenExpiration != null &&
                tokenExpiration.isAfter(Instant.now().plusSeconds(60))) {
            logger.debug("Using existing access token");
            return accessToken;
        }

        try {
            logger.info("Requesting new Spotify access token");

            // Validate credentials
            if (clientId == null || clientId.trim().isEmpty()) {
                throw new RuntimeException("Spotify client ID is not configured");
            }
            if (clientSecret == null || clientSecret.trim().isEmpty()) {
                throw new RuntimeException("Spotify client secret is not configured");
            }

            WebClient webClient = WebClient.create();

            // Prepare request body
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");

            // Prepare basic auth
            String credentials = Base64.getEncoder().encodeToString(
                    (clientId + ":" + clientSecret).getBytes()
            );

            // Make token request
            Map<String, Object> response = webClient.post()
                    .uri("https://accounts.spotify.com/api/token")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + credentials)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("access_token")) {
                accessToken = (String) response.get("access_token");
                int expiresIn = (Integer) response.get("expires_in");
                tokenExpiration = Instant.now().plusSeconds(expiresIn);
                logger.info("Successfully obtained Spotify access token, expires in {} seconds", expiresIn);
                return accessToken;
            } else {
                logger.error("Invalid response from Spotify auth service: {}", response);
                throw new RuntimeException("Invalid response from Spotify auth service");
            }
        } catch (WebClientResponseException e) {
            logger.error("HTTP error from Spotify auth service: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to obtain Spotify access token: HTTP " + e.getStatusCode());
        } catch (Exception e) {
            logger.error("Failed to obtain Spotify access token", e);
            throw new RuntimeException("Failed to obtain Spotify access token: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> fetchPlaylistTracks(String playlistId) {
        try {
            logger.info("Fetching tracks for playlist: {}", playlistId);

            if (playlistId == null || playlistId.trim().isEmpty()) {
                throw new RuntimeException("Playlist ID cannot be null or empty");
            }

            String token = getAccessToken();

            WebClient webClient = WebClient.create();
            Map<String, Object> response = webClient.get()
                    .uri("https://api.spotify.com/v1/playlists/" + playlistId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                logger.error("Null response from Spotify playlist API");
                throw new RuntimeException("Null response from Spotify playlist API");
            }

            logger.debug("Playlist API response keys: {}", response.keySet());

            if (!response.containsKey("tracks")) {
                logger.error("No 'tracks' key in playlist response: {}", response.keySet());
                throw new RuntimeException("Invalid playlist response from Spotify - no tracks found");
            }

            Map<String, Object> tracksObj = (Map<String, Object>) response.get("tracks");
            if (tracksObj == null || !tracksObj.containsKey("items")) {
                logger.error("No 'items' in tracks object: {}", tracksObj != null ? tracksObj.keySet() : "null");
                throw new RuntimeException("Invalid tracks structure in playlist response");
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) tracksObj.get("items");
            if (items == null) {
                logger.warn("Items list is null, returning empty list");
                return new ArrayList<>();
            }

            List<Map<String, Object>> results = new ArrayList<>();
            for (int i = 0; i < items.size(); i++) {
                try {
                    Map<String, Object> item = items.get(i);
                    if (item == null) {
                        logger.warn("Skipping null item at index {}", i);
                        continue;
                    }

                    Map<String, Object> track = (Map<String, Object>) item.get("track");
                    if (track == null) {
                        logger.warn("Skipping item with null track at index {}", i);
                        continue;
                    }

                    Map<String, Object> song = new HashMap<>();

                    // Extract title
                    Object nameObj = track.get("name");
                    song.put("title", nameObj != null ? nameObj.toString() : "Unknown Title");

                    // Extract artist
                    List<Map<String, Object>> artists = (List<Map<String, Object>>) track.get("artists");
                    if (artists != null && !artists.isEmpty() && artists.get(0) != null) {
                        Object artistName = artists.get(0).get("name");
                        song.put("artist", artistName != null ? artistName.toString() : "Unknown Artist");
                    } else {
                        song.put("artist", "Unknown Artist");
                    }

                    // Extract album image
                    Map<String, Object> album = (Map<String, Object>) track.get("album");
                    if (album != null) {
                        List<Map<String, Object>> images = (List<Map<String, Object>>) album.get("images");
                        if (images != null && !images.isEmpty() && images.get(0) != null) {
                            Object imageUrl = images.get(0).get("url");
                            if (imageUrl != null) {
                                song.put("image", imageUrl.toString());
                            }
                        }
                    }

                    // Extract Spotify link
                    Map<String, Object> externalUrls = (Map<String, Object>) track.get("external_urls");
                    if (externalUrls != null) {
                        Object spotifyUrl = externalUrls.get("spotify");
                        if (spotifyUrl != null) {
                            song.put("spotifyLink", spotifyUrl.toString());
                        }
                    }

                    results.add(song);
                } catch (Exception e) {
                    logger.error("Error processing track at index {}: {}", i, e.getMessage());
                    // Continue processing other tracks
                }
            }

            logger.info("Successfully processed {} tracks from playlist {}", results.size(), playlistId);
            return results;

        } catch (WebClientResponseException e) {
            logger.error("HTTP error from Spotify playlist API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Error fetching playlist tracks: HTTP " + e.getStatusCode());
        } catch (Exception e) {
            logger.error("Error fetching playlist tracks for playlist {}", playlistId, e);
            throw new RuntimeException("Error fetching playlist tracks: " + e.getMessage());
        }
    }
}