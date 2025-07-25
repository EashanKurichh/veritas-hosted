package com.eashan.shazam_api.dto;

import com.eashan.shazam_api.Enum.TicketPageType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class TicketDetailsResponse {
    private String concertId;
    private TicketPageType pageType;
    private LocalDateTime availableFrom;
    private String bookingUrl;
    private List<TicketTypeInfo> ticketTypes;

    public static class TicketTypeInfo {
        private String typeName;
        private BigDecimal price;
        private int quantity;

        public TicketTypeInfo(String typeName, BigDecimal price, int quantity) {
            this.typeName = typeName;
            this.price = price;
            this.quantity = quantity;
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
    }

    // Getters and setters
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

    public List<TicketTypeInfo> getTicketTypes() {
        return ticketTypes;
    }

    public void setTicketTypes(List<TicketTypeInfo> ticketTypes) {
        this.ticketTypes = ticketTypes;
    }
}