import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { User, Download, Mail, Key, Settings, X } from 'lucide-react';

interface UserAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserAccount: React.FC<UserAccountProps> = ({ isOpen, onClose }) => {
  const [userEmail, setUserEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset to login state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setIsLoggedIn(false);
      setUserEmail('');
      setLicenseKey('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (userEmail && userEmail.includes('@')) {
      try {
        // Send to ConvertKit API
        const response = await fetch('https://api.kit.com/v3/forms/8475501/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            tags: ['profile-login', 'potential-customer']
          })
        });

        if (response.ok) {
          setIsLoggedIn(true);
          // Track in Mixpanel
          import('../lib/mixpanel').then(({ trackEvent }) => {
            trackEvent('User Login', { 
              email: userEmail,
              source: 'profile-popup'
            });
          });
        }
      } catch (error) {
        console.error('ConvertKit API failed:', error);
        // Still allow login even if ConvertKit fails
        setIsLoggedIn(true);
      }
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleDownload = (platform: 'mac' | 'windows') => {
    // Track download
    import('../lib/mixpanel').then(({ trackEvent }) => {
      trackEvent('App Download', { 
        platform,
        user_email: userEmail 
      });
    });
    
    // In production, this would download the actual app
    alert(`Download link for ${platform} will be sent to ${userEmail}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card ref={modalRef} className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Account</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isLoggedIn ? (
            <>
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Access your downloads and license</p>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Access Account
                </Button>
              </form>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account? Purchase Épure to get access.
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium">{userEmail}</p>
                <p className="text-sm text-muted-foreground">Licensed User</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">License Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="flex-1 p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="EPURE-XXXXX-XXXXX"
                    />
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Downloads</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleDownload('mac')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download for Mac
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleDownload('windows')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download for Windows
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Support</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('mailto:support@epure.app', '_blank')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => setIsLoggedIn(false)}
                >
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccount;
