
import React from "react";

export const getDayOfWeek = (dateString) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjust for UTC date from input type="date"
  return days[date.getDay()];
};

export const formatDate = (dateString, options = { day: '2-digit', month: '2-digit' }) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 
  return date.toLocaleDateString('es-ES', options);
};

export const calculateCycleDay = (recordDate, cycleStartDate) => {
  if (!recordDate || !cycleStartDate) return null;
  const start = new Date(cycleStartDate);
  const current = new Date(recordDate);
  start.setUTCHours(0,0,0,0); // Normalize to start of day UTC
  current.setUTCHours(0,0,0,0); // Normalize to start of day UTC
  return Math.ceil((current - start) / (1000 * 60 * 60 * 24)) + 1;
};
  