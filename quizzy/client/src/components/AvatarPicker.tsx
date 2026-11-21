import { RotateCcw, Upload } from 'lucide-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchAvatarUrls } from '@/lib/avatars';

const AVATAR_KEY = 'quizz_avatar';

const BUILTIN_AVATARS = [
  { url: '/characters/fox.svg', label: 'Cáo cam' },
  { url: '/characters/frog.svg', label: 'Ếch xanh' },
  { url: '/characters/cat.svg', label: 'Mèo tím' },
  { url: '/characters/bunny.svg', label: 'Thỏ hồng' },
  { url: '/characters/robot.svg', label: 'Robot xanh' },
  { url: '/characters/bear.svg', label: 'Gấu nâu' },
  { url: '/characters/penguin.svg', label: 'Cánh cụt' },
  { url: '/characters/alien.svg', label: 'Bạn ngoài hành tinh' },
];

// Emoji fallbacks shown while the server list is loading or if it returns empty
const FALLBACK_EMOJIS = [
  '🦊',
  '🦁',
  '🐸',
  '🦄',
  '🐧',
  '🦋',
  '🦈',
  '🦑',
  '🤖',
  '👾',
  '🎮',
  '🎯',
  '⚡',
  '🌈',
  '🔥',
  '🐉',
  '🦅',
  '🐺',
  '🐙',
  '🎭',
];

export function loadSavedAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) ?? BUILTIN_AVATARS[0].url;
}

export function saveAvatar(avatar: string) {
  localStorage.setItem(AVATAR_KEY, avatar);
}

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [serverUrls, setServerUrls] = useState<string[] | null>(null);

  useEffect(() => {
    fetchAvatarUrls()
      .then((urls) => setServerUrls(urls))
      // Fetch failure → empty list → emoji fallback grid renders instead.
      .catch(() => setServerUrls([]));
  }, []);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 128;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Center-crop to circle
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      onChange(dataUrl);
      e.target.value = '';
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      e.target.value = '';
    };
    img.src = url;
  }

  const isImage =
    value.startsWith('data:') || value.startsWith('/avatars/') || value.startsWith('/characters/');
  const loading = serverUrls === null;
  const options = [
    ...BUILTIN_AVATARS,
    ...(serverUrls ?? []).map((url, index) => ({ url, label: `Avatar tải lên ${index + 1}` })),
  ];

  return (
    <div>
      {/* Preview + upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <AvatarDisplay avatar={value} size={72} />
        <div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text2)',
              fontWeight: 600,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Avatar của bạn
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            {isImage ? (
              <>
                <RotateCcw className="size-4" /> Đổi ảnh
              </>
            ) : (
              <>
                <Upload className="size-4" /> Tải ảnh lên
              </>
            )}
          </Button>
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>

      {/* Server avatars or fallback emojis */}
      <p
        style={{
          fontSize: '0.78rem',
          color: 'var(--text2)',
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {loading ? 'Đang tải avatar…' : 'Hoặc chọn một avatar'}
      </p>

      {loading && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: 10 }, (_, i) => i).map((i) => (
            <div
              key={`skeleton-${i}`}
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                background: 'var(--surface2)',
                border: '2px solid var(--border)',
                animation: 'pulse .8s infinite alternate',
              }}
            />
          ))}
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {options.map(({ url, label }) => {
            const selected = value === url;
            return (
              <button
                type="button"
                key={url}
                aria-label={`Chọn ${label}`}
                aria-pressed={selected}
                onClick={() => onChange(url)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  padding: 2,
                  border: `2px solid ${selected ? 'var(--foreground)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-soft)' : 'var(--surface2)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: selected ? '0 3px 0 var(--foreground)' : 'none',
                  transition: 'all .15s',
                  flexShrink: 0,
                }}
              >
                <img
                  src={url}
                  alt={label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '50%',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {!loading && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-muted-foreground">Thêm emoji</summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {FALLBACK_EMOJIS.map((emoji) => {
              const selected = value === emoji;
              return (
                <button
                  type="button"
                  key={emoji}
                  aria-label={`Chọn avatar ${emoji}`}
                  aria-pressed={selected}
                  onClick={() => onChange(emoji)}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    background: selected ? 'var(--accent-soft)' : 'var(--surface2)',
                    fontSize: '1.6rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: selected ? '0 0 0 3px var(--accent-soft)' : 'none',
                    transition: 'all .15s',
                  }}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}

// ── Standalone avatar display ──────────────────────────────────────────────────

interface AvatarDisplayProps {
  avatar?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function AvatarDisplay({ avatar, size = 36, style }: AvatarDisplayProps) {
  const isImage =
    avatar?.startsWith('data:') ||
    avatar?.startsWith('/avatars/') ||
    avatar?.startsWith('/characters/');
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--border)',
        background: 'var(--surface2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        fontSize: size * 0.52,
        ...style,
      }}
    >
      {isImage ? (
        <img
          src={avatar}
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        (avatar ?? '🎮')
      )}
    </div>
  );
}
