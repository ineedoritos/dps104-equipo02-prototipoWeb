
"use client";

import { useState } from "react";


export interface User {
  name: string;
}

export interface Activity {
  dummy: string;
}

export interface MyActivityDashboardProps {
  user: User;
  activities: Activity[];
}

export interface ActivityFilters {
  status: ActivityStatus | "all";
  tags: string[];
  dateFrom: string;
  dateTo: string;
}

export type ActivityStatus =
  | "upcoming"
  | "current"
  | "completed";


export default function MyActivityDashboard({
  activities,user
}: MyActivityDashboardProps): React.JSX.Element {

  // const [filters, setFilters] = useState<ActivityFilters>({
  //   status: "all",
  //   tags: [],
  //   dateFrom: "",
  //   dateTo: ""
  // });


  // Cambiar estado de actividad
  const handleStatusChange = (status: ActivityStatus | "all") => {
    // setFilters(prev => ({
    //   ...prev,
    //   status
    // }));
  };

  // Agregar o quitar etiquetas
  const handleTagsChange = (tag: string) => {
    // setFilters(prev => ({
    //   ...prev,
    //   tags: prev.tags.includes(tag)
    //     ? prev.tags.filter(item => item !== tag)
    //     : [...prev.tags, tag]
    // }));
  };

  // Cambiar fecha inicial
  const handleDateFromChange = (date: string) => {
    // setFilters(prev => ({
    //   ...prev,
    //   dateFrom: date
    // }));
  };

  // Cambiar fecha final
  const handleDateToChange = (date: string) => {
    // setFilters(prev => ({
    //   ...prev,
    //   dateTo: date
    // }));
  };

  // LIMPIAR FILTROS
  const handleClearFilters = () => {
    setFilters({
      status: "all",
      tags: [],
      dateFrom: "",
      dateTo: ""
    });
  };

  return (
    <div className="w-full">

      {/* CONTENEDOR PRINCIPAL */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">

        {/* ENCABEZADO */}
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            ¡Hola, {user.name}! 👋
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Tu comunidad te necesita. Consulta tus actividades y registra tu participación.
          </p>
        </header>

        {/* FILTROS DE ACTIVIDADES */}
        <section className="mt-10">
        
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Filtrar actividades
            </h2>
        
            <p className="mt-1 text-sm text-slate-500">
              Encuentra actividades según su estado, categoría o fecha.
            </p>
          </div>
        
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 lg:grid-cols-4">
        
            {/* FILTRO POR ESTADO */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Estado
              </label>
        
              <select
                // value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value as ActivityStatus | "all")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
              >
                <option value="all">Todos los estados</option>
                <option value="upcoming">Programadas</option>
                <option value="current">En curso</option>
                <option value="completed">Completadas</option>
              </select>
            </div>
        
            {/* FILTRO POR FECHA INICIAL */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Desde
              </label>
        
              <input
                type="date"
                // value={filters.dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
              />
            </div>
        
            {/* FILTRO POR FECHA FINAL */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Hasta
              </label>
        
              <input
                type="date"
                // value={filters.dateTo}
                // min={filters.dateFrom || undefined}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
              />
            </div>
        
            {/* LIMPIAR FILTROS */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                Limpiar filtros
              </button>
            </div>
        
          </div>
        
        </section>

        
        {/* LISTA DE ACTIVIDADES */}
        <section className="mt-10">
        
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Mis actividades
            </h2>
        
            <p className="mt-1 text-sm text-slate-500">
              Consulta tus próximas actividades y revisa las que ya has realizado.
            </p>
          </div>
        
          {activities.map((activity, index) => (
            <div key={index}>
              {/* Aquí irá ActivityCard */}
            </div>
          ))}
        
        </section>

      </div>

    </div>
  );
}
