import { ArrowRight, BookOpen, Crown, Gamepad2, Star, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EventBrand } from '@/components/EventBrand';
import { useAuth } from '@/context/AuthContext';
import './Landing.css';

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
      <section className="event-hero" aria-label="Tọa đàm Bình đẳng giới">
        <div className="event-hero-glow" aria-hidden="true" />
        <span className="event-hero-spark event-hero-spark-one" aria-hidden="true">✦</span>
        <span className="event-hero-spark event-hero-spark-two" aria-hidden="true">✧</span>
        <div className="event-hero-content">
          <EventBrand />
          <div className="event-hero-actions">
            <Link className="quizzy-action quizzy-action-primary" to="/play"><Gamepad2 size={22} /> Tham gia quiz <ArrowRight size={19} /></Link>
            <Link className="quizzy-action quizzy-action-secondary" to={creatorUrl}><Crown size={21} /> Dành cho quản trò</Link>
          </div>
          <p className="event-hero-hint">Nhập mã PIN hoặc quét mã QR trên màn hình để cùng chơi.</p>
        </div>
        <div className="event-hero-poster-wrap"><img className="event-hero-poster" src="/event/poster.png" alt="Poster tọa đàm Bình đẳng giới" /></div>
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
