
import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, getDayOfWeek } from '@/lib/dateUtils.jsx';

const CycleRecordItem = ({ record, onEdit, onDelete }) => {
  return (
    <motion.div
      className="p-4 rounded-lg border bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-primary">
            {getDayOfWeek(record.date)}, {formatDate(record.date, { day: 'numeric', month: 'long' })} - Día {record.cycleDay}
          </p>
          {record.temperature !== null && record.temperature !== undefined && <p className="text-sm">Temperatura: <span className="font-medium text-pink-700">{record.temperature.toFixed(2)}°C</span></p>}
          {record.mucusAppearance && <p className="text-sm">Aspecto Moco: <span className="font-medium text-purple-700">{record.mucusAppearance}</span></p>}
          {record.mucusSensation && <p className="text-sm">Sensación Moco: <span className="font-medium text-purple-700">{record.mucusSensation}</span></p>}
          {record.observations && <p className="text-sm mt-1">Observaciones: <span className="italic text-gray-600">{record.observations}</span></p>}
        </div>
        <div className="flex space-x-1 sm:space-x-2">
          <Button variant="ghost" size="icon" onClick={onEdit} className="text-primary/80 hover:text-primary h-8 w-8 sm:h-auto sm:w-auto">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive/80 hover:text-destructive h-8 w-8 sm:h-auto sm:w-auto">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CycleRecordItem;
  