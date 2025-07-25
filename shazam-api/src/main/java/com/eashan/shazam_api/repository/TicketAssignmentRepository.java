package com.eashan.shazam_api.repository;

import com.eashan.shazam_api.model.TicketAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketAssignmentRepository extends JpaRepository<TicketAssignment, Long> {
    Optional<TicketAssignment> findByTicketCode(String code);
    List<TicketAssignment> findByOrderId(String orderId);
}