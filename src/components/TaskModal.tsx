// src/components/TaskModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, MenuItem } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; status: string; date: string; priority: string }) => void;
  task?: { title: string; description: string; status: string; date: string; priority: string };
}

const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, onSave, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [date, setDate] = useState<Date | null>(new Date());
  const [priority, setPriority] = useState('Medium');
  const [errors, setErrors] = useState<{ title: boolean }>({ title: false });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDate(new Date(task.date));
      setPriority(task.priority);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDate(new Date());
      setPriority('Medium');
    }
  }, [task, open]);

  const handleSave = () => {
    let hasErrors = false;
    const newErrors = { title: false };

    if (!title.trim()) {
      newErrors.title = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors && date) {
      onSave({ title, description, status, date: date.toISOString(), priority });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: '90%', maxWidth: 360, p: 3 }} className="space-y-3 p-3 max-w-sm mx-auto bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Task Details</h2>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
          error={errors.title}
          helperText={errors.title ? 'Title is required' : ''}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          className="mt-1"
        />
        <DatePicker
          selected={date}
          onChange={(date: Date | null) => setDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          wrapperClassName="w-full" // Ensure the wrapper takes full width
          className="w-full mt-1 p-1 border border-gray-300 rounded"
          customInput={
            <TextField
              label="Date"
              value={date ? date.toLocaleDateString() : ''}
              fullWidth
              margin="normal"
              className="w-full mt-1" // Ensure this matches the full width like other inputs
              InputProps={{
                endAdornment: (
                  <FaCalendar className="m-1" />
                ),
              }}
            />
          }
        />
        <TextField label="Status" value={status} onChange={(e) => setStatus(e.target.value)} select fullWidth margin="normal" className="mt-1">
          <MenuItem value="TODO">TODO</MenuItem>
          <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
          <MenuItem value="COMPLETED">COMPLETED</MenuItem>
        </TextField>
        <TextField label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} select fullWidth margin="normal" className="mt-1">
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
        
        <div className="flex justify-end mt-3">
          <Button onClick={handleSave} variant="contained" color="primary" className="px-3 py-1" disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
};

export default TaskModal;