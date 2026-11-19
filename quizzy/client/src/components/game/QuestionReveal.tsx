import { Check, MapPin } from 'lucide-react';
import { type MapGuess, MapReveal } from '@/components/GeoMap';
import { OptionText } from '@/components/OptionText';
import { QuestionExplanation } from '@/components/QuestionExplanation';
import { displayOptions, optionLetter } from '@/helpers';
import type { QuestionResults } from '@/types';

interface Props {
  results: Pick<
    QuestionResults,
    | 'questionType'
    | 'correctAnswer'
    | 'correctIndex'
    | 'correctIndices'
    | 'correctBlanks'
    | 'correctOrder'
    | 'correctPairs'
    | 'geo'
    | 'imageUrl'
    | 'options'
    | 'rangeMin'
    | 'rangeMax'
    | 'explanation'
  >;
  /** Player view: highlight chosen vs correct options */
  myChosenIndex?: number | null;
  myChosenIndices?: number[] | null;
  /** Player view: where this player dropped their pin, for geo questions */
  myChosenPoint?: { lat: number; lng: number } | null;
  /** Geo: every player's pin. Without it the map shows only `myChosenPoint`. */
  mapGuesses?: MapGuess[];
  animate?: boolean;
}

export function QuestionReveal({
  results,
  myChosenIndex,
  myChosenIndices,
  myChosenPoint,
  mapGuesses,
  animate = false,
}: Props) {
  const isOpenText = results.questionType === 'open_text';
  const isMultiSelect = results.questionType === 'multi_select';
  const isClosestTo = results.questionType === 'closest_to';
  const isFillBlank = results.questionType === 'fill_blank';
  const isOrdering = results.questionType === 'ordering';
  const isGeo = results.questionType === 'geo';
  const isMatching = results.questionType === 'matching';

  return (
    <>
      {isFillBlank ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
          <p className="mb-2 text-[0.78rem] text-muted-foreground">Các đáp án đúng</p>
          <ol className="list-decimal space-y-1 pl-5">
            {(results.correctBlanks ?? []).map((ans, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional blanks
              <li key={i} className="font-bold text-ok">
                {ans}
              </li>
            ))}
          </ol>
        </div>
      ) : isOrdering ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
          <p className="mb-2 text-[0.78rem] text-muted-foreground">Thứ tự đúng</p>
          <ol className="list-decimal space-y-1 pl-5">
            {(results.correctOrder ?? results.options).map((item, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional order
              <li key={i} className="font-semibold text-ok">
                {item}
              </li>
            ))}
          </ol>
        </div>
      ) : isMatching ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
          <p className="mb-2 text-[0.78rem] text-muted-foreground">Các cặp đúng</p>
          <ul className="space-y-1">
            {(results.correctPairs ?? []).map((p, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: left items may repeat text
                key={`pair-${i}`}
                className="flex items-center gap-2 font-semibold text-ok"
              >
                <span>{p.left}</span>
                <span className="text-muted-foreground">→</span>
                <span>{p.right}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : isGeo ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 p-3">
          <p className="mb-2 text-[0.78rem] text-muted-foreground">Vị trí đúng</p>
          {results.geo ? (
            <MapReveal
              correct={results.geo}
              guess={myChosenPoint ?? undefined}
              guesses={mapGuesses}
              height={300}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Vị trí sẽ hiện trên màn hình của quản trò.</p>
          )}
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <Check className="size-3.5 text-ok" /> đúng
            {myChosenPoint ? (
              <>
                · <MapPin className="size-3.5" /> ghim của bạn
              </>
            ) : null}
            {mapGuesses?.length ? (
              <>
                · {mapGuesses.length} người chơi
              </>
            ) : null}
          </p>
        </div>
      ) : isClosestTo ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
          <p className="mb-1 text-[0.78rem] text-muted-foreground">Đáp án đúng</p>
          <p className="text-[1.8rem] font-bold text-ok">{results.correctAnswer}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Khoảng: {results.rangeMin}–{results.rangeMax}
          </p>
        </div>
      ) : isOpenText ? (
        <div className="result-reveal-correct rounded-lg border border-ok/30 bg-ok/10 px-4 py-3">
          <p className="mb-1 text-[0.78rem] text-muted-foreground">Đáp án đúng</p>
          <p className="text-[1.1rem] font-bold text-ok">{results.correctAnswer}</p>
        </div>
      ) : (
        <div className={`options-grid ${animate ? 'gap-2 p-0' : ''}`}>
          {displayOptions(results.options, results.questionType).map((opt, i) => {
            const isCorrect = isMultiSelect
              ? (results.correctIndices ?? []).includes(i)
              : i === results.correctIndex;
            const myChoice =
              myChosenIndex !== undefined || myChosenIndices !== undefined
                ? isMultiSelect
                  ? (myChosenIndices ?? []).includes(i)
                  : myChosenIndex === i
                : false;
            return (
              <div
                key={optionLetter(i)}
                className={`option-btn ${animate ? 'result-reveal' : ''} ${isCorrect ? 'correct' : myChoice ? 'wrong' : ''}`}
                style={{
                  cursor: 'default',
                  ...(animate ? { animationDelay: `${i * 0.06}s` } : {}),
                }}
              >
                <div className="option-letter">{optionLetter(i)}</div>
                <div className="option-text">
                  <OptionText value={opt} imgClassName="option-img-sm" />
                </div>
                {isCorrect && <Check className="ml-auto size-4" />}
              </div>
            );
          })}
        </div>
      )}
      <QuestionExplanation explanation={results.explanation} />
    </>
  );
}
