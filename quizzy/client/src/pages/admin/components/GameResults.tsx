import { ArrowRight, Flag, Trophy } from 'lucide-react';
import { ClosestGuessesList, LeaderboardList } from '@/components/game/LeaderboardList';
import { QuestionDistribution } from '@/components/game/QuestionDistribution';
import { MainContent } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { NextPreview, QuestionResults } from '../../../types';
import { UpNextCard } from './UpNextCard';

interface Props {
  results: QuestionResults;
  questionIndex: number;
  autoAdvanceLeft: number;
  nextPreview?: NextPreview | null;
  onNextQuestion: () => void;
  onEndGame: () => void;
  onRemovePoints: (playerId: number, questionId: number) => void;
  onOpenPlayerAnswers: (playerId: number) => void;
}

export function GameResults({
  results,
  questionIndex,
  autoAdvanceLeft,
  nextPreview,
  onNextQuestion,
  onEndGame,
  onRemovePoints,
  onOpenPlayerAnswers,
}: Props) {
  const isClosestTo = results.questionType === 'closest_to';
  const closestList = results.closestRanking ?? [];

  return (
    <MainContent>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2>Kết quả — Câu{questionIndex + 1}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="lg" onClick={onEndGame}>
            Kết thúc trò chơi
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onNextQuestion}
            className="relative min-w-0 sm:min-w-[180px]"
          >
            {results.isLastQuestion ? (
              <span className="flex items-center gap-1.5">
                <Flag className="size-4" /> Điểm chung cuộc
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Tiếp <ArrowRight className="size-4" />
              </span>
            )}
            {results.autoAdvanceSec > 0 && (
              <span className="ml-1.5 text-[0.75rem] opacity-80">({autoAdvanceLeft}s)</span>
            )}
          </Button>
        </div>
      </div>

      {nextPreview && <UpNextCard preview={nextPreview} />}

      <Card className="mb-4 w-full max-w-4xl">
        <CardContent className="p-6">
          <p className="mb-3 text-sm text-muted-foreground">{results.questionText}</p>
          <QuestionDistribution results={results} />
        </CardContent>
      </Card>

      {isClosestTo && closestList.length > 0 && (
        <Card className="mb-4 w-full max-w-4xl">
          <CardContent className="p-6">
            <h2 className="mb-4">Các đáp án gần nhất</h2>
            <ClosestGuessesList entries={closestList} limit={10} />
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <h2 className="mb-4 flex items-center gap-1.5">
            <Trophy className="size-4" /> Bảng xếp hạng
          </h2>
          <LeaderboardList
            entries={results.leaderboard}
            limit={10}
            showQuestionScore
            renderActions={(e) => (
              <div className="ml-2 flex shrink-0 gap-1">
                {e.questionScore > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2 py-0.5 text-[0.7rem] text-destructive"
                    title="Trừ điểm của câu hỏi này"
                    onClick={() => onRemovePoints(e.playerId, results.questionId)}
                  >
                    Trừ điểm
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-1.5 py-0.5 text-[0.8rem]"
                  title="Xem tất cả câu trả lời"
                  onClick={() => onOpenPlayerAnswers(e.playerId)}
                >
                  ...
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </MainContent>
  );
}
