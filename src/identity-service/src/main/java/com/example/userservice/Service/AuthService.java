package com.example.userservice.Service;

import com.example.userservice.Model.User;
import com.example.userservice.Model.UserStatus;
import com.example.userservice.Repository.UserRepository;
import com.example.userservice.Request.SigninRequest;
import com.example.userservice.Request.SignupRequest;
import com.example.userservice.until.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 1. Logic Đăng ký
    public User registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return null; // Trả về null để Controller biết là trùng email
        }

        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setStatus(UserStatus.ACTIVE.name());
        newUser.setCreatedAt(LocalDateTime.now());

        return userRepository.save(newUser);
    }

    // 2. Logic Đăng nhập
    public Map<String, Object> authenticateUser(SigninRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        // Check sai email hoặc sai pass
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            return null;
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("fullName", user.getFullName());
        userData.put("email", user.getEmail());

        Map<String, Object> tokenData = new HashMap<>();
        tokenData.put("token", token);
        tokenData.put("tokenType", "Bearer");
        tokenData.put("expiresIn", 86400);
        tokenData.put("user", userData);

        return tokenData;
    }

    // 3. Logic Validate Token
    public Map<String, Object> validateAndGetUser(String token) {
        Map<String, Object> response = new HashMap<>();

        if (jwtUtil.validateToken(token)) {
            UUID userId = jwtUtil.getUserIdFromJWT(token);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent() && userOpt.get().getStatus().equals(UserStatus.ACTIVE.name())) {
                User user = userOpt.get();
                response.put("valid", true);
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("status", user.getStatus());
                return response;
            }
        }

        // Token xịt hoặc user bị khóa
        response.put("valid", false);
        response.put("userId", null);
        response.put("email", null);
        response.put("status", null);
        return response;
    }
}