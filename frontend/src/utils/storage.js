/**
 * localStorage Helper Functions
 * 
 * Manages localStorage for targets and schedules
 * Since we don't have GET endpoints for targets/schedules,
 * we store them locally after creation
 */

const TARGETS_KEY = 'ping-robot-targets';
const SCHEDULES_KEY = 'ping-robot-schedules';

/**
 * Get all targets from localStorage
 * @returns {Array} Array of target objects
 */
export const getTargets = () => {
  try {
    const targets = localStorage.getItem(TARGETS_KEY);
    return targets ? JSON.parse(targets) : [];
  } catch (error) {
    console.error('Error reading targets from localStorage:', error);
    return [];
  }
};

/**
 * Save a target to localStorage
 * @param {Object} target - Target object to save
 */
export const saveTarget = (target) => {
  try {
    const targets = getTargets();
    // Check if target already exists (by id)
    const existingIndex = targets.findIndex(t => t.id === target.id);
    
    if (existingIndex >= 0) {
      // Update existing target
      targets[existingIndex] = target;
    } else {
      // Add new target
      targets.push(target);
    }
    
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  } catch (error) {
    console.error('Error saving target to localStorage:', error);
  }
};

/**
 * Get all schedules from localStorage
 * @returns {Array} Array of schedule objects
 */
export const getSchedules = () => {
  try {
    const schedules = localStorage.getItem(SCHEDULES_KEY);
    return schedules ? JSON.parse(schedules) : [];
  } catch (error) {
    console.error('Error reading schedules from localStorage:', error);
    return [];
  }
};

/**
 * Save a schedule to localStorage
 * @param {Object} schedule - Schedule object to save
 */
export const saveSchedule = (schedule) => {
  try {
    const schedules = getSchedules();
    // Check if schedule already exists (by id)
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (existingIndex >= 0) {
      // Update existing schedule
      schedules[existingIndex] = schedule;
    } else {
      // Add new schedule
      schedules.push(schedule);
    }
    
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving schedule to localStorage:', error);
  }
};

/**
 * Update a schedule in localStorage
 * @param {string} id - Schedule ID
 * @param {Object} updates - Fields to update
 */
export const updateSchedule = (id, updates) => {
  try {
    const schedules = getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    
    if (index >= 0) {
      schedules[index] = { ...schedules[index], ...updates };
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
      return schedules[index];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating schedule in localStorage:', error);
    return null;
  }
};

/**
 * Get a target by ID
 * @param {string} id - Target ID
 * @returns {Object|null} Target object or null
 */
export const getTargetById = (id) => {
  const targets = getTargets();
  return targets.find(t => t.id === id) || null;
};

/**
 * Get a schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Object|null} Schedule object or null
 */
export const getScheduleById = (id) => {
  const schedules = getSchedules();
  return schedules.find(s => s.id === id) || null;
};
