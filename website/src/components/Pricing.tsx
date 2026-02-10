import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { fadeInUp } from '../lib/utils'
import EmailSignup from './EmailSignup'
import { CHECKOUT_URL, initiatePayment } from '../lib/payment'

const Pricing = () => {
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

  const handlePurchase = () => {
    // Track purchase attempt
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Purchase Button Clicked', {
        source: 'Pricing Section',
        price: 9,
        platform: userOS
      })
    }
    
    // Open Lemon Squeezy checkout
    initiatePayment()
  }

  const features = [
    "Unlimited file processing",
    "All formats (HEIC, WebP, TIFF, etc.)",
    "Advanced batch processing",
    "Smart compression algorithms",
    "Metadata preservation options",
    "Works completely offline",
    "Lifetime updates & support",
    "30-day money-back guarantee"
  ]

  const futureFeatures = [
    {
      category: "Documents",
      icon: "📄",
      features: ["PDF conversion", "Word, Excel, PowerPoint", "Pages, Numbers support"]
    },
    {
      category: "Video",
      icon: "🎥",
      features: ["MP4, MOV, AVI", "MKV, WebM support", "Quality control"]
    },
    {
      category: "Audio",
      icon: "🎵",
      features: ["MP3, WAV, FLAC", "AAC, OGG support", "Bitrate control"]
    }
  ]

  return (
    <section className="py-24 bg-white" data-tour="pricing">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Simple, Fair Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            One purchase, lifetime access. No subscriptions, no surprises.
          </p>
        </motion.div>

        <motion.div
          className="max-w-lg mx-auto"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Card className="relative bg-gradient-to-br from-white to-primary/5 border-2 border-primary shadow-strong hover:shadow-glow transition-all duration-300">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                🚀 Launch Week Special
              </div>
            </div>

            <CardHeader className="text-center pt-12 pb-8">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl text-muted-foreground line-through">$15</span>
                  <span className="text-6xl font-bold text-foreground">$9</span>
                </div>
                <p className="text-xl text-muted-foreground">one-time purchase</p>
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <span>Save $180+ per year vs competitors</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-3 text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="pt-6">
                <Button 
                  onClick={handlePurchase}
                  variant="premium"
                  size="xl"
                  className="w-full text-xl py-6 group"
                >
                  Get for {userOS === 'windows' ? 'Windows' : 'Mac'} - $9 Forever
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.div>
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  30-day money-back guarantee • Instant download
                </p>
              </div>

              {/* Value Proposition */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Native Mac performance</span>
                  <span>•</span>
                  <span>Complete privacy</span>
                  <span>•</span>
                  <span>One-time purchase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Future Features Carousel */}
        <motion.div
          className="mt-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Coming Soon - Universal Converter
            </h3>
            <p className="text-xl text-muted-foreground">
              Get ALL future conversions with your purchase today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {futureFeatures.map((category, index) => (
              <motion.div
                key={category.category}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h4 className="text-xl font-bold text-foreground">{category.category}</h4>
                </div>
                <ul className="space-y-2">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full text-lg font-bold shadow-lg">
              <span>🚀</span>
              <span>All future features included with your purchase!</span>
            </div>
          </div>
        </motion.div>

        {/* Email Signup */}
        <motion.div
          className="mt-12 text-center"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <EmailSignup />
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-16 text-center"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-6">Trusted by professionals worldwide</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="text-sm font-medium">Photographers</div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm font-medium">Designers</div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm font-medium">Content Creators</div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm font-medium">Agencies</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Pricing
