import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Mail, Check } from 'lucide-react';

const StickyWaitlistBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
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
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </motion.div>
                
                <div className="hidden sm:block">
                  <h3 className="font-semibold text-sm">Épure — Launching Soon</h3>
                  <p className="text-xs text-white/60">
                    Get early access & a launch day discount
                  </p>
                </div>
              </div>
              
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
              
              <div className="flex items-center gap-2">
                {!isSubmitted ? (
                  <>
                    <iframe name="loops-frame-sticky" style={{ display: 'none' }} />
                    <form 
                      action="https://app.loops.so/api/newsletter-form/cmjdc4wv302yk0iyy9lc0nbol"
                      method="POST"
                      target="loops-frame-sticky"
                      className="flex items-center gap-2"
                      onSubmit={() => {
                        setTimeout(() => setIsSubmitted(true), 1000);
                      }}
                    >
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        required
                        className="hidden sm:block w-48 px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:border-emerald-400/60 focus:outline-none text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!email}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium px-4 py-2 rounded-lg group inline-flex items-center transition-all disabled:opacity-50"
                      >
                        <Mail className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Join Waitlist</span>
                        <span className="sm:hidden">Join</span>
                        <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    You're in!
                  </div>
                )}
                
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
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyWaitlistBar;
