const base = `http://localhost:${process.env.APP_PORT || 3000}`;
if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required');

async function api(path, method = 'GET', body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  return result;
}

const { token } = await api('/api/auth/login', 'POST', {
  email: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD,
});
const title = 'Đố vui khởi động 🌟';
const existing = await api('/api/admin/quizzes', 'GET', undefined, token);
if (existing.some((quiz) => quiz.title === title)) {
  console.log('Quiz mẫu đã có sẵn');
  process.exit(0);
}

const questions = [
  ['Thủ đô Việt Nam là thành phố nào?', ['Hà Nội', 'Huế', 'Đà Nẵng', 'Cần Thơ'], 0],
  ['Hành tinh nào được gọi là Hành tinh Đỏ?', ['Sao Kim', 'Sao Hỏa', 'Sao Thổ', 'Sao Mộc'], 1],
  ['Một chú bạch tuộc có mấy cánh tay?', ['6', '7', '8', '10'], 2],
  ['Đỏ pha với vàng thường tạo ra màu gì?', ['Tím', 'Xanh lá', 'Cam', 'Nâu'], 2],
  ['Loài vật nào nổi tiếng với chiếc cổ rất dài?', ['Voi', 'Hươu cao cổ', 'Ngựa vằn', 'Gấu trúc'], 1],
].map(([text, options, correctIndex]) => ({ text, options, correctIndex, baseScore: 500, timeSec: 20 }));

const created = await api('/api/admin/quizzes', 'POST', {
  title,
  description: '5 câu hỏi vui để thử phòng chơi cùng bạn bè.',
  language: 'vi',
  questions,
}, token);
console.log(`Đã tạo quiz mẫu #${created.id}`);
