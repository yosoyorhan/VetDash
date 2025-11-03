import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const AVATAR_COLORS = [
  '#FFC857', // Mango
  '#E9724C', // Burnt Sienna
  '#C5283D', // Crimson
  '#48A9A6', // Viridian Green
  '#255F85', // Dark Cerulean
  '#844685', // Plum
  '#78C0E0', // Light Blue
  '#F49D6E', // Sandy Brown
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function generateAvatar(name) {
  if (!name) {
    return { backgroundColor: '#cccccc' };
  }
  const hash = hashCode(name);
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return { backgroundColor: AVATAR_COLORS[colorIndex] };
}