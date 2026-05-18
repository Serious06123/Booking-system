package com.example.bookingservice.Respone;

import lombok.Data;
import java.util.UUID;

@Data
public class AuthValidateResponse {
    private boolean valid;
    private UUID userId;
    private String email;
    private String status;
}