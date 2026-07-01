import { SimulationParameters, Evento, EstadisticasGlobales, EstadisticasSurtidor, EstadisticasTrimestre } from './types';
import {
  generarTiempoEntreArribos,
  generarVolumen,
  generarPerfil,
  generarTiempoServicio,
} from './generators';
import {
  calcularPrecioTrimestre,
  calcularCostoTotal,
  determinarMejorSurtidor,
  obtenerTrimestre,
  calcularTiempoRealEnCola,
  seleccionarSurtidorOptimo,
  calcularTasaOcupacion,
  calcularLongitudPromedioCola,
} from './calculations';
import { redondear, generateId } from './utils';

export class SimulationEngine {
  private parametros: SimulationParameters;
  private eventos: Evento[] = [];
  private colas: Map<number, Evento[]> = new Map();
  private estadisticas: EstadisticasGlobales;
  private tiempoActual: number = 0;
  private eventoId: number = 0;

  constructor(parametros: SimulationParameters) {
    this.parametros = parametros;
    this.inicializarColas();
    this.estadisticas = this.inicializarEstadisticas();
  }

  private inicializarColas(): void {
    const totalSurtidores = this.parametros.surtidoresSubvencionados + 
                           this.parametros.surtidoresInternacionales;
    
    for (let i = 1; i <= totalSurtidores; i++) {
      this.colas.set(i, []);
    }
  }

  private inicializarEstadisticas(): EstadisticasGlobales {
    return {
      totalEventos: 0,
      totalVolumen: 0,
      totalIngreso: 0,
      tiempoPromedioEsperaGlobal: 0,
      proporcionPesadoReal: 0,
      proporcionParticularReal: 0,
      migracionAlInternacional: 0,
      estadisticasPorSurtidor: [],
      estadisticasPorTrimestre: [],
      ingresoPorTrimestre: {},
      demandaPorTrimestre: {},
    };
  }

  /**
   * Ejecuta la simulación completa
   */
  public simular(onProgress?: (progreso: number) => void): Evento[] {
    this.eventos = [];
    this.inicializarColas();
    this.estadisticas = this.inicializarEstadisticas();

    let minutoActual = 0;
    let proximoArribo = this.generarProximoArribo();

    // Calcular minutos por trimestre
    const minutosPorTrimestre = this.parametros.periodoSimulacionMinutos / this.parametros.numeroTrimestres;

    for (let i = 0; i < this.parametros.numeroEventos; i++) {
      // Avanzar tiempo hasta próximo evento
      minutoActual = proximoArribo;

      // Verificar si ya salimos del período de simulación
      if (minutoActual > this.parametros.periodoSimulacionMinutos) {
        break;
      }

      // Crear evento
      const evento = this.crearEvento(minutoActual, minutosPorTrimestre);
      this.eventos.push(evento);

      // Procesar evento (actualizar colas)
      this.procesarEvento(evento, minutoActual);

      // Actualizar próximo arribo
      proximoArribo = minutoActual + this.generarProximoArribo();

      // Reportar progreso cada 10%
      if (i % Math.max(1, Math.floor(this.parametros.numeroEventos / 10)) === 0) {
        onProgress?.((i / this.parametros.numeroEventos) * 100);
      }
    }

    // Calcular estadísticas finales
    this.calcularEstadisticas();

    onProgress?.(100);
    return this.eventos;
  }

  private generarProximoArribo(): number {
    return redondear(
      generarTiempoEntreArribos(
        this.parametros.tipoDistribucionArribos,
        this.parametros.parametroArribosLambda,
        this.parametros.parametroArribosMean
      ),
      2
    );
  }

