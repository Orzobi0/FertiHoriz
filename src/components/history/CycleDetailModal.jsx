import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';
import CycleRecordItem from '@/components/history/CycleRecordItem.jsx';
import { formatDate } from '@/lib/dateUtils.jsx';
import CycleGraph from '@/components/dashboard/CycleGraph.jsx';

const CycleDetailModal = ({ isOpen, onOpenChange, cycle, onEditRecord, onDeleteRecord }) => {
  if (!cycle) return null;

  return (
    <DialogContent className="max-w-3xl w-full sm:w-[95vw] h-[95vh] flex flex-col p-0 rounded-lg">
      <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DialogTitle className="text-2xl text-primary">
            Detalles del Ciclo - {formatDate(cycle.startDate, { day: 'numeric', month: 'long', year: 'numeric' })}
          </DialogTitle>
          <DialogDescription>
            Aquí puedes ver todos los registros de este ciclo y gestionarlos.
          </DialogDescription>
        </div>
        <Button variant="outline" className="mt-2 sm:mt-0" onClick={() => onOpenChange(false)}>Cerrar</Button>
      </DialogHeader>
      <div className="flex-shrink-0 p-4 pb-0">
        <CycleGraph cycle={cycle} displayMode="full" />
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {cycle.records.length > 0 ? (
          cycle.records.map(record => (
            <CycleRecordItem 
              key={record.id} 
              record={record} 
              onEdit={() => onEditRecord(record, cycle)}
              onDelete={() => onDeleteRecord(record.id, cycle)}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-5">No hay registros para este ciclo.</p>
        )}
      </div>
    </DialogContent>
  );
};

export default CycleDetailModal;
  