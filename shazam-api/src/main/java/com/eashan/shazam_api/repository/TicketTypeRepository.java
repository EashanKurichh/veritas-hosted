package com.eashan.shazam_api.repository;

import com.eashan.shazam_api.model.Ticket;
import com.eashan.shazam_api.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    List<TicketType> findByTicket(Ticket ticket);
}