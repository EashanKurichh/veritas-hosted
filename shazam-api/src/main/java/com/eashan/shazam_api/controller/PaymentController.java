package com.eashan.shazam_api.controller;

import com.eashan.shazam_api.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            logger.info("Creating order for request: {}", orderRequest);
            Map<String, Object> response = paymentService.createOrder(orderRequest);
            logger.info("Order created successfully");
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            logger.error("Failed to create order", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> paymentDetails) {
        try {
            logger.info("Verifying payment: {}", paymentDetails);
            Map<String, Object> result = paymentService.verifyPayment(paymentDetails);
            
            if (result.get("success").equals(true)) {
                logger.info("Payment verified successfully");
                return ResponseEntity.ok(result);
            } else {
                logger.warn("Invalid payment signature");
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Invalid payment signature"));
            }
        } catch (Exception e) {
            logger.error("Payment verification failed", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Payment verification failed"));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        try {
            Map<String, Object> orderDetails = paymentService.getOrderDetails(orderId);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            logger.error("Failed to fetch order details", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch order details"));
        }
    }
} 