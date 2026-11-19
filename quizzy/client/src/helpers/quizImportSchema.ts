import { isSlideType, type QuestionWithKey, validateClosestToQuestion, withKey } from '@/helpers';
import { normalizeQuestion } from '@/pages/admin/components/studio/questionOps';
import type { ImportPayload, QuizTranslationPayload } from '@/types';

/** Full import example — one question per supported type, with every optional field shown. */
export const QUIZ_IMPORT_EXAMPLE = {
  title: 'Quiz kiến thức tổng hợp',
  description: 'Khởi động với 12 câu về địa lý, lập trình, âm nhạc và nhiều chủ đề khác',
  coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
  language: 'vi',
  questions: [
    {
      text: 'Thủ đô của Pháp là thành phố nào?',
      options: ['Berlin', 'Madrid', 'Paris', 'Roma'],
      correctIndex: 2,
      baseScore: 500,
      timeSec: 20,
      questionType: 'multiple_choice',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      explanation: 'Paris là thủ đô của Pháp từ năm 987.',
      tags: ['dễ', 'địa lý'],
    },
    {
      text: 'Đoạn mã này in ra gì?\n```js\nconst a = [1, 2, 3];\nconsole.log(a.map(x => x * 2));\n```',
      options: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'undefined'],
      correctIndex: 1,
      baseScore: 500,
      timeSec: 30,
      questionType: 'multiple_choice',
      explanation: 'map nhân đôi từng phần tử nên `[1,2,3]` thành `[2,4,6]`.',
      tags: ['lập trình', 'javascript'],
    },
    {
      text: 'Ảnh nào là con cáo?',
      options: [
        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600',
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
        'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600',
      ],
      correctIndex: 0,
      baseScore: 500,
      timeSec: 20,
      questionType: 'multiple_choice',
      explanation: 'A: cáo · B: chó · C: mèo · D: voi',
      tags: ['hình ảnh', 'động vật'],
    },
    {
      text: 'Nghe nhạc và đoán tên ca sĩ.',
      options: ['Rick Astley', 'Bruno Mars', 'The Weeknd', 'Ed Sheeran'],
      correctIndex: 0,
      baseScore: 500,
      timeSec: 30,
      questionType: 'multiple_choice',
      mediaType: 'audio',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=43',
      explanation: "Rick Astley — 'Never Gonna Give You Up' (bắt đầu tại 0:43).",
      tags: ['âm nhạc', 'giải trí'],
    },
    {
      text: 'Video đầu tiên trên YouTube được quay ở đâu?',
      options: ['Sở thú', 'Buổi hòa nhạc', 'Trong ô tô', 'Ở nhà'],
      correctIndex: 0,
      baseScore: 500,
      timeSec: 30,
      questionType: 'multiple_choice',
      mediaType: 'video',
      mediaUrl: 'https://youtu.be/jNQXAC9IVRw',
      explanation: "Video 'Me at the zoo' được quay tại sở thú San Diego năm 2005.",
      tags: ['kiến thức', 'giải trí'],
    },
    {
      text: 'Những số nào sau đây là số nguyên tố?',
      options: ['2', '4', '7', '9'],
      correctIndex: 0,
      correctIndices: [0, 2],
      baseScore: 600,
      timeSec: 25,
      questionType: 'multi_select',
      explanation:
        'Số nguyên tố chỉ có hai ước là 1 và chính nó. 2 và 7 là số nguyên tố.',
      tags: ['toán học', 'trung bình'],
    },
    {
      text: 'Trái Đất phẳng.',
      options: ['Đúng', 'Sai'],
      correctIndex: 1,
      baseScore: 300,
      timeSec: 20,
      questionType: 'true_false',
      explanation:
        'Trái Đất có dạng gần cầu, hơi dẹt ở hai cực.',
      tags: ['khoa học', 'dễ'],
    },
    {
      text: '2 + 2 bằng bao nhiêu?',
      options: [],
      correctIndex: 0,
      correctAnswer: '4',
      baseScore: 400,
      timeSec: 20,
      questionType: 'open_text',
      explanation: 'Phép cộng cơ bản: 2 + 2 = 4.',
      tags: ['toán học', 'dễ'],
    },
    {
      text: 'Liên minh châu Phi có bao nhiêu quốc gia thành viên?',
      options: [],
      correctIndex: 0,
      correctAnswer: '55',
      rangeMin: 1,
      rangeMax: 100,
      baseScore: 500,
      timeSec: 25,
      questionType: 'closest_to',
      explanation: 'Liên minh châu Phi có 55 quốc gia thành viên.',
      tags: ['địa lý', 'trung bình'],
    },
    {
      text: '___ là hành tinh lớn nhất và ___ gần Mặt Trời nhất.',
      options: [],
      correctIndex: 0,
      questionType: 'fill_blank',
      blanks: [['Sao Mộc'], ['Sao Thủy']],
      baseScore: 500,
      timeSec: 25,
      explanation: 'Mỗi chỗ trống đúng được tính điểm riêng.',
      tags: ['khoa học', 'vũ trụ'],
    },
    {
      text: 'Sắp xếp các sự kiện theo thời gian (sớm nhất trước).',
      options: ['Đế quốc La Mã sụp đổ', 'Thời kỳ Phục hưng', 'Con người lên Mặt Trăng', 'iPhone đầu tiên'],
      correctIndex: 0,
      questionType: 'ordering',
      baseScore: 600,
      timeSec: 30,
      explanation: 'Số điểm phụ thuộc vào số mục được đặt đúng vị trí.',
      tags: ['lịch sử', 'trung bình'],
    },
    {
      text: 'Đặt ghim vào vị trí Paris.',
      options: [],
      correctIndex: 0,
      questionType: 'geo',
      geo: { lat: 48.8566, lng: 2.3522 },
      baseScore: 500,
      timeSec: 25,
      explanation: 'Ghim càng gần vị trí thực càng nhiều điểm.',
      tags: ['địa lý', 'giải trí'],
    },
    {
      text: 'Vòng 2: Địa lý',
      options: [],
      correctIndex: 0,
      questionType: 'title_slide',
      baseScore: 0,
      explanation: 'Các câu tiếp theo về địa điểm. Quản trò chuyển tiếp khi mọi người sẵn sàng.',
    },
    {
      text: 'Ghép thủ đô với quốc gia tương ứng.',
      options: ['Paris', 'Tokyo', 'Cairo'],
      matches: ['Pháp', 'Nhật Bản', 'Ai Cập'],
      correctIndex: 0,
      questionType: 'matching',
      baseScore: 500,
      timeSec: 30,
      explanation: 'Mỗi cặp ghép đúng được tính điểm riêng.',
      tags: ['địa lý', 'trung bình'],
    },
    {
      text: 'Bảng xếp hạng hiện tại',
      options: [],
      correctIndex: 0,
      questionType: 'standings_slide',
      baseScore: 0,
    },
  ],
} satisfies ImportPayload;

