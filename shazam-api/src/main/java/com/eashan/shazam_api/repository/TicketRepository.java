package com.eashan.shazam_api.repository;

import com.eashan.shazam_api.model.Ticket;
import com.eashan.shazam_api.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByBookingUrlEndingWith(String uuid);
    Optional<Ticket> findByConcertId(String concertId);
    Optional<Ticket> findFirstByConcertIdOrderByCreatedAtDesc(String concertId);
}

