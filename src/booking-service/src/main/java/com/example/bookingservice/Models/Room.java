package com.example.bookingservice.Models;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "bookings")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "room_code", nullable = false, unique = true)
    private String roomCode;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "price", nullable = false)
    private BigDecimal price; // Dùng BigDecimal cho kiểu decimal để tránh sai số tiền tệ

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RoomStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Version
    @Column(name = "version")
    private Long version;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Booking> bookings;
}