package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.model.TicketAssignment;
import com.eashan.shazam_api.repository.TicketAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class TicketAdminController {

    @Autowired
    private TicketAssignmentRepository ticketAssignmentRepo;

    @PostMapping("/verify-ticket")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> req) {
        String code = req.get("ticketCode");

        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Ticket code is required."));
        }

        Optional<TicketAssignment> opt = ticketAssignmentRepo.findByTicketCode(code);
        if (opt.isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "INVALID", "message", "No ticket found with this code."));
        }

        TicketAssignment ta = opt.get();
        String status = ta.isUsed() ? "USED" : "VALID";

        return ResponseEntity.ok(Map.of(
                "status", status,
                "ticketCode", ta.getTicketCode(),
                "concertId", ta.getConcertId(),
                "userEmail", ta.getUserEmail(),
                "userName", ta.getUserName(),
                "ticketType", ta.getTicketType(),
                "issuedAt", ta.getIssuedAt()
        ));
    }

    @PostMapping("/mark-ticket-used")
    @Transactional
    public ResponseEntity<?> markUsed(@RequestBody Map<String, String> req) {
        String code = req.get("ticketCode");

        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "ERROR", "message", "Ticket code is required."));
        }

        Optional<TicketAssignment> opt = ticketAssignmentRepo.findByTicketCode(code);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("status", "INVALID", "message", "Ticket not found."));
        }

        TicketAssignment ta = opt.get();
        if (ta.isUsed()) {
            return ResponseEntity.status(400).body(Map.of("status", "USED", "message", "This ticket has already been used."));
        }

        ta.setUsed(true);
        ticketAssignmentRepo.save(ta);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Ticket marked as used successfully.",
                "ticketCode", ta.getTicketCode()
        ));
    }
}
