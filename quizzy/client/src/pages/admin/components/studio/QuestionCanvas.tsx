import { Check, GripVertical, ImageIcon, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapPicker } from '@/components/GeoMap';
import { Input, IntegerInput, Textarea } from '@/components/Input';
import { MediaPicker } from '@/components/MediaPicker';
import { Button } from '@/components/ui/button';
import { countBlanks, isImageUrl, optionLetter, quadColor, quadIcon } from '@/helpers';
import { usePointerReorder } from '@/hooks/usePointerReorder';
import { cn } from '@/lib/utils';
import type { ImportQuestion } from '@/types';
import { MediaZone } from './MediaZone';
import { QuestionTextEditor } from './QuestionTextEditor';
import type { questionOps } from './questionOps';

interface Props {
  q: ImportQuestion;
  ops: ReturnType<typeof questionOps>;
  onChange: (field: keyof ImportQuestion, value: unknown) => void;
}

export function QuestionCanvas({ q, ops, onChange }: Props) {
  const { type } = ops;

  // closest_to range defaults are owned by normalizeQuestion/setType in
  // questionOps — no mount-scoped repair needed here.

  // Keep fill_blank answer rows in sync with the number of ___ markers.
  const blankCount = countBlanks(q.text);
  useEffect(() => {
    if (type !== 'fill_blank') return;
    const cur = q.blanks ?? [];
    if (cur.length !== blankCount) {
      onChange(
        'blanks',
        Array.from({ length: blankCount }, (_, i) => cur[i] ?? []),
      );
    }
  }, [type, blankCount, q.blanks, onChange]);

  const choiceMode = type === 'multiple_choice' || type === 'multi_select';

  if (type === 'title_slide' || type === 'standings_slide') {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <QuestionTextEditor value={q.text} onChange={(v) => onChange('text', v)} />
        {type === 'title_slide' ? (
          <>
            <MediaZone
              q={q}
              ops={ops}
              allow={['image', 'gif']}
              label="Thêm ảnh cho trang này (không bắt buộc)"
            />
            <Textarea
              noMargin
              label="Nội dung (không bắt buộc)"
              rows={4}
              className="resize-y"
              value={q.explanation ?? ''}
              onChange={(e) => onChange('explanation', e.target.value || undefined)}
              placeholder="Những câu tiếp theo nói về gì?"
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Mọi người sẽ thấy bảng xếp hạng hiện tại dưới tiêu đề này.
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Người chơi không cần trả lời ở trang này. Trang sẽ hiện cho đến khi quản trò chuyển tiếp.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Question text — block editor (text lines + real code boxes). */}
      <QuestionTextEditor value={q.text} onChange={(v) => onChange('text', v)} />

      <MediaZone
        q={q}
        ops={ops}
        allow={type === 'geo' ? ['image', 'gif', 'video'] : undefined}
        label={type === 'geo' ? 'Thêm ảnh để người chơi đoán địa điểm chụp' : undefined}
      />

      {choiceMode && (
        <ChoiceTiles q={q} ops={ops} onChange={onChange} multi={type === 'multi_select'} />
      )}

      {type === 'true_false' && (
        <div className="grid grid-cols-2 gap-4">
          {['Đúng', 'Sai'].map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange('correctIndex', i)}
              className={cn(
                'flex h-24 items-center justify-center gap-2 rounded-2xl text-xl font-extrabold text-white transition-all',
                i === 0 ? 'bg-emerald-500' : 'bg-rose-500',
                q.correctIndex === i
                  ? 'ring-4 ring-offset-2 ring-offset-background'
                  : 'opacity-60 hover:opacity-100',
                q.correctIndex === i && (i === 0 ? 'ring-emerald-300' : 'ring-rose-300'),
              )}
            >
              {i === 0 ? <Check className="size-6" /> : <X className="size-6" />} {label}
            </button>
          ))}
        </div>
      )}

      {type === 'open_text' && (
        <Input
          label="Đáp án đúng *"
          value={q.correctAnswer ?? ''}
          onChange={(e) => onChange('correctAnswer', e.target.value)}
          placeholder="Ví dụ: Hà Nội (không phân biệt chữ hoa, chữ thường)"
        />
      )}

      {type === 'closest_to' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <IntegerInput
              noMargin
              label="Giới hạn dưới *"
              value={q.rangeMin ?? 1}
              onValueChange={(value) => onChange('rangeMin', value)}
            />
            <IntegerInput
              noMargin
              label="Giới hạn trên *"
              value={q.rangeMax ?? 100}
              onValueChange={(value) => onChange('rangeMax', value)}
            />
          </div>
          <IntegerInput
            noMargin
            label="Đáp án đúng (số nguyên) *"
            value={q.correctAnswer ?? ''}
            onValueChange={(value) => onChange('correctAnswer', String(value))}
            placeholder="Phải nằm trong khoảng đã chọn"
          />
          <p className="text-sm text-muted-foreground">
            Người chơi nhập số nguyên trong khoảng. Số gần đáp án nhất được nhiều điểm nhất.
          </p>
        </div>
      )}

      {type === 'fill_blank' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Nhập <code className="rounded bg-border px-1">___</code> (ít nhất 3 dấu gạch dưới)
            vào câu hỏi để tạo từng chỗ trống — đã nhận diện {blankCount} chỗ trống.
            Mỗi chỗ trống đúng sẽ được tính điểm.
          </p>
          {blankCount === 0 && (
            <p className="text-sm text-destructive">
              Thêm ___ vào nội dung câu hỏi để tạo chỗ trống.
            </p>
          )}
          {Array.from({ length: blankCount }, (_, bi) => (
            <Input
              // biome-ignore lint/suspicious/noArrayIndexKey: blanks are positional by design
              key={`blank-${bi}`}
              noMargin
              label={`Chỗ trống ${bi + 1} — các đáp án được chấp nhận (cách nhau bằng dấu phẩy)`}
              value={(q.blanks?.[bi] ?? []).join(', ')}
              onChange={(e) => ops.setBlankAccepted(bi, e.target.value)}
              placeholder="Hà Nội, Thủ đô Việt Nam"
            />
          ))}
        </div>
      )}

      {type === 'ordering' && <OrderingItems q={q} ops={ops} />}

      {type === 'matching' && <MatchingPairs q={q} ops={ops} />}

      {type === 'geo' && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Nhấp bản đồ để đặt vị trí đúng. Người chơi đặt ghim và được tính điểm theo khoảng cách thực tế.
          </p>
          <MapPicker value={q.geo ?? null} onChange={(p) => onChange('geo', p)} height={340} />
          {q.geo && (
            <p className="text-xs text-muted-foreground">
              Vị trí đúng: {q.geo.lat.toFixed(4)}, {q.geo.lng.toFixed(4)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Kahoot-style answer tiles (single + multi select) ───────────────────────────
function ChoiceTiles({
  q,
  ops,
  onChange,
  multi,
}: {
  q: ImportQuestion;
  ops: ReturnType<typeof questionOps>;
  onChange: (field: keyof ImportQuestion, value: unknown) => void;
  multi: boolean;
}) {
  const opts = q.options ?? [];
  // Which answer index the media picker is open for (null = closed).
  const [pickFor, setPickFor] = useState<number | null>(null);
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opts.map((opt, oi) => {
          const correct = multi ? (q.correctIndices ?? []).includes(oi) : q.correctIndex === oi;
          const Glyph = quadIcon(oi);
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: option rows are positional
              key={`opt-${oi}`}
              className={cn(
                'flex items-center overflow-hidden rounded-2xl text-white shadow-sm transition-all',
                correct ? 'ring-4 ring-white/85' : 'ring-1 ring-black/10',
              )}
              style={{ background: quadColor(oi) }}
            >
              <span className="flex h-16 w-14 shrink-0 items-center justify-center bg-black/15">
                <Glyph className="size-5 fill-current" />
              </span>
              <div className="min-w-0 flex-1 px-3">
                <input
                  value={opt}
                  onChange={(e) => ops.updateOption(oi, e.target.value)}
                  placeholder={`Thêm đáp án ${oi + 1}${oi >= 2 ? ' (không bắt buộc)' : ''}`}
                  className="w-full bg-transparent py-4 text-[15px] font-semibold text-white outline-none placeholder:text-white/70"
                />
                {isImageUrl(opt) && (
                  <img
                    src={opt}
                    alt={`Xem trước lựa chọn ${optionLetter(oi)}`}
                    className="mb-2 max-h-[80px] max-w-full rounded-md object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setPickFor(oi)}
                title="Chọn ảnh hoặc GIF cho đáp án này"
                className="flex h-16 w-11 shrink-0 items-center justify-center text-white/75 hover:text-white"
              >
                <ImageIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => (multi ? ops.toggleCorrectIndex(oi) : onChange('correctIndex', oi))}
                title={correct ? 'Đáp án đúng' : 'Đánh dấu đáp án đúng'}
                className={cn(
                  'flex h-16 w-12 shrink-0 items-center justify-center transition-colors',
                  correct
                    ? 'bg-white/25 text-white'
                    : 'text-white/60 hover:bg-black/10 hover:text-white',
                )}
              >
                <Check className="size-5" />
              </button>
              {opts.length > 2 && (
                <button
                  type="button"
                  onClick={() => ops.removeOption(oi)}
                  title="Xóa lựa chọn"
                  className="flex h-16 w-10 shrink-0 items-center justify-center text-white/60 hover:bg-black/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={() => ops.addOption()}>
          <Plus className="size-3.5" /> Thêm đáp án
        </Button>
        <p className="text-xs text-muted-foreground">
          {multi ? 'Hãy đánh dấu mọi đáp án đúng.' : 'Hãy đánh dấu đáp án đúng.'} Dùng nút ảnh để thêm ảnh hoặc GIF cho đáp án.
        </p>
      </div>
      <MediaPicker
        open={pickFor !== null}
        allow={['image', 'gif']}
        onClose={() => setPickFor(null)}
        onPick={(m) => {
          if (pickFor !== null) ops.updateOption(pickFor, m.url);
        }}
      />
    </div>
  );
}

function OrderingItems({ q, ops }: { q: ImportQuestion; ops: ReturnType<typeof questionOps> }) {
  const opts = q.options ?? [];
  const reorder = usePointerReorder((from, to) => ops.reorderOptions(from, to));
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Các mục theo đúng thứ tự{' '}
        <span className="font-normal text-muted-foreground/70">
          — kéo để đổi thứ tự; người chơi sẽ thấy chúng bị xáo trộn
        </span>
      </p>
      <div
        className={cn(reorder.dragPos !== null && 'touch-none select-none')}
        {...reorder.listProps}
      >
        {opts.map((opt, oi) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: item rows are positional
            key={`order-${oi}`}
            style={reorder.dragStyle(oi)}
            className={cn(
              'mb-2 flex items-center gap-2 rounded-lg p-1',
              reorder.dragPos === oi
                ? 'cursor-grabbing bg-muted shadow-2xl ring-2 ring-primary'
                : reorder.dragPos !== null
                  ? 'opacity-60 transition-transform'
                  : '',
            )}
          >
            <button
              type="button"
              aria-label="Kéo để đổi thứ tự"
              {...reorder.handleProps(oi)}
              className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-[0.8rem] font-extrabold text-muted-foreground">
              {oi + 1}
            </span>
            <Input
              className="mb-0 flex-1"
              noMargin
              value={opt}
              onChange={(e) => ops.updateOption(oi, e.target.value)}
              placeholder={`Mục ${oi + 1}`}
            />
            {opts.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => ops.removeOption(oi)}
                title="Xóa mục"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1"
        onClick={() => ops.addOption()}
      >
        <Plus className="size-3.5" /> Thêm mục
      </Button>
    </div>
  );
}

function MatchingPairs({ q, ops }: { q: ImportQuestion; ops: ReturnType<typeof questionOps> }) {
  const opts = q.options ?? [];
  const matches = q.matches ?? [];
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Các cặp (2–6){' '}
        <span className="font-normal text-muted-foreground/70">
          — người chơi ghép mục bên trái với mục bên phải; cột phải được xáo trộn
        </span>
      </p>
      {opts.map((left, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: pair rows are positional
        <div key={`pair-${i}`} className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-[0.8rem] font-extrabold text-muted-foreground">
            {i + 1}
          </span>
          <Input
            className="mb-0 flex-1"
            noMargin
            value={left}
            onChange={(e) => ops.updateMatchLeft(i, e.target.value)}
            placeholder={`Bên trái ${i + 1}`}
          />
          <span className="text-muted-foreground">↔</span>
          <Input
            className="mb-0 flex-1"
            noMargin
            value={matches[i] ?? ''}
            onChange={(e) => ops.updateMatchRight(i, e.target.value)}
            placeholder={`Bên phải ${i + 1}`}
          />
          {opts.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => ops.removeMatchPair(i)}
              title="Xóa cặp"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}
      {opts.length < 6 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => ops.addMatchPair()}
        >
          <Plus className="size-3.5" /> Thêm cặp
        </Button>
      )}
    </div>
  );
}
