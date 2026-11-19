import { ArrowLeft, Braces, Check, Eye, Languages, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAlert } from '@/components/AppAlert';
import { Textarea } from '@/components/Input';
import { MainContent, Page, Subtitle } from '@/components/layout';
import { QuizPreviewModal } from '@/components/QuizPreviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { copyText } from '@/helpers';
import {
  importPayloadToStudioDraft,
  parseQuizImportJson,
  QUIZ_IMPORT_AI_PROMPT,
  QUIZ_IMPORT_EXAMPLE_JSON,
  QUIZ_IMPORT_JSON_SHORT,
} from '@/helpers/quizImportSchema';
import { cn } from '@/lib/utils';
import CreatorNav from '../../components/CreatorNav';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import { useCreatorBase } from '../../hooks/useCreatorBase';
import type { ImportPayload, ImportQuestion, QuizTranslationPayload } from '../../types';

import { clearCreateDraft, QuizStudio, saveCreateDraft } from './components/studio/QuizStudio';
import { TranslationsDialog } from './components/TranslationsDialog';

const COPY_TONE = {
  example: {
    label: 'Sao chép ví dụ',
    icon: Braces,
    className: 'bg-primary text-primary-foreground hover:bg-primary/85',
  },
  prompt: {
    label: 'Sao chép câu lệnh',
    icon: Sparkles,
    className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  },
} as const;

