/** Подпись на плашке Sage (Tag Filled): подписи цифр. */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="t-caption inline-flex items-center bg-sage px-2 py-1 text-white">
      {children}
    </span>
  );
}
