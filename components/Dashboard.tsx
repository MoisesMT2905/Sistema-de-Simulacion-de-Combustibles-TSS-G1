'use client';

import React from 'react';
import { EstadisticasGlobales, Evento } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumberES } from '@/lib/utils';

interface DashboardProps {
  estadisticas: EstadisticasGlobales;
  eventos: Evento[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function Dashboard({ estadisticas, eventos }: DashboardProps) {
  // Datos para gráfico de ingresos por surtidor
  const datosIngresos = estadisticas.estadisticasPorSurtidor.map((stat) => ({
    nombre: `${stat.surtidorTipo === 'subvencionado' ? 'Sub' : 'Int'} #${stat.numeroSurtidor}`,
    ingreso: stat.ingresoTotal,
    volumen: stat.volumenTotal,
  }));

  // Datos para gráfico de demanda acumulada
  const datosDemanda = estadisticas.estadisticasPorSurtidor.map((stat) => ({
    nombre: `${stat.surtidorTipo === 'subvencionado' ? 'Sub' : 'Int'} #${stat.numeroSurtidor}`,
    volumen: stat.volumenTotal,
  }));

  // Datos para gráfico de migración
  const datosMigracion = estadisticas.estadisticasPorTrimestre.map((stat) => ({
    trimestre: `T${stat.trimestre}`,
    migracion: stat.migracionAlInternacional,
    eventos: stat.totalEventos,
  }));

  // Datos para pastel de perfiles
  const datosPerfiles = [
    {
      nombre: 'Transporte Pesado',
      valor: estadisticas.proporcionPesadoReal,
    },
    {
      nombre: 'Vehículos Particulares',
      valor: estadisticas.proporcionParticularReal,
    },
  ];

  // Datos para tiempo de espera
  const datosEspera = estadisticas.estadisticasPorSurtidor.map((stat) => ({
    nombre: `${stat.surtidorTipo === 'subvencionado' ? 'Sub' : 'Int'} #${stat.numeroSurtidor}`,
    espera: parseFloat(stat.tiempoPromedioEspera.toString()),
  }));

  // Datos para congestión temporal
  const datosCongestión = eventos.reduce((acc: any[], evento) => {
    const trimestre = evento.trimestre;
    const existente = acc.find((item) => item.trimestre === trimestre);
    
    if (existente) {
      existente.congestión += evento.tiempoRealEnCola;
      existente.eventos++;
    } else {
      acc.push({
        trimestre: `T${trimestre}`,
        congestión: evento.tiempoRealEnCola,
        eventos: 1,
      });
    }
    
    return acc;
  }, []);

  // Promediar congestión
  datosCongestión.forEach((item: any) => {
    item.congestión = item.congestión / item.eventos;
  });

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumberES(estadisticas.totalEventos)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Volumen Total (L)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumberES(estadisticas.totalVolumen, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingreso Total (Bs)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {formatNumberES(estadisticas.totalIngreso, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Espera Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {formatNumberES(estadisticas.tiempoPromedioEsperaGlobal, 1)} min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Ingresos por Surtidor */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Surtidor</CardTitle>
            <CardDescription>Comparación de ingresos totales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosIngresos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis label={{ value: 'Ingresos (Bs)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatNumberES(value as number, 0)} />
                <Legend />
                <Bar dataKey="ingreso" fill="#3b82f6" name="Ingreso (Bs)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Demanda Acumulada */}
        <Card>
          <CardHeader>
            <CardTitle>Demanda Acumulada por Surtidor</CardTitle>
            <CardDescription>Volumen total cargado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosDemanda}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis label={{ value: 'Volumen (L)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => formatNumberES(value as number, 0)} />
                <Legend />
                <Bar dataKey="volumen" fill="#10b981" name="Volumen (L)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: Migración a Internacional */}
        <Card>
          <CardHeader>
            <CardTitle>Migración a Internacional</CardTitle>
            <CardDescription>Evolución temporal del cambio de surtidor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosMigracion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimestre" />
                <YAxis label={{ value: 'Migración (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${formatNumberES(value as number, 2)}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="migracion"
                  stroke="#ef4444"
                  name="Migración (%)"
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 4: Perfiles de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Clientes</CardTitle>
            <CardDescription>Proporción por perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosPerfiles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, valor }) => `${nombre}: ${formatNumberES(valor, 1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {datosPerfiles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatNumberES(value as number, 2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 5: Tiempo de Espera */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo Promedio de Espera</CardTitle>
            <CardDescription>Por surtidor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosEspera}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis label={{ value: 'Tiempo (min)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${formatNumberES(value as number, 2)} min`} />
                <Legend />
                <Bar dataKey="espera" fill="#f59e0b" name="Espera Promedio (min)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 6: Congestión Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Congestión Temporal</CardTitle>
            <CardDescription>Evolución de la congestión</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={datosCongestión}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimestre" />
                <YAxis label={{ value: 'Congestión (min)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${formatNumberES(value as number, 2)} min`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="congestión"
                  fill="#8b5cf6"
                  stroke="#8b5cf6"
                  name="Congestión Promedio (min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Estadísticas por Surtidor */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Surtidor</CardTitle>
          <CardDescription>Detalles de desempeño</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">Surtidor</th>
                  <th className="text-right py-2 px-4 font-semibold">Eventos</th>
                  <th className="text-right py-2 px-4 font-semibold">Volumen (L)</th>
                  <th className="text-right py-2 px-4 font-semibold">Ingreso (Bs)</th>
                  <th className="text-right py-2 px-4 font-semibold">Espera (min)</th>
                  <th className="text-right py-2 px-4 font-semibold">Ocupación (%)</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.estadisticasPorSurtidor.map((stat, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          stat.surtidorTipo === 'subvencionado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {stat.surtidorTipo === 'subvencionado' ? 'Sub' : 'Int'} #{stat.numeroSurtidor}
                      </span>
                    </td>
                    <td className="text-right py-2 px-4">{stat.totalEventos}</td>
                    <td className="text-right py-2 px-4">{formatNumberES(stat.volumenTotal, 2)}</td>
                    <td className="text-right py-2 px-4 font-semibold text-green-700">
                      {formatNumberES(stat.ingresoTotal, 2)}
                    </td>
                    <td className="text-right py-2 px-4">{formatNumberES(stat.tiempoPromedioEspera, 2)}</td>
                    <td className="text-right py-2 px-4">{formatNumberES(stat.tasaOcupacion, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
