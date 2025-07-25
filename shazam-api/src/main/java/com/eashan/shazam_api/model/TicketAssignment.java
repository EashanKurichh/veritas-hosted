package com.eashan.shazam_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
public class TicketAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ticketCode;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String concertId;

    @Column(nullable = false)
    private String concertName;

    @Column(nullable = false)
    private String ticketType;

    @Column(name = "order_id", nullable = false, columnDefinition = "VARCHAR(255)")
    private String orderId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private LocalDateTime issuedAt;

    private boolean used = false;

    // Optional: Reference to order if you implement Order entity
    @ManyToOne(optional = true)
    @JoinColumn(name = "order_entity_id")
    private Order order;
}
