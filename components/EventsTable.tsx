'use client';

import React, { useState, useMemo } from 'react';
import { Evento } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumberES } from '@/lib/utils';

interface EventsTableProps {
  eventos: Evento[];
  onEventClick: (evento: Evento) => void;
}

export function EventsTable({ eventos, onEventClick }: EventsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState<'todos' | 'pesado' | 'particular'>('todos');
  const [filterSurtidor, setFilterSurtidor] = useState<'todos' | 'subvencionado' | 'internacional'>('todos');
  const [page, setPage] = useState(0);
  const itemsPerPage = 25;

  // Filtrar eventos
  const filteredEventos = useMemo(() => {
    return eventos.filter((evento) => {
      const matchesSearch =
        evento.vehiculoId.includes(searchTerm) || evento.id.toString().includes(searchTerm);
      const matchesPerfil = filterPerfil === 'todos' || evento.perfil === filterPerfil;
      const matchesSurtidor =
        filterSurtidor === 'todos' || evento.surtidorAsignado === filterSurtidor;

      return matchesSearch && matchesPerfil && matchesSurtidor;
    });
  }, [eventos, searchTerm, filterPerfil, filterSurtidor]);

  // Paginar
  const paginatedEventos = useMemo(() => {
    const start = page * itemsPerPage;
    return filteredEventos.slice(start, start + itemsPerPage);
  }, [filteredEventos, page]);

  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Buscar (ID o Vehículo)</label>
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Perfil</label>
          <select
            value={filterPerfil}
            onChange={(e) => {
              setFilterPerfil(e.target.value as typeof filterPerfil);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="todos">Todos</option>
            <option value="pesado">Transporte Pesado</option>
            <option value="particular">Vehículo Particular</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Surtidor</label>
          <select
            value={filterSurtidor}
            onChange={(e) => {
              setFilterSurtidor(e.target.value as typeof filterSurtidor);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="todos">Todos</option>
            <option value="subvencionado">Subvencionado</option>
            <option value="internacional">Internacional</option>
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-gray-600">
            Mostrando {paginatedEventos.length} de {filteredEventos.length} eventos
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[120px]">Min. Arribo</TableHead>
              <TableHead className="w-[100px]">Perfil</TableHead>
              <TableHead className="w-[80px]">Vol. (L)</TableHead>
              <TableHead className="w-[80px]">Espera</TableHead>
              <TableHead className="w-[100px]">Costo Sub. (Bs)</TableHead>
              <TableHead className="w-[100px]">Costo Int. (Bs)</TableHead>
              <TableHead className="w-[100px]">Surtidor</TableHead>
              <TableHead className="w-[120px]">Costo Total (Bs)</TableHead>
              <TableHead className="w-[100px]">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEventos.map((evento) => (
              <TableRow key={evento.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{evento.id}</TableCell>
                <TableCell>{formatNumberES(evento.minutoArribo, 1)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      evento.perfil === 'pesado'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {evento.perfil === 'pesado' ? 'Pesado' : 'Particular'}
                  </span>
                </TableCell>
                <TableCell>{formatNumberES(evento.volumen, 2)}</TableCell>
                <TableCell>{formatNumberES(evento.tiempoRealEnCola, 1)}</TableCell>
                <TableCell>{formatNumberES(evento.costoSubvencionado, 2)}</TableCell>
                <TableCell>{formatNumberES(evento.costoInternacional, 2)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      evento.surtidorAsignado === 'subvencionado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {evento.surtidorAsignado === 'subvencionado'
                      ? `Sub #${evento.numerSurtidor}`
                      : `Int #${evento.numerSurtidor}`}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-green-700">
                  {formatNumberES(evento.costoTotalFinal, 2)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEventClick(evento)}
                  >
                    Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
