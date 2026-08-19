export type AppErrorKind = "ValidationError" | "StorageError" | "NetworkError" | "AIError" | "ContentError" | "UnknownError";

export class AppError extends Error {
  constructor(
    public readonly kind: AppErrorKind,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = kind;
  }
}

export function toLearnerMessage(error: unknown): string {
  if (error instanceof AppError) {
    if (error.kind === "StorageError") return "তোমার অগ্রগতি এখনই সংরক্ষণ করা যায়নি। আবার চেষ্টা করো।";
    if (error.kind === "ContentError") return "এই পাঠের তথ্য এখন পড়া যাচ্ছে না। অন্য পাঠ থেকে আবার চেষ্টা করো।";
  }
  return "কাজটি সম্পন্ন করা যায়নি। একটু পরে আবার চেষ্টা করো।";
}
