package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.model.Song;
import com.eashan.shazam_api.service.AudioProcessor;
import com.eashan.shazam_api.service.FingerprintService;
import com.eashan.shazam_api.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/match")
public class MatchController {

    @Autowired
    private FingerprintService fingerprintService;

    @Autowired
    private SongService songService;

    @Autowired
    private AudioProcessor audioProcessor;

    private static final boolean DEBUG_MODE = true;
    private static final int MIN_CONFIDENCE_SCORE = 8;
    private static final double RELATIVE_STRENGTH_FACTOR = 1.3; // Reduced from 1.5
    private static final int MAX_ALIGNMENT_CLUSTER_SIZE = 150; // Increased tolerance
    private static final double MIN_MATCH_RATIO = 0.0002; // Reduced threshold
    private static final double MIN_NORMALIZED_SCORE = 0.000040; // Reduced threshold
    private static final int MIN_CLUSTER_SIZE = 3;
    private static final double CLUSTER_QUALITY_WEIGHT = 2.0; // New: Weight for cluster quality
    private static final double DENSITY_WEIGHT = 1.5; // New: Weight for match density

    @PostMapping
    public Map<String, Object> matchAudio(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (DEBUG_MODE) {
                System.out.println("\n🎵 ===== AUDIO MATCHING REQUEST START =====");
                System.out.println("📁 File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
            }

            // Validate file
            if (file.isEmpty()) {
                response.put("status", "error");
                response.put("message", "No audio file provided");
                return response;
            }

            // Process audio using the unified processor
            AudioProcessor.AudioData audioData = audioProcessor.processAudioStream(file.getInputStream());

            if (DEBUG_MODE) {
                System.out.println("✅ Audio processed: " + audioData.getSamples().length + " samples");
                System.out.println("⏱️ Duration: " + String.format("%.2f", audioData.getDurationSeconds()) + " seconds");
                System.out.println("🎵 Sample rate: " + audioData.getSampleRate() + " Hz");
                System.out.println("🔊 Channels: " + audioData.getChannels());
            }

            // Generate fingerprints
            List<int[]> fingerprints = fingerprintService.generateFingerprint(
                    audioData.getSamples(),
                    audioData.getSampleRate()
            );

            if (DEBUG_MODE) {
                System.out.println("🔍 Generated " + fingerprints.size() + " fingerprints");
                if (fingerprints.size() > 0) {
                    System.out.println("🔹 Sample fingerprints:");
                    for (int i = 0; i < Math.min(5, fingerprints.size()); i++) {
                        int[] fp = fingerprints.get(i);
                        System.out.println("   [" + i + "] Hash: " + fp[0] + ", Offset: " + fp[1] + "ms");
                    }
                }
            }

            // Database diagnostics
            if (DEBUG_MODE) {
                runDatabaseDiagnostics(fingerprints);
            }

            // Find matches
            MatchResult matchResult = findMatchingSongWithDetails(fingerprints);

            // Build response
            if (matchResult.bestSong != null) {
                if (DEBUG_MODE) {
                    System.out.println("🎯 MATCH FOUND!");
                    System.out.println("   🎵 " + matchResult.bestSong.getTitle() + " - " + matchResult.bestSong.getArtist());
                    System.out.println("   📊 Score: " + matchResult.bestScore + " (ratio: " + String.format("%.4f", matchResult.matchRatio) + ")");
                    System.out.println("   🎯 Normalized: " + String.format("%.6f", matchResult.bestNormalizedScore));
                    System.out.println("   🏆 Confidence: " + String.format("%.2f", matchResult.confidenceScore));
                    System.out.println("   🔄 Quality: " + String.format("%.2f", matchResult.qualityScore));
                }

                response.put("status", "success");
                response.put("match", true);
                response.put("title", matchResult.bestSong.getTitle());
                response.put("artist", matchResult.bestSong.getArtist());
                response.put("album", matchResult.bestSong.getAlbum());
                response.put("coverUrl", matchResult.bestSong.getCoverUrl());
                if (matchResult.bestSong.getSongUrl() != null) {
                    response.put("songUrl", matchResult.bestSong.getSongUrl());
                }
            } else {
                if (DEBUG_MODE) {
                    System.out.println("❌ No match found");
                    System.out.println("   Reasons: " + String.join(", ", matchResult.confidenceReasons));
                }

                response.put("status", "success");
                response.put("match", false);
                response.put("message", "No matching song found");
            }

            // Add debug information
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("sampleRate", audioData.getSampleRate());
            debugInfo.put("duration", audioData.getDurationSeconds());
            debugInfo.put("fingerprints", fingerprints.size());
            debugInfo.put("bestScore", matchResult.bestScore);
            debugInfo.put("matchRatio", matchResult.matchRatio);
            debugInfo.put("bestNormalizedScore", matchResult.bestNormalizedScore);
            debugInfo.put("confidenceScore", matchResult.confidenceScore);
            debugInfo.put("qualityScore", matchResult.qualityScore);
            debugInfo.put("totalMatches", matchResult.totalMatches);
            debugInfo.put("songCandidates", matchResult.songAnalysis.size());
            debugInfo.put("confidenceReasons", matchResult.confidenceReasons);
            response.put("debug", debugInfo);

            if (DEBUG_MODE) {
                System.out.println("🏁 ===== AUDIO MATCHING REQUEST END =====\n");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Error processing audio: " + e.getMessage());
        }

        return response;
    }

    private void runDatabaseDiagnostics(List<int[]> fingerprints) {
        System.out.println("🔍 === DATABASE DIAGNOSTICS ===");
        int totalSongs = songService.getTotalSongCount();
        int totalFingerprints = songService.getTotalFingerprintCount();
        System.out.println("📊 Database: " + totalSongs + " songs, " + totalFingerprints + " fingerprints");

        if (totalSongs == 0) {
            System.out.println("⚠️ WARNING: No songs in database!");
            return;
        }

        if (totalFingerprints == 0) {
            System.out.println("⚠️ WARNING: No fingerprints in database!");
            return;
        }

        // Test fingerprint matches
        int testCount = Math.min(20, fingerprints.size());
        int matchCount = 0;
        Map<Integer, Integer> hashMatches = new HashMap<>();

        for (int i = 0; i < testCount; i++) {
            int hash = fingerprints.get(i)[0];
            List<Map<String, Object>> matches = songService.getMatchingFingerprints(hash);
            if (!matches.isEmpty()) {
                matchCount++;
                hashMatches.put(hash, matches.size());
            }
        }

        System.out.println("🔍 Fingerprint test: " + matchCount + "/" + testCount + " hashes found matches");

        if (matchCount > 0) {
            System.out.println("✅ Sample matches found:");
            hashMatches.entrySet().stream().limit(5).forEach(entry ->
                    System.out.println("   Hash " + entry.getKey() + ": " + entry.getValue() + " matches"));
        } else {
            System.out.println("⚠️ WARNING: No fingerprint matches found!");
            System.out.println("   This suggests fingerprint generation differences between upload/match");

            // Show some sample hashes for debugging
            System.out.println("🔹 Sample query hashes:");
            for (int i = 0; i < Math.min(5, fingerprints.size()); i++) {
                System.out.println("   " + fingerprints.get(i)[0]);
            }
        }
        System.out.println("=== END DIAGNOSTICS ===\n");
    }

    private MatchResult findMatchingSongWithDetails(List<int[]> clipFingerprints) {
        MatchResult result = new MatchResult();
        result.songAnalysis = new ArrayList<>();
        result.confidenceReasons = new ArrayList<>();

        if (clipFingerprints.isEmpty()) {
            result.confidenceReasons.add("No fingerprints generated from audio");
            return result;
        }

        // Build song match data
        Map<Long, Map<Integer, Integer>> songVotes = new HashMap<>();
        Map<Long, Integer> songTotalMatches = new HashMap<>();
        Map<Long, Song> songCache = new HashMap<>();

        if (DEBUG_MODE) {
            System.out.println("🔍 Processing " + clipFingerprints.size() + " fingerprints...");
        }

        int totalDbMatches = 0;

        // Collect matches for each fingerprint
        for (int[] fp : clipFingerprints) {
            int hash = fp[0];
            int offsetInClip = fp[1];

            List<Map<String, Object>> matches = songService.getMatchingFingerprints(hash);
            totalDbMatches += matches.size();

            for (Map<String, Object> match : matches) {
                Long songId = ((Number) match.get("songId")).longValue();
                Integer offsetInSong = (Integer) match.get("offset");
                int delta = offsetInSong - offsetInClip;

                songTotalMatches.put(songId, songTotalMatches.getOrDefault(songId, 0) + 1);

                songVotes.putIfAbsent(songId, new HashMap<>());
                songVotes.get(songId).put(delta, songVotes.get(songId).getOrDefault(delta, 0) + 1);

                // Cache song info
                if (!songCache.containsKey(songId)) {
                    Song song = songService.findById(songId);
                    if (song != null) {
                        songCache.put(songId, song);
                    }
                }
            }
        }

        if (DEBUG_MODE) {
            System.out.println("🔍 Found " + totalDbMatches + " total DB matches across " + songVotes.size() + " songs");
        }

        if (songVotes.isEmpty()) {
            result.confidenceReasons.add("No matching fingerprints found in database");
            return result;
        }

        // Calculate improved scoring with multiple metrics
        Map<Long, Integer> bestAlignmentScores = new HashMap<>();
        Map<Long, Double> normalizedScores = new HashMap<>();
        Map<Long, Double> qualityScores = new HashMap<>();
        Map<Long, Double> finalScores = new HashMap<>();

        // Get fingerprint counts for all candidate songs efficiently
        List<Long> songIds = new ArrayList<>(songVotes.keySet());
        Map<Long, Integer> songFingerprintCounts = songService.getFingerprintCountsForSongs(songIds);

        for (Map.Entry<Long, Map<Integer, Integer>> entry : songVotes.entrySet()) {
            Long songId = entry.getKey();
            Map<Integer, Integer> offsetCounts = entry.getValue();

            // Create improved clusters
            List<AlignmentCluster> clusters = createImprovedTimeClusters(offsetCounts);

            // Calculate alignment scores
            int bestClusterScore = 0;
            double totalQualityScore = 0.0;
            int totalAlignedMatches = 0;

            if (!clusters.isEmpty()) {
                // Sort clusters by quality
                clusters.sort((c1, c2) -> Double.compare(c2.getQualityScore(), c1.getQualityScore()));

                // Primary cluster
                AlignmentCluster primaryCluster = clusters.get(0);
                bestClusterScore = primaryCluster.getTotalMatches();
                totalQualityScore = primaryCluster.getQualityScore();
                totalAlignedMatches = bestClusterScore;

                // Add secondary clusters with diminishing returns
                for (int i = 1; i < Math.min(clusters.size(), 3); i++) {
                    AlignmentCluster secondaryCluster = clusters.get(i);
                    if (secondaryCluster.getTotalMatches() >= MIN_CLUSTER_SIZE) {
                        double weight = 1.0 / (i + 1);
                        totalAlignedMatches += (int)(secondaryCluster.getTotalMatches() * weight);
                        totalQualityScore += secondaryCluster.getQualityScore() * weight;
                    }
                }
            }

            bestAlignmentScores.put(songId, totalAlignedMatches);

            // Calculate multiple scoring metrics
            int songTotalFingerprints = songFingerprintCounts.getOrDefault(songId, 1);
            double normalizedScore = (double) totalAlignedMatches / songTotalFingerprints;

            // Quality score based on cluster tightness and consistency
            double avgTightness = clusters.isEmpty() ? 0 :
                    clusters.stream().mapToDouble(AlignmentCluster::getTightness).average().orElse(0);
            double qualityScore = (totalQualityScore / Math.max(1, clusters.size())) * avgTightness;

            // Density score - how many of our query fingerprints matched
            double densityScore = (double) totalAlignedMatches / clipFingerprints.size();

            // Uniqueness score - prefer songs with fewer total matches (less common fingerprints)
            double avgMatchesPerFingerprint = (double) songTotalMatches.getOrDefault(songId, 0) / Math.max(1, totalAlignedMatches);
            double uniquenessScore = Math.max(0.1, 1.0 / Math.log(avgMatchesPerFingerprint + 1));

            // Combined final score with multiple factors
            double finalScore = (normalizedScore * 1000000) *
                    (1.0 + qualityScore * CLUSTER_QUALITY_WEIGHT) *
                    (1.0 + densityScore * DENSITY_WEIGHT) *
                    (1.0 + uniquenessScore) *
                    Math.min(2.0, Math.log(totalAlignedMatches + 1) / Math.log(10));

            normalizedScores.put(songId, normalizedScore);
            qualityScores.put(songId, qualityScore);
            finalScores.put(songId, finalScore);

            // Add analysis data
            Song song = songCache.get(songId);
            if (song != null) {
                Map<String, Object> analysis = new HashMap<>();
                analysis.put("songId", songId);
                analysis.put("title", song.getTitle());
                analysis.put("artist", song.getArtist());
                analysis.put("totalMatches", songTotalMatches.getOrDefault(songId, 0));
                analysis.put("alignedMatches", totalAlignedMatches);
                analysis.put("normalizedScore", normalizedScore);
                analysis.put("qualityScore", qualityScore);
                analysis.put("densityScore", densityScore);
                analysis.put("uniquenessScore", uniquenessScore);
                analysis.put("finalScore", finalScore);
                analysis.put("totalFingerprints", songTotalFingerprints);
                analysis.put("clusters", clusters.size());
                analysis.put("avgTightness", avgTightness);
                analysis.put("primaryClusterSize", clusters.isEmpty() ? 0 : clusters.get(0).getTotalMatches());
                analysis.put("avgMatchesPerFingerprint", avgMatchesPerFingerprint);
                result.songAnalysis.add(analysis);

                if (DEBUG_MODE) {
                    System.out.println(String.format("🔹 %s - %s [ID:%d]: %d aligned (%d total, %d clusters) | " +
                                    "Norm: %.6f | Quality: %.2f | Density: %.4f | Unique: %.3f | Final: %.2f",
                            song.getTitle(), song.getArtist(), songId, totalAlignedMatches,
                            songTotalMatches.getOrDefault(songId, 0), clusters.size(),
                            normalizedScore, qualityScore, densityScore, uniquenessScore, finalScore));
                }
            }
        }

        // Find best match using final scores
        result.totalMatches = songTotalMatches.values().stream().mapToInt(Integer::intValue).sum();

        List<Map.Entry<Long, Double>> sortedSongsByFinalScore = finalScores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .collect(Collectors.toList());

        if (!sortedSongsByFinalScore.isEmpty()) {
            Long bestSongId = sortedSongsByFinalScore.get(0).getKey();
            result.confidenceScore = sortedSongsByFinalScore.get(0).getValue();
            result.bestScore = bestAlignmentScores.get(bestSongId);
            result.bestNormalizedScore = normalizedScores.get(bestSongId);
            result.qualityScore = qualityScores.get(bestSongId);

            if (sortedSongsByFinalScore.size() > 1) {
                result.secondBestConfidenceScore = sortedSongsByFinalScore.get(1).getValue();
                result.secondBestScore = bestAlignmentScores.get(sortedSongsByFinalScore.get(1).getKey());
                result.secondBestNormalizedScore = normalizedScores.get(sortedSongsByFinalScore.get(1).getKey());
            }

            result.matchRatio = clipFingerprints.size() > 0 ?
                    (double) result.bestScore / clipFingerprints.size() : 0;

            if (DEBUG_MODE) {
                System.out.println("📊 Alignment scores - Best: " + result.bestScore + ", Second: " + result.secondBestScore);
                System.out.println("📊 Normalized scores - Best: " + String.format("%.6f", result.bestNormalizedScore) +
                        ", Second: " + String.format("%.6f", result.secondBestNormalizedScore));
                System.out.println("📊 Final scores - Best: " + String.format("%.2f", result.confidenceScore) +
                        ", Second: " + String.format("%.2f", result.secondBestConfidenceScore));
                System.out.println("📊 Match ratio: " + String.format("%.4f", result.matchRatio));
                System.out.println("📊 Quality score: " + String.format("%.2f", result.qualityScore));
            }

            // Apply improved confidence checks
            boolean hasConfidence = result.bestScore >= MIN_CONFIDENCE_SCORE &&
                    result.bestNormalizedScore >= MIN_NORMALIZED_SCORE &&
                    result.confidenceScore >= 100.0 && // Adjusted threshold for new scoring
                    (result.secondBestConfidenceScore == 0 || result.confidenceScore >= result.secondBestConfidenceScore * RELATIVE_STRENGTH_FACTOR) &&
                    result.matchRatio >= MIN_MATCH_RATIO;

            if (hasConfidence) {
                result.bestSong = songCache.get(bestSongId);
            } else {
                // Add reasons for rejection
                if (result.bestScore < MIN_CONFIDENCE_SCORE) {
                    result.confidenceReasons.add("Alignment score too low (" + result.bestScore + " < " + MIN_CONFIDENCE_SCORE + ")");
                }
                if (result.bestNormalizedScore < MIN_NORMALIZED_SCORE) {
                    result.confidenceReasons.add("Normalized score too low (" + String.format("%.6f", result.bestNormalizedScore) + ")");
                }
                if (result.confidenceScore < 100.0) {
                    result.confidenceReasons.add("Final score too low (" + String.format("%.2f", result.confidenceScore) + ")");
                }
                if (result.matchRatio < MIN_MATCH_RATIO) {
                    result.confidenceReasons.add("Match ratio too low (" + String.format("%.4f", result.matchRatio) + ")");
                }
                if (result.secondBestConfidenceScore > 0 && result.confidenceScore < result.secondBestConfidenceScore * RELATIVE_STRENGTH_FACTOR) {
                    result.confidenceReasons.add("Not significantly better than second match");
                }
            }
        } else {
            result.confidenceReasons.add("No song candidates found");
        }

        return result;
    }

    private List<AlignmentCluster> createImprovedTimeClusters(Map<Integer, Integer> offsetCounts) {
        List<Map.Entry<Integer, Integer>> sortedOffsets = offsetCounts.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());

        List<AlignmentCluster> clusters = new ArrayList<>();

        for (Map.Entry<Integer, Integer> offset : sortedOffsets) {
            boolean addedToCluster = false;

            // Try to add to existing cluster
            for (AlignmentCluster cluster : clusters) {
                if (cluster.canAccept(offset.getKey(), MAX_ALIGNMENT_CLUSTER_SIZE)) {
                    cluster.addOffset(offset.getKey(), offset.getValue());
                    addedToCluster = true;
                    break;
                }
            }

            // Create new cluster if needed
            if (!addedToCluster) {
                AlignmentCluster newCluster = new AlignmentCluster();
                newCluster.addOffset(offset.getKey(), offset.getValue());
                clusters.add(newCluster);
            }
        }

        return clusters;
    }

