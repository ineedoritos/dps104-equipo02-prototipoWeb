import type { LucideIcon } from "lucide-react";

const TONOS_METRICA = {
  blue: "bg-forma-blue text-forma-blue-ink",
  mint: "bg-forma-mint text-forma-mint-ink",
  peach: "bg-forma-peach text-forma-peach-ink",
  lilac: "bg-forma-lilac text-forma-lilac-ink",
};

export function Metrica({
  icono: Icono, tono, etiqueta, valor, detalle,
}: {
  icono: LucideIcon;
  tono: keyof typeof TONOS_METRICA;
  etiqueta: string;
  valor: string | number;
  detalle: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[24px] bg-forma-canvas p-2.5">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${TONOS_METRICA[tono]}`}>
        <Icono aria-hidden="true" size={21} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-forma-muted">{etiqueta}</dt>
        <dd className="text-xl font-semibold leading-tight tracking-tight text-forma-ink tabular-nums">{valor}</dd>
        <dd className="text-xs leading-snug text-forma-muted">{detalle}</dd>
      </div>
    </div>
  );
}
