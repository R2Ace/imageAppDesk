import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import InteractiveDemo from './components/InteractiveDemo'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import StickyDownloadBar from './components/StickyDownloadBar'
import OnboardingGuide from './components/OnboardingGuide'
import { initMixpanel, trackEvent } from './lib/mixpanel'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Initialize Mixpanel
    initMixpanel()
    
    // Track page view
    trackEvent('React Landing Page Visit', {
      page: 'Modern Homepage',
      design_version: 'react_typescript_v1',
      timestamp: new Date().toISOString()
    })

    // Check if user should see onboarding
    const hasSeenOnboarding = localStorage.getItem('epure_onboarding_completed')
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay to let the page load
      setTimeout(() => {
        setShowOnboarding(true)
      }, 2000)
    }

    // Listen for manual onboarding trigger
    const handleShowOnboarding = () => {
      setShowOnboarding(true)
    }

    window.addEventListener('showOnboarding', handleShowOnboarding)

    return () => {
      window.removeEventListener('showOnboarding', handleShowOnboarding)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <StickyDownloadBar />
      
      <main>
        <Hero />
        <Features />
        <InteractiveDemo />
        <Pricing />
      </main>
      
      <Footer />

      {/* Onboarding Guide */}
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  )
}

export default App