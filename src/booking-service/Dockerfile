# Giai đoạn 1: Build (Sử dụng JDK 17)
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy các file cấu hình để cache dependencies
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew

# Tải dependencies trước (giúp build nhanh hơn ở những lần sau)
RUN ./gradlew build -x test --no-daemon > /dev/null 2>&1 || true

# Copy mã nguồn và đóng gói file JAR
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon

# Giai đoạn 2: Runtime (Sử dụng JRE 17 cho nhẹ và bảo mật)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy file .jar đã build từ Stage 1 sang
# Spring Boot thường tạo file jar trong thư mục build/libs/
COPY --from=build /app/build/libs/*.jar app.jar

# Khai báo Port (Spring Boot mặc định là 8080)
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]