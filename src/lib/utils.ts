
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets initials from a name (first letter of first and last name)
 * @param name Full name to extract initials from
 * @returns String with 1-2 characters representing initials
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const nameParts = name.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  } else {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}
