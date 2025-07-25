package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.dto.TicketDetailsResponse;
import com.eashan.shazam_api.dto.TicketRequest;
import com.eashan.shazam_api.dto.TicketTypeResponse;
import com.eashan.shazam_api.model.Ticket;
import com.eashan.shazam_api.model.TicketType;
import com.eashan.shazam_api.repository.TicketRepository;
import com.eashan.shazam_api.repository.TicketTypeRepository;
import com.eashan.shazam_api.service.TicketService;
import com.eashan.shazam_api.Enum.TicketPageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @Autowired
    private TicketRepository ticketRepo;

    @Autowired
    private TicketTypeRepository typeRepo;
    
    @Autowired
    private TicketService ticketService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Map<String, String>> createTicket(
            @RequestBody TicketRequest request,
            @RequestHeader(value = "X-Timezone-Offset", required = false, defaultValue = "-330") int timezoneOffset
    ) {
        // Convert the availableFrom time to IST
        if (request.getAvailableFrom() != null) {
            LocalDateTime utcTime = request.getAvailableFrom();
            LocalDateTime istTime = utcTime.atZone(ZoneOffset.UTC)
                    .withZoneSameInstant(IST_ZONE)
                    .toLocalDateTime();
            request.setAvailableFrom(istTime);
        }
        
        String url = ticketService.createTicketFlow(request);
        Map<String, String> response = new HashMap<>();
        response.put("bookingUrl", url);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<TicketDetailsResponse> getTicketDetails(
            @PathVariable String uuid,
            @RequestHeader(value = "X-Timezone-Offset", required = false, defaultValue = "-330") int timezoneOffset
    ) {
        Ticket ticket = ticketRepo.findByBookingUrlEndingWith(uuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        List<TicketType> types = typeRepo.findByTicket(ticket);

        // Check if the ticket is available based on availableFrom date in IST
        if (ticket.getPageType() == TicketPageType.AVAILABLE_LATER) {
            LocalDateTime nowIST = LocalDateTime.now(IST_ZONE);
            if (ticket.getAvailableFrom() != null && nowIST.isBefore(ticket.getAvailableFrom())) {
                // Return the response with AVAILABLE_LATER status
                TicketDetailsResponse response = new TicketDetailsResponse();
                response.setConcertId(ticket.getConcertId());
                response.setPageType(TicketPageType.AVAILABLE_LATER);
                response.setAvailableFrom(ticket.getAvailableFrom());
                response.setBookingUrl(ticket.getBookingUrl());
                return ResponseEntity.ok(response);
            }
        }

        TicketDetailsResponse response = new TicketDetailsResponse();
        response.setConcertId(ticket.getConcertId());
        response.setPageType(ticket.getPageType());
        
        // Return the availableFrom time in IST
        if (ticket.getAvailableFrom() != null) {
            response.setAvailableFrom(ticket.getAvailableFrom());
        } else {
            response.setAvailableFrom(null);
        }
        
        response.setBookingUrl(ticket.getBookingUrl());
        response.setTicketTypes(
                types.stream().map(type ->
                        new TicketDetailsResponse.TicketTypeInfo(
                                type.getTypeName(),
                                type.getPrice(),
                                type.getQuantity())
                ).toList()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/concert/{concertId}")
    public ResponseEntity<TicketDetailsResponse> getTicketDetailsByConcertId(
            @PathVariable String concertId,
            @RequestHeader(value = "X-Timezone-Offset", required = false, defaultValue = "-330") int timezoneOffset
    ) {
        try {
            // Get the most recently created ticket for this concert
            Ticket ticket = ticketRepo.findFirstByConcertIdOrderByCreatedAtDesc(concertId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

            List<TicketType> types = typeRepo.findByTicket(ticket);

            TicketDetailsResponse response = new TicketDetailsResponse();
            response.setConcertId(ticket.getConcertId());
            response.setPageType(ticket.getPageType());
            response.setAvailableFrom(ticket.getAvailableFrom());
            response.setBookingUrl(ticket.getBookingUrl());
            response.setTicketTypes(
                types.stream()
                    .map(type -> new TicketDetailsResponse.TicketTypeInfo(
                        type.getTypeName(),
                        type.getPrice(),
                        type.getQuantity()
                    ))
                    .collect(Collectors.toList())
            );

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch ticket details");
        }
    }
}
