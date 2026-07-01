'use client';

import React, { useRef } from 'react';
import { Evento, SimulationParameters } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumberES, formatTimeES } from '@/lib/utils';
import { calcularEscenarioAlternativo, calcularPrecioTrimestre } from '@/lib/calculations';
import { exportarEventoPDF } from '@/lib/export';

interface EventAnalysisModalProps {
  evento: Evento | null;
  parametros: SimulationParameters;
  isOpen: boolean;
  onClose: () => void;
}

export function EventAnalysisModal({
  evento,
  parametros,
  isOpen,
  onClose,
}: EventAnalysisModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!evento) return null;

  const precioActual = calcularPrecioTrimestre(parametros, evento.trimestre);
  const escenarioAlternativo = calcularEscenarioAlternativo(evento, parametros, precioActual);

  const datos = [
    {
      nombre: 'Subvencionado',
      costo: evento.costoSubvencionado,
      seleccionado: evento.surtidorAsignado === 'subvencionado',
    },
    {
      nombre: 'Internacional',
      costo: evento.costoInternacional,
      seleccionado: evento.surtidorAsignado === 'internacional',
    },
  ];

  const handleExportPDF = async () => {
    if (contentRef.current) {
      await exportarEventoPDF(evento, parametros, contentRef.current);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Análisis Detallado del Evento #{evento.id}</DialogTitle>
          <DialogDescription>Análisis completo de decisión del surtidor</DialogDescription>
        </DialogHeader>

        <div ref={contentRef} className="space-y-6 p-4">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Vehículo</h4>
              <p className="text-lg font-bold text-gray-900">{evento.vehiculoId}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Perfil</h4>
              <p className="text-lg font-bold text-gray-900">
                {evento.perfil === 'pesado' ? 'Transporte Pesado' : 'Vehículo Particular'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Volumen</h4>
              <p className="text-lg font-bold text-gray-900">{formatNumberES(evento.volumen, 2)} L</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-600">Trimestre</h4>
              <p className="text-lg font-bold text-gray-900">{evento.trimestre}</p>
            </div>
          </div>

          {/* Gráfico de Comparación de Costos */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Comparación de Costos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis label={{ value: 'Costo (Bs)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value) => formatNumberES(value as number, 2)}
                  labelFormatter={(label) => `${label} Bs`}
                />
                <Legend />
                <Bar
                  dataKey="costo"
                  fill="#3b82f6"
                  name="Costo Total (Bs)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Surtidor Seleccionado:</span>{' '}
                {evento.surtidorAsignado === 'subvencionado' ? 'Subvencionado' : 'Internacional'} (
                {formatNumberES(evento.costoTotalFinal, 2)} Bs)
              </p>
            </div>
          </div>

          {/* Detalles de Costos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Desglose de Costos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Precio Utilizado</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatNumberES(evento.precioUtilizado, 2)} Bs/L
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Costo Combustible</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatNumberES(evento.precioUtilizado * evento.volumen, 2)} Bs
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Costo Oportunidad</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatNumberES(evento.costoOportunidadTotal, 2)} Bs
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Costo Total Final</p>
                <p className="text-lg font-bold text-green-700">
                  {formatNumberES(evento.costoTotalFinal, 2)} Bs
                </p>
              </div>
            </div>
          </div>

          {/* Detalles Temporales */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Detalles Temporales</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Minuto de Arribo</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatNumberES(evento.minutoArribo, 1)}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Espera Estimada</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatTimeES(evento.esperaEstimada)}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Tiempo de Servicio</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatTimeES(evento.tiempoServicioEstimado)}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-xs text-gray-600">Tiempo Real en Cola</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatTimeES(evento.tiempoRealEnCola)}
                </p>
              </div>
            </div>
          </div>

          {/* Análisis de Decisión */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Análisis de Decisión</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                El cliente optó por el surtidor{' '}
                <span className="font-semibold">
                  {evento.surtidorAsignado === 'subvencionado' ? 'subvencionado' : 'internacional'}
                </span>{' '}
                al costo de{' '}
                <span className="font-bold text-green-700">{formatNumberES(evento.costoTotalFinal, 2)} Bs</span>.
              </p>
              <p>
                Si hubiera elegido el surtidor alternativo, el costo habría sido{' '}
                <span className="font-bold">{formatNumberES(escenarioAlternativo.costo, 2)} Bs</span>.
              </p>
              <p>
                {escenarioAlternativo.diferencia > 0 ? (
                  <>
                    <span className="font-semibold text-green-700">Ahorró:</span>{' '}
                    <span className="font-bold text-green-700">
                      {formatNumberES(Math.abs(escenarioAlternativo.diferencia), 2)} Bs
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-orange-600">Perdió:</span>{' '}
                    <span className="font-bold text-orange-600">
                      {formatNumberES(Math.abs(escenarioAlternativo.diferencia), 2)} Bs
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700">
            Exportar a PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
