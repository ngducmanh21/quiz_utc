import { Zap } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppAlert } from '@/components/AppAlert';
import { AppLogo, AuthCard, PageCenter, Subtitle } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/Input';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function UserRegister() {
  const { registerUser } = useAuth();
  const { appName, allowedDomain } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const domainHint = allowedDomain ? `@${allowedDomain}` : 'configured domain';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await registerUser(email, password, username);
    setLoading(false);
    if (err) setError(err);
    else navigate('/u/my-games');
  }

  return (
    <PageCenter>
      <AuthCard>
        <div className="text-center mb-6">
          <AppLogo>
            {appName || (
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-4" /> Quizzy
              </span>
            )}
          </AppLogo>
          <Subtitle className="mt-2">Tạo tài khoản người chơi để lưu lịch sử và kết quả</Subtitle>
          {allowedDomain && (
            <p className="text-muted-foreground text-sm mt-2">
              Hãy dùng email có đuôi {domainHint}
            </p>
          )}
        </div>

        {error && <AppAlert variant="error">{error}</AppAlert>}

        {!allowedDomain && (
          <AppAlert variant="error" className="mb-4">
            Hiện chưa mở đăng ký tài khoản.
          </AppAlert>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder={allowedDomain ? `ten@${allowedDomain}` : 'ten@email.vn'}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!allowedDomain}
          />
          <Input
            id="username"
            label="Tên hiển thị"
            type="text"
            autoComplete="username"
            placeholder="Tên của bạn"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!allowedDomain}
          />
          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            autoComplete="new-password"
            placeholder="Ít nhất 6 ký tự"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!allowedDomain}
          />
          <Button
            type="submit"
            disabled={loading || !allowedDomain}
            variant="default"
            size="lg"
            className="mt-2 w-full"
          >
            {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
        <p className="text-center text-muted-foreground text-sm mt-2">
          <Link to="/play">Tham gia trò chơi</Link> · <Link to="/">Trang chủ</Link>
        </p>
      </AuthCard>
    </PageCenter>
  );
}
