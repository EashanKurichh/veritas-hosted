package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.service.AudioProcessor;
import com.eashan.shazam_api.service.FingerprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sound.sampled.*;
import java.io.*;
import java.nio.file.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.*;

@EnableMethodSecurity
@RestController
@RequestMapping("/upload")
public class UploadController {
    private static final String COVER_DIR = "./covers/";
    private static final int BATCH_SIZE = 1000;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AudioProcessor audioProcessor;

    @Autowired
    private FingerprintService fingerprintService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> uploadSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "album", required = false) String album,
            @RequestParam(value = "cover", required = false) MultipartFile coverImage
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || (!originalFilename.toLowerCase().endsWith(".wav") &&
                    !originalFilename.toLowerCase().endsWith(".mp3"))) {
                response.put("status", "error");
                response.put("message", "Only WAV and MP3 files are supported");
                return response;
            }

            // Save cover image if provided
            String coverFilename = null;
            if (coverImage != null && !coverImage.isEmpty()) {
                coverFilename = UUID.randomUUID() + "_" + coverImage.getOriginalFilename();
                Path coverPath = Paths.get(COVER_DIR, coverFilename);
                Files.createDirectories(coverPath.getParent());
                Files.copy(coverImage.getInputStream(), coverPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Convert audio to samples
            AudioProcessor.AudioData audioData = audioProcessor.processAudioStream(file.getInputStream());

            System.out.println("✅ Audio processed: " + audioData.getSamples().length + " samples");
            System.out.println("⏱️ Duration: " + String.format("%.2f", audioData.getDurationSeconds()) + " seconds");

//            AudioInputStream audioInputStream = null;
            try {
//                audioInputStream = AudioSystem.getAudioInputStream(new BufferedInputStream(file.getInputStream()));
//
//                // Convert to PCM if needed (important for MP3)
//                AudioFormat originalFormat = audioInputStream.getFormat();
//                AudioFormat pcmFormat = new AudioFormat(
//                        AudioFormat.Encoding.PCM_SIGNED,
//                        originalFormat.getSampleRate(),
//                        16, // 16-bit
//                        originalFormat.getChannels(),
//                        originalFormat.getChannels() * 2, // frame size
//                        originalFormat.getSampleRate(),
//                        false // little endian
//                );
//
//                // Convert to PCM if not already
//                if (!originalFormat.matches(pcmFormat)) {
//                    audioInputStream = AudioSystem.getAudioInputStream(pcmFormat, audioInputStream);
//                }
//
//                AudioFormat format = audioInputStream.getFormat();
//                int bytesPerSample = format.getSampleSizeInBits() / 8;
//                byte[] audioBytes = audioInputStream.readAllBytes();
//                int numSamples = audioBytes.length / (bytesPerSample * format.getChannels());
//
//                // Convert to mono if stereo (take average of channels)
//                double[] samples = new double[numSamples];
//                boolean isBigEndian = format.isBigEndian();
//                int channels = format.getChannels();
//
//                for (int i = 0, sampleIndex = 0; i + (bytesPerSample * channels) <= audioBytes.length;
//                     i += (bytesPerSample * channels), sampleIndex++) {
//
//                    double sampleSum = 0;
//                    for (int channel = 0; channel < channels; channel++) {
//                        int sampleOffset = i + (channel * bytesPerSample);
//                        int sample = 0;
//
//                        if (bytesPerSample == 2) {
//                            sample = isBigEndian
//                                    ? ((audioBytes[sampleOffset] << 8) | (audioBytes[sampleOffset + 1] & 0xFF))
//                                    : ((audioBytes[sampleOffset + 1] << 8) | (audioBytes[sampleOffset] & 0xFF));
//                        } else if (bytesPerSample == 1) {
//                            sample = audioBytes[sampleOffset];
//                        }
//                        sampleSum += sample;
//                    }
//                    samples[sampleIndex] = (sampleSum / channels) / 32768.0;
//                }

                List<int[]> fingerprints = fingerprintService.generateFingerprint(audioData.getSamples(),
                        audioData.getSampleRate());

                // Insert song
                String insertSongSql = "INSERT INTO songs (title, artist, album, cover_path) VALUES (?, ?, ?, ?)";
                jdbcTemplate.update(insertSongSql, title, artist, album, coverFilename);
                Integer songId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);

                // Write fingerprints to CSV and load into database
                Path tempCsv = Paths.get("./temp_fingerprints_" + UUID.randomUUID() + ".csv");
                try (BufferedWriter writer = Files.newBufferedWriter(tempCsv)) {
                    for (int[] fp : fingerprints) {
                        writer.write(songId + "," + fp[0] + "," + fp[1]);
                        writer.newLine();
                    }
                }

                // Load CSV into MySQL
                String loadSql = "LOAD DATA LOCAL INFILE ? INTO TABLE fingerprints " +
                        "FIELDS TERMINATED BY ',' " +
                        "LINES TERMINATED BY '\\n' " +
                        "(song_id, hash, offset)";

                jdbcTemplate.execute((Connection conn) -> {
                    try (PreparedStatement ps = conn.prepareStatement(loadSql)) {
                        ps.setString(1, tempCsv.toAbsolutePath().toString());
                        ps.execute();
                    }
                    return null;
                });

                // Delete temp CSV
                Files.deleteIfExists(tempCsv);

                response.put("status", "success");
                response.put("message", "Song uploaded and fingerprints saved.");
                response.put("fingerprints", fingerprints.size());
                response.put("format", audioData.getSampleRate());

            }
            catch (Exception e){
                response.put("status", "error");
            }
//            finally {
//                if (audioInputStream != null) {
//                    audioInputStream.close();
//                }
//            }

        } catch (UnsupportedAudioFileException e) {
            response.put("status", "error");
            response.put("message", "Unsupported audio format. Please use WAV or MP3 files.");
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Error processing file: " + e.getMessage());
        }

        return response;
    }
}