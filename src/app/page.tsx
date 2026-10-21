import { Button } from "@/components/ui/Button";

/**
 * ВРЕМЕННО. В макете нет входной страницы: как сотрудник попадает на «свою»
 * версию (ссылка от HR, выбор при входе), ещё решается. Пока здесь два адреса.
 */
export default function Home() {
  return (
    <main className="gutter-x flex min-h-screen flex-col justify-center gap-8 py-16">
      <p className="t-caption text-red">[Welcome Book]</p>
      <h1 className="t-h1 max-w-[16ch]">Выбери свою версию онбординга</h1>
      <div className="flex flex-col gap-3 md:flex-row">
        <Button href="/office">Office</Button>
        <Button href="/retail">Retail</Button>
      </div>
    </main>
  );
}
