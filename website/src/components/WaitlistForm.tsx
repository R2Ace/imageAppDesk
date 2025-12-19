import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Loader2 } from 'lucide-react';

interface WaitlistFormProps {
  variant?: 'inline' | 'stacked' | 'compact';
  className?: string;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ variant = 'inline', className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load ConvertKit script
    const script = document.createElement('script');
    script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
    script.async = true;
    
    const existingScript = document.querySelector('script[src="https://f.convertkit.com/ckjs/ck.5.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email');
      setStatus('error');
      return;
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
    
    // Submit to ConvertKit via form action
    try {
      const formData = new FormData();
      formData.append('email_address', email);
      
      const response = await fetch('https://app.kit.com/forms/8475501/subscriptions', {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // ConvertKit doesn't support CORS for form submissions
      });
      
      // Since no-cors mode doesn't give us response details, assume success
      setStatus('success');
      
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track('Waitlist Signup Success', {
          email: email,
          source: variant
        });
      }
    } catch (error) {
      console.error('Waitlist signup failed:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-success">You're on the list!</p>
          <p className="text-sm text-muted-foreground">Check your email for confirmation.</p>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
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
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Join'
          )}
        </button>
      </form>
    );
  }

  if (variant === 'stacked') {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus('idle');
          }}
          placeholder="Enter your email address"
          className="waitlist-input"
          disabled={status === 'loading'}
        />
        {status === 'error' && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="waitlist-button w-full flex items-center justify-center gap-2"
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
    );
  }

  // Inline variant (default)
  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus('idle');
          }}
          placeholder="Enter your email address"
          className="flex-1 px-5 py-4 rounded-xl border-2 border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-accent shadow-accent-glow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
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
  );
};

export default WaitlistForm;

