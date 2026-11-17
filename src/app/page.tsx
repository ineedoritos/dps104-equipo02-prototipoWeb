
import MyActivityDashboard, { Activity, User } from "./components/activities/MyActivityDashboard";

const user: User = {
  name: "Carlos"
};

const activities: Activity[] = [
  { dummy: "Reforestación comunitaria" },
  { dummy: "Jornada de limpieza" },
  { dummy: "Entrega de alimentos" }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <MyActivityDashboard user={user} activities={activities} />

      </div>

    </main>
  );
}
