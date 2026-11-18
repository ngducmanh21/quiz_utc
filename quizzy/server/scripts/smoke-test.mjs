import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

const base = `http://localhost:${process.env.APP_PORT || 3000}`;
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error('ADMIN_PASSWORD is required');

async function request(path, method = 'GET', body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

function event(socket, name, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${name}`)), timeout);
    socket.once(name, (data) => { clearTimeout(timer); resolve(data); });
  });
}

const sockets = [];
let quizId;
let token;
try {
  ({ token } = await request('/api/auth/login', 'POST', { email: process.env.ADMIN_USERNAME || 'admin', password }));
  const quiz = await request('/api/admin/quizzes', 'POST', {
    title: 'Smoke test Quizzy', language: 'vi',
    questions: [{ text: 'Thủ đô Việt Nam là gì?', options: ['Hà Nội', 'Huế', 'Đà Nẵng', 'Cần Thơ'], correctIndex: 0, baseScore: 500, timeSec: 15 }],
  }, token);
  quizId = quiz.id;
  const session = await request('/api/admin/sessions', 'POST', { quizId }, token);
  assert.match(session.pin, /^\d{6}$/);

  const host = io(base, { transports: ['websocket'] });
  const p1 = io(base, { transports: ['websocket'] });
  const p2 = io(base, { transports: ['websocket'] });
  sockets.push(host, p1, p2);
  await Promise.all(sockets.map((socket) => event(socket, 'connect')));

  const hostReady = event(host, 'session:state');
  host.emit('admin:join-session', { sessionId: session.id, token });
  await hostReady;
  const joined1 = event(p1, 'player:joined');
  const joined2 = event(p2, 'player:joined');
  p1.emit('player:join', { pin: session.pin, username: 'Mèo Cam' });
  p2.emit('player:join', { pin: session.pin, username: 'Gấu Bông' });
  const [player1, player2] = await Promise.all([joined1, joined2]);
  assert.equal(player1.sessionId, session.id);
  assert.equal(player2.sessionId, session.id);

  const q1 = event(p1, 'game:question', 12000);
  const q2 = event(p2, 'game:question', 12000);
  host.emit('admin:start-game', { sessionId: session.id, token });
  const [question1, question2] = await Promise.all([q1, q2]);
  assert.equal(question1.text, 'Thủ đô Việt Nam là gì?');
  assert.equal(question1.questionId, question2.questionId);
  assert.equal('correctIndex' in question1, false);

  const answer1 = event(p1, 'player:answer-received');
  const answer2 = event(p2, 'player:answer-received');
  const results = event(host, 'game:question-results');
  p1.emit('player:answer', { sessionId: session.id, questionId: question1.questionId, playerId: player1.playerId, chosenIndex: question1.options.indexOf('Hà Nội') });
  p2.emit('player:answer', { sessionId: session.id, questionId: question2.questionId, playerId: player2.playerId, chosenIndex: question2.options.indexOf('Huế') });
  const [a1, a2] = await Promise.all([answer1, answer2]);
  assert.equal(a1.isCorrect, true);
  assert.equal(a2.isCorrect, false);
  await results;
  const ended = event(host, 'game:ended');
  host.emit('admin:end-game', { sessionId: session.id, token });
  await ended;
  console.log('OK: admin login, room PIN, two players, question, scoring and results');
} finally {
  sockets.forEach((socket) => socket.disconnect());
  if (quizId && token) await request(`/api/admin/quizzes/${quizId}`, 'DELETE', undefined, token);
}
