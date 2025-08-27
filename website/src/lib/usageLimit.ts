// Usage limit system for browser app
export interface UsageStats {
  totalConversions: number;
  totalImages: number;
  lastReset: string;
  dailyLimit: number;
  sessionLimit: number;
}

const DAILY_LIMIT = 10; // Free images per day
const SESSION_LIMIT = 5; // Free images per session

// Get current usage stats from localStorage
export const getUsageStats = (): UsageStats => {
  const stored = localStorage.getItem('epure_usage_stats');
  const today = new Date().toDateString();
  
  if (stored) {
    const stats = JSON.parse(stored);
    
    // Reset daily stats if it's a new day
    if (stats.lastReset !== today) {
      return {
        ...stats,
        totalConversions: 0,
        totalImages: 0,
        lastReset: today
      };
    }
    
    return stats;
  }
  
  // Default stats for new users
  return {
    totalConversions: 0,
    totalImages: 0,
    lastReset: today,
    dailyLimit: DAILY_LIMIT,
    sessionLimit: SESSION_LIMIT
  };
};

// Save usage stats to localStorage
export const saveUsageStats = (stats: UsageStats): void => {
  localStorage.setItem('epure_usage_stats', JSON.stringify(stats));
};

// Check if user can process more images
export const canProcessImages = (imageCount: number): { canProcess: boolean; reason?: string; remaining?: number } => {
  const stats = getUsageStats();
  
  // Check daily limit
  if (stats.totalImages + imageCount > stats.dailyLimit) {
    const remaining = Math.max(0, stats.dailyLimit - stats.totalImages);
    return {
      canProcess: false,
      reason: 'daily',
      remaining
    };
  }
  
  return { canProcess: true };
};

// Track image processing
export const trackImageProcessing = (imageCount: number): UsageStats => {
  const stats = getUsageStats();
  const newStats = {
    ...stats,
    totalConversions: stats.totalConversions + 1,
    totalImages: stats.totalImages + imageCount
  };
  
  saveUsageStats(newStats);
  
  // Track in analytics
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track('Image Processing', {
      images_count: imageCount,
      total_images_today: newStats.totalImages,
      conversion_number: newStats.totalConversions
    });
  }
  
  return newStats;
};

// Get usage limit message
export const getUsageLimitMessage = (reason: string, remaining: number): string => {
  switch (reason) {
    case 'daily':
      if (remaining > 0) {
        return `You have ${remaining} free images remaining today. Get unlimited processing with the desktop app!`;
      }
      return `You've reached today's limit of ${DAILY_LIMIT} free images. Get unlimited processing with the desktop app!`;
    default:
      return 'Usage limit reached. Get unlimited processing with the desktop app!';
  }
};

// Reset usage stats (for testing)
export const resetUsageStats = (): void => {
  localStorage.removeItem('epure_usage_stats');
};
