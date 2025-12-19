import { motion } from 'framer-motion';
import { Zap, Shield, DollarSign, Clock, Layers, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Native desktop performance means instant processing. Convert hundreds of images in seconds, not minutes.",
      stat: "3x faster",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      icon: Lock,
      title: "Complete Privacy",
      description: "Your files never leave your computer. Zero cloud uploads, zero data collection, zero tracking.",
      stat: "100% local",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      icon: DollarSign,
      title: "Pay Once, Own Forever",
      description: "No subscriptions, no recurring fees. One purchase gets you lifetime access and all future updates.",
      stat: "$9 lifetime",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: Layers,
      title: "Batch Processing",
      description: "Drop entire folders and convert thousands of files at once. Perfect for photographers and designers.",
      stat: "Unlimited files",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Clock,
      title: "Works Offline",
      description: "No internet required. Process your files anywhere, anytime, without depending on cloud services.",
      stat: "Always available",
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      icon: Shield,
      title: "All Formats Supported",
      description: "HEIC, WebP, AVIF, PNG, JPG, TIFF, and more. Convert between any format with smart compression.",
      stat: "20+ formats",
      gradient: "from-rose-400 to-red-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <section className="py-24 bg-secondary/30 relative overflow-hidden" data-tour="features">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            Why choose Épure
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Built for speed <span className="text-gradient">and privacy</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlike web-based converters that upload your files to unknown servers, 
            Épure processes everything locally on your machine.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group"
            >
              <Card className="h-full bg-white border border-border/50 shadow-sm hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3.5 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {feature.stat}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison callout */}
        <motion.div
          className="mt-16 bg-gradient-to-br from-foreground to-foreground/95 rounded-3xl p-8 md:p-10 text-white shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Web converters vs. Épure
              </h3>
              <p className="text-white/70 leading-relaxed">
                Most online converters upload your files to their servers, 
                which is slow, unreliable, and a privacy nightmare. 
                Épure is different.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Web converters */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="font-medium text-sm text-white/80">Web Tools</span>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    Uploads to servers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    Slow processing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    File size limits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    Ads everywhere
                  </li>
                </ul>
              </div>
              
              {/* Épure */}
              <div className="bg-emerald-500/20 rounded-2xl p-5 border border-emerald-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="font-medium text-sm text-white">Épure</span>
                </div>
                <ul className="space-y-2 text-sm text-white/90">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    100% local
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    Instant results
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    Unlimited files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    Clean interface
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
