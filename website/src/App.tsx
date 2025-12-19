import { useEffect } from 'react'
import ConverterHero from './components/ConverterHero'
import SocialProof from './components/SocialProof'
import Features from './components/Features'
import WaitlistCTA from './components/WaitlistCTA'
import Footer from './components/Footer'
import StickyWaitlistBar from './components/StickyWaitlistBar'

import { initMixpanel, trackEvent } from './lib/mixpanel'

function App() {
  useEffect(() => {
    // Initialize Mixpanel
    initMixpanel()
    
    // Track page view
    trackEvent('React Landing Page Visit', {
      page: 'Waitlist Landing',
      design_version: 'waitlist_v1',
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <StickyWaitlistBar />
      
      <main>
        <ConverterHero />
        <SocialProof />
        <Features />
        <WaitlistCTA />
      </main>
      
      <Footer />
    </div>
  )
}

export default App
