import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";

type ReaderFooterProps = {
  page: number;
  totalPages: number;
  freePageLimit: number;
  isSubscriber: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJump: (page: number) => void;
  visible: boolean;
};

export function ReaderFooter({
  page,
  totalPages,
  freePageLimit,
  isSubscriber,
  loading,
  onPrev,
  onNext,
  onJump,
  visible,
}: ReaderFooterProps) {
  const atPaywall = !isSubscriber && page >= freePageLimit;

  return (
    <footer
      className={cn(
        "reader-chrome fixed inset-x-0 bottom-0 z-50 transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="reader-footer border-t backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="w-10 text-xs tabular-nums opacity-50">1</span>
            <input
              type="range"
              min={1}
              max={totalPages}
              value={page}
              disabled={loading}
              onChange={(e) => onJump(Number(e.target.value))}
              className="reader-slider flex-1"
            />
            <span className="w-10 text-right text-xs tabular-nums opacity-50">{totalPages}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={onPrev}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm font-medium tabular-nums">
                Page {page} of {totalPages}
              </p>
              {!isSubscriber && (
                <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-amber-500">
                  <Lock className="h-3 w-3" />
                  {freePageLimit} free pages
                  {atPaywall && " · limit reached"}
                </p>
              )}
            </div>

            <Button variant="secondary" size="sm" disabled={page >= totalPages || loading} onClick={onNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
