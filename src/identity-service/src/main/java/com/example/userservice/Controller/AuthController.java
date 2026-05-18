package com.example.userservice.Controller;

import com.example.userservice.Model.User;
import com.example.userservice.Request.SigninRequest;
import com.example.userservice.Request.SignupRequest;
import com.example.userservice.Service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. API Đăng ký
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        Map<String, Object> response = new HashMap<>();
        User newUser = authService.registerUser(request);

        if (newUser == null) {
            response.put("success", false);
            response.put("message", "Email đã được sử dụng");
            response.put("data", null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", newUser.getId());
        data.put("fullName", newUser.getFullName());
        data.put("email", newUser.getEmail());
        data.put("createdAt", newUser.getCreatedAt());

        response.put("success", true);
        response.put("message", "Tạo tài khoản thành công");
        response.put("data", data);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. API Đăng nhập
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> tokenData = authService.authenticateUser(request);

        if (tokenData == null) {
            response.put("success", false);
            response.put("message", "Sai email hoặc mật khẩu");
            response.put("data", null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("success", true);
        response.put("message", "Đăng nhập thành công");
        response.put("data", tokenData);

        return ResponseEntity.ok(response);
    }

    // 3. API Validate Token (Internal)
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request,
                                           @RequestHeader(value = "X-Internal-Secret", required = false) String secret) {

        if (!"your-internal-service-secret".equals(secret)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Internal Secret");
        }

        String bearerToken;
        bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            Map<String, Object> validateResult = authService.validateAndGetUser(token);
            return ResponseEntity.ok(validateResult);
        }

        // Trường hợp không có header Authorization hoặc sai format
        Map<String, Object> failResponse = new HashMap<>();
        failResponse.put("valid", false);
        failResponse.put("userId", null);
        failResponse.put("email", null);
        failResponse.put("status", null);

        return ResponseEntity.ok(failResponse);
    }
}