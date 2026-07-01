'use client';

import React, { useState } from 'react';
import { SimulationParameters } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SimulationParametersProps {
  onSimulationStart: (params: SimulationParameters) => void;
  onReset: () => void;
  isSimulating: boolean;
}

export function SimulationParametersForm({ onSimulationStart, onReset, isSimulating }: SimulationParametersProps) {
  const [params, setParams] = useState<SimulationParameters>({
    // Precios
    precioSubvencionadoInicial: 0.50,
    incrementoTrimestral: 0.10,
    precioInternacional: 2.50,

    // Surtidores
    surtidoresSubvencionados: 3,
    surtidoresInternacionales: 2,

    // Simulación
    numeroEventos: 1000,
    periodoSimulacionMinutos: 1440, // 1 día
    numeroTrimestres: 4,

    // Perfiles
    proporcionPesado: 40,
    volumenMinimoPesado: 50,
    volumenMaximoPesado: 500,
    volumenMinimoParticular: 10,
    volumenMaximoParticular: 100,

    // Costos de Oportunidad
    costoOportunidadPesado: 50,
    costoOportunidadParticular: 10,

    // Distribuciones
    tipoDistribucionArribos: 'exponencial',
    parametroArribosLambda: 0.5,
    parametroArribosMean: 2,

    tipoDistribucionServicio: 'normal',
    parametroServicioMean: 10,
    parametroServicioDevEst: 3,

    // Capacidades
    capacidadMaximaColaPorSurtidor: 50,
    tiempoServicioPromedioPorLitro: 0.1,
    factorCongestión: 1.0,

    // Umbrales
    margenDecisionSurtidor: 0.5,
    preferenciaAlternativa: 'cualquiera',
  });

  const handleNumberChange = (field: keyof SimulationParameters, value: string) => {
    setParams((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : parseFloat(value),
    }));
  };

  const handleStringChange = (field: keyof SimulationParameters, value: string) => {
    setParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartSimulation = () => {
    onSimulationStart(params);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={handleStartSimulation}
          disabled={isSimulating}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isSimulating ? 'Simulando...' : 'Iniciar Simulación'}
        </Button>
        <Button
          onClick={onReset}
          disabled={isSimulating}
          variant="outline"
          size="lg"
        >
          Reiniciar
        </Button>
      </div>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="prices">Precios</TabsTrigger>
          <TabsTrigger value="pumps">Surtidores</TabsTrigger>
          <TabsTrigger value="simulation">Simulación</TabsTrigger>
          <TabsTrigger value="profiles">Perfiles</TabsTrigger>
          <TabsTrigger value="distributions">Distribuciones</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        {/* Tab Precios */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Precios</CardTitle>
              <CardDescription>Ajusta los precios de gasolina</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precioSubvencionado">Precio Subvencionado Inicial (Bs/L)</Label>
                <Input
                  id="precioSubvencionado"
                  type="number"
                  step="0.01"
                  value={params.precioSubvencionadoInicial}
                  onChange={(e) => handleNumberChange('precioSubvencionadoInicial', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="incrementoTrimestral">Incremento Trimestral (Bs/L)</Label>
                <Input
                  id="incrementoTrimestral"
                  type="number"
                  step="0.01"
                  value={params.incrementoTrimestral}
                  onChange={(e) => handleNumberChange('incrementoTrimestral', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="precioInternacional">Precio Internacional (Bs/L)</Label>
                <Input
                  id="precioInternacional"
                  type="number"
                  step="0.01"
                  value={params.precioInternacional}
                  onChange={(e) => handleNumberChange('precioInternacional', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Surtidores */}
        <TabsContent value="pumps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Surtidores</CardTitle>
              <CardDescription>Define cantidad de surtidores por tipo</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surtidoresSubvencionados">Surtidores Subvencionados (1-5)</Label>
                <Input
                  id="surtidoresSubvencionados"
                  type="number"
                  min="1"
                  max="5"
                  value={params.surtidoresSubvencionados}
                  onChange={(e) => handleNumberChange('surtidoresSubvencionados', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="surtidoresInternacionales">Surtidores Internacionales (1-5)</Label>
                <Input
                  id="surtidoresInternacionales"
                  type="number"
                  min="1"
                  max="5"
                  value={params.surtidoresInternacionales}
                  onChange={(e) => handleNumberChange('surtidoresInternacionales', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Simulación */}
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de Simulación</CardTitle>
              <CardDescription>Configura duración y alcance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroEventos">Número de Eventos (1 - 1,000,000)</Label>
                <Input
                  id="numeroEventos"
                  type="number"
                  min="1"
                  max="1000000"
                  value={params.numeroEventos}
                  onChange={(e) => handleNumberChange('numeroEventos', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="periodoSimulacionMinutos">Período Simulación (minutos)</Label>
                <Input
                  id="periodoSimulacionMinutos"
                  type="number"
                  value={params.periodoSimulacionMinutos}
                  onChange={(e) => handleNumberChange('periodoSimulacionMinutos', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="numeroTrimestres">Número de Trimestres</Label>
                <Input
                  id="numeroTrimestres"
                  type="number"
                  min="1"
                  value={params.numeroTrimestres}
                  onChange={(e) => handleNumberChange('numeroTrimestres', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Perfiles */}
        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfiles de Usuarios</CardTitle>
              <CardDescription>Define características de clientes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proporcionPesado">% Transporte Pesado (0-100)</Label>
                <Input
                  id="proporcionPesado"
                  type="number"
                  min="0"
                  max="100"
                  value={params.proporcionPesado}
                  onChange={(e) => handleNumberChange('proporcionPesado', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="costoOportunidadPesado">Costo Oportunidad Pesado (Bs/h)</Label>
                <Input
                  id="costoOportunidadPesado"
                  type="number"
                  step="0.01"
                  value={params.costoOportunidadPesado}
                  onChange={(e) => handleNumberChange('costoOportunidadPesado', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="costoOportunidadParticular">Costo Oportunidad Particular (Bs/h)</Label>
                <Input
                  id="costoOportunidadParticular"
                  type="number"
                  step="0.01"
                  value={params.costoOportunidadParticular}
                  onChange={(e) => handleNumberChange('costoOportunidadParticular', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div className="col-span-2 border-t pt-4">
                <h4 className="font-semibold mb-3">Volúmenes Pesado (L)</h4>
              </div>
              <div>
                <Label htmlFor="volumenMinimoPesado">Mínimo</Label>
                <Input
                  id="volumenMinimoPesado"
                  type="number"
                  value={params.volumenMinimoPesado}
                  onChange={(e) => handleNumberChange('volumenMinimoPesado', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="volumenMaximoPesado">Máximo</Label>
                <Input
                  id="volumenMaximoPesado"
                  type="number"
                  value={params.volumenMaximoPesado}
                  onChange={(e) => handleNumberChange('volumenMaximoPesado', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div className="col-span-2 border-t pt-4">
                <h4 className="font-semibold mb-3">Volúmenes Particular (L)</h4>
              </div>
              <div>
                <Label htmlFor="volumenMinimoParticular">Mínimo</Label>
                <Input
                  id="volumenMinimoParticular"
                  type="number"
                  value={params.volumenMinimoParticular}
                  onChange={(e) => handleNumberChange('volumenMinimoParticular', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="volumenMaximoParticular">Máximo</Label>
                <Input
                  id="volumenMaximoParticular"
                  type="number"
                  value={params.volumenMaximoParticular}
                  onChange={(e) => handleNumberChange('volumenMaximoParticular', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Distribuciones */}
        <TabsContent value="distributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuciones de Tiempo</CardTitle>
              <CardDescription>Configura distribuciones entre arribos y servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Distribución de Arribos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoDistribucionArribos">Tipo</Label>
                    <Select
                      value={params.tipoDistribucionArribos}
                      onValueChange={(value) => handleStringChange('tipoDistribucionArribos', value)}
                      disabled={isSimulating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poisson">Poisson</SelectItem>
                        <SelectItem value="exponencial">Exponencial</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="uniforme">Uniforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parametroArribosLambda">Lambda</Label>
                    <Input
                      id="parametroArribosLambda"
                      type="number"
                      step="0.01"
                      value={params.parametroArribosLambda}
                      onChange={(e) => handleNumberChange('parametroArribosLambda', e.target.value)}
                      disabled={isSimulating}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="parametroArribosMean">Media (minutos)</Label>
                    <Input
                      id="parametroArribosMean"
                      type="number"
                      step="0.1"
                      value={params.parametroArribosMean}
                      onChange={(e) => handleNumberChange('parametroArribosMean', e.target.value)}
                      disabled={isSimulating}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Distribución de Servicio</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoDistribucionServicio">Tipo</Label>
                    <Select
                      value={params.tipoDistribucionServicio}
                      onValueChange={(value) => handleStringChange('tipoDistribucionServicio', value)}
                      disabled={isSimulating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exponencial">Exponencial</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="uniforme">Uniforme</SelectItem>
                        <SelectItem value="poisson">Poisson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parametroServicioMean">Media (minutos)</Label>
                    <Input
                      id="parametroServicioMean"
                      type="number"
                      step="0.1"
                      value={params.parametroServicioMean}
                      onChange={(e) => handleNumberChange('parametroServicioMean', e.target.value)}
                      disabled={isSimulating}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="parametroServicioDevEst">Desviación Estándar</Label>
                    <Input
                      id="parametroServicioDevEst"
                      type="number"
                      step="0.1"
                      value={params.parametroServicioDevEst}
                      onChange={(e) => handleNumberChange('parametroServicioDevEst', e.target.value)}
                      disabled={isSimulating}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Avanzado */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>Parámetros adicionales del sistema</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacidadMaximaColaPorSurtidor">Cap. Máx Cola</Label>
                <Input
                  id="capacidadMaximaColaPorSurtidor"
                  type="number"
                  value={params.capacidadMaximaColaPorSurtidor}
                  onChange={(e) => handleNumberChange('capacidadMaximaColaPorSurtidor', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="tiempoServicioPromedioPorLitro">Tiempo Servicio/L (min)</Label>
                <Input
                  id="tiempoServicioPromedioPorLitro"
                  type="number"
                  step="0.01"
                  value={params.tiempoServicioPromedioPorLitro}
                  onChange={(e) => handleNumberChange('tiempoServicioPromedioPorLitro', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="factorCongestión">Factor Congestión</Label>
                <Input
                  id="factorCongestión"
                  type="number"
                  step="0.1"
                  value={params.factorCongestión}
                  onChange={(e) => handleNumberChange('factorCongestión', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div>
                <Label htmlFor="margenDecisionSurtidor">Margen Decisión (Bs)</Label>
                <Input
                  id="margenDecisionSurtidor"
                  type="number"
                  step="0.01"
                  value={params.margenDecisionSurtidor}
                  onChange={(e) => handleNumberChange('margenDecisionSurtidor', e.target.value)}
                  disabled={isSimulating}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="preferenciaAlternativa">Preferencia Surtidor</Label>
                <Select
                  value={params.preferenciaAlternativa}
                  onValueChange={(value) => handleStringChange('preferenciaAlternativa', value)}
                  disabled={isSimulating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cualquiera">Cualquiera (más barato)</SelectItem>
                    <SelectItem value="subvencionado">Preferir Subvencionado</SelectItem>
                    <SelectItem value="internacional">Preferir Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
