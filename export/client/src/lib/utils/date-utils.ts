/**
 * Returns a formatted string for the current date
 * @returns {string} Formatted date string (e.g., "Monday, April 6, 2025")
 */
export function getCurrentDateString(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date().toLocaleDateString('en-US', options);
}

/**
 * Formats a date object into a human-readable time string
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "3:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Formats a date into a short date string (MM/DD/YYYY)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "04/06/2025")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Checks if two dates are on the same day
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} True if dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Gets a date range for the current week (Sunday to Saturday)
 * @returns {[Date, Date]} Start and end dates for the current week
 */
export function getCurrentWeekRange(): [Date, Date] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate the end of the week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return [startOfWeek, endOfWeek];
}

/**
 * Formats a date range into a readable string
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {string} Formatted date range (e.g., "Apr 1 - Apr 7, 2025")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const endYear = endDate.getFullYear();
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
  }
}

/**
 * Calculates the duration between two dates in hours and minutes
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {string} Formatted duration string (e.g., "8h 30m")
 */
export function calculateDuration(startDate: Date, endDate: Date): string {
  if (!startDate || !endDate) {
    return "0h 0m";
  }
  
  const diffInMs = endDate.getTime() - startDate.getTime();
  const diffInMinutes = diffInMs / (1000 * 60);
  
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = Math.floor(diffInMinutes % 60);
  
  return `${hours}h ${minutes}m`;
}

/**
 * Formats a date into a readable date and time format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date and time (e.g., "Apr 6, 2025, 3:30 PM")
 */
export function formatDateTime(date: Date): string {
  if (!date) {
    return "";
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats a date into a readable date format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date (e.g., "April 6, 2025")
 */
export function formatDate(date: Date): string {
  if (!date) {
    return "";
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}