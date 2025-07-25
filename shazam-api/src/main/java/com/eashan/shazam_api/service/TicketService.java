package com.eashan.shazam_api.service;

import com.eashan.shazam_api.Enum.TicketPageType;
import com.eashan.shazam_api.dto.TicketRequest;
import com.eashan.shazam_api.dto.TicketTypeRequest;
import com.eashan.shazam_api.model.Ticket;
import com.eashan.shazam_api.model.TicketType;
import com.eashan.shazam_api.repository.TicketRepository;
import com.eashan.shazam_api.repository.TicketTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.ZoneId;
import java.util.*;

@Service
public class TicketService {
    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    @Autowired private TicketRepository ticketRepo;
    @Autowired private TicketTypeRepository typeRepo;
    @Autowired private ObjectMapper objectMapper;

    @Transactional
    public String createTicketFlow(TicketRequest request) {
        logger.info("Creating ticket flow for concert: {}", request.getConcertId());
        
        // Check if a ticket already exists for this concert
        Ticket ticket = ticketRepo.findByConcertId(request.getConcertId())
                .orElse(new Ticket());
        
        // Update existing ticket or set new values
        ticket.setConcertId(request.getConcertId());
        ticket.setPageType(request.getPageType());
        ticket.setAvailableFrom(request.getAvailableFrom());

        // Generate booking URL only if it doesn't exist or if it's a new ticket
        if (ticket.getBookingUrl() == null || ticket.getId() == null) {
            String url = generateBookingUrl(ticket);
            ticket.setBookingUrl(url);
        }

        // Save or update the ticket
        ticket = ticketRepo.save(ticket);
        logger.info("Saved ticket with ID: {} for concert: {}", ticket.getId(), ticket.getConcertId());

        // Clear existing ticket types if any
        if (ticket.getTicketTypes() != null) {
            typeRepo.deleteAll(ticket.getTicketTypes());
            ticket.getTicketTypes().clear();
            logger.info("Cleared existing ticket types for concert: {}", ticket.getConcertId());
        }

        // Add new ticket types
        if (request.getPageType() == TicketPageType.BOOKABLE && request.getTicketTypes() != null) {
            logger.info("Adding {} ticket types for concert: {}", request.getTicketTypes().size(), ticket.getConcertId());
            List<TicketType> newTypes = new ArrayList<>();
            
            for (TicketTypeRequest ttr : request.getTicketTypes()) {
                TicketType type = new TicketType();
                type.setTypeName(ttr.getTypeName());
                type.setPrice(ttr.getPrice());
                type.setQuantity(ttr.getQuantity());
                type.setTicket(ticket);
                type = typeRepo.save(type);
                newTypes.add(type);
                logger.info("Added ticket type: {} with quantity: {} for concert: {}", 
                    type.getTypeName(), type.getQuantity(), ticket.getConcertId());
            }
            
            ticket.setTicketTypes(newTypes);
            ticket = ticketRepo.save(ticket);
        }

        return ticket.getBookingUrl();
    }

    @Transactional
    public boolean updateTicketQuantities(String concertId, String ticketDetails) {
        try {
            logger.info("Updating ticket quantities for concert: {}", concertId);
            
            // Parse ticketDetails JSON string as an array of objects
            List<Map<String, Object>> ticketList = objectMapper.readValue(
                ticketDetails, 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            // Find the ticket for this concert using UUID string
            Ticket ticket = ticketRepo.findByConcertId(concertId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found for concert: " + concertId));

            // Update quantities for each ticket type
            for (Map<String, Object> ticketItem : ticketList) {
                String typeName = (String) ticketItem.get("ticketType");
                Integer quantityPurchased = (Integer) ticketItem.get("quantity");

                if (typeName == null || quantityPurchased == null) {
                    logger.error("Invalid ticket details format: missing ticketType or quantity");
                    throw new RuntimeException("Invalid ticket details format");
                }

                // Find the ticket type
                Optional<TicketType> ticketTypeOpt = ticket.getTicketTypes().stream()
                    .filter(type -> type.getTypeName().equals(typeName.trim()))
                    .findFirst();

                if (ticketTypeOpt.isPresent()) {
                    TicketType ticketType = ticketTypeOpt.get();
                    int remainingQuantity = ticketType.getQuantity() - quantityPurchased;
                    
                    if (remainingQuantity < 0) {
                        logger.error("Not enough tickets available for type: {}", typeName);
                        throw new RuntimeException("Not enough tickets available for type: " + typeName);
                    }
                    
                    ticketType.setQuantity(remainingQuantity);
                    typeRepo.save(ticketType);
                    logger.info("Updated quantity for ticket type {}: {} remaining", typeName, remainingQuantity);
                } else {
                    logger.error("Ticket type not found: {}", typeName);
                    throw new RuntimeException("Ticket type not found: " + typeName);
                }
            }
            
            return true;
        } catch (Exception e) {
            logger.error("Error updating ticket quantities: {}", e.getMessage());
            throw new RuntimeException("Failed to update ticket quantities: " + e.getMessage());
        }
    }

    private String generateBookingUrl(Ticket ticket) {
        String uuid = UUID.randomUUID().toString();
        return "/book-ticket/" + uuid;
    }
}
