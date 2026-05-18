package com.example.bookingservice.Request;
import lombok.Data;
import java.util.UUID;

@Data
public class BookingRequest {
    private UUID roomId;
}