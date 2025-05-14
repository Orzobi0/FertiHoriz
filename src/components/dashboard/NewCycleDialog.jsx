
import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx';

const NewCycleDialog = ({ onConfirm, onOpenChange }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>¿Iniciar un Nuevo Ciclo?</DialogTitle>
        <DialogDescription>
          Esto marcará el día de hoy como el inicio de tu nuevo ciclo menstrual.
          ¿Estás segura?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onConfirm}>Sí, Iniciar Nuevo Ciclo</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default NewCycleDialog;
  