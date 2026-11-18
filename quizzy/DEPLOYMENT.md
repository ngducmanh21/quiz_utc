# Triển khai Quizzy

Ứng dụng gồm hai phần:

- **Vercel:** giao diện React/Vite trong `client/`.
- **EC2:** Express, Socket.IO và SQLite trong `server/`, chạy bằng Docker Compose với ổ đĩa bền cho `data/`.

Vercel project `quiz-utc` đã được cấu hình với root directory `quizzy/client`, build command `npm run build` và output directory `dist`. Chưa nối Git hoặc deploy production cho đến khi có endpoint HTTPS của EC2; giao diện cần `/api`, `/socket.io` và `/avatars` từ server.

Khi EC2 sẵn sàng:

1. Cài Docker và Docker Compose, clone repo, tạo `.env` với `ADMIN_PASSWORD` và `JWT_SECRET` mạnh. Không commit `.env`.
2. Gắn ổ đĩa bền vào thư mục `data/`. Chạy `docker compose up --build -d`.
3. Cấp endpoint HTTPS cho backend và kiểm tra `/api/public` cùng kết nối Socket.IO qua endpoint đó.
4. Thêm các rewrite trên Vercel: `/api/:path*`, `/socket.io/:path*` và `/avatars/:path*` tới endpoint backend; giữ SPA fallback sau cùng.
5. Đặt `PUBLIC_URL` của backend thành URL Vercel để mã QR dẫn người chơi về giao diện chính. Nối GitHub, deploy và thử hai thiết bị ngoài mạng LAN.

Không đưa SQLite vào Vercel Function: filesystem của Function không lưu dữ liệu ứng dụng bền qua các lần chạy.