  private crearEvento(minutoArribo: number, minutosPorTrimestre: number): Evento {
    const perfil = generarPerfil(this.parametros.proporcionPesado);
    const volumen = generarVolumen(
      perfil === 'pesado',
      this.parametros.volumenMinimoPesado,
      this.parametros.volumenMaximoPesado,
      this.parametros.volumenMinimoParticular,
      this.parametros.volumenMaximoParticular
    );

    const trimestre = obtenerTrimestre(minutoArribo, minutosPorTrimestre);
    const precioSubvencionado = calcularPrecioTrimestre(this.parametros, trimestre);
    const precioInternacional = this.parametros.precioInternacional;

    const tiempoServicio = generarTiempoServicio(
      this.parametros.tipoDistribucionServicio,
      this.parametros.parametroServicioMean,
      this.parametros.parametroServicioDevEst,
      this.parametros.tiempoServicioPromedioPorLitro,
      volumen
    );

    // Determinar esperaEstimada
    const surtidorSubvencionadoOptimo = seleccionarSurtidorOptimo(
      'subvencionado',
      this.colas,
      this.parametros.surtidoresSubvencionados,
      1
    );
    const surtidorInternacionalOptimo = seleccionarSurtidorOptimo(
      'internacional',
      this.colas,
      this.parametros.surtidoresInternacionales,
      this.parametros.surtidoresSubvencionados + 1
    );

    const colaSubvencionada = this.colas.get(surtidorSubvencionadoOptimo) || [];
    const colaInternacional = this.colas.get(surtidorInternacionalOptimo) || [];

    let esperaTotalSubvencionado = 0;
    let esperaTotalInternacional = 0;

    for (const evt of colaSubvencionada) {
      esperaTotalSubvencionado += evt.tiempoServicioEstimado;
    }
    for (const evt of colaInternacional) {
      esperaTotalInternacional += evt.tiempoServicioEstimado;
    }

    const esperaPromedio = (esperaTotalSubvencionado + esperaTotalInternacional) / 2;

    // Calcular costos
    const costoOportunidad = perfil === 'pesado'
      ? this.parametros.costoOportunidadPesado
      : this.parametros.costoOportunidadParticular;

    const costoSubvencionado = calcularCostoTotal(
      precioSubvencionado,
      volumen,
      esperaTotalSubvencionado,
      costoOportunidad
    );

    const costoInternacional = calcularCostoTotal(
      precioInternacional,
      volumen,
      esperaTotalInternacional,
      costoOportunidad
    );

    // Determinar mejor surtidor
    const surtidorAsignado = determinarMejorSurtidor(
      costoSubvencionado,
      costoInternacional,
      this.parametros.margenDecisionSurtidor,
      this.parametros.preferenciaAlternativa
    );

    const numerSurtidor = surtidorAsignado === 'subvencionado'
      ? surtidorSubvencionadoOptimo
      : surtidorInternacionalOptimo;

    const precioUtilizado = surtidorAsignado === 'subvencionado'
      ? precioSubvencionado
      : precioInternacional;

    const costoTotalFinal = calcularCostoTotal(
      precioUtilizado,
      volumen,
      surtidorAsignado === 'subvencionado' ? esperaTotalSubvencionado : esperaTotalInternacional,
      costoOportunidad
    );

    // Calcular esperaEstimada fuera del objeto para usarla en sus propiedades
    const esperaEstimada = redondear(
      surtidorAsignado === 'subvencionado' ? esperaTotalSubvencionado : esperaTotalInternacional,
      2
    );

    const evento: Evento = {
      id: this.eventoId++,
      vehiculoId: generateId(),
      minutoArribo: redondear(minutoArribo, 2),
      perfil,
      volumen: redondear(volumen, 2),
      tiempoServicioEstimado: redondear(tiempoServicio, 2),
      esperaEstimada,
      costoSubvencionado: redondear(costoSubvencionado, 2),
      costoInternacional: redondear(costoInternacional, 2),
      surtidorAsignado,
      numerSurtidor,
      minutoInicioServicio: redondear(minutoArribo + esperaEstimada, 2) || minutoArribo,
      minutoFinServicio: redondear(
        minutoArribo + esperaEstimada + tiempoServicio,
        2
      ) || minutoArribo + tiempoServicio,
      tiempoRealEnCola: 0, // Se calculará después
      precioUtilizado: redondear(precioUtilizado, 2),
      costoTotalFinal: redondear(costoTotalFinal, 2),
      costoOportunidadTotal: redondear((esperaEstimada / 60) * costoOportunidad, 2) || 0,
      trimestre,
    };

    // Calcular tiempoRealEnCola
    evento.tiempoRealEnCola = calcularTiempoRealEnCola(
      evento.minutoFinServicio,
      evento.minutoArribo,
      evento.tiempoServicioEstimado
    );

    return evento;
  }

  private procesarEvento(evento: Evento, minutoActual: number): void {
    const cola = this.colas.get(evento.numerSurtidor) || [];
    cola.push(evento);
    this.colas.set(evento.numerSurtidor, cola);
  }

