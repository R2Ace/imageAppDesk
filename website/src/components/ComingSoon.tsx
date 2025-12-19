import { motion } from 'framer-motion';
import { Check, Sparkles, Image, Music, FileText, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import WaitlistForm from './WaitlistForm';

const ComingSoon = () => {
  const currentFeatures = [
    "Batch processing - convert 1000s of files",
    "HEIC to JPG/PNG (Apple's format)",
    "WebP, AVIF, TIFF support",
    "Smart compression with quality control",
    "Strip EXIF metadata for privacy",
    "Works 100% offline",
    "Native Mac & Windows apps",
    "Lifetime updates included",
  ];

  const upcomingFeatures = [
    {
      category: "Audio",
      icon: Music,
      badge: "Coming Q1 2025",
      features: ["MP3, WAV, FLAC", "AAC, OGG conversion", "Bitrate control"],
      color: "from-violet-500 to-purple-600"
    },
    {
      category: "Documents",
      icon: FileText,
      badge: "Coming Q2 2025",
      features: ["PDF conversion", "Word, Excel support", "Pages, Numbers"],
      color: "from-blue-500 to-cyan-600"
    },
    {
      category: "Video",
      icon: Video,
      badge: "Coming Q3 2025",
      features: ["MP4, MOV, WebM", "Quick compression", "Format conversion"],
      color: "from-rose-500 to-pink-600"
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-secondary/30" id="pricing">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Launching Soon
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
            One Price. <span className="text-gradient">All Features.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the waitlist today and get lifetime access for just $9 when we launch — 
            including all future features at no extra cost.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden border-2 border-primary/20 shadow-strong">
            {/* Badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="bg-gradient-primary text-white px-6 py-2 rounded-b-xl text-sm font-bold shadow-lg">
                Early Bird Price
              </div>
            </div>

            <CardHeader className="text-center pt-16 pb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl text-muted-foreground line-through">$29</span>
                <span className="text-6xl font-black text-foreground">$9</span>
              </div>
              <p className="text-xl text-muted-foreground">one-time purchase, forever</p>
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-semibold">
                <Check className="w-4 h-4" />
                Save $180+/year vs subscriptions
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Features grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {currentFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Waitlist Form */}
              <div className="pt-6 border-t border-border">
                <p className="text-center text-muted-foreground mb-4">
                  Be the first to know when we launch
                </p>
                <WaitlistForm variant="inline" />
              </div>

              {/* Guarantee */}
              <div className="text-center text-sm text-muted-foreground pt-4">
                30-day money-back guarantee • Instant download on launch
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Coming Soon: Universal Converter
            </h3>
            <p className="text-muted-foreground">
              Images are just the beginning. All future features included with your purchase.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {upcomingFeatures.map((item, index) => (
              <motion.div
                key={item.category}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="h-full card-interactive overflow-hidden">
                  {/* Gradient header */}
                  <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  
                  <CardHeader className="text-center pb-3">
                    <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{item.category}</CardTitle>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full text-lg font-bold shadow-glow">
              <Sparkles className="w-5 h-5" />
              All future features included with your $9 purchase!
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoon;

