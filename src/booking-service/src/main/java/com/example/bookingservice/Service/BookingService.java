package com.example.bookingservice.Service;
import com.example.bookingservice.Repository.BookingRepository;
import com.example.bookingservice.Repository.RoomRepository;
import com.example.bookingservice.Respone.AuthValidateResponse;
import com.example.bookingservice.Request.BookingRequest;
import com.example.bookingservice.Models.Booking;
import com.example.bookingservice.Models.Room;
import com.example.bookingservice.Models.RoomStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final UserClientService userClientService;

    // Bắt buộc phải có @Transactional để nếu lưu lỗi thì nó rollback (hoàn tác) lại toàn bộ
    @Transactional
    public Map<String, Object> createBooking(String bearerToken, BookingRequest request) {

        // 1. Gọi sang UserService để xác thực Token
        AuthValidateResponse authResponse = userClientService.validateToken(bearerToken);

        if (!authResponse.isValid()) {
            throw new RuntimeException("UNAUTHORIZED"); // Tí ra Controller bắt lỗi sau
        }

        // 2. Tìm phòng trong DB
        Optional<Room> roomOpt = roomRepository.findById(request.getRoomId());
        if (roomOpt.isEmpty()) {
            throw new RuntimeException("ROOM_NOT_FOUND");
        }

        Room room = roomOpt.get();

        // 3. Kiểm tra xem phòng có trống không
        if (room.getStatus() == RoomStatus.BOOKED) {
            throw new RuntimeException("ROOM_ALREADY_BOOKED");
        }

        // 4. Đổi trạng thái phòng
        room.setStatus(RoomStatus.BOOKED);
        // Lúc này Hibernate chưa lưu ngay đâu, nó cứ cầm Object Room (đang có version cũ) ở đó.

        // 5. Tạo thông tin Booking
        Booking booking = new Booking();
        booking.setUserId(authResponse.getUserId());
        booking.setRoom(room);
        booking.setBookingDate(LocalDateTime.now());
        booking.setCreatedAt(LocalDateTime.now());

        // 6. Lưu xuống DB
        bookingRepository.save(booking);
        // Khi hàm này kết thúc (do có @Transactional), Hibernate mới ồ ạt ghi xuống DB.
        // Nó sẽ chạy câu SQL: UPDATE rooms SET status='BOOKED', version=2 WHERE id=... AND version=1.
        // Nếu lúc này version không còn là 1 (do thằng khác nhanh tay giành mất),
        // nó sẽ ném ra lỗi ObjectOptimisticLockingFailureException!

        // Tạo data trả về
        Map<String, Object> data = new HashMap<>();
        data.put("bookingId", booking.getId());
        data.put("roomCode", room.getRoomCode());
        data.put("bookedByUserId", authResponse.getUserId());
        data.put("status", "BOOKED");

        return data;
    }
}