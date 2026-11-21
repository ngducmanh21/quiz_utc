import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

const base = `http://localhost:${process.env.APP_PORT || 3000}`;
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error('ADMIN_PASSWORD is required');

async function api(path, method = 'GET', body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  return data;
}

function event(socket, name, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${name}`)), timeout);
    socket.once(name, (data) => { clearTimeout(timer); resolve(data); });
  });
}

const sockets = [];
let quizId;
let token;
try {
  ({ token } = await api('/api/auth/login', 'POST', {
    email: process.env.ADMIN_USERNAME || 'admin', password,
  }));
  ({ id: quizId } = await api('/api/admin/quizzes', 'POST', {
    title: 'Kiểm thử điểm theo thời gian', language: 'vi',
    questions: [{
      text: 'Chọn đáp án đúng', options: ['Đúng', 'Sai', 'Khác', 'Không biết'],
      correctIndex: 0, baseScore: 500, timeSec: 10, tags: ['X2 điểm'],
    }],
  }, token));
  const session = await api('/api/admin/sessions', 'POST', { quizId }, token);
  const host = io(base, { transports: ['websocket'] });
  const early = io(base, { transports: ['websocket'] });
  const late = io(base, { transports: ['websocket'] });
  sockets.push(host, early, late);
  await Promise.all(sockets.map((socket) => event(socket, 'connect')));

  const ready = event(host, 'session:state');
  host.emit('admin:join-session', { sessionId: session.id, token });
  await ready;
  const earlyJoined = event(early, 'player:joined');
  const lateJoined = event(late, 'player:joined');
  early.emit('player:join', { pin: session.pin, username: 'Trả lời nhanh' });
  late.emit('player:join', { pin: session.pin, username: 'Trả lời chậm' });
  const [p1, p2] = await Promise.all([earlyJoined, lateJoined]);

  const q1 = event(early, 'game:question');
  const q2 = event(late, 'game:question');
  host.emit('admin:start-game', {
    sessionId: session.id, token,
    gameSettings: { streakBonusEnabled: false, jokersEnabled: { pass: false, fiftyFifty: false } },
  });
  const [firstQuestion, secondQuestion] = await Promise.all([q1, q2]);
  assert.equal(firstQuestion.scoreMultiplier, 2);
  assert.equal(secondQuestion.scoreMultiplier, 2);

  const firstScore = event(early, 'player:answer-received');
  early.emit('player:answer', {
    sessionId: session.id, questionId: firstQuestion.questionId,
    playerId: p1.playerId, chosenIndex: firstQuestion.options.indexOf('Đúng'),
  });
  const fast = await firstScore;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const secondScore = event(late, 'player:answer-received');
  late.emit('player:answer', {
    sessionId: session.id, questionId: secondQuestion.questionId,
    playerId: p2.playerId, chosenIndex: secondQuestion.options.indexOf('Đúng'),
  });
  const slow = await secondScore;
  assert.equal(fast.isCorrect, true);
  assert.equal(slow.isCorrect, true);
  assert.ok(fast.score > slow.score, `faster ${fast.score} should beat slower ${slow.score}`);
  assert.ok(fast.score > 1000 && slow.score > 1000, 'X2 must apply to base and speed points');

  const ended = event(host, 'game:ended');
  host.emit('admin:end-game', { sessionId: session.id, token });
  const final = await ended;
  assert.equal(final.leaderboard[0].username, 'Trả lời nhanh');
  console.log(`OK: X2 điểm, nhanh ${fast.score} > chậm ${slow.score}, người thắng đứng đầu`);
} finally {
  sockets.forEach((socket) => socket.disconnect());
  if (quizId && token) await api(`/api/admin/quizzes/${quizId}`, 'DELETE', undefined, token);
}