export const QUIZ_IMPORT_JSON = JSON.stringify(QUIZ_IMPORT_EXAMPLE, null, 2);

/** Compact hint for the empty textarea. */
export const QUIZ_IMPORT_JSON_SHORT = `{
  "title": "Quiz của tôi",
  "description": "Mô tả không bắt buộc, hiện trong phòng chờ",
  "coverImage": "https://example.com/cover.jpg",
  "language": "vi",
  "questions": [
    {
      "text": "Thủ đô của Pháp là thành phố nào?",
      "options": ["Berlin", "Madrid", "Paris", "Roma"],
      "correctIndex": 2,
      "baseScore": 500,
      "timeSec": 20,
      "questionType": "multiple_choice"
    }
  ]
}`;

/** JSON Schema for the Quizz import format — copied by "Copy schema". */
const QUIZ_IMPORT_SCHEMA_OBJECT = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'QuizzImport',
  type: 'object',
  required: ['title', 'questions'],
  properties: {
    title: { type: 'string', description: 'Tên quiz' },
    description: { type: 'string', description: 'Dòng mô tả trong phòng chờ' },
    coverImage: { type: 'string', description: 'URL ảnh bìa phòng chờ' },
    language: {
      type: 'string',
      default: 'vi',
      description:
        'Mã ngôn ngữ của quiz (ví dụ "vi", "en", "fr"). Mặc định là tiếng Việt.',
    },
    questions: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#/$defs/question' },
    },
  },
  $defs: {
    question: {
      type: 'object',
      required: ['text', 'options', 'correctIndex'],
      properties: {
        text: {
          type: 'string',
          description: 'Nội dung câu hỏi; hỗ trợ xuống dòng, ```khối mã``` và `mã trong dòng`',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Các đáp án; URL ảnh sẽ hiện thành ảnh. Với câu sắp xếp, liệt kê theo thứ tự đúng; với ghép cặp, đây là cột trái. Dùng [] cho open_text, closest_to, fill_blank, geo.',
        },
        correctIndex: {
          type: 'integer',
          minimum: 0,
          description: 'Vị trí đáp án đúng, tính từ 0; dùng 0 khi options là []',
        },
        correctIndices: {
          type: 'array',
          items: { type: 'integer', minimum: 0 },
          description: 'multi_select: vị trí của tất cả đáp án đúng',
        },
        correctAnswer: {
          type: 'string',
          description: 'open_text: đáp án được chấp nhận; closest_to: số đúng dạng chuỗi',
        },
        questionType: {
          type: 'string',
          enum: [
            'multiple_choice',
            'multi_select',
            'true_false',
            'open_text',
            'closest_to',
            'fill_blank',
            'ordering',
            'geo',
            'matching',
            'title_slide',
            'standings_slide',
          ],
          description:
            'title_slide: trang mở đầu, text là tiêu đề và explanation là nội dung. standings_slide: hiện bảng xếp hạng dưới tiêu đề. Trang trình chiếu không có đáp án hoặc đồng hồ; dùng options [] và correctIndex 0.',
          default: 'multiple_choice',
        },
        baseScore: {
          type: 'integer',
          default: 500,
          description: 'Điểm cho đáp án đúng hoàn toàn',
        },
        timeSec: { type: 'integer', default: 20, description: 'Số giây để trả lời' },
        imageUrl: { type: 'string', description: 'URL ảnh câu hỏi' },
        explanation: {
          type: 'string',
          description: 'Hiện sau khi công bố đáp án; với title_slide là nội dung trang',
        },
        rangeMin: { type: 'number', description: 'closest_to: giới hạn dưới' },
        rangeMax: { type: 'number', description: 'closest_to: giới hạn trên' },
        mediaUrl: {
          type: 'string',
          description: 'URL YouTube (hỗ trợ ?t=SECONDS để chọn thời điểm bắt đầu)',
        },
        mediaType: {
          type: 'string',
          enum: ['audio', 'video'],
          description: 'audio: chỉ phát âm thanh; video: phát video trong trang',
        },
        blanks: {
          type: 'array',
          items: { type: 'array', items: { type: 'string' } },
          description: 'fill_blank: đáp án chấp nhận cho mỗi ___, không phân biệt chữ hoa',
        },
        geo: {
          type: 'object',
          required: ['lat', 'lng'],
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
          description: 'geo: vị trí đúng trên bản đồ',
        },
        matches: {
          type: 'array',
          items: { type: 'string' },
          description:
            'matching: mục bên phải tương ứng với mỗi options[i] bên trái; 2–6 cặp, cùng thứ tự với options',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Thẻ tự do (chủ đề, độ khó); hiện trong phòng chờ',
        },
      },
    },
  },
} as const;

