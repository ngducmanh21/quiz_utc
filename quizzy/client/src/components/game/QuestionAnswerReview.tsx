import { Check, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { QuadGlyph } from '@/components/game/QuadGlyph';
import { QuestionExplanation } from '@/components/QuestionExplanation';
import { QuestionImage } from '@/components/QuestionImage';
import { OptionText } from '@/components/OptionText';
import { QuestionText } from '@/components/QuestionText';
import { displayOptions, hasQuestionImage, quadColor } from '@/helpers';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/types';
import '@/pages/play/components/QuestionScreen.css';
import './QuestionAnswerReview.css';

interface Props {
  text: string;
  options: string[];
  questionType: QuestionType;
  correctIndex?: number;
  correctIndices?: number[];
  chosenIndex?: number | null;
  chosenIndices?: number[] | null;
  questionNumber?: number;
  totalQuestions?: number;
  imageUrl?: string;
  explanation?: string;
}

/** The same answer tiles used while choosing, now with the correct answer revealed. */
export function QuestionAnswerReview({
  text,
  options,
  questionType,
  correctIndex,
  correctIndices,
  chosenIndex,
  chosenIndices,
  questionNumber,
  totalQuestions,
  imageUrl,
  explanation,
}: Props) {
  const shownOptions = displayOptions(options, questionType);
  const correct = questionType === 'multi_select' ? (correctIndices ?? []) : [correctIndex ?? -1];
  const chosen = questionType === 'multi_select'
    ? (chosenIndices ?? [])
    : chosenIndex == null || chosenIndex < 0 ? [] : [chosenIndex];
  const answered = chosen.length > 0;
  const isFullyCorrect = answered && chosen.length === correct.length && chosen.every((i) => correct.includes(i));

  return (
    <div className="play-question play-review-question mx-auto w-full max-w-[700px]">
      <div className="question-header play-question-header">
        {questionNumber != null && totalQuestions != null && (
          <div className="play-question-topline">
            <span className="question-counter">Câu hỏi {questionNumber} trên {totalQuestions}</span>
          </div>
        )}
        {hasQuestionImage(imageUrl) && <QuestionImage src={imageUrl} className="question-image" />}
        <div className="question-text"><QuestionText text={text} /></div>
        <div className={cn('play-review-outcome', isFullyCorrect ? 'is-correct' : answered ? 'is-wrong' : 'is-unanswered')}>
          {isFullyCorrect ? (
            <><Check size={18} aria-hidden="true" /> Bạn đã chọn đúng!</>
          ) : answered ? (
            <><X size={18} aria-hidden="true" /> Đáp án của bạn chưa đúng</>
          ) : (
            'Bạn chưa chọn đáp án'
          )}
        </div>
      </div>

      <div className="quad-grid play-answer-grid play-review-tiles">
        {shownOptions.map((option, index) => {
          const isCorrect = correct.includes(index);
          const isChosen = chosen.includes(index);
          return (
            <div
              key={`${index}:${option}`}
              className={cn('option-quad', isCorrect ? 'play-review-correct' : isChosen ? 'play-review-chosen' : 'play-review-dim')}
              style={{ '--quad-color': quadColor(index) } as CSSProperties}
            >
              <span className="quad-badge" aria-hidden="true">
                {isCorrect ? <Check size={22} strokeWidth={3} /> : isChosen ? <X size={20} strokeWidth={3} /> : <QuadGlyph index={index} size={22} />}
              </span>
              <span className="quad-label">
                <OptionText value={option} />
                {isCorrect && (
                  <small className="play-review-caption">
                    {isChosen ? (isFullyCorrect ? 'Bạn đã chọn đúng' : 'Đáp án đúng · bạn đã chọn') : 'Đáp án đúng'}
                  </small>
                )}
                {isChosen && !isCorrect && <small className="play-review-caption">Bạn đã chọn</small>}
              </span>
            </div>
          );
        })}
      </div>
      <QuestionExplanation explanation={explanation} />
    </div>
  );
}
