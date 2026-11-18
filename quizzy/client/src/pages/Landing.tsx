import { ArrowRight, BookOpen, Crown, Gamepad2, Sparkles, Star, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Landing.css';

function Mascot() {
  return <svg className="quizzy-mascot" viewBox="0 0 260 240" role="img" aria-label="Linh vật Quizzy đang mỉm cười">
    <path d="M52 208c7-54 34-71 77-71s72 24 79 71" fill="#fff9ea" stroke="#302016" strokeWidth="6" strokeLinecap="round" />
    <path d="M107 140v20c0 13 43 13 43 0v-20" fill="#ffd6a5" stroke="#302016" strokeWidth="5" />
    <ellipse cx="128" cy="89" rx="66" ry="62" fill="#ffe0ae" stroke="#302016" strokeWidth="6" />
    <path d="M66 79c-7-46 18-70 53-67 20-13 53 1 62 19 24 4 36 27 23 42-20-7-33-18-43-29-16 23-58 19-78 12-2 13-9 20-17 23Z" fill="#6b3d2b" stroke="#302016" strokeWidth="6" strokeLinejoin="round" />
    <ellipse cx="67" cy="101" rx="12" ry="17" fill="#ffe0ae" stroke="#302016" strokeWidth="5" /><ellipse cx="189" cy="101" rx="12" ry="17" fill="#ffe0ae" stroke="#302016" strokeWidth="5" />
    <ellipse cx="105" cy="91" rx="5" ry="8" fill="#302016" /><ellipse cx="151" cy="91" rx="5" ry="8" fill="#302016" />
    <path d="M116 113c7 9 18 9 25 0" fill="none" stroke="#302016" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="85" cy="107" rx="10" ry="5" fill="#ff9d91" opacity=".8" /><ellipse cx="171" cy="107" rx="10" ry="5" fill="#ff9d91" opacity=".8" />
    <path d="M195 164c18-22 23-40 28-58 3-9 13-7 13 2l-2 17 10-13c7-8 17-1 12 8l-19 35c-5 12-13 22-25 31" fill="#ffe0ae" stroke="#302016" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M191 171c12 2 23 9 28 17" fill="none" stroke="#302016" strokeWidth="6" strokeLinecap="round" />
    <path d="m28 56 4-12 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#fff7d7" stroke="#302016" strokeWidth="3" />
  </svg>;
}

function Logo() {
  return <Link to="/" className="quizzy-logo" aria-label="Quizzy, về trang chủ"><span>Q</span><span>U</span><span>I</span><span>Z</span><span>Z</span><span>Y</span><b>✦</b></Link>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [pin, setPin] = useState('');
  const creatorUrl = role === 'super_admin' ? '/admin' : role === 'user' ? '/u' : '/login';

  function joinWithPin(e: FormEvent) {
    e.preventDefault();
    const value = pin.replace(/\D/g, '').slice(0, 8);
    navigate(value ? `/play/${value}` : '/play');
  }

  return <div className="quizzy-home">
    <header className="quizzy-header">
      <Logo />
      <form className="quizzy-pinbar" onSubmit={joinWithPin}><label htmlFor="home-pin">Có mã phòng rồi?</label><input id="home-pin" inputMode="numeric" maxLength={8} placeholder="Nhập mã PIN" value={pin} onChange={(e) => setPin(e.target.value)} /><button type="submit" aria-label="Vào phòng chơi"><ArrowRight size={22} /></button></form>
      <Link className="quizzy-signin" to={creatorUrl}>{role ? 'Quản lý quiz' : 'Đăng nhập'}</Link>
    </header>

    <main>
      <section className="quizzy-intro">
        <div className="quizzy-intro-copy">
          <span className="quizzy-eyebrow"><Sparkles size={16} /> Quiz vui hơn khi chơi cùng nhau</span>
          <h1>Tạo quiz <em>siêu dễ.</em><br />Chơi cùng hội <em>siêu vui!</em></h1>
          <p>Một mã phòng, cả nhóm cùng nhập cuộc. Quản trò điều khiển từng câu hỏi, người chơi trả lời trên điện thoại và đua điểm theo thời gian thực.</p>
          <div className="quizzy-intro-actions"><Link className="quizzy-action quizzy-action-primary" to={creatorUrl}><Crown size={21} /> Tạo phòng chơi <ArrowRight size={19} /></Link><Link className="quizzy-action quizzy-action-secondary" to="/play"><Gamepad2 size={22} /> Tham gia ngay</Link></div>
          <div className="quizzy-mini-proof"><span>✦</span> Không cần cài app <span>✦</span> Vào bằng PIN hoặc QR</div>
        </div>
        <div className="quizzy-intro-art" aria-hidden="true"><span className="quizzy-art-star one">✦</span><span className="quizzy-art-star two">★</span><div className="quizzy-art-bubble top">+1000 điểm! ⭐</div><Mascot /><div className="quizzy-art-bubble bottom">Sẵn sàng chưa? 🎉</div></div>
      </section>

      <section className="quizzy-role-section" aria-labelledby="role-title">
        <div className="quizzy-section-head"><div><span className="quizzy-kicker">BẮT ĐẦU THÔI</span><h2 id="role-title">Bạn sẽ chơi theo cách nào?</h2></div><span className="quizzy-head-sparkle">✳</span></div>
        <div className="quizzy-role-grid">
          <Link to={creatorUrl} className="quizzy-role-card quizzy-host-card"><div className="quizzy-role-icon"><Crown size={26} /></div><div className="quizzy-role-copy"><span className="quizzy-role-tag">DÀNH CHO QUẢN TRÒ</span><h3>Tạo một quiz thật chất</h3><p>Soạn câu hỏi, mở phòng và dẫn dắt cuộc chơi theo cách của bạn.</p><span className="quizzy-role-link">Vào trang quản lý <ArrowRight size={18} /></span></div><span className="quizzy-role-deco">✦</span></Link>
          <Link to="/play" className="quizzy-role-card quizzy-player-card"><div className="quizzy-role-icon"><Gamepad2 size={27} /></div><div className="quizzy-role-copy"><span className="quizzy-role-tag">DÀNH CHO NGƯỜI CHƠI</span><h3>Nhập PIN, quẩy hết mình</h3><p>Chọn avatar, trả lời thật nhanh và xem mình đứng thứ mấy.</p><span className="quizzy-role-link">Vào phòng chơi <ArrowRight size={18} /></span></div><span className="quizzy-role-deco">★</span></Link>
        </div>
      </section>

      <section className="quizzy-steps" aria-labelledby="steps-title"><div className="quizzy-section-head"><div><span className="quizzy-kicker">CÁCH CHƠI</span><h2 id="steps-title">Ba bước là vào cuộc 🎈</h2></div></div><div className="quizzy-step-grid"><div className="quizzy-step"><span className="quizzy-step-icon orange"><BookOpen size={29} /></span><b>01</b><h3>Tạo quiz</h3><p>Quản trò chọn câu hỏi và mở phòng chơi.</p></div><div className="quizzy-step"><span className="quizzy-step-icon mint"><Users size={29} /></span><b>02</b><h3>Rủ bạn bè</h3><p>Chia sẻ mã PIN hoặc mã QR để cả nhóm vào phòng.</p></div><div className="quizzy-step"><span className="quizzy-step-icon pink"><Star size={29} /></span><b>03</b><h3>Đua điểm</h3><p>Trả lời trước khi hết giờ và leo lên bảng xếp hạng.</p></div></div></section>
    </main>
    <footer className="quizzy-footer"><Logo /><span>Cùng chơi, cùng cười, cùng nhớ mãi. ✨</span></footer>
  </div>;
}
