import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog.jsx';
import RecordFormFields from '@/components/shared/RecordFormFields.jsx';

const RecordDialog = ({ handleSubmit, formData, handleChange, dialogTitle, dialogDescription, submitButtonText, isEdit = false }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogDescription && <DialogDescription>{dialogDescription}</DialogDescription>}
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <RecordFormFields formData={formData} handleChange={handleChange} isEdit={isEdit} />
        <DialogFooter>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default RecordDialog;
  