import { useCallback, useEffect, useState } from 'react';
import { AppAlert } from '@/components/AppAlert';
import { MainContent, Page, Subtitle } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AdminNav from '../../components/AdminNav';
import { useDialog } from '../../context/DialogContext';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import type { UserAccount } from '../../types';

type UserActionsProps = {
  user: UserAccount;
  actionId: number | null;
  onUnban: (id: number) => void;
  onBan: (id: number) => void;
  onReset: (id: number) => void;
  onDelete: (id: number) => void;
};

/** Ban/Unban · Reset pw · Delete — shared between the mobile list and desktop table. */
function UserActions({ user, actionId, onUnban, onBan, onReset, onDelete }: UserActionsProps) {
  const busy = actionId === user.id;
  return (
    <>
      {user.is_banned ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => onUnban(user.id)}
        >
          Bỏ chặn
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => onBan(user.id)}
        >
          Chặn
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => onReset(user.id)}
      >
        Đặt lại mật khẩu
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => onDelete(user.id)}
        className="text-destructive"
      >
        Xóa
      </Button>
    </>
  );
}

export default function UserManagement() {
  const api = useAuthFetch();
  const { confirm } = useDialog();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState<{ id: number; password: string } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { ok, data } = await api.get<{ users?: UserAccount[] }>('/api/admin/users');
    if (!ok) {
      setError('Không tải được danh sách người dùng');
      setLoading(false);
      return;
    }
    setUsers(data?.users ?? []);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function banUser(id: number) {
    setActionId(id);
    await api.post(`/api/admin/users/${id}/ban`);
    setActionId(null);
    load();
  }

  async function unbanUser(id: number) {
    setActionId(id);
    await api.post(`/api/admin/users/${id}/unban`);
    setActionId(null);
    load();
  }

  async function resetUserPassword(id: number) {
    const proceed = await confirm({
      title: 'Đặt lại mật khẩu?',
      message: 'Hệ thống sẽ tạo mật khẩu mới cho người dùng này.',
      confirmText: 'Generate',
    });
    if (!proceed) return;
    setActionId(id);
    const { ok, data } = await api.post<{ password?: string; error?: string }>(
      `/api/admin/users/${id}/reset-password`,
      {},
    );
    setActionId(null);
    if (ok && data?.password) setResetPassword({ id, password: data.password });
    else setError(data?.error ?? 'Đặt lại thất bại');
  }

  async function deleteUser(id: number) {
    const ok = await confirm({
      title: 'Xóa người dùng?',
      message: 'Các quiz của họ sẽ không còn người sở hữu.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    setActionId(id);
    await api.delete(`/api/admin/users/${id}`);
    setActionId(null);
    load();
  }

  return (
    <Page>
      <AdminNav />
      <MainContent>
        <h1>Quản lý người dùng</h1>
        <Subtitle className="mb-6">Quản lý tài khoản tạo quiz</Subtitle>

        {error && <AppAlert variant="error">{error}</AppAlert>}
        {resetPassword && (
          <AppAlert variant="success">
            Mật khẩu mới của người dùng #{resetPassword.id}: <code>{resetPassword.password}</code>.
            Hãy sao chép ngay; mật khẩu sẽ không hiện lại.
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setResetPassword(null)}
            >
              Đóng
            </Button>
          </AppAlert>
        )}

        {loading ? (
          <p className="text-muted-foreground">Đang tải…</p>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-12 text-center">
              <p className="text-muted-foreground">Chưa có người dùng đăng ký.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <ul className="divide-y divide-border rounded-xl border border-border md:hidden">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{u.username}</span>
                    <span className="block truncate text-sm text-muted-foreground">{u.email}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {u.quiz_count} quiz ·{' '}
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 font-semibold uppercase',
                      u.is_banned
                        ? 'border-border bg-muted text-muted-foreground'
                        : 'border-ok/30 bg-ok/15 text-ok',
                    )}
                  >
                    {u.is_banned ? 'Đã chặn' : 'Đang hoạt động'}
                  </Badge>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <UserActions
                      user={u}
                      actionId={actionId}
                      onUnban={unbanUser}
                      onBan={banUser}
                      onReset={resetUserPassword}
                      onDelete={deleteUser}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <Card className="hidden w-full max-w-6xl overflow-hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Tên</th>
                      <th className="px-4 py-3 font-medium">Bộ câu hỏi</th>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium">Ngày tạo</th>
                      <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0">
                        <td className="max-w-[200px] truncate px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3">{u.quiz_count}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-semibold uppercase',
                              u.is_banned
                                ? 'border-border bg-muted text-muted-foreground'
                                : 'border-ok/30 bg-ok/15 text-ok',
                            )}
                          >
                            {u.is_banned ? 'Đã chặn' : 'Đang hoạt động'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <UserActions
                              user={u}
                              actionId={actionId}
                              onUnban={unbanUser}
                              onBan={banUser}
                              onReset={resetUserPassword}
                              onDelete={deleteUser}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </MainContent>
    </Page>
  );
}
