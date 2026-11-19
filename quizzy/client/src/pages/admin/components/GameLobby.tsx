import { QRCodeSVG } from 'qrcode.react';
import { LobbyPlayers } from '@/components/game/LobbyPlayers';
import { QuizIntroCard } from '@/components/game/QuizIntroCard';
import { MainContent } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlayerInfo, QuizIntro } from '@/types';

interface Props {
  quizTitle?: string;
  questionCount: number;
  intro?: QuizIntro | null;
  pin: string;
  shareUrl: string;
  players: PlayerInfo[];
  onStart: () => void;
  onDiscard: () => void;
  onCopyLink: () => void;
}

export function GameLobby({
  quizTitle,
  questionCount,
  intro,
  pin,
  shareUrl,
  players,
  onStart,
  onDiscard,
  onCopyLink,
}: Props) {
  let joinHost = shareUrl;
  try {
    joinHost = new URL(shareUrl).host;
  } catch {
    /* keep raw shareUrl */
  }

  return (
    <MainContent>
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
          Hủy phiên
        </Button>
      </div>

      {intro ? (
        <QuizIntroCard intro={intro} layout="row" typesHeading="Các loại câu hỏi" className="mb-9" />
      ) : (
        <div className="mb-6">
          <h1>{quizTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {questionCount} câu hỏi
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Tham gia trò chơi</div>
        <div className="text-[15px] text-muted-foreground">
          Truy cập <strong className="text-foreground">{joinHost}</strong> và nhập mã PIN này
        </div>

        <div className="pin-display mt-1">{pin}</div>

        <div className="mt-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
          <QRCodeSVG
            value={shareUrl}
            title={`Quét để tham gia phòng ${pin}`}
            size={188}
            level="M"
            role="img"
            aria-label={`Mã QR tham gia phòng ${pin}`}
          />
        </div>
        <p className="text-sm text-muted-foreground">Người chơi quét mã QR để vào cùng phòng.</p>

        {/* Share link */}
        <div className="mt-3 flex w-full max-w-[440px] gap-2">
          <Input
            readOnly
            value={shareUrl}
            className="flex-1"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button type="button" variant="secondary" onClick={onCopyLink}>
            Sao chép
          </Button>
        </div>

        <div className="mt-5 mb-3 text-sm font-semibold text-muted-foreground">
          {players.length} người chơi đã tham gia
        </div>

        <LobbyPlayers players={players} />

        <Button
          type="button"
          size="lg"
          onClick={onStart}
          disabled={players.length === 0}
          className="mt-8 rounded-2xl border-none bg-gradient-to-br from-brand-strong to-brand px-8 py-[15px] text-[17px] font-bold text-primary-foreground hover:opacity-95"
        >
          Bắt đầu chơi →
        </Button>
      </div>
    </MainContent>
  );
}
