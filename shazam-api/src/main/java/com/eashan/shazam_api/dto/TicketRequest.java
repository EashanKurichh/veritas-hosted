package com.eashan.shazam_api.dto;

import com.eashan.shazam_api.Enum.TicketPageType;

import java.time.LocalDateTime;
import java.util.List;

public class TicketRequest {
    private String concertId;
    private TicketPageType pageType;
    private LocalDateTime availableFrom; // only if AVAILABLE_LATER
    private List<TicketTypeRequest> ticketTypes; // only if BOOKABLE

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

    public List<TicketTypeRequest> getTicketTypes() {
        return ticketTypes;
    }

    public void setTicketTypes(List<TicketTypeRequest> ticketTypes) {
        this.ticketTypes = ticketTypes;
    }
}
