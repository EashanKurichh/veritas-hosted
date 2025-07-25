package com.eashan.shazam_api.model;

import com.eashan.shazam_api.Enum.TicketPageType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Ticket {
    @Id
    @GeneratedValue
    private Long id;

    @Column(columnDefinition = "VARCHAR(36)")
    private String concertId;

    @Enumerated(EnumType.STRING)
    private TicketPageType pageType;

    private LocalDateTime availableFrom;

    private String bookingUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL)
    private List<TicketType> ticketTypes = new ArrayList<>();

    // Getters & Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getConcertId() {
        return concertId;
    }
    public void setConcertId(String concertId) {
        this.concertId = concertId;
    }

    public TicketPageType getPageType() {
        return pageType;
    }
    public void setPageType(TicketPageType pageType) {
        this.pageType = pageType;
    }

    public LocalDateTime getAvailableFrom() {
        return availableFrom;
    }
    public void setAvailableFrom(LocalDateTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public String getBookingUrl() {
        return bookingUrl;
    }
    public void setBookingUrl(String bookingUrl) {
        this.bookingUrl = bookingUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<TicketType> getTicketTypes() {
        return ticketTypes;
    }
    public void setTicketTypes(List<TicketType> ticketTypes) {
        this.ticketTypes = ticketTypes;
    }
}
