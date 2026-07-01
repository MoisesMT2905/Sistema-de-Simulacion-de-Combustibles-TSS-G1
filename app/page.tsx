'use client';

import React, { useState } from 'react';
import { SimulationParameters, EstadoSimulacion } from '@/lib/types';
import { SimulationEngine } from '@/lib/simulation';
import { SimulationParametersForm } from '@/components/SimulationParameters';
import { SimulationResults } from '@/components/SimulationResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  const [estadoSimulacion, setEstadoSimulacion] = useState<EstadoSimulacion | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [tiempo, setTiempo] = useState(0);

  const handleSimulationStart = (parametros: SimulationParameters) => {
    setProgreso(0);
    setTiempo(0);

    // Ejecutar simulación en un setTimeout para no bloquear el UI
    setTimeout(() => {
      const tiempoInicio = performance.now();

      const engine = new SimulationEngine(parametros);
      const eventos = engine.simular((progreso) => {
        setProgreso(progreso);
      });

      const tiempoFinal = performance.now();

      setEstadoSimulacion({
        parametros,
        eventos,
        estadisticas: engine.getEstadisticas(),
        enProgreso: false,
        progreso: 100,
        tiempo: tiempoFinal - tiempoInicio,
      });

      setTiempo(tiempoFinal - tiempoInicio);
      setProgreso(100);
    }, 100);
  };

  const handleReset = () => {
    setEstadoSimulacion(null);
    setProgreso(0);
    setTiempo(0);
  };

  const isSimulating = estadoSimulacion === null && progreso > 0 && progreso < 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Simulación de Combustibles
          </h1>
          <p className="text-gray-600">
            Basado en simulación de eventos discretos con análisis de decisiones de usuarios
          </p>
        </div>

        {/* Tabs Principal */}
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parameters">Parámetros</TabsTrigger>
            <TabsTrigger value="results" disabled={!estadoSimulacion}>
              Resultados
            </TabsTrigger>
          </TabsList>

          {/* Tab Parámetros */}
          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurar Simulación</CardTitle>
                <CardDescription>
                  Ajusta todos los parámetros del sistema. TODOS los valores son parametrizables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulationParametersForm
                  onSimulationStart={handleSimulationStart}
                  onReset={handleReset}
                  isSimulating={isSimulating}
                />
              </CardContent>
            </Card>

            {/* Barra de Progreso */}
            {isSimulating && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Simulación en Progreso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm font-bold text-blue-600">{Math.round(progreso)}%</span>
                    </div>
                    <Progress value={progreso} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Procesando eventos... Por favor espera mientras se ejecuta la simulación.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información de Finalización */}
            {estadoSimulacion && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">Simulación Completada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total de Eventos</p>
                      <p className="text-2xl font-bold text-green-700">
                        {estadoSimulacion.eventos.length.toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tiempo de Ejecución</p>
                      <p className="text-2xl font-bold text-green-700">
                        {(tiempo / 1000).toFixed(2)}s
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const resultsTab = document.querySelector('[value="results"]') as HTMLButtonElement;
                      if (resultsTab) resultsTab.click();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
                  >
                    Ver Resultados y Gráficos
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Resultados */}
          {estadoSimulacion && (
            <TabsContent value="results" className="space-y-6">
              <SimulationResults
                eventos={estadoSimulacion.eventos}
                estadisticas={estadoSimulacion.estadisticas}
                parametros={estadoSimulacion.parametros}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <div className="text-center py-8 border-t mt-12">
          <p className="text-sm text-gray-500">
            Sistema de Simulación basado en el libro de Raúl Coss Bú
          </p>
        </div>
      </div>
    </main>
  );
}
