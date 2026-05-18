package com.example.bookingservice.Controller;

import org.springframework.beans.factory.annotation.Value;import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    // TIỆT CHIÊU DEVOPS: Lấy URL từ biến môi trường
    @Value("${USER_SERVICE_URL}")
    private String userServiceUrl;

    @GetMapping("/create")
    public ResponseEntity<String> createBooking() {
        RestTemplate restTemplate = new RestTemplate();

        try {
            // Gọi sang User Service
            String url = userServiceUrl + "/api/users/validate";
            String userResponse = restTemplate.getForObject(url, String.class);

            if ("VALID_USER".equals(userResponse)) {
                return ResponseEntity.ok("Tạo Booking thành công! Đã gọi qua User Service OK.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi gọi User Service: " + e.getMessage());
        }

        return ResponseEntity.badRequest().body("User đéo hợp lệ!");
    }
}