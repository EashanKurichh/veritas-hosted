package com.eashan.shazam_api.service;

import com.eashan.shazam_api.model.TicketAssignment;
import com.eashan.shazam_api.repository.TicketAssignmentRepository;
import com.eashan.shazam_api.model.Ticket;
import com.eashan.shazam_api.repository.TicketRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private final TicketService ticketService;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final TicketAssignmentRepository ticketAssignmentRepository;
    private final TicketRepository ticketRepo;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(TicketService ticketService, ObjectMapper objectMapper,
            TicketAssignmentRepository ticketAssignmentRepository, EmailService emailService,
            TicketRepository ticketRepo) {
        this.ticketService = ticketService;
        this.ticketAssignmentRepository = ticketAssignmentRepository;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.ticketRepo = ticketRepo;
    }

    public Map<String, Object> createOrder(Map<String, Object> orderRequest) throws RazorpayException {
        logger.info("Creating new order with Razorpay");
        
        try {
            // Initialize RazorpayClient with key_id and key_secret
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Prepare order JSON
            JSONObject orderJson = new JSONObject();
            
            // Convert amount to paise (multiply by 100) and ensure it's an integer
            long amountInPaise = Math.round(((Number) orderRequest.get("amount")).doubleValue() * 100);
            orderJson.put("amount", amountInPaise);
            orderJson.put("currency", "INR");
            orderJson.put("receipt", "order_" + System.currentTimeMillis());
            
            // Add notes for reference
            JSONObject notes = new JSONObject();
            notes.put("concertId", orderRequest.get("concertId"));
            notes.put("userId", orderRequest.get("userId"));
            notes.put("ticketDetails", objectMapper.writeValueAsString(orderRequest.get("ticketDetails")));
            orderJson.put("notes", notes);

            // Create order
            Order order = razorpay.orders.create(orderJson);
            logger.info("Order created successfully: {}", order.toString());

            // Return only necessary information to frontend
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key_id", razorpayKeyId); // Only expose public key
            response.put("prefill", new HashMap<String, String>() {{
                put("name", (String) orderRequest.get("name"));
                put("email", (String) orderRequest.get("email"));
                put("contact", (String) orderRequest.get("phone"));
            }});
            
            return response;
        } catch (JsonProcessingException e) {
            logger.error("Error processing ticket details JSON: {}", e.getMessage());
            throw new RazorpayException("Error processing ticket details: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating Razorpay order: {}", e.getMessage());
            throw new RazorpayException(e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderDetails(String orderId) {
        List<TicketAssignment> tickets = ticketAssignmentRepository.findByOrderId(orderId);
        if (tickets.isEmpty()) {
            throw new RuntimeException("Order not found");
        }

        TicketAssignment firstTicket = tickets.get(0);
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("concertName", firstTicket.getConcertName());
        response.put("userEmail", firstTicket.getUserEmail());
        response.put("userName", firstTicket.getUserName());
        
        // Calculate total amount from ticket details using AtomicReference
        AtomicReference<BigDecimal> totalAmount = new AtomicReference<>(BigDecimal.ZERO);
        List<Map<String, Object>> ticketDetails = tickets.stream()
            .map(ticket -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("code", ticket.getTicketCode());
                detail.put("type", ticket.getTicketType());
                detail.put("price", ticket.getPrice());
                totalAmount.set(totalAmount.get().add(ticket.getPrice()));
                return detail;
            })
            .collect(Collectors.toList());
        
        response.put("tickets", ticketDetails);
        response.put("amount", totalAmount.get().doubleValue());
        return response;
    }

    @Transactional
    public Map<String, Object> verifyPayment(Map<String, Object> paymentDetails) {
        try {
            String orderId = (String) paymentDetails.get("orderId");
            String paymentId = (String) paymentDetails.get("paymentId");
            String signature = (String) paymentDetails.get("signature");
            String concertId = (String) paymentDetails.get("concertId");
            String concertName = (String) paymentDetails.get("concertName");
            Object ticketDetailsObj = paymentDetails.get("ticketDetails");
            String userEmail = (String) paymentDetails.get("email");
            String userName = (String) paymentDetails.get("name");

            logger.info("Payment details received - orderId: {}, concertId: {}, concertName: {}, email: {}", 
                orderId, concertId, concertName, userEmail);

            // Verify payment signature
            String data = orderId + "|" + paymentId;
            String generatedSignature = generateHmacSha256(data, razorpayKeySecret);
            boolean isValid = signature.equals(generatedSignature);

            Map<String, Object> response = new HashMap<>();
            response.put("success", isValid);

            if (isValid) {
                if (concertId == null || ticketDetailsObj == null || userEmail == null || concertName == null) {
                    logger.error("Missing required fields - concertId: {}, ticketDetails: {}, email: {}, concertName: {}", 
                        concertId, ticketDetailsObj, userEmail, concertName);
                    response.put("success", false);
                    response.put("message", "Missing required payment details");
                    return response;
                }

                String ticketDetailsJson;
                try {
                    if (ticketDetailsObj instanceof String) {
                        ticketDetailsJson = (String) ticketDetailsObj;
                    } else {
                        ticketDetailsJson = objectMapper.writeValueAsString(ticketDetailsObj);
                    }
                    
                    logger.info("Updating ticket quantities for concert: {}", concertId);
                    boolean quantitiesUpdated = ticketService.updateTicketQuantities(concertId, ticketDetailsJson);
                    if (quantitiesUpdated) {
                        // Assign tickets & send emails
                        assignTicketsAndSendEmails(concertId, concertName, ticketDetailsJson, userEmail, userName, orderId);
                        response.put("message", "Payment processed successfully");
                    } else {
                        response.put("success", false);
                        response.put("message", "Failed to update ticket quantities");
                    }
                } catch (JsonProcessingException e) {
                    logger.error("Error processing ticket details JSON: {}", e.getMessage());
                    response.put("success", false);
                    response.put("message", "Error processing ticket details");
                }
            } else {
                response.put("message", "Invalid payment signature");
            }
            
            return response;
        } catch (Exception e) {
            logger.error("Error verifying payment: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment verification failed: " + e.getMessage());
            return response;
        }
    }

    private String generateHmacSha256(String data, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] signatureBytes = sha256Hmac.doFinal(data.getBytes());
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : signatureBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
    @Transactional
    public void assignTicketsAndSendEmails(String concertId, String concertName, String ticketDetailsJson, String userEmail, String userName, String orderId) throws JsonProcessingException {
        // Parse ticket details JSON (list of {ticketType, quantity, price})
        List<Map<String, Object>> tickets = objectMapper.readValue(ticketDetailsJson, new com.fasterxml.jackson.core.type.TypeReference<>() {});

        for (Map<String, Object> ticketDetail : tickets) {
            int quantity = (int) ticketDetail.get("quantity");
            String ticketType = (String) ticketDetail.get("ticketType");
            BigDecimal price = new BigDecimal(ticketDetail.get("price").toString());

            for (int i = 0; i < quantity; i++) {
                String ticketCode = generateTicketCode();

                TicketAssignment ta = new TicketAssignment();
                ta.setTicketCode(ticketCode);
                ta.setUserEmail(userEmail);
                ta.setUserName(userName);
                ta.setConcertId(concertId);
                ta.setConcertName(concertName);
                ta.setTicketType(ticketType);
                ta.setPrice(price);
                ta.setIssuedAt(java.time.LocalDateTime.now());
                ta.setUsed(false);
                ta.setOrderId(orderId);

                ticketAssignmentRepository.save(ta);

                // Send ticket email
                emailService.sendTicketEmail(ta);
            }
        }
    }

    // Move your existing generateTicketCode() method here or keep it private in this class
    private String generateTicketCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.util.Random rand = new java.util.Random();
        return "VI-" + randomChunk(rand, chars, 4) + "-" + randomChunk(rand, chars, 4);
    }

    private String randomChunk(java.util.Random rand, String chars, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(rand.nextInt(chars.length())));
        }
        return sb.toString();
    }

} 