package com.eashan.shazam_api.dto;

import java.math.BigDecimal;

public class TicketTypeRequest {
    private String typeName;
    private BigDecimal price;
    private int quantity;
    // Getters and Setters
    public String getTypeName() {
        return typeName;
    }
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
