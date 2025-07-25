package com.eashan.shazam_api.service;

import org.springframework.stereotype.Service;
import javax.sound.sampled.*;
import java.io.BufferedInputStream;
import java.io.InputStream;

@Service
public class AudioProcessor {

    /**
     * Unified audio processing method for both upload and matching
     * This ensures identical fingerprint generation
     */
    public AudioData processAudioStream(InputStream inputStream) throws Exception {
        AudioInputStream audioInputStream = null;

        try {
            // Create audio input stream
            audioInputStream = AudioSystem.getAudioInputStream(new BufferedInputStream(inputStream));

            // Get original format
            AudioFormat originalFormat = audioInputStream.getFormat();
            System.out.println("🎵 Original format: " + originalFormat);

            // Define target PCM format (standardized)
            AudioFormat targetFormat = new AudioFormat(
                    AudioFormat.Encoding.PCM_SIGNED,
                    originalFormat.getSampleRate(),
                    16, // 16-bit
                    originalFormat.getChannels(), // retain original channel count
                    originalFormat.getChannels() * 2, // frame size for mono 16-bit
                    originalFormat.getSampleRate(),
                    false // little endian
            );

            // Convert to target format
            System.out.println("🔄 Converting to standardized format: " + targetFormat);
            audioInputStream = AudioSystem.getAudioInputStream(targetFormat, audioInputStream);

            // Read all bytes
            byte[] audioBytes = audioInputStream.readAllBytes();
            System.out.println("📊 Read " + audioBytes.length + " bytes");

            // Convert to normalized samples
            double[] samples = convertBytesToNormalizedSamples(audioBytes, targetFormat);

            return new AudioData(samples, targetFormat.getSampleRate(), targetFormat.getChannels());

        } finally {
            if (audioInputStream != null) {
                audioInputStream.close();
            }
        }
    }

    /**
     * Convert audio bytes to normalized samples using consistent method
     */
    private double[] convertBytesToNormalizedSamples(byte[] audioBytes, AudioFormat format) {
        int bytesPerSample = format.getSampleSizeInBits() / 8;
        int channels = format.getChannels();
        boolean isBigEndian = format.isBigEndian();

        // Calculate number of samples (not frames)
        int numSamples = audioBytes.length / (bytesPerSample * channels);
        double[] samples = new double[numSamples];

        System.out.println("🔄 Converting " + numSamples + " samples, " + channels + " channels, " + bytesPerSample + " bytes per sample");

        // Process each sample
        for (int i = 0; i < numSamples; i++) {
            int frameStart = i * bytesPerSample * channels;
            double monoSample = 0;

            for (int ch = 0; ch < channels; ch++) {
                int byteIndex = frameStart + ch * bytesPerSample;
                int sampleValue = 0;

                if (bytesPerSample == 2) {
                    if (isBigEndian) {
                        sampleValue = ((audioBytes[byteIndex] << 8) | (audioBytes[byteIndex + 1] & 0xFF));
                    } else {
                        sampleValue = ((audioBytes[byteIndex + 1] << 8) | (audioBytes[byteIndex] & 0xFF));
                    }
                } else if (bytesPerSample == 1) {
                    sampleValue = (audioBytes[byteIndex] & 0xFF) - 128;
                    sampleValue <<= 8;
                }

                monoSample += sampleValue / 32768.0;
            }

            samples[i] = monoSample / channels; // average across channels
        }

        // Calculate and log stats
        double min = Double.MAX_VALUE, max = Double.MIN_VALUE;
        for (double sample : samples) {
            min = Math.min(min, sample);
            max = Math.max(max, sample);
        }

        System.out.println("🔍 Sample range: [" + String.format("%.6f", min) + ", " + String.format("%.6f", max) + "]");
        System.out.println("✅ Generated " + samples.length + " normalized samples");

        return samples;
    }

    /**
     * Data class to hold processed audio information
     */
    public static class AudioData {
        private final double[] samples;
        private final float sampleRate;
        private final int channels;

        public AudioData(double[] samples, float sampleRate, int channels) {
            this.samples = samples;
            this.sampleRate = sampleRate;
            this.channels = channels;
        }

        public double[] getSamples() { return samples; }
        public float getSampleRate() { return sampleRate; }
        public int getChannels() { return channels; }
        public double getDurationSeconds() { return (double) samples.length / sampleRate; }
    }
}