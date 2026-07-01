'use client';

import React, { useState } from 'react';
import { Evento, EstadisticasGlobales, SimulationParameters } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsTable } from '@/components/EventsTable';
import { Dashboard } from '@/components/Dashboard';
import { EventAnalysisModal } from '@/components/EventAnalysisModal';
import { exportarEventosExcel, exportarResumenPDF, exportarParametrosJSON } from '@/lib/export';

interface SimulationResultsProps {
  eventos: Evento[];
  estadisticas: EstadisticasGlobales;
  parametros: SimulationParameters;
}

export function SimulationResults({
  eventos,
  estadisticas,
  parametros,
}: SimulationResultsProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleEventClick = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setEventoSeleccionado(null);
  };

  return (
    <div className="space-y-6">
      {/* Sección de Exportaciones */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Opciones de Exportación</CardTitle>
          <CardDescription>Descarga los resultados en múltiples formatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => exportarEventosExcel(eventos, parametros)}
              className="bg-green-600 hover:bg-green-700"
            >
              Descargar Excel
            </Button>
            <Button
              onClick={() => exportarResumenPDF(eventos, estadisticas, parametros)}
              className="bg-red-600 hover:bg-red-700"
            >
              Descargar Resumen PDF
            </Button>
            <Button
              onClick={() => exportarParametrosJSON(parametros)}
              variant="outline"
            >
              Descargar Parámetros (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Resultados */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Tabla de Eventos</TabsTrigger>
        </TabsList>

        {/* Tab Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <Dashboard eventos={eventos} estadisticas={estadisticas} />
        </TabsContent>

        {/* Tab Tabla de Eventos */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabla Completa de Eventos</CardTitle>
              <CardDescription>
                Total: {eventos.length} eventos simulados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsTable eventos={eventos} onEventClick={handleEventClick} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Análisis */}
      <EventAnalysisModal
        evento={eventoSeleccionado}
        parametros={parametros}
        isOpen={modalAbierto}
        onClose={handleCloseModal}
      />
    </div>
  );
}
