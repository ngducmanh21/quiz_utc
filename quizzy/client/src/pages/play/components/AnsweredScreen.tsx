import { Lock, SkipForward } from 'lucide-react';
import type { CSSProperties } from 'react';
import { OptionText } from '@/components/OptionText';
import { TimerBar } from '@/components/game/TimerBar';
import { PageCenter } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { displayOptions, quadColor } from '@/helpers';
import type { QuestionPayload } from '@/types';
import './AnsweredScreen.css';

interface Props {
  isCorrect: boolean;
  score: number;
  wasPassJoker?: boolean;
  answeredCount: number;
  totalPlayers: number;
  timeLeft: number | null;
  question?: QuestionPayload | null;
  selectedIndex?: number | null;
  selectedIndices?: number[];
}

export function AnsweredScreen({
  wasPassJoker,
  answeredCount,
  totalPlayers,
  timeLeft,
  question,
  selectedIndex,
  selectedIndices = [],
}: Props) {
  const answerPct = totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0;
  const options = question ? displayOptions(question.options, question.questionType) : [];
  const chosenIndices = question?.questionType === 'multi_select'
    ? selectedIndices
    : selectedIndex == null ? [] : [selectedIndex];
  const chosenOptions = wasPassJoker ? [] : chosenIndices
    .filter((index) => index >= 0 && index < options.length)
    .map((index) => ({ index, text: options[index] }));

  return (
    <PageCenter>
      <Card>
        <CardContent className="p-8 text-center">
          <div className="answer-overlay">
            {wasPassJoker ? (
              <>
                <SkipForward className="answer-icon mx-auto size-12" />
                <div className="answer-label">Đã bỏ qua câu hỏi</div>
              </>
            ) : (
              <>
                <Lock className="answer-icon mx-auto size-12" />
                <div className="answer-label">Đã ghi nhận câu trả lời!</div>
              </>
            )}

            {chosenOptions.length > 0 && (
              <div className="mt-5 text-left">
                <p className="mb-2 text-center text-sm font-bold">Bạn đã chọn</p>
                <div className="space-y-2">
                  {chosenOptions.map(({ index, text }) => (
                    <div
                      key={index}
                      className="play-picked-answer"
                      style={{ '--quad-color': quadColor(index) } as CSSProperties}
                    >
                      <span className="play-picked-answer-mark" aria-hidden="true"><Lock size={16} strokeWidth={2.5} /></span>
                      <strong><OptionText value={text} /></strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalPlayers > 0 && (
              <div className="mt-6">
                <div className="answer-counter mb-2 text-[1.1rem]">
                  {answeredCount} / {totalPlayers} đã trả lời
                </div>
                <div className="answer-bar mx-auto max-w-[220px]">
                  <div className="answer-bar-fill" style={{ width: `${answerPct}%` }} />
                </div>
              </div>
            )}

            {question && timeLeft !== null ? (
              <div className="answer-time-left mt-5">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">
                  Đáp án hiện khi hết giờ
                </p>
                <TimerBar timeLeft={timeLeft} totalSec={question.timeSec} className="gap-3" silent />
              </div>
            ) : (
              <p className="mt-5 text-base font-semibold text-muted-foreground">
                Đang chờ hết giờ…
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageCenter>
  );
}
