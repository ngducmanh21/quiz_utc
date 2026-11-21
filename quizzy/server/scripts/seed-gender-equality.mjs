import { readFile } from 'node:fs/promises';

const base = `http://localhost:${process.env.APP_PORT || 3000}`;
if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required');

async function api(path, method = 'GET', body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${result.error ?? ''}`);
  return result;
}

const payload = JSON.parse(
  await readFile(new URL('../assets/binh-dang-gioi.json', import.meta.url), 'utf8'),
);
const { token } = await api('/api/auth/login', 'POST', {
  email: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD,
});
const quizzes = await api('/api/admin/quizzes', 'GET', undefined, token);
let quiz = quizzes.find((item) => item.title === payload.title);
if (!quiz) {
  const created = await api('/api/admin/quizzes', 'POST', payload, token);
  quiz = { id: created.id };
  console.log(`Đã tạo bộ 15 câu hỏi #${quiz.id}`);
} else {
  console.log(`Bộ câu hỏi đã có sẵn #${quiz.id}`);
}

if (process.argv.includes('--create-session')) {
  const sessions = await api('/api/admin/sessions', 'GET', undefined, token);
  let session = sessions.find((item) => item.quiz_id === quiz.id && item.status === 'waiting');
  if (!session) {
    session = await api('/api/admin/sessions', 'POST', {
      quizId: quiz.id,
      presentationMode: true,
      chooseQuizMaker: false,
    }, token);
  }
  const joinBase = (process.env.PUBLIC_URL || base).replace(/\/+$/, '');
  console.log(JSON.stringify({
    quizId: quiz.id,
    sessionId: session.id,
    pin: session.pin,
    joinUrl: `${joinBase}/play/${session.pin}`,
    screenUrl: `${joinBase}/screen/${session.pin}`,
    hostUrl: `${joinBase}/admin/game/${session.id}`,
  }, null, 2));
}
