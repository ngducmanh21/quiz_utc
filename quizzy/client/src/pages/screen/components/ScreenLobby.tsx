import { QRCodeSVG } from 'qrcode.react';
import { EventBrand } from '@/components/EventBrand';
import { LobbyPlayers } from '@/components/game/LobbyPlayers';
import { useApp } from '@/context/AppContext';
import { publicBaseUrl } from '@/helpers';
import type { PlayerInfo } from '@/types';
import './ScreenLobby.css';

interface Props {
  pin: string;
  title: string;
  players: PlayerInfo[];
}

export function ScreenLobby({ pin, title, players }: Props) {
  const { publicUrl } = useApp();
  const baseUrl = publicBaseUrl(publicUrl);
  const joinUrl = `${baseUrl}/play/${pin}`;

  return (
    <div className="screen-lobby-event flex flex-1 flex-col">
      <EventBrand compact className="screen-lobby-event-brand" />
      <div className="mx-auto grid w-full max-w-[1800px] flex-1 items-center gap-8 p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:p-10">
      <div className="flex min-w-0 flex-col items-center gap-3 text-center">
        <div className="text-2xl font-bold">Quét mã để tham gia</div>
        <div className="w-full max-w-[min(46vh,420px)] rounded-3xl bg-white p-5">
          <QRCodeSVG
            value={joinUrl}
            title={`Liên kết tham gia: ${joinUrl}`}
            level="M"
            size={380}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        <div className="pin-display">{pin}</div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <h1 className="text-center font-extrabold" style={{ fontSize: 'clamp(2rem, 4vw, 4.5rem)' }}>
          {title}
        </h1>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-2xl font-semibold">
            {players.length} người chơi đã tham gia
          </div>
          <LobbyPlayers players={players} />
        </div>
      </div>
      </div>
    </div>
  );
}
