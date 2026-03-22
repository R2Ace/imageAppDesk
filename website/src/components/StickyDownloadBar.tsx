import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { triggerDownload } from '../lib/payment'

const StickyDownloadBar = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight
      const scrollY = window.scrollY
      setIsVisible(scrollY > heroHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
                    Free file converter for Mac
                  </p>
                </div>
              </div>
              
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
                    <span>Works Offline</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => triggerDownload('Sticky Bar')}
                  variant="premium"
                  size="lg"
                  className="shadow-lg hover:shadow-xl group"
                >
                  <Download className="mr-2 h-4 w-4 group-hover:animate-bounce-subtle" />
                  <span className="hidden sm:inline">Download Free for Mac</span>
                  <span className="sm:hidden">Download Free</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StickyDownloadBar
