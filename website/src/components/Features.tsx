import { motion } from 'framer-motion'
import { Zap, Shield, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { fadeInUp, staggerContainer } from '../lib/utils'

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "Native Mac performance means instant processing. Convert 100+ images in seconds, not minutes. No uploading, no waiting for servers.",
      gradient: "from-yellow-400 to-orange-500",
      stats: "3x faster than competitors"
    },
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your images never leave your Mac. Zero cloud uploads, zero data collection, zero privacy risks. Perfect for sensitive business content.",
      gradient: "from-blue-400 to-purple-500",
      stats: "100% local processing"
    },
    {
      icon: DollarSign,
      title: "Simple Pricing",
      description: "One-time purchase, lifetime access. Save $180+ per year vs. $24/month competitors. No subscriptions, no recurring fees, ever.",
      gradient: "from-green-400 to-emerald-500",
      stats: "$9 one-time purchase"
    }
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Why Épure Changes Everything
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built specifically for Mac users who demand speed, privacy, and value
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 shadow-lg hover:shadow-strong transition-all duration-500 transform-3d will-change-transform">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} p-5 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  
                  <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {feature.stats}
                  </div>
                </CardHeader>
                
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Section */}
        <motion.div
          className="mt-24 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Épure vs. Web Converters
            </h3>
            <p className="text-xl text-muted-foreground">
              See why native Mac performance wins every time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Web Converters */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <h4 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                Web Converters
              </h4>
              <ul className="space-y-3 text-red-600">
                <li className="flex items-center">
                  <span className="text-red-500 mr-3">❌</span>
                  Upload files to unknown servers
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-3">❌</span>
                  Wait 30-60 seconds for processing
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-3">❌</span>
                  Pay $24+ per month ($288/year)
                </li>
                <li className="flex items-center">
                  <span className="text-red-500 mr-3">❌</span>
                  Bombarded with ads
                </li>
              </ul>
            </div>

            {/* Épure */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Épure (Native Mac)
              </h4>
              <ul className="space-y-3 text-green-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Process files locally - 100% private
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Instant results - 3-5 seconds
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Pay once: $9 (lifetime access)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✅</span>
                  Clean, distraction-free interface
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg font-semibold text-primary">
              💡 The choice is clear: Native Mac performance wins every time
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
