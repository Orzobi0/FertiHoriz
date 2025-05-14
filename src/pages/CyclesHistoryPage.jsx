
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from '@/components/ui/use-toast.jsx';
import { motion } from 'framer-motion';
import { Dialog, DialogTrigger } from '@/components/ui/dialog.jsx';
import { getCyclesForUser, saveCyclesForUser } from '@/lib/cycleStore.jsx';
import { calculateCycleDay } from '@/lib/dateUtils.jsx';
import CycleCard from '@/components/history/CycleCard.jsx';
import CycleDetailModal from '@/components/history/CycleDetailModal.jsx';
import RecordDialog from '@/components/shared/RecordDialog.jsx';

const initialFormState = {
  date: '',
  temperature: '',
  mucusAppearance: '',
  mucusSensation: '',
  observations: '',
};

const CyclesHistoryPage = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [selectedCycleForDetail, setSelectedCycleForDetail] = useState(null);
  const [isCycleDetailModalOpen, setIsCycleDetailModalOpen] = useState(false);
  
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [cycleOfRecordToEdit, setCycleOfRecordToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormState);

  useEffect(() => {
    if (user) {
      setCycles(getCyclesForUser(user.id));
    }
  }, [user]);

  const resetEditForm = useCallback(() => {
    setEditFormData(initialFormState);
    setRecordToEdit(null);
    setCycleOfRecordToEdit(null);
  }, []);

  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const openCycleDetails = useCallback((cycle) => {
    setSelectedCycleForDetail(cycle);
    setIsCycleDetailModalOpen(true);
  }, []);

  const openEditModal = useCallback((record, cycle) => {
    setRecordToEdit(record);
    setCycleOfRecordToEdit(cycle);
    setEditFormData({
      date: record.date,
      temperature: record.temperature?.toString() || '',
      mucusAppearance: record.mucusAppearance || '',
      mucusSensation: record.mucusSensation || '',
      observations: record.observations || '',
    });
    setIsEditRecordModalOpen(true); 
    
    if (isCycleDetailModalOpen) {
      setIsCycleDetailModalOpen(false);
    }

  }, [isCycleDetailModalOpen]);

  const handleEditRecord = useCallback((e) => {
    e.preventDefault();
    if (!user || !recordToEdit || !cycleOfRecordToEdit) return;

    const cycleDay = calculateCycleDay(editFormData.date, cycleOfRecordToEdit.startDate);
    if (cycleDay === null || cycleDay < 1) {
      toast({ variant: "destructive", title: "Fecha inválida", description: "La fecha del registro no puede ser anterior al inicio del ciclo." });
      return;
    }

    const updatedRecord = {
      ...recordToEdit,
      ...editFormData,
      temperature: parseFloat(editFormData.temperature) || null,
      cycleDay,
    };
    
    const updatedRecords = cycleOfRecordToEdit.records.map(r => r.id === recordToEdit.id ? updatedRecord : r).sort((a,b) => new Date(a.date) - new Date(b.date));
    const updatedCycle = { ...cycleOfRecordToEdit, records: updatedRecords };
    
    const updatedCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    setCycles(updatedCycles);
    
    saveCyclesForUser(user.id, updatedCycles);

    toast({ title: "Registro actualizado", description: `Datos del día ${cycleDay} actualizados.` });
    setIsEditRecordModalOpen(false);
    resetEditForm();
    // Re-open detail modal if it was open before editing
    if (cycleOfRecordToEdit) {
        const freshlyUpdatedCycle = updatedCycles.find(c => c.id === cycleOfRecordToEdit.id);
        if (freshlyUpdatedCycle) {
          setSelectedCycleForDetail(freshlyUpdatedCycle);
          setIsCycleDetailModalOpen(true);
        }
    }

  }, [user, recordToEdit, cycleOfRecordToEdit, editFormData, cycles, resetEditForm]);
  
  const handleDeleteRecord = useCallback((recordId, cycle) => {
    if (!user || !recordId || !cycle) return;

    const updatedRecords = cycle.records.filter(r => r.id !== recordId);
    const updatedCycle = { ...cycle, records: updatedRecords };
    
    const updatedCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    setCycles(updatedCycles);
    if (selectedCycleForDetail && selectedCycleForDetail.id === updatedCycle.id) {
      setSelectedCycleForDetail(updatedCycle); 
    }
    saveCyclesForUser(user.id, updatedCycles);
    toast({ title: "Registro eliminado", description: "El registro ha sido eliminado." });
  }, [user, cycles, selectedCycleForDetail]);

  if (!user) return <div className="p-6 text-center text-muted-foreground">Cargando historial...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-8 tracking-tight">Mis Ciclos Anteriores</h1>
      </motion.div>
      
      {cycles.length === 0 ? (
        <motion.p 
          className="text-muted-foreground text-lg text-center py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Aún no tienes ciclos guardados. Los ciclos completados aparecerán aquí.
        </motion.p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle, index) => (
            <CycleCard 
              key={cycle.id} 
              cycle={cycle} 
              onOpenDetails={() => openCycleDetails(cycle)}
              index={index}
            />
          ))}
        </div>
      )}
      
      <Dialog open={isCycleDetailModalOpen} onOpenChange={setIsCycleDetailModalOpen}>
        <CycleDetailModal
            cycle={selectedCycleForDetail}
            onEditRecord={(record, cycle) => openEditModal(record, cycle)}
            onDeleteRecord={handleDeleteRecord}
            onOpenChange={setIsCycleDetailModalOpen} 
            isOpen={isCycleDetailModalOpen} 
        />
      </Dialog>
      

      <Dialog open={isEditRecordModalOpen} onOpenChange={(isOpen) => { 
          setIsEditRecordModalOpen(isOpen); 
          if (!isOpen) {
            resetEditForm();
            // If returning from edit, and there was a cycle context, re-open its detail.
            if(cycleOfRecordToEdit) {
                const freshCycleData = getCyclesForUser(user.id).find(c => c.id === cycleOfRecordToEdit.id);
                if (freshCycleData) {
                   openCycleDetails(freshCycleData);
                }
            }
          }
      }}>
        <RecordDialog
            handleSubmit={handleEditRecord}
            formData={editFormData}
            handleChange={handleEditFormChange}
            dialogTitle="Editar Registro"
            dialogDescription="Modifica los datos del registro seleccionado."
            submitButtonText="Guardar Cambios"
            isEdit={true}
        />
      </Dialog>
    </div>
  );
};

export default CyclesHistoryPage;
  