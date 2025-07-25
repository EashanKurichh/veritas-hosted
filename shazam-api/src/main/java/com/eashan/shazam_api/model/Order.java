package com.eashan.shazam_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payment_orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String orderId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "concert_id")
    private String concertId;

    private Double amount;

    private String status;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(name = "payment_signature")
    private String paymentSignature;

    private String email;
    private String name;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String ticketDetails;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
} 