import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from '@/components/ui/use-toast.jsx';
import { PlusCircle, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCyclesForUser, saveCyclesForUser, getCycleById } from '@/lib/cycleStore.jsx';
import { calculateCycleDay } from '@/lib/dateUtils.jsx';
import RecordDialog from '@/components/shared/RecordDialog.jsx';
import NewCycleDialog from '@/components/dashboard/NewCycleDialog.jsx';
import CycleGraph from '@/components/dashboard/CycleGraph.jsx';
import CycleRecordList from '@/components/dashboard/CycleRecordList.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog.jsx";


const initialFormState = {
  date: new Date().toISOString().split('T')[0],
  temperature: '',
  mucusAppearance: '',
  mucusSensation: '',
  observations: '',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [currentCycle, setCurrentCycle] = useState(null);
  const [allUserCycles, setAllUserCycles] = useState([]);
  
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  
  const [formData, setFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);


  const loadUserCycles = useCallback(() => {
    if (user) {
      const userCycles = getCyclesForUser(user.id);
      setAllUserCycles(userCycles);
      if (userCycles.length > 0) {
        setCurrentCycle(userCycles[0]);
      } else {
        setCurrentCycle(null);
      }
    }
  }, [user]);

  useEffect(() => {
    loadUserCycles();
  }, [loadUserCycles]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditFormData(initialFormState);
    setRecordToEdit(null);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEditFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleStartNewCycle = useCallback(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCycle = {
      id: Date.now().toString(),
      userId: user.id,
      startDate: today,
      records: [],
    };
    const updatedCycles = [newCycle, ...allUserCycles];
    saveCyclesForUser(user.id, updatedCycles);
    loadUserCycles(); 
    toast({ title: "Nuevo ciclo iniciado", description: `El nuevo ciclo comenzó el ${today}.` });
    setIsNewCycleModalOpen(false);
  }, [user, allUserCycles, loadUserCycles]);

  const handleAddRecord = useCallback((e) => {
    e.preventDefault();
    if (!user || !currentCycle) {
      toast({ variant: "destructive", title: "Error", description: "No hay un ciclo activo." });
      return;
    }

    const cycleDay = calculateCycleDay(formData.date, currentCycle.startDate);
    if (cycleDay === null || cycleDay < 1) {
      toast({ variant: "destructive", title: "Fecha inválida", description: "La fecha del registro no puede ser anterior al inicio del ciclo." });
      return;
    }

    const newRecord = {
      id: Date.now().toString(),
      ...formData,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      cycleDay,
    };

    const updatedRecords = [...(currentCycle.records || []), newRecord].sort((a,b) => new Date(a.date) - new Date(b.date));
    const updatedCycle = { ...currentCycle, records: updatedRecords };
    
    const updatedUserCycles = allUserCycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    saveCyclesForUser(user.id, updatedUserCycles);
    loadUserCycles();

    toast({ title: "Registro añadido", description: `Datos del día ${cycleDay} guardados.` });
    setIsAddRecordModalOpen(false);
    resetForm();
  }, [user, currentCycle, formData, allUserCycles, resetForm, loadUserCycles]);

  const openEditModal = useCallback((record) => {
    setRecordToEdit(record);
    setEditFormData({
      date: record.date,
      temperature: record.temperature?.toString() || '',
      mucusAppearance: record.mucusAppearance || '',
      mucusSensation: record.mucusSensation || '',
      observations: record.observations || '',
    });
    setIsEditRecordModalOpen(true);
  }, []);

  const handleEditRecord = useCallback((e) => {
    e.preventDefault();
    if (!user || !recordToEdit || !currentCycle) return;

    const cycleDay = calculateCycleDay(editFormData.date, currentCycle.startDate);
    if (cycleDay === null || cycleDay < 1) {
      toast({ variant: "destructive", title: "Fecha inválida", description: "La fecha del registro no puede ser anterior al inicio del ciclo." });
      return;
    }

    const updatedRecord = {
      ...recordToEdit,
      ...editFormData,
      temperature: editFormData.temperature ? parseFloat(editFormData.temperature) : null,
      cycleDay,
    };
    
    const updatedRecords = currentCycle.records.map(r => r.id === recordToEdit.id ? updatedRecord : r).sort((a,b) => new Date(a.date) - new Date(b.date));
    const updatedCycle = { ...currentCycle, records: updatedRecords };
    
    const updatedUserCycles = allUserCycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    saveCyclesForUser(user.id, updatedUserCycles);
    loadUserCycles();

    toast({ title: "Registro actualizado", description: `Datos del día ${cycleDay} actualizados.` });
    setIsEditRecordModalOpen(false);
    resetEditForm();
  }, [user, recordToEdit, currentCycle, editFormData, allUserCycles, resetEditForm, loadUserCycles]);
  
  const confirmDeleteRecord = (recordId) => {
    setRecordToDelete(recordId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteRecord = useCallback(() => {
    if (!user || !recordToDelete || !currentCycle) return;

    const updatedRecords = currentCycle.records.filter(r => r.id !== recordToDelete);
    const updatedCycle = { ...currentCycle, records: updatedRecords };
    
    const updatedUserCycles = allUserCycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    saveCyclesForUser(user.id, updatedUserCycles);
    loadUserCycles();

    toast({ title: "Registro eliminado", description: "El registro ha sido eliminado." });
    setIsConfirmDeleteDialogOpen(false);
    setRecordToDelete(null);
  }, [user, recordToDelete, currentCycle, allUserCycles, loadUserCycles]);


  if (!user) return <div className="p-6 text-center text-muted-foreground">Cargando datos del usuario...</div>;
  
  const currentCycleDay = currentCycle ? calculateCycleDay(new Date().toISOString().split('T')[0], currentCycle.startDate) : null;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-white/70 backdrop-blur-lg shadow-2xl border-primary/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary tracking-tight">
              {currentCycle ? `Ciclo Actual (Iniciado: ${new Date(currentCycle.startDate).toLocaleDateString('es-ES')})` : "Bienvenida"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {currentCycle && currentCycleDay ? `Hoy es el día ${currentCycleDay} de tu ciclo.` : "Comienza registrando un nuevo ciclo."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Dialog open={isAddRecordModalOpen} onOpenChange={setIsAddRecordModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={resetForm}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-pink-400 hover:from-primary/90 hover:to-pink-400/90 text-white shadow-md"
                        disabled={!currentCycle}
                      >
                        <PlusCircle className="mr-2 h-5 w-5" /> Añadir Registro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <RecordDialog
                        handleSubmit={handleAddRecord}
                        formData={formData}
                        handleChange={handleFormChange}
                        dialogTitle="Añadir Nuevo Registro"
                        dialogDescription="Ingresa los datos de hoy."
                        submitButtonText="Guardar Registro"
                      />
                    </DialogContent>
                  </Dialog>
                          {/* Iniciar Nuevo Ciclo */}
                          <Dialog open={isNewCycleModalOpen} onOpenChange={setIsNewCycleModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/10 shadow-md"
                              >
                                <RefreshCw className="mr-2 h-5 w-5" /> Iniciar Nuevo Ciclo
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <NewCycleDialog
                                onConfirm={handleStartNewCycle}
                                onOpenChange={setIsNewCycleModalOpen}
                              />
                            </DialogContent>
                          </Dialog>
            </div>
            {currentCycle && <CycleGraph cycle={currentCycle} />}
            {/* Si no hay ciclos */}
            {!currentCycle && (
              <div className="text-center py-10">
                <p className="text-xl text-muted-foreground mb-4">
                  Parece que no tienes ningún ciclo registrado.
                </p>
                <Dialog open={isNewCycleModalOpen} onOpenChange={setIsNewCycleModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground">
                      <RefreshCw className="mr-2 h-5 w-5" /> Comienza tu Primer Ciclo
                    </Button>
                  </DialogTrigger>
                  <NewCycleDialog
                    onConfirm={handleStartNewCycle}
                    onOpenChange={setIsNewCycleModalOpen}
                  />
                </Dialog>
              </div>
            )}
            
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isEditRecordModalOpen} onOpenChange={(isOpen) => { 
          setIsEditRecordModalOpen(isOpen); 
          if (!isOpen) resetEditForm(); 
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

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás segura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default DashboardPage;
  