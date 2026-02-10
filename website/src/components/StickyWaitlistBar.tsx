import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { CHECKOUT_URL } from '../lib/payment';

const StickyWaitlistBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling past the hero section (roughly 100vh)
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      setIsVisible(scrollY > heroHeight && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-foreground text-white shadow-xl"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - App info */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </motion.div>
                
                <div className="hidden sm:block">
                  <h3 className="font-semibold text-sm">Épure - $9 once</h3>
                  <p className="text-xs text-white/60">
                    Not $180/year like web tools
                  </p>
                </div>
              </div>
              
              {/* Center - Features */}
              <div className="hidden lg:flex items-center gap-6 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  <span>500+ files at once</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Zero uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span>Works offline</span>
                </div>
              </div>
              
              {/* Right side - CTA */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => window.open(CHECKOUT_URL, '_blank')}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium px-4 py-2 rounded-lg group"
                >
                  <span className="hidden sm:inline">Get Épure - $9</span>
                  <span className="sm:hidden">Buy $9</span>
                  <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Subtle gradient border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyWaitlistBar;
