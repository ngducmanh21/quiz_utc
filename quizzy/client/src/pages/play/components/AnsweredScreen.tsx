import { Lock, SkipForward } from 'lucide-react';
import type { CSSProperties } from 'react';
import { OptionText } from '@/components/OptionText';
import { AppAlert } from '@/components/AppAlert';
import { QuestionAnswerReview } from '@/components/game/QuestionAnswerReview';
import { TimerBar } from '@/components/game/TimerBar';
import { Page, PageCenter } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { displayOptions, quadColor } from '@/helpers';
import type { PlayerAnswerReceived, QuestionPayload } from '@/types';
import './AnsweredScreen.css';

interface Props {
  isCorrect: boolean;
  score: number;
  answerKey?: PlayerAnswerReceived['answerKey'];
  wasPassJoker?: boolean;
  answeredCount: number;
  totalPlayers: number;
  timeLeft: number | null;
  question?: QuestionPayload | null;
  selectedIndex?: number | null;
  selectedIndices?: number[];
}

export function AnsweredScreen({
  isCorrect,
  score,
  answerKey,
  wasPassJoker,
  answeredCount,
  totalPlayers,
  timeLeft,
  question,
  selectedIndex,
  selectedIndices = [],
}: Props) {
  const shownAnsweredCount = totalPlayers > 0 ? Math.min(totalPlayers, Math.max(answeredCount, 1)) : answeredCount;
  const answerPct = totalPlayers > 0 ? (shownAnsweredCount / totalPlayers) * 100 : 0;
  const options = question ? displayOptions(question.options, question.questionType) : [];
  const chosenIndices = question?.questionType === 'multi_select'
    ? selectedIndices
    : selectedIndex == null ? [] : [selectedIndex];
  const chosenOptions = wasPassJoker ? [] : chosenIndices
    .filter((index) => index >= 0 && index < options.length)
    .map((index) => ({ index, text: options[index] }));
  const isOptionBased = answerKey && !wasPassJoker && (
    answerKey.questionType === 'multiple_choice' ||
    answerKey.questionType === 'true_false' ||
    answerKey.questionType === 'multi_select'
  );

  const progress = (
    <>
      {totalPlayers > 0 && (
        <div>
          <div className="answer-counter mb-2 text-[1.1rem]">
            {shownAnsweredCount} / {totalPlayers} đã trả lời
          </div>
          <div className="answer-bar mx-auto max-w-[220px]">
            <div className="answer-bar-fill" style={{ width: `${answerPct}%` }} />
          </div>
        </div>
      )}
      {timeLeft !== null ? (
        <div className="answer-time-left mt-5">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            Màn chiếu hiện đáp án khi mọi người trả lời hoặc hết giờ
          </p>
          <TimerBar timeLeft={timeLeft} totalSec={question?.timeSec ?? answerKey?.timeSec ?? Math.max(timeLeft, 1)} className="gap-3" silent />
        </div>
      ) : (
        <p className="mt-5 text-base font-semibold text-muted-foreground">Đang chờ cả phòng…</p>
      )}
    </>
  );

  if (isOptionBased) {
    return (
      <Page className="mx-auto w-full max-w-[700px] px-3 py-5">
        <AppAlert variant={isCorrect ? 'success' : 'error'} className="mb-4 text-center text-base font-bold">
          {isCorrect ? `Đúng rồi! +${score} điểm` : 'Chưa đúng · 0 điểm'}
        </AppAlert>
        <QuestionAnswerReview
          text={answerKey.questionText}
          options={answerKey.options}
          questionType={answerKey.questionType}
          correctIndex={answerKey.correctIndex}
          correctIndices={answerKey.correctIndices}
          chosenIndex={selectedIndex}
          chosenIndices={selectedIndices}
          questionNumber={answerKey.questionIndex + 1}
          totalQuestions={answerKey.totalQuestions}
          imageUrl={question?.imageUrl ?? answerKey.imageUrl}
          explanation={answerKey.explanation}
        />
        <Card className="mt-4">
          <CardContent className="p-5 text-center">{progress}</CardContent>
        </Card>
      </Page>
    );
  }

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
                <div className="answer-label">{isCorrect ? `Đúng rồi! +${score} điểm` : `Chưa đúng · +${score} điểm`}</div>
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

            {answerKey?.correctAnswer && (
              <p className="mt-4 text-sm font-semibold">Đáp án đúng: {answerKey.correctAnswer}</p>
            )}
            <div className="mt-6">{progress}</div>
          </div>
        </CardContent>
      </Card>
    </PageCenter>
  );
}
