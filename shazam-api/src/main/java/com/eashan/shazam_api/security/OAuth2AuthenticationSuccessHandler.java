package com.eashan.shazam_api.security;

import com.eashan.shazam_api.config.JwtUtil;
import com.eashan.shazam_api.model.User;
import com.eashan.shazam_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // Check if the user exists in the DB; if not, create it
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(""); // Set empty or random password for OAuth users
            newUser.setRole("USER"); // or "ADMIN" if needed
            userRepository.save(newUser);
        }

        // Get role for token generation
        String role = userRepository.findByEmail(email)
                .map(User::getRole)
                .orElse("USER");

        // Generate JWT and redirect to frontend with token
        String token = jwtUtil.generateToken(email, role);
        response.sendRedirect("http://localhost:3000/oauth-success?token=" + token);
    }
}
