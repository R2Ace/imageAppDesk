import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation utilities
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
}

export const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Analytics tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // This will integrate with your Mixpanel setup
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, properties)
  }
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate random file sizes for demo
export const generateRandomFileSize = (min: number = 1000000, max: number = 5000000): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Simulate processing time
export const simulateProcessing = async (duration: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration))
}
