package com.eashan.shazam_api.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class TicketType {
    @Id
    @GeneratedValue
    private Long id;

    private String typeName;
    private BigDecimal price;
    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    // Getters & Setters


    public void setId(Long id) {
        this.id = id;
    }
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
    public Long getId() {
        return id;
    }
    public String getTypeName() {
        return typeName;
    }
    public BigDecimal getPrice() {
        return price;
    }
    public int getQuantity() {
        return quantity;
    }
    public Ticket getTicket() {
        return ticket;
    }
}
