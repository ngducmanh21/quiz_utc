# Triển khai Quizzy

Ứng dụng gồm hai phần:

- **Vercel:** giao diện React/Vite trong `client/`.
- **EC2:** Express, Socket.IO và SQLite trong `server/`, chạy bằng Docker Compose với ổ đĩa bền cho `data/`.

Vercel project `quiz-utc` đã được cấu hình với root directory `quizzy/client`, build command `npm run build` và output directory `dist`. Người chơi dùng URL Vercel; `/api` và `/avatars` được rewrite tới backend HTTPS, còn Socket.IO kết nối trực tiếp tới backend qua `VITE_SOCKET_ORIGIN` để WebSocket hoạt động ổn định.

Khi EC2 sẵn sàng:

1. Cài Docker và Docker Compose, clone repo, tạo `.env` với `ADMIN_PASSWORD` và `JWT_SECRET` mạnh. Không commit `.env`.
2. Gắn ổ đĩa bền vào thư mục `data/`. Chạy `docker compose up --build -d`.
3. Cấp endpoint HTTPS cho backend và kiểm tra `/api/public` cùng kết nối Socket.IO qua endpoint đó.
4. Kiểm tra các rewrite trong `client/vercel.json` và `VITE_SOCKET_ORIGIN` trong `client/.env.production` trỏ đến backend HTTPS.
5. Đặt `PUBLIC_URL` của backend thành URL Vercel để mã QR dẫn người chơi về giao diện chính. Nối GitHub, deploy và thử hai thiết bị ngoài mạng LAN.

Không đưa SQLite vào Vercel Function: filesystem của Function không lưu dữ liệu ứng dụng bền qua các lần chạy.

Mục tiêu hiện tại là 1000 người đồng thời. `maxPlayersPerSession` mặc định đã đặt thành 1000 trong code. Đây là giới hạn cấu hình, chưa phải kết quả kiểm thử tải. Trên EC2, dùng `server/scripts/load-test.mjs` để đo p95/p99 join, trả lời, event loop lag, SQLite latency và bộ nhớ trước khi mở sự kiện thật.
