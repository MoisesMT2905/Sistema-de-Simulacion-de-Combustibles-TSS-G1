# Sistema de Simulación de Combustibles - TSS - G1

Simulador interactivo de eventos discretos para el análisis de una estación de servicio de gasolina especial en Bolivia.

## 📋 Descripción del Proyecto

Este proyecto consiste en un **simulador web** de una estación de servicio de gasolina, desarrollado para la materia **Taller de Simulación de Sistemas**. 

El sistema modela el comportamiento de conductores de vehículos particulares y de transporte pesado frente a la red de expendio de gasolina subvencionada, permitiendo analizar el impacto de cambios en precios, tasas de llegada y otros parámetros mediante **simulación de eventos discretos**.

## ✨ Características Principales

- Interfaz web moderna e interactiva
- Configuración de parámetros de simulación en tiempo real
- Ejecución de simulación de eventos discretos
- Visualización de resultados y métricas clave (tiempos de espera, utilización de surtidores, longitud de colas, etc.)
- Tabla detallada de eventos con análisis
- Exportación de reportes a PDF
- Gráficos de resultados

## 🚀 Demo en Línea

🔗 **Aplicación desplegada:** (https://simulation-system-implementation.vercel.app/)

## 🛠 Tecnologías Utilizadas

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/ui**
- **jsPDF** + **html2canvas** (para exportación PDF)

## 📁 Estructura del Proyecto

- `/app` — Páginas y configuración principal
- `/components` — Componentes reutilizables (Dashboard, SimulationResults, EventsTable, etc.)
- `/lib` — Lógica de simulación, generadores y utilidades
- `/data` — Informe del proyecto y archivos de datos
