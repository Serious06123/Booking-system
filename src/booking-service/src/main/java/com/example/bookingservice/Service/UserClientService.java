package com.example.bookingservice.Service;

import com.example.bookingservice.Respone.AuthValidateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class UserClientService {

    private final RestTemplate restTemplate;

    // Lấy URL http://localhost:8080 từ file config của bác
    @Value("${USER_SERVICE_URL}")
    private String userServiceUrl;

    public AuthValidateResponse validateToken(String bearerToken) {
        // 1. Chuẩn bị Header (giống như nhét thông tin vào phong bì)
        HttpHeaders headers = new HttpHeaders();
        // Nhét token của khách vào để UserService kiểm tra
        headers.set("Authorization", bearerToken);
        // Nhét mật khẩu nội bộ để UserService biết đây là "người nhà" gọi
        headers.set("X-Internal-Secret", "your-internal-service-secret");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 2. Thực hiện cuộc gọi HTTP GET sang UserService
            ResponseEntity<AuthValidateResponse> response = restTemplate.exchange(
                    userServiceUrl + "/api/auth/validate",
                    HttpMethod.GET,
                    entity,
                    AuthValidateResponse.class // Dặn Spring Boot ép JSON về class này
            );

            return response.getBody(); // Trả về kết quả ngon lành

        } catch (Exception e) {
            // 3. Nếu đứt mạng, UserService chết, hoặc lỗi gì đó...
            System.out.println("Toang! Lỗi gọi sang UserService: " + e.getMessage());

            // Trả về một object fail cho an toàn
            AuthValidateResponse failResponse = new AuthValidateResponse();
            failResponse.setValid(false);
            return failResponse;
        }
    }
}