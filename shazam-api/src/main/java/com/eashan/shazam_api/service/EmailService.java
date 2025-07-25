package com.eashan.shazam_api.service;

import com.eashan.shazam_api.model.TicketAssignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendTicketEmail(TicketAssignment ta) {
        String content = """
            Hi %s,
            
            Thank you for your booking for concert : %s.
            
            🎟 Your Ticket Code: %s
            Ticket Type: %s
            
            Please show this code at the concert entry.
            
            """.formatted(ta.getUserName(),ta.getConcertName(), ta.getTicketCode(), ta.getTicketType());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(ta.getUserEmail());
        message.setSubject("Your Concert Ticket");
        message.setText(content);
        mailSender.send(message);
    }
}