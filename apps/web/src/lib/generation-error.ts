const GENERIC_FAILURE_MESSAGE =
  "웹페이지 생성 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.";

export function getGenerationErrorMessage(error?: string | null): string {
  const message = error?.trim();

  if (!message) return GENERIC_FAILURE_MESSAGE;

  if (
    /(?:FastAPI|Unprocessable Entity|\/generate|railway\.app)/i.test(message) ||
    /\b422\b/.test(message)
  ) {
    return "입력 정보 형식이 AI 생성 조건과 맞지 않아요. 입력 내용을 확인한 뒤 다시 시도해주세요.";
  }

  if (/(?:timeout|timed out|시간 초과)/i.test(message)) {
    return "웹페이지 생성 시간이 초과되었어요. 잠시 후 다시 시도해주세요.";
  }

  if (
    /(?:NetworkError|Failed to fetch|connection|연결이.*끊|ECONN)/i.test(
      message,
    )
  ) {
    return "생성 서버와 연결하지 못했어요. 잠시 후 다시 시도해주세요.";
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
