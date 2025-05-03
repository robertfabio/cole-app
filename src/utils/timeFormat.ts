/**
 * Format milliseconds into a readable time string (HH:MM:SS)
 * Essa função é usada no cronômetro principal e mostra horas, minutos e segundos
 * Melhorada para evitar saltos na exibição dos números
 */
export const formatTimeWithSeconds = (milliseconds: number): string => {
  // Arredondar para o décimo de segundo mais próximo para estabilizar a exibição
  const roundedMs = Math.floor(Math.abs(milliseconds) / 100) * 100;
  const totalSeconds = Math.floor(roundedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const padZero = (num: number): string => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  }
  
  return `${padZero(minutes)}:${padZero(seconds)}`;
};

/**
 * Format milliseconds into a readable time string (HH:MM)
 * Mostra apenas horas e minutos, sem segundos
 * Usado principalmente para estatísticas
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  const padZero = (num: number): string => num.toString().padStart(2, '0');
  
  // Se tiver horas, mostra no formato HH:MM
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}`;
  }
  
  // Se não tiver horas, mostra apenas os minutos
  return `${minutes} min`;
};

/**
 * Format milliseconds into a natural language description (e.g., "2 horas e 30 minutos")
 */
export const formatTimeDescription = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let description = '';

  if (hours > 0) {
    description += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  if (minutes > 0) {
    if (hours > 0) description += ' e ';
    description += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  if (hours === 0 && minutes === 0) {
    description = `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
  }

  return description;
};

/**
 * Format a date string into a readable format (DD/MM/YYYY HH:MM)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Returns the day of the week for a date (in Portuguese)
 */
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = [
    'Domingo', 
    'Segunda', 
    'Terça', 
    'Quarta', 
    'Quinta', 
    'Sexta', 
    'Sábado'
  ];
  
  return days[date.getDay()];
};

/**
 * Format time for the pomodoro timer
 * Melhorada para evitar saltos na exibição dos números
 */
export const formatPomodoroTime = (milliseconds: number): string => {
  // Arredondar para o décimo de segundo mais próximo para estabilizar a exibição
  const roundedMs = Math.floor(Math.abs(milliseconds) / 100) * 100;
  const totalSeconds = Math.floor(roundedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};