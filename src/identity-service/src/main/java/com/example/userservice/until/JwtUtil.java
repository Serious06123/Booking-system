package com.example.userservice.until;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    // Chìa khóa bí mật để ký token (Tuyệt đối không để lộ).
    // Trong thực tế nên để ở file application.properties
    private final String JWT_SECRET = "SbPuBBxZq31p9wwLbM28LntlgGplwqJCzR7kgSqhZWa";

    // Thời gian sống của token: 86400 giây = 24 giờ
    private final long JWT_EXPIRATION = 86400000L;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    // Hàm 1: Tạo ra Token khi đăng nhập thành công
    public String generateToken(UUID userId, String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(userId.toString()) // Lưu userId làm thông tin chính
                .claim("email", email)         // Lưu thêm email
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Hàm 2: Lấy UserId từ Token
    public UUID getUserIdFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return UUID.fromString(claims.getSubject());
    }

    // Hàm 3: Kiểm tra Token có hợp lệ không (còn hạn không, bị chế cháo không)
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            // Token hết hạn, sai chữ ký,
            System.out.println("Lỗi JWT: " + ex.getMessage());
            return false;
        }
    }
}