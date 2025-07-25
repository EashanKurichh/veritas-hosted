package com.eashan.shazam_api.service;

import com.eashan.shazam_api.model.TicketAssignment;
import com.eashan.shazam_api.repository.TicketAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class TicketVerificationService {

    @Autowired
    private TicketAssignmentRepository ticketAssignmentRepo;

    @Transactional(readOnly = true)
    public Map<String, Object> verifyTicket(String ticketCode) {
        Map<String, Object> response = new HashMap<>();
        
        var ticketOpt = ticketAssignmentRepo.findByTicketCode(ticketCode);
        
        if (ticketOpt.isEmpty()) {
            response.put("status", "INVALID");
            response.put("message", "No ticket found with this code.");
            return response;
        }

        TicketAssignment ticket = ticketOpt.get();
        
        response.put("status", ticket.isUsed() ? "USED" : "VALID");
        response.put("ticketCode", ticket.getTicketCode());
        response.put("concertId", ticket.getConcertId());
        response.put("userEmail", ticket.getUserEmail());
        response.put("userName", ticket.getUserName());
        response.put("ticketType", ticket.getTicketType());
        response.put("issuedAt", ticket.getIssuedAt());
        
        return response;
    }

    @Transactional
    public Map<String, Object> markTicketAsUsed(String ticketCode) {
        Map<String, Object> response = new HashMap<>();
        
        var ticketOpt = ticketAssignmentRepo.findByTicketCode(ticketCode);
        
        if (ticketOpt.isEmpty()) {
            response.put("status", "INVALID");
            response.put("message", "No ticket found with this code.");
            return response;
        }

        TicketAssignment ticket = ticketOpt.get();
        
        if (ticket.isUsed()) {
            response.put("status", "USED");
            response.put("message", "This ticket has already been used.");
            return response;
        }

        ticket.setUsed(true);
        ticketAssignmentRepo.save(ticket);
        
        response.put("status", "SUCCESS");
        response.put("message", "Ticket marked as used successfully.");
        response.put("ticketCode", ticket.getTicketCode());
        
        return response;
    }
} 