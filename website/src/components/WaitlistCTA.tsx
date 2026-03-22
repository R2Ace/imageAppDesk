import { motion } from 'framer-motion';
import { Download, ArrowRight, Check, Zap, FileImage, Volume2, FileText, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { triggerDownload } from '../lib/payment';

const WaitlistCTA = () => {
  const upcomingFeatures = [
    {
      icon: FileImage,
      title: 'Images',
      description: 'HEIC, WebP, AVIF, 20+ formats',
      status: 'ready',
      color: 'emerald'
    },
    {
      icon: Volume2,
      title: 'Audio',
      description: 'MP3, WAV, FLAC, AAC',
      status: 'coming',
      color: 'amber'
    },
    {
      icon: FileText,
      title: 'Documents',
      description: 'PDF, Word, Pages',
      status: 'planned',
      color: 'blue'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="download">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Available Now
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              One app for <span className="text-gradient">all your conversions</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Images, audio, and documents — all converted locally on your machine. 
              Download free and start converting in seconds.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`p-6 h-full border-2 ${
                  feature.status === 'ready' 
                    ? 'border-emerald-200 bg-emerald-50/30' 
                    : feature.status === 'coming'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-blue-200 bg-blue-50/30'
                } transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.status === 'ready'
                      ? 'bg-emerald-100'
                      : feature.status === 'coming'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      feature.status === 'ready'
                        ? 'text-emerald-600'
                        : feature.status === 'coming'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      feature.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-700'
                        : feature.status === 'coming'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {feature.status === 'ready' ? 'Ready' : feature.status === 'coming' ? 'Coming' : 'Planned'}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Download CTA */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 md:p-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-white shadow-2xl">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Get Épure — free
                </h3>
                <p className="text-white/70 mb-6">
                  One app, all your conversions, completely offline.
                  No sign-up required.
                </p>

                <button
                  onClick={() => triggerDownload('CTA Section')}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-lg px-8 py-4 rounded-xl group shadow-lg shadow-emerald-500/25 transition-all inline-flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Free for Mac
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-white/50 mt-4">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    100% free
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    No account needed
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Works offline
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Benefits */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { emoji: '⚡', text: 'Lightning fast' },
              { emoji: '📦', text: 'Batch 500+ files' },
              { emoji: '🎁', text: 'Free updates forever' },
              { emoji: '🔒', text: '100% private & offline' }
            ].map((benefit, index) => (
              <motion.div 
                key={benefit.text}
                className="p-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl mb-2">{benefit.emoji}</div>
                <p className="text-sm font-medium text-muted-foreground">{benefit.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistCTA;
