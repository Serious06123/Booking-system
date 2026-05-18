package com.example.bookingservice.Models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

// Trong RoomService
@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // LIÊN KẾT BẰNG ID THUẦN (Không dùng @ManyToOne sang User nữa)
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Mối quan hệ nội bộ với Room thì vẫn giữ nguyên vì cùng 1 Service quản lý
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private LocalDateTime bookingDate;
    private LocalDateTime createdAt;
}