// components/ActivityCard.tsx

export type ActivityStatus = 'upcoming' | 'current' | 'completed';

export interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  location: string;
  participants: number;
  evidenceCount: number;
  status: ActivityStatus;
}

export interface ActivityCardProps {
  activity: Activity;
  variant: ActivityStatus;
}

const variantConfig: Record<
  ActivityStatus,
  {
    label: string;
    badgeClasses: string;
    borderClasses: string;
    dotClasses: string;
  }
> = {
  current: {
    label: 'En curso',
    badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClasses: 'border-t-4 border-t-emerald-500',
    dotClasses: 'bg-emerald-500 animate-pulse',
  },
  upcoming: {
    label: 'Próxima',
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClasses: 'border-t-4 border-t-blue-500',
    dotClasses: 'bg-blue-500',
  },
  completed: {
    label: 'Completada',
    badgeClasses: 'bg-slate-100 text-slate-600 border-slate-200',
    borderClasses: 'border-t-4 border-t-slate-400',
    dotClasses: 'bg-slate-400',
  },
};

export default function ActivityCard({ activity, variant }: ActivityCardProps) {
  const styles = variantConfig[variant];

  return (
    <article
      className={`flex flex-col justify-between bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 ${styles.borderClasses}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badgeClasses}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dotClasses}`} />
            {styles.label}
          </span>

          <span className="text-xs font-medium text-slate-500">
            {activity.date} · {activity.startTime}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
          {activity.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {activity.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <span>📍</span>
          <span className="font-medium text-slate-700">{activity.location}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
          <span>
            👥 <strong className="text-slate-800">{activity.participants}</strong> participantes
          </span>
          <span>
            📸 <strong className="text-slate-800">{activity.evidenceCount}</strong> evidencias
          </span>
        </div>
      </div>
    </article>
  );
}