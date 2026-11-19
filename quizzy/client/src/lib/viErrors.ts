const messages: Record<string, string> = {
  'Unauthorized': 'Bạn cần đăng nhập lại.',
  'Super admin only': 'Chỉ quản trị viên cao nhất được thực hiện thao tác này.',
  'This account has been banned': 'Tài khoản này đã bị chặn.',
  'Invalid credentials': 'Tên đăng nhập hoặc mật khẩu không đúng.',
  'Authentication failed': 'Xác thực thất bại.',
  'Invalid email address': 'Địa chỉ email không hợp lệ.',
  'An account with this email already exists': 'Email này đã được đăng ký.',
  'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'New password must be at least 6 characters': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
  'newPassword must be at least 6 characters': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
  'Current password incorrect': 'Mật khẩu hiện tại không đúng.',
  'Username is required': 'Hãy nhập tên đăng nhập.',
  'Display name is required': 'Hãy nhập tên hiển thị.',
  'User accounts only': 'Chỉ tài khoản người dùng được thực hiện thao tác này.',
  'User not found': 'Không tìm thấy người dùng.',
  'Admin not found': 'Không tìm thấy quản trị viên.',
  'Quiz not found': 'Không tìm thấy quiz.',
  'Session not found': 'Không tìm thấy phiên chơi.',
  'Invalid session id': 'Mã phiên chơi không hợp lệ.',
  'Session is full': 'Phòng đã đủ người.',
  'Session not active': 'Phiên chơi chưa bắt đầu.',
  'Invalid PIN': 'Mã PIN không hợp lệ.',
  'Game has ended': 'Trò chơi đã kết thúc.',
  'Game already started': 'Trò chơi đã bắt đầu.',
  'No presentation game found for this PIN': 'Không tìm thấy màn hình chiếu cho mã PIN này.',
  'Username required': 'Hãy nhập tên người chơi.',
  'Answer not found': 'Không tìm thấy câu trả lời.',
  'Question bank is not available': 'Ngân hàng câu hỏi hiện không khả dụng.',
  'Public URL must be a valid http(s) URL': 'Địa chỉ công khai phải là URL http(s) hợp lệ.',
  'Avatar not found': 'Không tìm thấy avatar.',
  'No valid images provided': 'Không có tệp ảnh hợp lệ.',
  'Every translated question needs an options array': 'Mỗi câu dịch cần có mảng "options".',
  'Every translated question needs text': 'Mỗi câu dịch cần có nội dung.',
  'dataUrls array is required': 'Thiếu danh sách ảnh tải lên.',
  'locale is required': 'Hãy chọn ngôn ngữ.',
  'questions are required': 'Hãy thêm câu hỏi.',
  'title and at least one question are required': 'Hãy nhập tiêu đề và ít nhất một câu hỏi.',
  'url is required': 'Hãy nhập URL.',
  'Not found': 'Không tìm thấy nội dung.',
  'Media provider request failed': 'Không tải được nội dung đa phương tiện.',
  'Unknown or unavailable provider': 'Nguồn nội dung không khả dụng.',
  'Registration failed': 'Đăng ký thất bại.',
  'Password change failed': 'Đổi mật khẩu thất bại.',
  'Super admin password is managed via environment variables': 'Mật khẩu quản trị viên cao nhất được lưu trên máy chủ.',
};

export function translateError(message: string): string {
  const domain = message.match(/^Registration is restricted to @(.+) email addresses$/);
  if (domain) return `Chỉ email có đuôi @${domain[1]} mới được đăng ký.`;
  const count = message.match(/^Translation has (\d+) question\(s\), quiz has (\d+)\. They must match in count and order\.$/);
  if (count) return `Bản dịch có ${count[1]} câu, quiz gốc có ${count[2]} câu. Số lượng và thứ tự phải giống nhau.`;
  return messages[message] ?? message;
}
