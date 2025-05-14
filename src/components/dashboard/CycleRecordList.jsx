
import React from 'react';
import { motion } from 'framer-motion';
import CycleRecordItem from '@/components/history/CycleRecordItem.jsx'; // Reutilizamos el item

const CycleRecordList = ({ cycle, onEditRecord, onDeleteRecord }) => {
  if (!cycle || !cycle.records || cycle.records.length === 0) {
    return (
      <motion.div 
        className="text-center py-6 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Aún no hay registros para este ciclo.
      </motion.div>
    );
  }

  const sortedRecords = [...cycle.records].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold text-primary mb-4">Registros Detallados del Ciclo Actual</h3>
      <div className="space-y-3">
        {sortedRecords.map((record) => (
          <CycleRecordItem
            key={record.id}
            record={record}
            onEdit={() => onEditRecord(record, cycle)}
            onDelete={() => onDeleteRecord(record.id, cycle)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CycleRecordList;
  