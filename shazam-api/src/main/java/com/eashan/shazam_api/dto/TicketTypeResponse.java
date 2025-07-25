package com.eashan.shazam_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeResponse {
    private String typeName;
    private Double price;
    private Integer quantity;
} 