export const QUIZ_IMPORT_SCHEMA = JSON.stringify(QUIZ_IMPORT_SCHEMA_OBJECT, null, 2);

/** Full example JSON — shown in the UI for reference, not included in schema copy. */
export const QUIZ_IMPORT_EXAMPLE_JSON = QUIZ_IMPORT_JSON;

/** AI task instructions only. */
const QUIZ_IMPORT_AI_INSTRUCTIONS = `Tôi đang tạo bộ câu hỏi cho Quizzy, ứng dụng quiz nhiều người chơi.

Hãy tạo một quiz hoàn chỉnh bằng JSON đúng theo cấu trúc bên dưới.

Chọn nội dung câu hỏi:
• Nếu tôi đính kèm hoặc dán tài liệu (PDF, bài giảng, slide, bài viết...), hãy lấy câu hỏi từ tài liệu đó.
• Nếu không có tài liệu, hãy tạo câu hỏi từ chủ đề hoặc hướng dẫn tôi cung cấp.

Yêu cầu:
1. Chỉ xuất JSON hợp lệ, không có hàng rào mã Markdown hoặc lời giải thích ngoài JSON.
2. Giữ nguyên tên trường và loại câu hỏi trong cấu trúc JSON bên dưới.
3. Thêm tiêu đề và mô tả rõ ràng cho phòng chờ.
4. Đặt "language" là "vi" khi câu hỏi bằng tiếng Việt; nếu dùng ngôn ngữ khác, hãy đặt mã tương ứng.
5. Thêm lời giải thích cho từng câu hỏi, hiện sau khi công bố đáp án.
6. Thêm thẻ chủ đề hoặc độ khó khi phù hợp và kết hợp nhiều loại câu hỏi.
7. Nếu quiz có nhiều chủ đề hoặc vòng, thêm "title_slide" trước mỗi vòng và "standings_slide" giữa các vòng. Quiz phải có ít nhất một câu hỏi thật.
8. Kiểm tra kỹ correctIndex, correctIndices, correctAnswer, blanks và tọa độ geo.`;