  private calcularEstadisticas(): void {
    this.estadisticas.totalEventos = this.eventos.length;

    let totalVolumen = 0;
    let totalIngreso = 0;
    let totalEspera = 0;
    let contadorPesado = 0;
    let contadorInternacional = 0;
    let congestiones: number[] = [];

    for (const evento of this.eventos) {
      totalVolumen += evento.volumen;
      totalIngreso += evento.costoTotalFinal;
      totalEspera += evento.tiempoRealEnCola;

      if (evento.perfil === 'pesado') contadorPesado++;
      if (evento.surtidorAsignado === 'internacional') contadorInternacional++;

      congestiones.push(evento.tiempoRealEnCola);
    }

    this.estadisticas.totalVolumen = redondear(totalVolumen, 2);
    this.estadisticas.totalIngreso = redondear(totalIngreso, 2);
    this.estadisticas.tiempoPromedioEsperaGlobal = redondear(
      totalEspera / Math.max(1, this.eventos.length),
      2
    );
    this.estadisticas.proporcionPesadoReal = redondear(
      (contadorPesado / Math.max(1, this.eventos.length)) * 100,
      2
    );
    this.estadisticas.proporcionParticularReal = redondear(
      100 - this.estadisticas.proporcionPesadoReal,
      2
    );
    this.estadisticas.migracionAlInternacional = redondear(
      (contadorInternacional / Math.max(1, this.eventos.length)) * 100,
      2
    );

    // Estadísticas por surtidor
    this.calcularEstadisticasPorSurtidor();

    // Estadísticas por trimestre
    this.calcularEstadisticasPorTrimestre();
  }

  private calcularEstadisticasPorSurtidor(): void {
    const stats: Map<number, EstadisticasSurtidor> = new Map();

    for (let i = 1; i <= this.parametros.surtidoresSubvencionados + 
                        this.parametros.surtidoresInternacionales; i++) {
      const tipo = i <= this.parametros.surtidoresSubvencionados 
        ? 'subvencionado' 
        : 'internacional';

      stats.set(i, {
        surtidorTipo: tipo,
        numeroSurtidor: i,
        totalEventos: 0,
        volumenTotal: 0,
        ingresoTotal: 0,
        tiempoPromedioEspera: 0,
        longitudPromedioColaMax: 0,
        tasaOcupacion: 0,
      });
    }

    for (const evento of this.eventos) {
      const stat = stats.get(evento.numerSurtidor)!;
      stat.totalEventos++;
      stat.volumenTotal += evento.volumen;
      stat.ingresoTotal += evento.costoTotalFinal;
      stat.tiempoPromedioEspera += evento.tiempoRealEnCola;
    }

    for (const stat of stats.values()) {
      stat.tiempoPromedioEspera = redondear(
        stat.tiempoPromedioEspera / Math.max(1, stat.totalEventos),
        2
      );
      stat.volumenTotal = redondear(stat.volumenTotal, 2);
      stat.ingresoTotal = redondear(stat.ingresoTotal, 2);
      stat.tasaOcupacion = redondear(
        (stat.tiempoPromedioEspera / this.parametros.periodoSimulacionMinutos) * 100,
        2
      );
    }

    this.estadisticas.estadisticasPorSurtidor = Array.from(stats.values());
  }

  private calcularEstadisticasPorTrimestre(): void {
    const statsPorTrimestre: Map<number, EstadisticasTrimestre> = new Map();
    const ingresoPorTrimestre: Map<number, number> = new Map();
    const demandaPorTrimestre: Map<number, number> = new Map();

    for (const evento of this.eventos) {
      const t = evento.trimestre;

      if (!statsPorTrimestre.has(t)) {
        statsPorTrimestre.set(t, {
          trimestre: t,
          totalEventos: 0,
          volumenTotal: 0,
          ingresoTotal: 0,
          precioPromedio: 0,
          migracionAlInternacional: 0,
        });
      }

      const stat = statsPorTrimestre.get(t)!;
      stat.totalEventos++;
      stat.volumenTotal += evento.volumen;
      stat.ingresoTotal += evento.costoTotalFinal;
      stat.precioPromedio += evento.precioUtilizado;

      if (evento.surtidorAsignado === 'internacional') {
        stat.migracionAlInternacional++;
      }

      ingresoPorTrimestre.set(t, (ingresoPorTrimestre.get(t) || 0) + evento.costoTotalFinal);
      demandaPorTrimestre.set(t, (demandaPorTrimestre.get(t) || 0) + evento.volumen);
    }

    for (const stat of statsPorTrimestre.values()) {
      stat.precioPromedio = redondear(
        stat.precioPromedio / Math.max(1, stat.totalEventos),
        2
      );
      stat.migracionAlInternacional = redondear(
        (stat.migracionAlInternacional / Math.max(1, stat.totalEventos)) * 100,
        2
      );
      stat.volumenTotal = redondear(stat.volumenTotal, 2);
      stat.ingresoTotal = redondear(stat.ingresoTotal, 2);
    }

    this.estadisticas.estadisticasPorTrimestre = Array.from(statsPorTrimestre.values());
    this.estadisticas.ingresoPorTrimestre = Object.fromEntries(ingresoPorTrimestre);
    this.estadisticas.demandaPorTrimestre = Object.fromEntries(demandaPorTrimestre);
  }

  public getEstadisticas(): EstadisticasGlobales {
    return this.estadisticas;
  }

  public getEventos(): Evento[] {
    return this.eventos;
  }
}
