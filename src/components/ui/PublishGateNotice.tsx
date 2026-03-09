import Link from 'next/link';

type Props = {
  reason: string;
  businessCount?: number;
};

export default function PublishGateNotice({ reason, businessCount = 0 }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-300">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined shrink-0 text-amber-500">info</span>
        <div className="flex-1">
          <p className="font-medium">{reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {businessCount <= 0 && (
              <Link href="/submit/business" className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 font-medium text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-sm">storefront</span>
                Registrar negocio
              </Link>
            )}
            <Link href="/dashboard/subscription" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 font-medium text-white hover:bg-primary-hover">
              <span className="material-symbols-outlined text-sm">card_membership</span>
              Ver planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
