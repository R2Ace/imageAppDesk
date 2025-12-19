import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const LOOPS_ENDPOINT = 'https://app.loops.so/api/newsletter-form/cmjdc4wv302yk0iyy9lc0nbol';

const EmailSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = () => {
    if (!email || !email.includes('@')) return false;
    
    setStatus('loading');
    
    // Show success after form submits to hidden iframe
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
    
    return true;
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <div 
          style={{
            backgroundColor: 'rgb(240, 253, 244)',
            borderRadius: '8px',
            border: '1px solid #86efac',
            padding: '32px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: '#166534', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
            You're subscribed! 🎉
          </h2>
          <p style={{ color: '#15803d', fontSize: '16px' }}>
            We'll keep you updated on our launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <iframe name="loops-newsletter" style={{ display: 'none' }} />
      <form 
        action={LOOPS_ENDPOINT}
        method="POST"
        target="loops-newsletter"
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgb(249, 250, 251)',
          borderRadius: '8px',
          border: '1px solid #e3e3e3',
          maxWidth: '700px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '32px', width: '100%', position: 'relative' }}>
          <div 
            style={{ 
              color: 'rgb(77, 77, 77)', 
              fontSize: '24px', 
              fontWeight: '700',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}
          >
            <h2>Join the Newsletter</h2>
          </div>
          <div 
            style={{ 
              color: 'rgb(104, 104, 104)', 
              fontSize: '16px',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}
          >
            Subscribe to get our latest content by email.
          </div>
          
          {status === 'error' && (
            <p style={{ color: '#dc2626', textAlign: 'center', marginBottom: '16px' }}>
              Something went wrong. Please try again.
            </p>
          )}
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            margin: '0 auto',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: '1 0 220px', margin: '0' }}>
              <input 
                name="email" 
                aria-label="Email Address" 
                placeholder="Email Address" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                style={{ 
                  color: 'rgb(0, 0, 0)', 
                  borderColor: 'rgb(227, 227, 227)', 
                  borderRadius: '6px', 
                  fontWeight: '400',
                  background: '#ffffff',
                  fontSize: '15px',
                  padding: '12px',
                  border: '1px solid #e3e3e3',
                  lineHeight: '1.4',
                  width: '100%',
                  transition: 'border-color ease-out 300ms'
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={status === 'loading' || !email}
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: '#3b82f6', 
                borderRadius: '6px', 
                fontWeight: '500',
                border: '0',
                cursor: status === 'loading' ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textAlign: 'center',
                fontSize: '15px',
                padding: '12px 24px',
                margin: '0',
                transition: 'all 300ms ease-in-out',
                opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </div>
          <div 
            style={{ 
              color: 'rgb(104, 104, 104)', 
              fontSize: '13px', 
              fontWeight: '400',
              margin: '16px 0 0 0',
              textAlign: 'center'
            }}
          >
            We won't send you spam. Unsubscribe at any time.
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailSignup;
