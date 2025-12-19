import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Zap, FileImage, Volume2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-warm/10 text-accent-warm text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Launching Soon
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              One app for <span className="text-gradient">all your conversions</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Images today, audio tomorrow, documents next. Be the first to get access 
              to the universal converter that respects your privacy.
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

          {/* Waitlist form */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 md:p-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-white shadow-2xl">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Get early access
                </h3>
                <p className="text-white/70 mb-6">
                  Join the waitlist to be notified when we launch. 
                  Early subscribers get a special founding member discount.
                </p>

                {!isSubmitted ? (
                  <form 
                    action="https://app.kit.com/forms/8887361/subscriptions"
                    method="post"
                    data-sv-form="8475501"
                    className="flex flex-col sm:flex-row gap-3"
                    onSubmit={() => setIsSubmitted(true)}
                  >
                    <input
                      type="email"
                      name="email_address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 border-2 border-white/20 rounded-xl bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                    />
                    <Button
                      type="submit"
                      className="bg-white text-foreground hover:bg-white/90 font-semibold px-6 py-3 rounded-xl group whitespace-nowrap"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Join Waitlist
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-emerald-400 font-medium py-3"
                  >
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span>You're on the list! Check your inbox.</span>
                  </motion.div>
                )}

                <p className="text-white/50 text-sm mt-4">
                  Join 500+ people on the waitlist. Unsubscribe anytime.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Benefits */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { emoji: '🚀', text: 'Early access' },
              { emoji: '💰', text: 'Founding discount' },
              { emoji: '🎁', text: 'Free updates forever' },
              { emoji: '🤝', text: 'Shape the product' }
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

