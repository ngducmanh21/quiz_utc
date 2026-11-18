# Triển khai Quizzy

Ứng dụng gồm hai phần:

- **Vercel:** giao diện React/Vite trong `client/`.
- **EC2:** Express, Socket.IO và SQLite trong `server/`, chạy bằng Docker Compose với ổ đĩa bền cho `data/`.

Vercel project `quiz-utc` đã được cấu hình với root directory `quizzy/client`, build command `npm run build` và output directory `dist`. Người chơi dùng URL Vercel; `/api` và `/avatars` được rewrite tới backend HTTPS, còn Socket.IO kết nối trực tiếp tới backend qua `VITE_SOCKET_ORIGIN` để WebSocket hoạt động ổn định.

Triển khai đang chạy tại `https://quiz-utc.vercel.app`. Backend kỹ thuật nằm tại `https://api.52-220-214-13.sslip.io` trên EC2 `i-0dbd3c026db17a5da` (Singapore). Dữ liệu SQLite nằm trong `data/` trên ổ root EBS gp3 50 GiB có mã hóa; ổ này được giữ khi instance bị terminate và cần xóa riêng nếu không còn dùng.

Để tái triển khai:

1. Cài Docker và Docker Compose, clone repo, tạo `.env` với `ADMIN_PASSWORD` và `JWT_SECRET` mạnh. Không commit `.env`.
2. Đặt repo trên ổ EBS bền để thư mục `data/` tồn tại qua các lần khởi động lại. Chạy `docker compose --profile caddy up -d --build`.
3. Cấp endpoint HTTPS cho backend và kiểm tra `/api/public` cùng kết nối Socket.IO qua endpoint đó.
4. Kiểm tra các rewrite trong `client/vercel.json` và `VITE_SOCKET_ORIGIN` trong `client/.env.production` trỏ đến backend HTTPS.
5. Đặt `PUBLIC_URL=https://quiz-utc.vercel.app` trong `.env` của backend để mã QR dẫn người chơi về giao diện chính. Thử hai thiết bị ngoài mạng LAN sau mỗi thay đổi lớn.

Không đưa SQLite vào Vercel Function: filesystem của Function không lưu dữ liệu ứng dụng bền qua các lần chạy.

Mục tiêu hiện tại là 1000 người đồng thời. `maxPlayersPerSession` mặc định đã đặt thành 1000 trong code. Giới hạn cấu hình không tự bảo đảm sức tải; dùng `server/scripts/load-test.mjs` để đo p95/p99 join, trả lời, event loop lag, SQLite latency và bộ nhớ.

## Kiểm thử tải ngày 19/11/2026

Trên EC2 `m7i.xlarge` ở Singapore, chạy 1000 bot trong một phòng với 2 câu hỏi, mỗi câu 10 giây, trả lời phân bố trong 2 giây. Kết quả sau tối ưu broadcast:

- Vào phòng: 1000/1000 thành công; p95 2,605 ms.
- Trả lời: 2000 lượt; p95 2,990 ms, p99 3,372 ms.
- Lỗi kết nối: 0; RSS cao nhất 325 MB.

Bot và server chạy trên cùng EC2, nên phép thử này xác nhận logic, CPU và SQLite trong điều kiện cục bộ. Trước sự kiện thật, nên thử thêm từ các thiết bị hoặc mạng bên ngoài và theo dõi giám sát khi tải cao.
