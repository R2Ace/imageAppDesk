import { motion } from 'framer-motion';
import { Zap, Shield, DollarSign, Clock, Layers, Lock, Image, FileAudio, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "500 Files in 2 Minutes",
      description: "Native desktop performance means instant processing. No waiting for uploads or downloads - just results.",
      stat: "3x faster",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      icon: Layers,
      title: "True Batch Processing",
      description: "Drop entire folders and convert everything at once. Perfect for photographers with hundreds of HEIC photos.",
      stat: "500+ files",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: DollarSign,
      title: "$9 Once, Not $180/Year",
      description: "Web converters charge $15-24/month. We charge $9 once. You do the math.",
      stat: "Save $171+",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      icon: Lock,
      title: "Zero Uploads",
      description: "Your files never leave your computer. No sketchy servers, no data collection, no wondering where your photos went.",
      stat: "100% local",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: Clock,
      title: "Works Offline",
      description: "No internet? No problem. Process files on a plane, at a cafe, anywhere. No connection required.",
      stat: "Always works",
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      icon: Image,
      title: "All Formats Included",
      description: "HEIC, WebP, AVIF, PNG, JPG, TIFF, and more. Convert iPhone photos, web graphics, anything.",
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
            Why creators switch to Épure
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything web converters <span className="text-gradient">can't do</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Web tools upload your files to random servers, limit batch sizes, 
            and charge monthly. Épure does the opposite.
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
              <Card className="h-full bg-white border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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

        {/* Detailed Comparison Table */}
        <motion.div
          className="mt-16 bg-gradient-to-br from-foreground to-foreground/95 rounded-3xl p-8 md:p-10 text-white shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              The real comparison
            </h3>
            <p className="text-white/60">
              See why photographers and designers are switching
            </p>
          </div>
          
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 font-medium text-white/60">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-white/60">Web Converters</th>
                  <th className="text-center py-4 px-4 font-medium text-emerald-400">Épure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-4 px-4 text-white/80">Upload files to servers</td>
                  <td className="py-4 px-4 text-center text-red-400">Yes - privacy risk</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">Never</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white/80">Batch file limit</td>
                  <td className="py-4 px-4 text-center text-red-400">5-20 files</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">500+ files</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white/80">File size limit</td>
                  <td className="py-4 px-4 text-center text-red-400">50-100MB</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white/80">Processing speed</td>
                  <td className="py-4 px-4 text-center text-red-400">Minutes (upload + process)</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">Seconds</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white/80">Works offline</td>
                  <td className="py-4 px-4 text-center text-red-400">No</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-white/80">Price</td>
                  <td className="py-4 px-4 text-center text-red-400">$15-24/month ($180-288/yr)</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-medium">$9 once, forever</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm mb-4">
              Join 500+ photographers and designers who made the switch
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors cursor-pointer">
              Get Épure for $9
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
