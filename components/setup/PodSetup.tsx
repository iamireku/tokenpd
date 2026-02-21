
import React from 'react';
import { usePodSetup } from '../../hooks/usePodSetup';
import { SetupHeader } from './SetupHeader';
import { IdentityStep } from './IdentityStep';
import { TaskStep } from './TaskStep';
import { SetupFooter } from './SetupFooter';

export const PodSetup: React.FC = () => {
  const {
    state,
    isProcessing,
    currentStep,
    setCurrentStep,
    identity,
    tasks,
    actions,
    editing
  } = usePodSetup();

  const isNextDisabled = identity.name.length < 2 || 
    (identity.launchMode === 'TELEGRAM' && !identity.tgHandle) || 
    (identity.launchMode === 'URL' && !identity.customUrl) || 
    isProcessing;

  const isSaveDisabled = tasks.addedTasks.length === 0 || isProcessing;

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-transparent pb-40 relative overflow-x-hidden">
      <SetupHeader 
        currentStep={currentStep} 
        onBack={actions.handleBack} 
        disabled={isProcessing} 
      />

      <div className="pt-24 px-6 max-w-md mx-auto space-y-8">
        {currentStep === 'IDENTITY' ? (
          <IdentityStep 
            data={{
              ...identity,
              isProcessing
            }} 
          />
        ) : (
          <TaskStep 
            data={{
              ...tasks,
              notificationsEnabled: state.notificationsEnabled,
              toggleNotifications: actions.toggleNotifications,
              isProcessing,
              editingTaskId: editing.editingTaskId
            }} 
          />
        )}

        <SetupFooter 
          currentStep={currentStep}
          isNextDisabled={isNextDisabled}
          isSaveDisabled={isSaveDisabled}
          isProcessing={isProcessing}
          onNext={() => setCurrentStep('TIMER')}
          onSave={actions.handleFinalize}
        />
      </div>
    </div>
  );
};
