
import React from 'react';
import { TaskListing } from './TaskListing';
import { TaskConfigForm } from './TaskConfigForm';

interface TaskStepProps {
  data: {
    taskName: string;
    setTaskName: (v: string) => void;
    addedTasks: any[];
    frequency: 'FIXED_DAILY' | 'SLIDING' | 'WINDOW';
    setFrequency: (v: 'FIXED_DAILY' | 'SLIDING' | 'WINDOW') => void;
    days: number;
    setDays: (v: number) => void;
    hours: number;
    setHours: (v: number) => void;
    mins: number;
    setMins: (v: number) => void;
    isSyncEnabled: boolean;
    setIsSyncEnabled: (v: boolean) => void;
    syncH: number;
    setSyncH: (v: number) => void;
    syncM: number;
    setSyncM: (v: number) => void;
    handleAddTask: () => void;
    removeTaskFromList: (i: number) => void;
    editTaskFromList: (i: number) => void;
    applyPreset: (h: number) => void;
    nextHarvestPreview: { full: string; relative: string };
    notificationsEnabled: boolean;
    toggleNotifications: () => void;
    isProcessing: boolean;
    editingTaskId: string | null;
  }
}

export const TaskStep: React.FC<TaskStepProps> = ({ data }) => {
  const {
    taskName, setTaskName, addedTasks, frequency, setFrequency,
    days, setDays, hours, setHours, mins, setMins,
    isSyncEnabled, setIsSyncEnabled, syncH, setSyncH, syncM, setSyncM,
    handleAddTask, removeTaskFromList, editTaskFromList, applyPreset, 
    nextHarvestPreview, notificationsEnabled, toggleNotifications,
    isProcessing, editingTaskId
  } = data;

  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-8">
      <TaskListing 
        addedTasks={addedTasks} 
        onEdit={editTaskFromList} 
        onRemove={removeTaskFromList} 
      />

      <TaskConfigForm 
        taskName={taskName}
        setTaskName={setTaskName}
        frequency={frequency}
        setFrequency={setFrequency}
        days={days}
        setDays={setDays}
        hours={hours}
        setHours={setHours}
        mins={mins}
        setMins={setMins}
        isSyncEnabled={isSyncEnabled}
        setIsSyncEnabled={setIsSyncEnabled}
        syncH={syncH}
        setSyncH={setSyncH}
        syncM={syncM}
        setSyncM={setSyncM}
        onAdd={handleAddTask}
        applyPreset={applyPreset}
        nextHarvestPreview={nextHarvestPreview}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={toggleNotifications}
        isProcessing={isProcessing}
        editingTaskId={editingTaskId}
      />
    </div>
  );
};
