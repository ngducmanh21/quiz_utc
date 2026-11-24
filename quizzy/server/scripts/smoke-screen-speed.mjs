import assert from 'node:assert/strict';
import { io } from 'socket.io-client';

const base = process.env.API_BASE || `http://localhost:${process.env.APP_PORT || 3000}`;
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

function event(socket, name, timeout = 12000, matches = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(name, listener);
      reject(new Error(`Timed out waiting for ${name}`));
    }, timeout);
    function listener(data) {
      if (!matches(data)) return;
      clearTimeout(timer);
      socket.off(name, listener);
      resolve(data);
    }
    socket.on(name, listener);
  });
}

const sockets = [];
let quizId;
let token;
try {
  ({ token } = await api('/api/auth/login', 'POST', {
    email: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
  }));
  ({ id: quizId } = await api('/api/admin/quizzes', 'POST', {
    title: 'Kiểm thử bảng tốc độ',
    language: 'vi',
    questions: [
      { text: 'Câu một', options: ['Đúng', 'Sai'], correctIndex: 0, timeSec: 4 },
      { text: 'Câu hai', options: ['Đúng', 'Sai'], correctIndex: 0, timeSec: 4 },
    ],
  }, token));
  const session = await api('/api/admin/sessions', 'POST', {
    quizId,
    presentationMode: true,
  }, token);

  const host = io(base, { transports: ['websocket'] });
  const screen = io(base, { transports: ['websocket'] });
  const first = io(base, { transports: ['websocket'] });
  const second = io(base, { transports: ['websocket'] });
  sockets.push(host, screen, first, second);
  await Promise.all(sockets.map((socket) => event(socket, 'connect')));

  const hostReady = event(host, 'session:state');
  const screenReady = event(screen, 'screen:state');
  host.emit('admin:join-session', { sessionId: session.id, token });
  screen.emit('screen:join', { pin: session.pin });
  await Promise.all([hostReady, screenReady]);

  const firstJoined = event(first, 'player:joined');
  const secondJoined = event(second, 'player:joined');
  first.emit('player:join', { pin: session.pin, username: 'Nhanh' });
  second.emit('player:join', { pin: session.pin, username: 'Chậm' });
  const [p1, p2] = await Promise.all([firstJoined, secondJoined]);

  const screenQuestion = event(screen, 'game:question');
  const firstQuestion = event(first, 'game:question');
  const secondQuestion = event(second, 'game:question');
  host.emit('admin:start-game', { sessionId: session.id, token });
  const [shown, q1, q2] = await Promise.all([screenQuestion, firstQuestion, secondQuestion]);
  assert.equal(shown.text, 'Câu một');
  const firstRoundStartedAt = Date.now();

  const speedFirst = event(screen, 'game:speed-leaderboard', 12000, (data) => data.entries.length === 1);
  const firstReceived = event(first, 'player:answer-received');
  first.emit('player:answer', {
    sessionId: session.id, questionId: q1.questionId, playerId: p1.playerId,
    chosenIndex: q1.options.indexOf('Đúng'),
  });
  await firstReceived;
  const firstBoard = await speedFirst;
  assert.equal(firstBoard.entries[0].username, 'Nhanh');

  await new Promise((resolve) => setTimeout(resolve, 500));
  const speedSecond = event(screen, 'game:speed-leaderboard', 12000, (data) => data.entries.length === 2);
  const resultsReady = event(screen, 'game:question-results', 3500);
  const playerResultsReady = event(first, 'game:question-results', 3500);
  const secondReceived = event(second, 'player:answer-received');
  second.emit('player:answer', {
    sessionId: session.id, questionId: q2.questionId, playerId: p2.playerId,
    chosenIndex: q2.options.indexOf('Đúng'),
  });
  await secondReceived;
  const board = await speedSecond;
  assert.deepEqual(board.entries.map((entry) => entry.username), ['Nhanh', 'Chậm']);
  assert.ok(board.entries[0].elapsedMs < board.entries[1].elapsedMs);

  // Everyone answered, so phones and the big screen reveal before the timer.
  const results = await resultsReady;
  assert.equal(results.questionId, q1.questionId);
  assert.equal((await playerResultsReady).questionId, q1.questionId);
  assert.ok(Date.now() - firstRoundStartedAt < 3500);
  const fast = results.leaderboard.find((entry) => entry.username === 'Nhanh');
  const slow = results.leaderboard.find((entry) => entry.username === 'Chậm');
  assert.ok(fast.questionScore > slow.questionScore, 'faster correct answer should earn more points');
  assert.equal(results.autoAdvanceSec, 5);
  const next = await event(screen, 'game:question', 8000);
  assert.equal(next.text, 'Câu hai');

  // No one answers the second question: its timer and the result countdown
  // still finish the game with no admin click.
  const secondResults = await event(screen, 'game:question-results', 8000);
  assert.equal(secondResults.questionId, next.questionId);
  const ended = event(host, 'game:ended', 8000);
  await ended;
  console.log('OK: hiện kết quả khi đủ đáp án, thưởng người nhanh hơn, tự chuyển và tự kết thúc');
} finally {
  sockets.forEach((socket) => socket.disconnect());
  if (quizId && token) await api(`/api/admin/quizzes/${quizId}`, 'DELETE', undefined, token);
}