/** Copies preset text to the clipboard with brief copied feedback. */
function CopyTextButton({
  text,
  tone,
  className,
  inSummary,
}: {
  text: string;
  tone: keyof typeof COPY_TONE;
  className?: string;
  inSummary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { label, icon: Icon, className: toneClassName } = COPY_TONE[tone];
  return (
    <Button
      type="button"
      size="sm"
      className={cn(toneClassName, className)}
      onClick={async (e) => {
        if (inSummary) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (!(await copyText(text))) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <>
          <Check className="size-3.5" /> Đã sao chép
        </>
      ) : (
        <>
          <Icon className="size-3.5" /> {label}
        </>
      )}
    </Button>
  );
}

export default function CreateQuiz() {
  const api = useAuthFetch();
  const navigate = useNavigate();
  const basePath = useCreatorBase();
  const [mode, setMode] = useState<'studio' | 'json'>('studio');
  const [studioKey, setStudioKey] = useState(0);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ title: string; questions: ImportQuestion[] } | null>(
    null,
  );
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [stagedTranslations, setStagedTranslations] = useState<QuizTranslationPayload[]>([]);

  const saveLabel = saving ? (
    'Đang lưu…'
  ) : (
    <>
      <Check className="size-4" /> Tạo quiz
    </>
  );

  async function saveQuiz(payload: ImportPayload) {
    setSaving(true);
    setJsonError('');
    setSuccess('');
    const { ok, data } = await api.post<{ id: number; error?: string }>(
      '/api/admin/quizzes',
      payload,
    );
    if (!ok) {
      setSaving(false);
      setJsonError(data.error ?? 'Không lưu được quiz');
      return;
    }
    // Drop the studio autosave here, not only in QuizStudio's success effect —
    // the JSON-import path saves with QuizStudio unmounted, and the stale
    // draft would otherwise be restored (and re-saveable) on the next visit.
    clearCreateDraft();

    // Upload any translations staged before the quiz had an id. The quiz is
    // already created at this point — a translation failure (e.g. the staged
    // JSON's question count drifted from what was actually saved) shouldn't
    // block navigating away, just gets reported alongside the success message.
    let translationWarning = '';
    for (const translation of stagedTranslations) {
      const res = await api.post<{ error?: string }>(
        `/api/admin/quizzes/${data.id}/translations`,
        translation,
      );
      if (!res.ok) {
        translationWarning = ` (bản dịch "${translation.locale}" chưa lưu được: ${res.data.error ?? 'lỗi không xác định'} — hãy thêm lại trong trang Sửa quiz)`;
      }
    }

    setSaving(false);
    setSuccess(`Đã tạo quiz! Mã: ${data.id}${translationWarning}`);
    setTimeout(() => navigate(basePath), translationWarning ? 2500 : 1000);
  }

  async function handleJsonSubmit() {
    const parsed = parseQuizImportJson(jsonText);
    if (!parsed.ok) {
      setJsonError(parsed.error);
      return;
    }
    await saveQuiz(parsed.payload);
  }

  async function handleJsonFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setJsonError('Tệp JSON phải nhỏ hơn 4 MB.');
      return;
    }
    try {
      const text = await file.text();
      setJsonText(text);
      const parsed = parseQuizImportJson(text);
      setJsonError(parsed.ok ? '' : parsed.error);
    } catch {
      setJsonError('Không đọc được tệp JSON. Hãy thử lại.');
    }
  }

  function applyJsonToStudio(): boolean {
    setJsonError('');
    const parsed = parseQuizImportJson(jsonText);
    if (!parsed.ok) {
      setJsonError(parsed.error);
      return false;
    }
    saveCreateDraft(importPayloadToStudioDraft(parsed.payload));
    setStudioKey((k) => k + 1);
    setMode('studio');
    return true;
  }

  function backToStudio() {
    if (jsonText.trim()) {
      applyJsonToStudio();
      return;
    }
    setJsonError('');
    setMode('studio');
  }

  function openJsonPreview() {
    setJsonError('');
    const parsed = parseQuizImportJson(jsonText, { requireTitle: false });
    if (!parsed.ok) {
      setJsonError(parsed.error);
      return;
    }
    setPreview({ title: parsed.payload.title ?? '', questions: parsed.payload.questions });
  }

  // Default full-screen Kahoot-style studio.
  if (mode === 'studio') {
    return (
      <>
        <QuizStudio
          key={studioKey}
          mode="create"
          saving={saving}
          error={jsonError}
          success={success}
          onSave={saveQuiz}
          onCancel={() => navigate(basePath)}
          onValidationError={setJsonError}
          headerExtra={
            <>
              <Button type="button" variant="ghost" onClick={() => setMode('json')}>
                <Braces className="size-4" /> Nhập JSON
              </Button>
              <Button type="button" variant="ghost" onClick={() => setTranslationsOpen(true)}>
                <Languages className="size-4" />
                Bản dịch
                {stagedTranslations.length > 0 && ` (${stagedTranslations.length})`}
              </Button>
            </>
          }
        />
        <TranslationsDialog
          open={translationsOpen}
          onClose={() => setTranslationsOpen(false)}
          stagedLocales={stagedTranslations.map((t) => t.locale)}
          onStage={(payload) =>
            setStagedTranslations((prev) => [
              ...prev.filter((t) => t.locale !== payload.locale),
              payload,
            ])
          }
          onUnstage={(locale) =>
            setStagedTranslations((prev) => prev.filter((t) => t.locale !== locale))
          }
        />
      </>
    );
  }

  return (
    <Page>
      <CreatorNav />
      <MainContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1>Tạo quiz</h1>
            <Subtitle>Dán JSON đã tạo</Subtitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyTextButton text={QUIZ_IMPORT_EXAMPLE_JSON} tone="example" />
            <CopyTextButton text={QUIZ_IMPORT_AI_PROMPT} tone="prompt" />
            <Button type="button" variant="ghost" onClick={() => setTranslationsOpen(true)}>
              <Languages className="size-4" />
              Bản dịch
              {stagedTranslations.length > 0 && ` (${stagedTranslations.length})`}
            </Button>
            <Button type="button" variant="ghost" onClick={backToStudio}>
              <ArrowLeft className="size-4" /> Quay lại trình soạn quiz
            </Button>
          </div>
        </div>

        {jsonError && <AppAlert variant="error">{jsonError}</AppAlert>}
        {success && <AppAlert variant="success">{success}</AppAlert>}

        <Card className="w-full max-w-4xl">
          <CardContent className="p-6">
            <h2 className="mb-4">Nhập bộ câu hỏi JSON</h2>
            <AppAlert variant="info" className="text-[0.85rem]">
              Dùng <strong>Sao chép câu lệnh</strong> để lấy hướng dẫn tạo JSON bằng AI, hoặc{' '}
              <strong>Sao chép ví dụ</strong> để xem một bộ câu hỏi mẫu. Sau đó dán JSON vào đây
              và chọn <strong>Đưa vào trình soạn quiz</strong>.
            </AppAlert>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label htmlFor="quiz-json-file" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted">
                <Upload className="size-4" /> Chọn tệp JSON
              </label>
              <input
                id="quiz-json-file"
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(e) => {
                  void handleJsonFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <span className="text-sm text-muted-foreground">Hoặc dán nội dung JSON vào ô bên dưới.</span>
            </div>
            <div className="mb-3 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate(basePath)}>
                Hủy
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleJsonSubmit}
                disabled={saving || !jsonText.trim()}
              >
                {saveLabel}
              </Button>
              <Button type="button" onClick={applyJsonToStudio} disabled={!jsonText.trim()}>
                Đưa vào trình soạn quiz
              </Button>
            </div>
            <Textarea
              id="quiz-json"
              label="JSON bộ câu hỏi"
              className="font-mono min-h-80"
              placeholder={QUIZ_IMPORT_JSON_SHORT}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <details className="mt-2 mb-2">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>JSON mẫu</span>
                <CopyTextButton text={QUIZ_IMPORT_EXAMPLE_JSON} tone="example" inSummary />
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-[0.78rem] text-muted-foreground whitespace-pre-wrap">
                {QUIZ_IMPORT_EXAMPLE_JSON}
              </pre>
            </details>
            <details className="mb-4">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Câu lệnh + cấu trúc</span>
                <CopyTextButton text={QUIZ_IMPORT_AI_PROMPT} tone="prompt" inSummary />
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-[0.78rem] text-muted-foreground whitespace-pre-wrap">
                {QUIZ_IMPORT_AI_PROMPT}
              </pre>
            </details>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => navigate(basePath)}>
                Hủy
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={openJsonPreview}
                disabled={!jsonText.trim()}
              >
                <Eye className="size-4" /> Xem trước
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={handleJsonSubmit}
                disabled={saving || !jsonText.trim()}
              >
                {saveLabel}
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={applyJsonToStudio}
                disabled={!jsonText.trim()}
              >
                Đưa vào trình soạn quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainContent>
      {preview && (
        <QuizPreviewModal
          title={preview.title}
          questions={preview.questions}
          onClose={() => setPreview(null)}
        />
      )}
      <TranslationsDialog
        open={translationsOpen}
        onClose={() => setTranslationsOpen(false)}
        stagedLocales={stagedTranslations.map((t) => t.locale)}
        onStage={(payload) =>
          setStagedTranslations((prev) => [
            ...prev.filter((t) => t.locale !== payload.locale),
            payload,
          ])
        }
        onUnstage={(locale) =>
          setStagedTranslations((prev) => prev.filter((t) => t.locale !== locale))
        }
      />
    </Page>
  );
}
