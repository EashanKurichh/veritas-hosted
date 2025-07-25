//package com.eashan.shazam_api.service;
//import org.apache.commons.math3.complex.Complex;
//import org.springframework.stereotype.Service;
//import org.apache.commons.math3.transform.FastFourierTransformer;
//import org.apache.commons.math3.transform.DftNormalization;
//import org.apache.commons.math3.transform.TransformType;
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
//import java.util.*;
//
//
//@Service
//public class FingerprintService {
//
//    private static final int WINDOW_SIZE = 4096;
//    private static final int OVERLAP = 2048;
//    private static final int TARGET_PEAKS_PER_FRAME = 6;
//    private static final int PEAK_NEIGHBORHOOD_SIZE = 10;
//    private static final int FAN_VALUE = 5;
//    private static final int MIN_TIME_DELTA = 1;
//    private static final int MAX_TIME_DELTA = 200;
//    private static final int MAX_FINGERPRINTS = 5000;
//
//    private static final FastFourierTransformer fft =
//            new FastFourierTransformer(DftNormalization.UNITARY);
//
//    public List<int[]> generateFingerprint(double[] samples,double sampleRate) {
////  Takes an array of audio samples (normalized between -1 and 1).
////  Creates a list to store fingerprints (frequency, time).
//
//        List<int[]> peakList = new ArrayList<>(); // Store all peaks as [frequency, time]
//
//        // Apply FFT in sliding windows
//        //Loops through the entire audio signal, extracting small chunks of size WINDOW_SIZE.
//        for (int start = 0; start + WINDOW_SIZE < samples.length; start += OVERLAP) {
//            double[] window = new double[WINDOW_SIZE];
//            window = Arrays.copyOfRange(samples, start, start + WINDOW_SIZE);
////            copies a segment of samples into window.
//
//
//            // Apply Hamming window to reduce spectral leakage
//            applyHammingWindow(window);
////            System.out.println("🧭 FFT Window Start: " + start + " / Time: " + (((double) start / sampleRate) * 1000.0) + " ms");
//
//            double[] magnitudes = applyFFT(window);
////            (applyFFT(window) takes the window array (which contains a chunk of audio samples).
////              It performs the FFT (Fast Fourier Transform) on it (which converts it from time-domain to frequency-domain).
////              It returns an array of magnitude values (how strong each frequency component is).
////              That returned array is stored in magnitudes, ready to be used in findPeaks().)
//
////          Converts window into frequency components using FFT.
////          Returns magnitude values (how strong each frequency is).
////          FFT (Fast Fourier Transform) converts time-domain audio → frequency-domain data.
//
////        Convert window position to time in milliseconds
//            int timeMs = (int)(((double) start / sampleRate) * 1000.0);
//
//            // Find the strongest peaks in this window
//            List<int[]> frameTopPeaks = findTopPeaks(magnitudes, timeMs, TARGET_PEAKS_PER_FRAME);
//            peakList.addAll(frameTopPeaks);
//        }
//        List<int[]> fingerprints = generatePeakPairs(peakList);
//        // ✅ Cap fingerprints for performance
//        if (samples.length < 700000) {
//            if (fingerprints.size() > MAX_FINGERPRINTS) {
//                fingerprints = fingerprints.subList(0, MAX_FINGERPRINTS);
//            }
//        }
//
//        return fingerprints;
//    }
//
//    private void applyHammingWindow(double[] window) {
//        for (int i = 0; i < window.length; i++) {
//            // Hamming window function: 0.54 - 0.46 * cos(2π * i / (N-1))
//            double multiplier = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (window.length - 1));
//            window[i] = window[i] * multiplier;
//        }
//    }
//
//    private double[] applyFFT(double[] window) {
//        // Convert real values to complex numbers (FFT requires complex input)
//        Complex[] complexSamples = new Complex[window.length];
//        for (int i = 0; i < window.length; i++) {
//            complexSamples[i] = new Complex(window[i], 0); // Imaginary part = 0
//        }
//
//        // Perform FFT
//        Complex[] fftResult = fft.transform(complexSamples, TransformType.FORWARD);
////        TransformType.FORWARD tells the FFT to perform a forward transform (time → frequency).
////        There is also TransformType.INVERSE, which does the reverse (frequency → time).
//
//        // Extract magnitudes (amplitude spectrum)
//        double[] magnitudes = new double[window.length / 2]; // Only take half (positive frequencies)
//        for (int i = 0; i < magnitudes.length; i++) {
//            magnitudes[i] = fftResult[i].abs(); // Magnitude = sqrt(real² + imag²)
//        }
//
//        return magnitudes;
//    }
//
//    private List<int[]> findTopPeaks(double[] magnitudes, int timeMs, int numPeaks) {
//        List<int[]> peaks = new ArrayList<>();
//
//        // Create a list of [frequency, magnitude] pairs
//        List<int[]> freqMagPairs = new ArrayList<>();
//        for (int i = PEAK_NEIGHBORHOOD_SIZE; i < magnitudes.length - PEAK_NEIGHBORHOOD_SIZE; i++) {
//            // Check if this is a local maximum
//            boolean isLocalMax = true;
//            for (int j = i - PEAK_NEIGHBORHOOD_SIZE; j <= i + PEAK_NEIGHBORHOOD_SIZE; j++) {
//                if (j != i && magnitudes[j] >= magnitudes[i]) {
//                    isLocalMax = false;
//                    break;
//                }
//            }
//
//            if (isLocalMax) {
//                freqMagPairs.add(new int[]{i, (int)(magnitudes[i] * 1000)}); // Scale magnitude for easier comparison
//            }
//        }
//
//        // Sort by magnitude (descending)
//        freqMagPairs.sort((a, b) -> Integer.compare(b[1], a[1]));
//
//        // Take the top N peaks
//        for (int i = 0; i < Math.min(numPeaks, freqMagPairs.size()); i++) {
//            int freq = freqMagPairs.get(i)[0];
//            peaks.add(new int[]{freq, timeMs});
//        }
//
//        return peaks;
//    }
//
//    private List<int[]> generatePeakPairs(List<int[]> peakList) {
//        List<int[]> fingerprints = new ArrayList<>();
//
//        // For each anchor point
//        for (int i = 0; i < peakList.size(); i++) {
//            int[] anchor = peakList.get(i);
//            int anchorFreq = anchor[0];
//            int anchorTime = anchor[1];
//
//            // Look for target points ahead in time
//            for (int j = i + 1; j < Math.min(i + FAN_VALUE + 1, peakList.size()); j++) {
//                int[] target = peakList.get(j);
//                int targetFreq = target[0];
//                int targetTime = target[1];
//
//                // Check if time delta is within bounds
//                int timeDelta = targetTime - anchorTime;
//                if (timeDelta >= MIN_TIME_DELTA && timeDelta <= MAX_TIME_DELTA) {
//                    // Generate a hash from this peak pair
//                    int hash = generateHash(anchorFreq, targetFreq, timeDelta);
//                    // Store [hash, anchorTime] as the fingerprint
//                    fingerprints.add(new int[]{hash, anchorTime});
//                }
//            }
//        }
//
//        return fingerprints;
//    }
//
//    private int generateHash(int freq1, int freq2, int timeDelta) {
//        try {
//            String data = freq1 + ":" + freq2 + ":" + timeDelta;
//            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
//            byte[] hashBytes = sha1.digest(data.getBytes());
//
//            // Convert first 4 bytes to int (32-bit hash)
//            int hash = ((hashBytes[0] & 0xFF) << 24) |
//                    ((hashBytes[1] & 0xFF) << 16) |
//                    ((hashBytes[2] & 0xFF) << 8) |
//                    (hashBytes[3] & 0xFF);
//
//            return Math.abs(hash); // Ensure positive int
//        } catch (NoSuchAlgorithmException e) {
//            e.printStackTrace();
//            return 0;
//        }
//    }
//}
package com.eashan.shazam_api.service;

