import { Timer, Trophy } from 'lucide-react';
import { AvatarDisplay } from '@/components/AvatarPicker';
import { Card, CardContent } from '@/components/ui/card';
import type { SpeedLeaderboardEntry } from '@/types';

interface Props {
  entries: SpeedLeaderboardEntry[];
  answeredCount: number;
  totalPlayers: number;
}

export function ScreenSpeedLeaderboard({ entries, answeredCount, totalPlayers }: Props) {
  return (
    <Card className="w-full self-stretch">
      <CardContent className="flex h-full flex-col p-5 lg:p-7">
        <h2 className="flex items-center gap-2 text-xl font-extrabold lg:text-2xl">
          <Trophy className="size-6 text-primary" /> Bảng tốc độ
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {answeredCount}/{totalPlayers} người đã trả lời
        </p>
        {entries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8 text-center text-muted-foreground">
            Đang chờ câu trả lời đầu tiên…
          </div>
        ) : (
          <ol className="mt-5 flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.playerId}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-[var(--surface2)] px-3 py-2"
              >
                <span className="w-7 shrink-0 text-center text-lg font-extrabold text-primary">
                  {entry.rank}
                </span>
                <AvatarDisplay avatar={entry.avatar} size={32} />
                <span className="min-w-0 flex-1 truncate font-semibold">{entry.username}</span>
                <span className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums">
                  <Timer className="size-4 text-muted-foreground" />
                  {entry.elapsedMs === null ? '—' : `${(entry.elapsedMs / 1000).toFixed(1)}s`}
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-auto pt-5 text-xs text-muted-foreground">
          Xếp theo lúc gửi đáp án. Điểm và đáp án đúng hiện sau khi hết giờ.
        </p>
      </CardContent>
    </Card>
  );
}
