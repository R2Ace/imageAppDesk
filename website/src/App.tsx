import { useEffect } from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import InteractiveDemo from './components/InteractiveDemo'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import StickyDownloadBar from './components/StickyDownloadBar'
import { initMixpanel, trackEvent } from './lib/mixpanel'

function App() {
  useEffect(() => {
    // Initialize Mixpanel
    initMixpanel()
    
    // Track page view
    trackEvent('React Landing Page Visit', {
      page: 'Modern Homepage',
      design_version: 'react_typescript_v1',
      timestamp: new Date().toISOString()
    })
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
    </div>
  )
}

export default App