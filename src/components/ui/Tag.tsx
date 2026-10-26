/** Красная плашка (Tag Filled): подписи цифр. */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="t-caption inline-flex items-center bg-red px-2 py-1 text-white">
      {children}
    </span>
  );
}