/** Prompt + JSON schema — copied by "Copy prompt". */
export const QUIZ_IMPORT_AI_PROMPT = `${QUIZ_IMPORT_AI_INSTRUCTIONS}

=== JSON SCHEMA ===
${QUIZ_IMPORT_SCHEMA}`;

export type ParsedQuizImport = { ok: true; payload: ImportPayload } | { ok: false; error: string };

/**
 * Parse and validate pasted quiz JSON before import or direct save.
 * Pass `requireTitle: false` for preview, where a top-level title is optional.
 */
export function parseQuizImportJson(
  text: string,
  { requireTitle = true }: { requireTitle?: boolean } = {},
): ParsedQuizImport {
  let payload: ImportPayload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, error: 'JSON không hợp lệ — hãy kiểm tra định dạng' };
  }
  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    return { ok: false, error: 'JSON cần có mảng "questions" không rỗng' };
  }
  if (requireTitle && !payload.title) {
    return { ok: false, error: 'JSON cần có "title" và mảng "questions" không rỗng' };
  }
  if (payload.questions.every((q) => isSlideType(q.questionType))) {
    return { ok: false, error: 'JSON cần ít nhất một câu hỏi, không chỉ có trang trình chiếu' };
  }
  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    if (isSlideType(q.questionType) && !q.text?.trim()) {
      return { ok: false, error: `Trang ${i + 1} thiếu "text" (tiêu đề)` };
    }
    if ((q.questionType ?? 'multiple_choice') === 'closest_to') {
      const err = validateClosestToQuestion(q, i);
      if (err) return { ok: false, error: err };
    }
  }
  return { ok: true, payload };
}

export type ParsedQuizTranslation =
  | { ok: true; payload: QuizTranslationPayload }
  | { ok: false; error: string };

/**
 * Parse and validate a pasted translation JSON before uploading it against an
 * existing quiz. `expectedCount` is the base quiz's current question count —
 * translations are matched to base questions by order/index, so the counts
 * must match exactly (the server re-validates this regardless). Omit
 * `expectedCount` when the base quiz doesn't have a stable question count yet
 * (e.g. staged during quiz creation, before the first save) — the count is
 * then only checked server-side, once the quiz exists.
 *
 * `locale` is normally set via the modal's own locale field, taking priority
 * over a top-level `"locale"` in the pasted JSON — either works, so JSON
 * copied from the example (which embeds one) still parses on its own.
 */
export function parseQuizTranslationJson(
  text: string,
  { expectedCount, locale }: { expectedCount?: number; locale?: string } = {},
): ParsedQuizTranslation {
  let payload: QuizTranslationPayload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, error: 'JSON không hợp lệ — hãy kiểm tra định dạng' };
  }
  const resolvedLocale = locale?.trim() || payload.locale?.trim();
  if (!resolvedLocale) {
    return { ok: false, error: 'Hãy nhập mã ngôn ngữ (ví dụ "fr", "es-MX")' };
  }
  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    return { ok: false, error: 'JSON cần có mảng "questions" không rỗng' };
  }
  if (expectedCount !== undefined && payload.questions.length !== expectedCount) {
    return {
      ok: false,
      error: `Quiz có ${expectedCount} câu nhưng bản dịch có ${payload.questions.length} câu. Số lượng và thứ tự phải giống nhau.`,
    };
  }
  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    if (!q.text?.trim()) return { ok: false, error: `Câu ${i + 1} thiếu "text"` };
    if (!Array.isArray(q.options)) {
      return { ok: false, error: `Câu ${i + 1} thiếu mảng "options"` };
    }
  }
  return { ok: true, payload: { ...payload, locale: resolvedLocale } };
}

/** Convert a validated import payload into studio slide state. */
export function importPayloadToStudioDraft(payload: ImportPayload): {
  title: string;
  description: string;
  coverImage: string;
  questions: QuestionWithKey[];
} {
  return {
    title: payload.title,
    description: payload.description ?? '',
    coverImage: payload.coverImage ?? '',
    questions: payload.questions.map((q) => withKey(normalizeQuestion(q))),
  };
}
