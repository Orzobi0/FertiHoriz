
import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

const RecordFormFields = ({ formData, handleChange, isEdit = false }) => {
  const { date, temperature, mucusAppearance, mucusSensation, observations } = formData;

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={isEdit ? "edit-date" : "date"} className="text-right">Fecha</Label>
        <Input 
          id={isEdit ? "edit-date" : "date"} 
          type="date" 
          name="date" 
          value={date} 
          onChange={handleChange} 
          className="col-span-3" 
          required 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={isEdit ? "edit-temperature" : "temperature"} className="text-right">Temperatura</Label>
        <Input 
          id={isEdit ? "edit-temperature" : "temperature"} 
          type="number" 
          name="temperature" 
          step="0.01" 
          placeholder="Ej: 36.50" 
          value={temperature} 
          onChange={handleChange} 
          className="col-span-3" 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={isEdit ? "edit-mucusAppearance" : "mucusAppearance"} className="text-right">Aspecto Moco</Label>
        <Input 
          id={isEdit ? "edit-mucusAppearance" : "mucusAppearance"} 
          name="mucusAppearance" 
          placeholder="Ej: Clara de huevo, Elástico" 
          value={mucusAppearance} 
          onChange={handleChange} 
          className="col-span-3" 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={isEdit ? "edit-mucusSensation" : "mucusSensation"} className="text-right">Sensación Moco</Label>
        <Input 
          id={isEdit ? "edit-mucusSensation" : "mucusSensation"} 
          name="mucusSensation" 
          placeholder="Ej: Húmedo, Resbaladizo" 
          value={mucusSensation} 
          onChange={handleChange} 
          className="col-span-3" 
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={isEdit ? "edit-observations" : "observations"} className="text-right">Observaciones</Label>
        <Textarea 
          id={isEdit ? "edit-observations" : "observations"} 
          name="observations" 
          placeholder="Notas adicionales..." 
          value={observations} 
          onChange={handleChange} 
          className="col-span-3" 
        />
      </div>
    </div>
  );
};

export default RecordFormFields;
  