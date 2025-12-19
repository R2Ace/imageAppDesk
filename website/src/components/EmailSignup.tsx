import React, { useEffect } from 'react';

const EmailSignup: React.FC = () => {
  useEffect(() => {
    // Load ConvertKit core script for the form functionality
    const script = document.createElement('script');
    script.src = 'https://f.convertkit.com/ckjs/ck.5.js';
    script.async = true;
    
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://f.convertkit.com/ckjs/ck.5.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }
    
    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Kit.com Newsletter Form */}
      <form 
        action="https://app.kit.com/forms/8887361/subscriptions" 
        className="seva-form formkit-form" 
        method="post" 
        data-sv-form="8475501" 
        data-uid="6b04348fc3" 
        data-format="inline" 
        data-version="5" 
        data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! Now check your email to confirm your subscription.","redirect_url":""},"analytics":{"google":null,"fathom":null,"facebook":null,"segment":null,"pinterest":null,"sparkloop":null,"googletagmanager":null},"modal":{"trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"powered_by":{"show":true,"url":"https://kit.com/features/forms?utm_campaign=poweredby&utm_content=form&utm_medium=referral&utm_source=dynamic"},"recaptcha":{"enabled":false},"return_visitor":{"action":"show","custom_content":""},"slide_in":{"display_in":"bottom_right","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},"sticky_bar":{"display_in":"top","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15}},"version":"5"}' 
        style={{
          backgroundColor: 'rgb(249, 250, 251)',
          borderRadius: '8px',
          border: '1px solid #e3e3e3',
          maxWidth: '700px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="formkit-background" style={{ opacity: 0.2 }}></div>
        <div data-style="minimal" style={{ padding: '32px', width: '100%', position: 'relative' }}>
          <div 
            className="formkit-header" 
            data-element="header" 
            style={{ 
              color: 'rgb(77, 77, 77)', 
              fontSize: '24px', 
              fontWeight: '700',
              margin: '0 0 16px 0',
              textAlign: 'center' as const
            }}
          >
            <h2>Join the Newsletter</h2>
          </div>
          <div 
            className="formkit-subheader" 
            data-element="subheader" 
            style={{ 
              color: 'rgb(104, 104, 104)', 
              fontSize: '16px',
              margin: '0 0 24px 0',
              textAlign: 'center' as const
            }}
          >
            Subscribe to get our latest content by email.
          </div>
          <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul>
          <div data-element="fields" data-stacked="false" className="seva-fields formkit-fields" style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '12px',
            margin: '0 auto',
            alignItems: 'flex-end'
          }}>
            <div className="formkit-field" style={{ flex: '1 0 220px', margin: '0' }}>
              <input 
                className="formkit-input" 
                name="email_address" 
                aria-label="Email Address" 
                placeholder="Email Address" 
                required 
                type="email" 
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
              data-element="submit" 
              className="formkit-submit" 
              type="submit"
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: '#3b82f6', 
                borderRadius: '6px', 
                fontWeight: '500',
                border: '0',
                cursor: 'pointer',
                display: 'inline-block',
                textAlign: 'center' as const,
                fontSize: '15px',
                padding: '12px 24px',
                margin: '0',
                transition: 'all 300ms ease-in-out'
              }}
            >
              <div className="formkit-spinner" style={{ display: 'none' }}>
                <div></div><div></div><div></div>
              </div>
              <span>Subscribe</span>
            </button>
          </div>
          <div 
            className="formkit-guarantee" 
            data-element="guarantee" 
            style={{ 
              color: 'rgb(104, 104, 104)', 
              fontSize: '13px', 
              fontWeight: '400',
              margin: '16px 0 0 0',
              textAlign: 'center' as const
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
