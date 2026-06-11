const GENERIC_FAILURE_MESSAGE =
  "웹페이지 생성 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.";

const VALIDATION_FAILURE_MESSAGE =
  "입력 정보 형식이 AI 생성 조건과 맞지 않아요. 입력 내용을 확인한 뒤 다시 시도해주세요.";

const AI_SERVER_FAILURE_MESSAGE =
  "AI 생성 서버에서 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.";

export const GENERATION_STATUS_CONNECTION_MESSAGE =
  "생성 상태 연결이 잠시 끊겼어요. 생성은 계속 진행될 수 있으니 웹사이트 관리에서 다시 확인해주세요.";

export function getGenerationErrorMessage(
  error?: string | null,
  status?: number,
): string {
  const message = error?.trim();

  if (!message) return GENERIC_FAILURE_MESSAGE;

  if (
    /생성 상태 연결이.*끊/i.test(message) ||
    /생성은 계속 진행될 수/i.test(message)
  ) {
    return GENERATION_STATUS_CONNECTION_MESSAGE;
  }

  if (
    status === 422 ||
    /Unprocessable Entity/i.test(message) ||
    /\b422\b/.test(message)
  ) {
    return VALIDATION_FAILURE_MESSAGE;
  }

  if (
    (status != null && status >= 500) ||
    /FastAPI\s*5\d{2}/i.test(message) ||
    /\b5\d{2}\b.*(?:POST\s+)?https?:\/\/\S*\/generate/i.test(message) ||
    /POST\s+\S*\/generate/i.test(message) ||
    /(?:AI|생성)\s*서버.*(?:오류|실패)/i.test(message)
  ) {
    return AI_SERVER_FAILURE_MESSAGE;
  }

  if (/(?:timeout|timed out|시간 초과)/i.test(message)) {
    return "웹페이지 생성 시간이 초과되었어요. 잠시 후 다시 시도해주세요.";
  }

  if (
    /(?:NetworkError|Failed to fetch|connection|연결이.*끊|ECONN)/i.test(
      message,
    )
  ) {
    return "생성 서버와 통신하지 못했어요. 잠시 후 다시 시도해주세요.";
  }

  if (
    /(?:Exception|https?:\/\/|POST |GET |\b[45]\d{2}\b|서버 응답이 비어)/i.test(
      message,
    )
  ) {
    return GENERIC_FAILURE_MESSAGE;
  }

  return message;
}
