import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Loader2 } from 'lucide-react';

interface WaitlistFormProps {
  variant?: 'inline' | 'stacked' | 'compact';
  className?: string;
}

const LOOPS_ENDPOINT = 'https://app.loops.so/api/newsletter-form/cmjdc4wv302yk0iyy9lc0nbol';

const WaitlistForm: React.FC<WaitlistFormProps> = ({ variant = 'inline', className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email');
      setStatus('error');
      return false;
    }
    
    setStatus('loading');
    
    // Track waitlist signup
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Waitlist Signup Attempted', {
        email: email,
        source: variant,
        timestamp: new Date().toISOString()
      });
    }
    
    // Show success after form submits to hidden iframe
    setTimeout(() => {
      setStatus('success');
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track('Waitlist Signup Success', {
          email: email,
          source: variant
        });
      }
    }, 1000);
    
    return true;
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-emerald-700">You're on the list!</p>
          <p className="text-sm text-muted-foreground">We'll notify you when we launch.</p>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <iframe name="loops-compact" style={{ display: 'none' }} />
        <form 
          action={LOOPS_ENDPOINT}
          method="POST"
          target="loops-compact"
          onSubmit={handleSubmit}
          className={`flex gap-2 ${className}`}
        >
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus('idle');
            }}
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Join'
            )}
          </button>
        </form>
      </>
    );
  }

  if (variant === 'stacked') {
    return (
      <>
        <iframe name="loops-stacked" style={{ display: 'none' }} />
        <form 
          action={LOOPS_ENDPOINT}
          method="POST"
          target="loops-stacked"
          onSubmit={handleSubmit}
          className={`space-y-3 ${className}`}
        >
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus('idle');
            }}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={status === 'loading'}
          />
          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Join the Waitlist
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            No spam, ever. Unsubscribe anytime.
          </p>
        </form>
      </>
    );
  }

  // Inline variant (default)
  return (
    <>
      <iframe name="loops-inline" style={{ display: 'none' }} />
      <form 
        action={LOOPS_ENDPOINT}
        method="POST"
        target="loops-inline"
        onSubmit={handleSubmit}
        className={`${className}`}
      >
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus('idle');
            }}
            placeholder="Enter your email address"
            className="flex-1 px-5 py-4 rounded-xl border-2 border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 rounded-xl font-semibold text-white bg-primary shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Join Waitlist
              </>
            )}
          </button>
        </div>
        {status === 'error' && (
          <p className="text-sm text-red-500 text-center mt-2">{errorMessage}</p>
        )}
        <p className="text-xs text-muted-foreground text-center mt-3">
          Join 500+ people waiting. No spam, ever.
        </p>
      </form>
    </>
  );
};

export default WaitlistForm;
