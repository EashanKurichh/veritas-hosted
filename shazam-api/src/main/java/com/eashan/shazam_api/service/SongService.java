package com.eashan.shazam_api.service;
import com.eashan.shazam_api.model.Song;
import org.springframework.stereotype.Service;
import com.eashan.shazam_api.model.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;


@Service
public class SongService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Song findMatchingSong(List<int[]> fingerprints) {
        // You can improve this logic with a better matching algorithm later
        for (int[] fp : fingerprints) {
            int hash = fp[0];

            String sql = "SELECT s.id, s.title, s.artist, s.album, s.cover_path, s.song_url FROM songs s " +
                    "JOIN fingerprints f ON s.id = f.song_id " +
                    "WHERE f.hash = ? LIMIT 1";

            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, hash);

            if (!result.isEmpty()) {
                Map<String, Object> row = result.get(0);
                Song song = new Song();
                song.setId((int) row.get("id"));
                song.setTitle((String) row.get("title"));
                song.setArtist((String) row.get("artist"));
                song.setAlbum((String) row.get("album"));
                String coverPath = (String) row.get("cover_path");
                song.setCoverPath(coverPath);

                // Automatically generate URL to cover image
                if (coverPath != null && !coverPath.isEmpty()) {
                    song.setCoverUrl("http://localhost:8080/covers/" + coverPath);
                }

                // Optional song URL
                Object songUrlObj = row.get("song_url");
                if (songUrlObj != null) {
                    song.setSongUrl(songUrlObj.toString());
                }
                return song;
            }
        }
        return null;
    }

    /**
     * Get all matching fingerprints for a given hash with song information
     */
    public List<Map<String, Object>> getMatchingFingerprints(int hash) {
        String sql = "SELECT f.song_id, f.offset as offset FROM fingerprints f WHERE f.hash = ?";

        List<Map<String, Object>> dbResults = jdbcTemplate.queryForList(sql, hash);
        List<Map<String, Object>> results = new ArrayList<>();

        for (Map<String, Object> row : dbResults) {
            Map<String, Object> match = new HashMap<>();

            // Handle different possible data types for song_id
            Object songIdObj = row.get("song_id");
            Long songId;
            if (songIdObj instanceof Integer) {
                songId = ((Integer) songIdObj).longValue();
            } else if (songIdObj instanceof Long) {
                songId = (Long) songIdObj;
            } else {
                // Skip if we can't determine song_id
                continue;
            }

            // Handle different possible data types for offset
            Object offsetObj = row.get("offset");
            Integer offset;
            if (offsetObj instanceof Integer) {
                offset = (Integer) offsetObj;
            } else if (offsetObj instanceof Long) {
                offset = ((Long) offsetObj).intValue();
            } else if (offsetObj instanceof Double) {
                offset = ((Double) offsetObj).intValue();
            } else {
                offset = 0; // Default fallback
            }

            match.put("songId", songId);
            match.put("offset", offset);
            results.add(match);
        }

        return results;
    }

    /**
     * Find a song by its ID
     */
    public Song findById(Long songId) {
        try {
            String sql = "SELECT id, title, artist, album, cover_path, song_url FROM songs WHERE id = ?";

            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, songId);

            if (!result.isEmpty()) {
                Map<String, Object> row = result.get(0);
                Song song = new Song();

                // Handle different possible data types for id
                Object idObj = row.get("id");
                if (idObj instanceof Integer) {
                    song.setId((Integer) idObj);
                } else if (idObj instanceof Long) {
                    song.setId(((Long) idObj).intValue());
                }

                song.setTitle((String) row.get("title"));
                song.setArtist((String) row.get("artist"));
                song.setAlbum((String) row.get("album"));

                String coverPath = (String) row.get("cover_path");
                song.setCoverPath(coverPath);

                // Automatically generate URL to cover image
                if (coverPath != null && !coverPath.isEmpty()) {
                    song.setCoverUrl("http://localhost:8080/covers/" + coverPath);
                }

                // Optional song URL
                Object songUrlObj = row.get("song_url");
                if (songUrlObj != null) {
                    song.setSongUrl(songUrlObj.toString());
                }

                return song;
            }
        } catch (Exception e) {
            System.err.println("Error finding song by ID " + songId + ": " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Helper method to get song title by ID (for debugging purposes)
     */
    public String getSongTitleById(Long songId) {
        try {
            String sql = "SELECT title FROM songs WHERE id = ?";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, songId);

            if (!result.isEmpty()) {
                return (String) result.get(0).get("title");
            }
        } catch (Exception e) {
            System.err.println("Error getting song title for ID " + songId + ": " + e.getMessage());
        }

        return "Unknown Song";
    }

    /**
     * Get total count of songs in database (for debugging)
     */
    public int getTotalSongCount() {
        try {
            String sql = "SELECT COUNT(*) as count FROM songs";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);

            if (!result.isEmpty()) {
                Object countObj = result.get(0).get("count");
                if (countObj instanceof Integer) {
                    return (Integer) countObj;
                } else if (countObj instanceof Long) {
                    return ((Long) countObj).intValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting total song count: " + e.getMessage());
        }

        return 0;
    }

    /**
     * Get total count of fingerprints in database (for debugging)
     */
    public int getTotalFingerprintCount() {
        try {
            String sql = "SELECT COUNT(*) as count FROM fingerprints";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);

            if (!result.isEmpty()) {
                Object countObj = result.get(0).get("count");
                if (countObj instanceof Integer) {
                    return (Integer) countObj;
                } else if (countObj instanceof Long) {
                    return ((Long) countObj).intValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting total fingerprint count: " + e.getMessage());
        }

        return 0;
    }

    /**
     * Debug method to check if fingerprints exist for a specific hash
     */
    public boolean hasMatchesForHash(int hash) {
        try {
            String sql = "SELECT COUNT(*) as count FROM fingerprints WHERE hash = ?";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, hash);

            if (!result.isEmpty()) {
                Object countObj = result.get(0).get("count");
                int count = 0;
                if (countObj instanceof Integer) {
                    count = (Integer) countObj;
                } else if (countObj instanceof Long) {
                    count = ((Long) countObj).intValue();
                }
                return count > 0;
            }
        } catch (Exception e) {
            System.err.println("Error checking matches for hash " + hash + ": " + e.getMessage());
        }

        return false;
    }

    /**
     * Get sample fingerprints for debugging
     */
    public List<Map<String, Object>> getSampleFingerprints(int limit) {
        try {
            String sql = "SELECT hash, song_id, offset FROM fingerprints LIMIT ?";
            return jdbcTemplate.queryForList(sql, limit);
        } catch (Exception e) {
            System.err.println("Error getting sample fingerprints: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get sample songs for debugging
     */
    public List<Map<String, Object>> getSampleSongs(int limit) {
        try {
            String sql = "SELECT id, title, artist, album FROM songs LIMIT ?";
            return jdbcTemplate.queryForList(sql, limit);
        } catch (Exception e) {
            System.err.println("Error getting sample songs: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get hash distribution for debugging
     */
    public Map<String, Object> getHashDistribution() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Get hash range
            String minMaxSql = "SELECT MIN(hash) as min_hash, MAX(hash) as max_hash FROM fingerprints";
            List<Map<String, Object>> minMaxResult = jdbcTemplate.queryForList(minMaxSql);

            if (!minMaxResult.isEmpty()) {
                Map<String, Object> row = minMaxResult.get(0);
                stats.put("minHash", row.get("min_hash"));
                stats.put("maxHash", row.get("max_hash"));
            }

            // Get some common hash counts
            String topHashesSql = "SELECT hash, COUNT(*) as count FROM fingerprints GROUP BY hash ORDER BY count DESC LIMIT 10";
            List<Map<String, Object>> topHashes = jdbcTemplate.queryForList(topHashesSql);
            stats.put("topHashes", topHashes);

        } catch (Exception e) {
            System.err.println("Error getting hash distribution: " + e.getMessage());
        }

        return stats;
    }
    // Add this method to SongService.java
    public List<Song> getRecentSongs(int limit) {
        try {
            String sql = "SELECT id, title, artist, album, cover_path, song_url FROM songs ORDER BY id DESC LIMIT ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, limit);

            List<Song> songs = new ArrayList<>();
            for (Map<String, Object> row : results) {
                Song song = new Song();
                song.setId((Integer) row.get("id"));
                song.setTitle((String) row.get("title"));
                song.setArtist((String) row.get("artist"));
                song.setAlbum((String) row.get("album"));

                String coverPath = (String) row.get("cover_path");
                song.setCoverPath(coverPath);
                if (coverPath != null && !coverPath.isEmpty()) {
                    song.setCoverUrl("http://localhost:8080/covers/" + coverPath);
                }

                Object songUrlObj = row.get("song_url");
                if (songUrlObj != null) {
                    song.setSongUrl(songUrlObj.toString());
                }

                songs.add(song);
            }

            return songs;
        } catch (Exception e) {
            System.err.println("Error getting recent songs: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    /**
     * Get fingerprint count for a specific song
     */
    public int getFingerprintCountForSong(Long songId) {
        try {
            String sql = "SELECT COUNT(*) as count FROM fingerprints WHERE song_id = ?";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, songId);

            if (!result.isEmpty()) {
                Object countObj = result.get(0).get("count");
                if (countObj instanceof Integer) {
                    return (Integer) countObj;
                } else if (countObj instanceof Long) {
                    return ((Long) countObj).intValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting fingerprint count for song " + songId + ": " + e.getMessage());
        }

        return 0;
    }

    /**
     * Get fingerprint counts for multiple songs at once (more efficient)
     */
    public Map<Long, Integer> getFingerprintCountsForSongs(List<Long> songIds) {
        Map<Long, Integer> counts = new HashMap<>();

        if (songIds.isEmpty()) {
            return counts;
        }

        try {
            // Create placeholders for IN clause
            String placeholders = songIds.stream().map(id -> "?").collect(Collectors.joining(","));
            String sql = "SELECT song_id, COUNT(*) as count FROM fingerprints WHERE song_id IN (" + placeholders + ") GROUP BY song_id";

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, songIds.toArray());

            for (Map<String, Object> row : results) {
                Object songIdObj = row.get("song_id");
                Object countObj = row.get("count");

                Long songId;
                if (songIdObj instanceof Integer) {
                    songId = ((Integer) songIdObj).longValue();
                } else if (songIdObj instanceof Long) {
                    songId = (Long) songIdObj;
                } else {
                    continue;
                }

                int count;
                if (countObj instanceof Integer) {
                    count = (Integer) countObj;
                } else if (countObj instanceof Long) {
                    count = ((Long) countObj).intValue();
                } else {
                    count = 0;
                }

                counts.put(songId, count);
            }

        } catch (Exception e) {
            System.err.println("Error getting fingerprint counts for songs: " + e.getMessage());
        }

        return counts;
    }

}