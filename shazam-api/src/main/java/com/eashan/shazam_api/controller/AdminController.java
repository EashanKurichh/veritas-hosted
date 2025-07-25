package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.service.TicketVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @Autowired
    private TicketVerificationService ticketVerificationService;

    @PostMapping("/verify-ticket")
    public ResponseEntity<?> verifyTicket(@RequestBody Map<String, String> request) {
        String ticketCode = request.get("ticketCode");
        if (ticketCode == null || ticketCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ticket code is required"));
        }
        
        Map<String, Object> response = ticketVerificationService.verifyTicket(ticketCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mark-ticket-used")
    public ResponseEntity<?> markTicketAsUsed(@RequestBody Map<String, String> request) {
        String ticketCode = request.get("ticketCode");
        if (ticketCode == null || ticketCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ticket code is required"));
        }
        
        try {
            Map<String, Object> response = ticketVerificationService.markTicketAsUsed(ticketCode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 