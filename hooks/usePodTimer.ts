import { useState, useEffect } from 'react';
import { useApp } from '../store';
// Importing AppStatus enum to use its values for logic
import { Pod, AppStatus } from '../types';
import { getAppStatus, formatTimeLeft, getStatusColor } from '../utils';

export const usePodTimer = (pod: Pod) => {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const appTasks = state.tasks.filter(t => t.appId === pod.id);
  const status = getAppStatus(pod.id, state.tasks, currentTime);
  
  // Calculate the next harvest time across all tasks for this app
  const nextHarvest = appTasks.length > 0 
    ? Math.min(...appTasks.map(t => t.nextDueAt)) 
    : currentTime;

  const diff = nextHarvest - currentTime;
  const timeLeft = formatTimeLeft(diff);
  // Fix: Comparison using AppStatus enum instead of PodStatus type alias
  const isUrgent = diff < 300000 && status !== AppStatus.READY;
  const statusColor = getStatusColor(status);

  return {
    status,
    nextHarvest,
    timeLeft,
    isUrgent,
    statusColor,
    currentTime
  };
};