import org.apache.commons.math3.complex.Complex;
import org.springframework.stereotype.Service;
import org.apache.commons.math3.transform.FastFourierTransformer;
import org.apache.commons.math3.transform.DftNormalization;
import org.apache.commons.math3.transform.TransformType;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class FingerprintService {

    // Optimized parameters for better matching
    private static final int WINDOW_SIZE = 4096;
    private static final int OVERLAP = 2048; // 50% overlap
    private static final int TARGET_PEAKS_PER_FRAME = 5;
    private static final int PEAK_NEIGHBORHOOD_SIZE = 10;
    private static final int FAN_VALUE = 15; // Increased for more connections
    private static final int MIN_TIME_DELTA = 0;
    private static final int MAX_TIME_DELTA = 200;
//    private static final int MAX_FINGERPRINTS = 80000; // Increased limit

    // Frequency ranges for better peak detection
    private static final int MIN_FREQ_BIN = 10;
    private static final int MAX_FREQ_BIN = 512;

    // Minimum magnitude threshold for peak detection
    private static final double MIN_MAGNITUDE_THRESHOLD = 0.01;

    private static final FastFourierTransformer fft =
            new FastFourierTransformer(DftNormalization.UNITARY);

    public List<int[]> generateFingerprint(double[] samples, double sampleRate) {
        System.out.println("🎵 Starting fingerprint generation for " + samples.length + " samples at " + sampleRate + " Hz");

        // Normalize samples
        samples = normalizeAudio(samples);

        List<int[]> peakList = new ArrayList<>();
        int frameCount = 0;

        // Apply FFT in sliding windows
        for (int start = 0; start + WINDOW_SIZE <= samples.length; start += OVERLAP) {
            double[] window = Arrays.copyOfRange(samples, start, start + WINDOW_SIZE);

            // Apply window function
            applyHammingWindow(window);

            // Get magnitudes from FFT
            double[] magnitudes = applyFFT(window);

            // Convert window position to time in milliseconds
            double timeMs = ((double) start / sampleRate) * 1000.0;

            // Find peaks in this frame
            List<int[]> framePeaks = findTopPeaks(magnitudes, (int)timeMs, TARGET_PEAKS_PER_FRAME);
            peakList.addAll(framePeaks);

            frameCount++;
        }

        System.out.println("🔍 Generated " + peakList.size() + " peaks from " + frameCount + " frames");

        // Generate fingerprints from peak pairs
        List<int[]> fingerprints = generatePeakPairs(peakList);

//        // Limit fingerprints for performance
//        if (fingerprints.size() > MAX_FINGERPRINTS) {
//            fingerprints = fingerprints.subList(0, MAX_FINGERPRINTS);
//        }

        System.out.println("✅ Generated " + fingerprints.size() + " fingerprints");
        return fingerprints;
    }

    private double[] normalizeAudio(double[] samples) {
        // Find the maximum absolute value
        double maxVal = 0.0;
        for (double sample : samples) {
            maxVal = Math.max(maxVal, Math.abs(sample));
        }

        // Normalize if needed
        if (maxVal > 0 && maxVal != 1.0) {
            double[] normalized = new double[samples.length];
            for (int i = 0; i < samples.length; i++) {
                normalized[i] = samples[i] / maxVal;
            }
            return normalized;
        }

        return samples;
    }

    private void applyHammingWindow(double[] window) {
        for (int i = 0; i < window.length; i++) {
            double multiplier = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (window.length - 1));
            window[i] = window[i] * multiplier;
        }
    }

    private double[] applyFFT(double[] window) {
        // Convert to complex numbers
        Complex[] complexSamples = new Complex[window.length];
        for (int i = 0; i < window.length; i++) {
            complexSamples[i] = new Complex(window[i], 0);
        }

        // Perform FFT
        Complex[] fftResult = fft.transform(complexSamples, TransformType.FORWARD);

        // Extract magnitudes (only positive frequencies)
        double[] magnitudes = new double[window.length / 2];
        for (int i = 0; i < magnitudes.length; i++) {
            magnitudes[i] = fftResult[i].abs();
        }

        return magnitudes;
    }

    private List<int[]> findTopPeaks(double[] magnitudes, int timeMs, int numPeaks) {
        List<int[]> peaks = new ArrayList<>();

        // Find local maxima within frequency range
        List<int[]> candidates = new ArrayList<>();

        for (int i = MIN_FREQ_BIN; i < Math.min(MAX_FREQ_BIN, magnitudes.length - PEAK_NEIGHBORHOOD_SIZE); i++) {
            // Skip if magnitude is too low
            if (magnitudes[i] < MIN_MAGNITUDE_THRESHOLD) {
                continue;
            }

            // Check if this is a local maximum
            boolean isLocalMax = true;
            for (int j = Math.max(0, i - PEAK_NEIGHBORHOOD_SIZE);
                 j <= Math.min(magnitudes.length - 1, i + PEAK_NEIGHBORHOOD_SIZE); j++) {
                if (j != i && magnitudes[j] >= magnitudes[i]) {
                    isLocalMax = false;
                    break;
                }
            }

            if (isLocalMax) {
                // Store frequency bin and scaled magnitude
                candidates.add(new int[]{i, (int)(magnitudes[i] * 10000)});
            }
        }

        // Sort by magnitude (descending)
        candidates.sort((a, b) -> Integer.compare(b[1], a[1]));

        // Take the top N peaks
        for (int i = 0; i < Math.min(numPeaks, candidates.size()); i++) {
            int freq = candidates.get(i)[0];
            peaks.add(new int[]{freq, timeMs});
        }

        return peaks;
    }

    private List<int[]> generatePeakPairs(List<int[]> peakList) {
        List<int[]> fingerprints = new ArrayList<>();

        // Sort peaks by time to ensure proper pairing
        peakList.sort(Comparator.comparingInt(peak -> peak[1]));

        // Generate pairs from each anchor point
        for (int i = 0; i < peakList.size(); i++) {
            int[] anchor = peakList.get(i);
            int anchorFreq = anchor[0];
            int anchorTime = anchor[1];

            // Look for target points within the fan
            int targetsFound = 0;
            for (int j = i + 1; j < peakList.size() && targetsFound < FAN_VALUE; j++) {
                int[] target = peakList.get(j);
                int targetFreq = target[0];
                int targetTime = target[1];

                int timeDelta = targetTime - anchorTime;

                // Check time delta constraints
                if (timeDelta >= MIN_TIME_DELTA && timeDelta <= MAX_TIME_DELTA) {
                    // Generate hash for this peak pair
                    int hash = generateHash(anchorFreq, targetFreq, timeDelta);
                    fingerprints.add(new int[]{hash, anchorTime});
                    targetsFound++;
                }
            }
        }

        return fingerprints;
    }

    private int generateHash(int freq1, int freq2, int timeDelta) {
        try {
            // Use a more consistent hash generation
            String data = freq1 + ":" + freq2 + ":" + timeDelta;
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = sha1.digest(data.getBytes());

            // Convert first 4 bytes to int
            int hash = ((hashBytes[0] & 0xFF) << 24) |
                    ((hashBytes[1] & 0xFF) << 16) |
                    ((hashBytes[2] & 0xFF) << 8) |
                    (hashBytes[3] & 0xFF);

            return Math.abs(hash);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            // Fallback to simple hash
            return Math.abs((freq1 + ":" + freq2 + ":" + timeDelta).hashCode());
        }
    }
}
