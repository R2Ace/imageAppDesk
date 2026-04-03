import { motion } from 'framer-motion'
import { Check, Download, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/card'
import { fadeInUp } from '../lib/utils'
import EmailSignup from './EmailSignup'
import { triggerDownload } from '../lib/payment'

const Pricing = () => {
  const features = [
    "Unlimited file processing",
    "All formats (HEIC, WebP, TIFF, etc.)",
    "Advanced batch processing",
    "Smart compression algorithms",
    "Metadata preservation options",
    "Works completely offline",
    "Free lifetime updates",
    "No account required"
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
            Completely Free
          </h2>
          <p className="text-xl text-muted-foreground">
            No subscriptions, no sign-ups, no surprises. Just download and go.
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
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                100% Free
              </div>
            </div>

            <CardHeader className="text-center pt-12 pb-8">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                </div>
                <p className="text-xl text-muted-foreground">Free forever, no strings attached</p>
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <span>Download now and start converting</span>
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
                <button
                  onClick={() => triggerDownload('Pricing')}
                  className="bg-gradient-primary text-white font-bold text-lg px-6 py-3 rounded-xl group shadow-lg transition-all inline-flex items-center justify-center whitespace-nowrap hover:opacity-90 w-full cursor-pointer"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Free for Mac
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  macOS 10.15+ &middot; Apple Silicon
                </p>
              </div>

              {/* Install Instructions */}
              <div className="pt-6 border-t border-gray-200">
                <details className="text-left">
                  <summary className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">
                    Installation Instructions
                  </summary>
                  <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Open the downloaded DMG and drag Épure to Applications</li>
                    <li>
                      Open <strong>Terminal</strong> and run:
                      <code className="block mt-1 mb-1 px-3 py-2 bg-gray-900 text-green-400 rounded-lg text-xs font-mono select-all">
                        xattr -cr /Applications/Épure.app
                      </code>
                    </li>
                    <li>Open Épure from Applications — it will launch normally</li>
                  </ol>
                  <p className="mt-3 text-xs text-muted-foreground/70">
                    This is required because the app is not yet signed with an Apple Developer certificate.
                    The command simply removes the macOS quarantine flag.
                  </p>
                </details>
              </div>

              {/* Value Proposition */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>Native Mac performance</span>
                  <span>•</span>
                  <span>Complete privacy</span>
                  <span>•</span>
                  <span>100% free</span>
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
              <span>All future features included — free forever</span>
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
