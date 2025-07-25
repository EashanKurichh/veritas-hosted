package com.eashan.shazam_api.exceptions;

import com.eashan.shazam_api.dto.SignupRequest;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }

}