    // Improved cluster class
    private static class AlignmentCluster {
        private List<Map.Entry<Integer, Integer>> offsets = new ArrayList<>();
        private int totalMatches = 0;
        private int minOffset = Integer.MAX_VALUE;
        private int maxOffset = Integer.MIN_VALUE;

        public void addOffset(int offset, int count) {
            offsets.add(new AbstractMap.SimpleEntry<>(offset, count));
            totalMatches += count;
            minOffset = Math.min(minOffset, offset);
            maxOffset = Math.max(maxOffset, offset);
        }

        public boolean canAccept(int offset, int maxSpread) {
            if (offsets.isEmpty()) return true;
            int newMin = Math.min(minOffset, offset);
            int newMax = Math.max(maxOffset, offset);
            return (newMax - newMin) <= maxSpread;
        }

        public int getTotalMatches() { return totalMatches; }

        public double getTightness() {
            if (offsets.size() <= 1) return 1.0;
            int spread = maxOffset - minOffset;
            return Math.max(0.1, 1.0 - (double)spread / 2000.0); // Increased tolerance
        }

        public double getQualityScore() {
            return totalMatches * getTightness();
        }
    }

    // Enhanced helper class for match results
    private static class MatchResult {
        Song bestSong;
        int bestScore;
        int secondBestScore;
        int totalMatches;
        double matchRatio;
        double bestNormalizedScore;
        double secondBestNormalizedScore;
        double confidenceScore;
        double secondBestConfidenceScore;
        double qualityScore; // New field
        List<Map<String, Object>> songAnalysis = new ArrayList<>();
        List<String> confidenceReasons = new ArrayList<>();
    }

    @PostMapping("/test")
    public Map<String, Object> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Match endpoint is working!");
        return response;
    }

    @GetMapping("/debug/database")
    public Map<String, Object> debugDatabase() {
        Map<String, Object> response = new HashMap<>();

        try {
            int totalSongs = songService.getTotalSongCount();
            int totalFingerprints = songService.getTotalFingerprintCount();

            List<Song> recentSongs = songService.getRecentSongs(5);

            response.put("status", "success");
            response.put("totalSongs", totalSongs);
            response.put("totalFingerprints", totalFingerprints);
            response.put("recentSongs", recentSongs);

            // Test a few fingerprint lookups
            if (totalFingerprints > 0) {
                List<Map<String, Object>> sampleFingerprints = songService.getSampleFingerprints(5);
                response.put("sampleFingerprints", sampleFingerprints);
            }

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Database error: " + e.getMessage());
        }

        return response;
    }
}