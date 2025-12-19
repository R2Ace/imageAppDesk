import React from 'react'
import { motion } from 'framer-motion'
import { Download, Play, Star, Users } from 'lucide-react'
import { Button } from './ui/button'
import { fadeInUp, slideInFromLeft, slideInFromRight } from '../lib/utils'

const Hero = () => {
  // Detect user's operating system
  const getUserOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('win')) return 'windows';
    return 'mac'; // Default to Mac
  };

  const [userOS, setUserOS] = React.useState('mac');
  
  React.useEffect(() => {
    setUserOS(getUserOS());
  }, []);

  const handleDownload = async () => {
    // Track download attempt
    import('../lib/mixpanel').then(({ trackEvent }) => {
      trackEvent('Download Button Clicked', {
        source: 'Hero Section',
        price: 9,
        platform: userOS
      })
    })
    
    // Initiate payment flow
    try {
      const { initiatePayment } = await import('../lib/payment')
      await initiatePayment()
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment system temporarily unavailable. Please contact r2thedev@gmail.com')
    }
  }

  const handleDemo = () => {
    // Track demo interest
    import('../lib/mixpanel').then(({ trackEvent }) => {
      trackEvent('Demo Button Clicked', {
        source: 'Hero Section'
      })
    })
    
    // Scroll to demo section
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden flex items-center">
      {/* Floating Background Orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={slideInFromLeft}
            initial="initial"
            animate="animate"
          >
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
              variants={fadeInUp}
            >
              <span className="text-gradient">Process Files</span>
              <br />
              <span className="text-foreground">Like a Pro</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl"
              variants={fadeInUp}
            >
              The fastest, most private file converter for Mac and Windows. Convert images, audio, and documents 
              with just a few clicks.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              variants={fadeInUp}
            >
              <Button 
                variant="premium" 
                size="xl" 
                onClick={handleDownload}
                className="group"
                data-tour="download-button"
              >
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce-subtle" />
                Download for {userOS === 'windows' ? 'Windows' : 'Mac'} $9
              </Button>
              
              <Button 
                variant="secondary_premium" 
                size="xl" 
                onClick={handleDemo}
                className="group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Try it Yourself
              </Button>
            </motion.div>
            
            {/* Social Proof */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-muted-foreground"
              variants={fadeInUp}
            >
              <div className="text-center lg:text-left">
                <span className="text-sm font-medium">Native Mac performance • Complete privacy • One-time purchase</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Mac Mockup */}
          <motion.div 
            className="relative"
            variants={slideInFromRight}
            initial="initial"
            animate="animate"
          >
            <div className="relative rotate-3d hover:scale-105 transition-transform duration-700 will-change-transform">
              {/* Main Mac Mockup */}
              <div className="mac-mockup w-full max-w-lg mx-auto aspect-[4/3] p-8">
                <div className="mt-8 space-y-6">
                  {/* Drag & Drop Area */}
                  <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Download className="w-12 h-12 text-primary mx-auto mb-3" />
                    </motion.div>
                    <p className="text-primary font-semibold">Drag & drop files here</p>
                    <p className="text-muted-foreground text-sm mt-1">Or click to browse</p>
                  </div>
                  
                  {/* Processing Preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Original</div>
                      <div className="text-sm font-semibold">2.4 MB</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600">Optimized</div>
                      <div className="text-sm font-semibold text-green-700">847 KB</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Feature Cards */}
              <motion.div 
                className="absolute -top-4 -left-6 bg-white rounded-lg shadow-lg p-3 glass"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">3x Faster</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -right-6 bg-white rounded-lg shadow-lg p-3 glass"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">100% Private</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/30 rounded-full mt-2 animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
