import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Zap, FileImage, Volume2, FileText, ShoppingCart, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CHECKOUT_URL } from '../lib/payment';

const WaitlistCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <section className="py-24 bg-background relative overflow-hidden" id="waitlist">
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
              Images today, audio and documents coming soon. 
              Buy once and get every future feature included, forever.
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

          {/* Buy CTA */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 md:p-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-white shadow-2xl">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Ready to ditch web converters?
                </h3>
                <p className="text-white/70 mb-6">
                  Get Épure today. One payment, no subscriptions, works forever.
                  All future features included with your purchase.
                </p>

                <Button
                  onClick={() => window.open(CHECKOUT_URL, '_blank')}
                  className="w-full max-w-sm mx-auto bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-lg py-6 rounded-xl group shadow-lg shadow-emerald-500/25"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Get Épure for $9
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-white/50 mt-4">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Instant download
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    30-day money back
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Lifetime updates
                  </span>
                </div>

                {/* Email signup as secondary */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm mb-3">
                    Not ready to buy? Get notified about updates:
                  </p>
                  {!isSubmitted ? (
                    <>
                    <iframe name="loops-frame-cta" style={{ display: 'none' }} />
                    <form 
                      action="https://app.loops.so/api/newsletter-form/cmjdc4wv302yk0iyy9lc0nbol"
                      method="POST"
                      target="loops-frame-cta"
                      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                      onSubmit={() => {
                        setTimeout(() => setIsSubmitted(true), 1000);
                      }}
                    >
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-4 py-2.5 border-2 border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!email}
                        className="inline-flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white/20 font-medium px-4 py-2.5 rounded-xl group whitespace-nowrap transition-all disabled:opacity-50 text-sm"
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Subscribe
                      </button>
                    </form>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center gap-2 text-emerald-400 font-medium py-2"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">You're subscribed! We'll keep you posted.</span>
                    </motion.div>
                  )}
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
              { emoji: '⚡', text: 'Instant download' },
              { emoji: '💰', text: '$9 once, forever' },
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
