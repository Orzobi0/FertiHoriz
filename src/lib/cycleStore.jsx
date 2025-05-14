
import React from "react";

const STORAGE_KEY = 'fertilityCycles';

export const getCyclesForUser = (userId) => {
  if (!userId) return [];
  const allCycles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return allCycles.filter(cycle => cycle.userId === userId).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
};

export const saveCyclesForUser = (userId, cyclesToSave) => {
  if (!userId) return;
  const allCycles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const otherUserCycles = allCycles.filter(cycle => cycle.userId !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherUserCycles, ...cyclesToSave]));
};

export const getCycleById = (userId, cycleId) => {
  if (!userId || !cycleId) return null;
  const userCycles = getCyclesForUser(userId);
  return userCycles.find(cycle => cycle.id === cycleId) || null;
};
  