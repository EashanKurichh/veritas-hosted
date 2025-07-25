package com.eashan.shazam_api.service;
import com.eashan.shazam_api.dto.*;
import com.eashan.shazam_api.exceptions.EmailAlreadyExistsException;
import com.eashan.shazam_api.model.User;
import com.eashan.shazam_api.repository.UserRepository;
import com.eashan.shazam_api.config.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.Map;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JavaMailSender mailSender;

    public Map<String, Object> getCurrentUser(String token) {
        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "role", user.getRole()
        );
    }

    public AuthResponse register(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email is already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setOauthUser(false);

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getFullName(), user.getEmail());
    }

    public AuthResponse authenticate(SigninRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getFullName(), user.getEmail());
    }
    // Generate OTP, save it with expiry, and email to user
    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate random 6-digit OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

        // Save OTP and expiry in user entity
        user.setOtp(otp);
        user.setOtpExpiry(expiry);
        userRepository.save(user);

        // Prepare and send email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your OTP for password reset");
        message.setText("Your OTP is: " + otp + "\nIt will expire in 10 minutes.");
        mailSender.send(message);
    }

    // Validate OTP and reset password
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check OTP and expiry
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())
                || user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Encode and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Clear OTP fields
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);
    }

}
