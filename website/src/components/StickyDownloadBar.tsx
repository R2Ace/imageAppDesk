import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, User, HelpCircle } from 'lucide-react'
import { Button } from './ui/button'
import UserAccount from './UserAccount'

const StickyDownloadBar = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showUserAccount, setShowUserAccount] = useState(false)
  
  // Detect user's operating system
  const getUserOS = () => {
    if (typeof window === 'undefined') return 'mac'
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'windows'
    return 'mac'
  }
  
  const [userOS, setUserOS] = useState('mac')
  
  useEffect(() => {
    setUserOS(getUserOS())
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling past the hero section (roughly 100vh)
      const heroHeight = window.innerHeight
      const scrollY = window.scrollY
      setIsVisible(scrollY > heroHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDownload = async () => {
    // Track download attempt from sticky bar
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Download Button Clicked', {
        source: 'Sticky Bar',
        price: 9,
        platform: userOS
      })
    }
    
    // Initiate payment flow
    try {
      const { initiatePayment } = await import('../lib/payment')
      await initiatePayment()
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment system temporarily unavailable. Please contact r2thedev@gmail.com')
    }
  }

  const showOnboardingGuide = () => {
    // Clear the completion flag and dispatch a custom event to trigger the guide
    localStorage.removeItem('epure_onboarding_completed')
    window.dispatchEvent(new CustomEvent('showOnboarding'))
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg"
        >
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - App info */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                
                <div>
                  <h3 className="font-bold text-foreground text-lg">Épure</h3>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    🔥 <span className="line-through">$10/month</span> → <span className="text-green-600 font-semibold">$9 forever</span> 🔥
                  </p>
                </div>
              </div>
              
              {/* Right side - CTA */}
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>3x Faster</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>100% Private</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>No Subscriptions</span>
                  </div>
                </div>
                
                <Button 
                  onClick={showOnboardingGuide}
                  variant="ghost"
                  size="sm"
                  title="Take a quick tour"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => setShowUserAccount(true)}
                  variant="ghost"
                  size="sm"
                >
                  <User className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleDownload}
                  variant="premium"
                  size="lg"
                  className="shadow-lg hover:shadow-xl group"
                >
                  <Download className="mr-2 h-4 w-4 group-hover:animate-bounce-subtle" />
                  <span className="hidden sm:inline">Get for {userOS === 'windows' ? 'Windows' : 'Mac'} $9</span>
                  <span className="sm:hidden">Get $9</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Subtle gradient border at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </motion.div>
      )}
      
      {/* User Account Modal */}
      <UserAccount 
        isOpen={showUserAccount} 
        onClose={() => setShowUserAccount(false)} 
      />
    </AnimatePresence>
  )
}

export default StickyDownloadBar
