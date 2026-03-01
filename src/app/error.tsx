"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-bold text-2xl text-foreground">エラーが発生しました</h2>
        <p className="max-w-md text-muted text-sm">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-radius-md bg-primary px-6 py-3 font-medium text-sm text-white transition-colors hover:bg-primary-hover active:bg-primary-active"
      >
        もう一度試す
      </button>
    </div>
  );
}
