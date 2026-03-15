import { motion } from 'framer-motion';
import { FileImage, Clock, Users, TrendingUp, Quote } from 'lucide-react';

const SocialProof = () => {
  // Number counters showing real impact
  const counters = [
    { 
      value: '50K+', 
      label: 'Files Converted', 
      icon: FileImage,
      color: 'text-primary'
    },
    { 
      value: '120+', 
      label: 'Hours Saved', 
      icon: Clock,
      color: 'text-emerald-500'
    },
    { 
      value: '500+', 
      label: 'Happy Users', 
      icon: Users,
      color: 'text-amber-500'
    },
    { 
      value: '3x', 
      label: 'Faster Than Web', 
      icon: TrendingUp,
      color: 'text-purple-500'
    },
  ];

  // Testimonials (placeholders for now)
  const testimonials = [
    {
      quote: "Converted 500 HEIC photos from my iPhone in under 2 minutes. Web converters would have taken an hour.",
      author: "Sarah M.",
      role: "Wedding Photographer",
      avatar: "S"
    },
    {
      quote: "Finally, I don't have to upload client files to random websites. The peace of mind alone is worth it.",
      author: "Mike R.",
      role: "Graphic Designer",
      avatar: "M"
    },
    {
      quote: "Switched from CloudConvert ($15/mo). Épure paid for itself in the first week.",
      author: "Lisa T.",
      role: "Content Creator",
      avatar: "L"
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="py-20 bg-secondary/30 border-y border-border/50">
      <div className="container mx-auto px-6 lg:px-8">
        
        {/* Number Counters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {counters.map((counter) => (
            <motion.div
              key={counter.label}
              variants={itemVariants}
              className="text-center"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 ${counter.color}`}>
                <counter.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{counter.value}</p>
              <p className="text-sm text-muted-foreground">{counter.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            What people are saying
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
              >
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-10 border-t border-border/50"
        >
          <p className="text-center text-sm text-muted-foreground mb-6">
            Used by professionals in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: 'Photography', emoji: '📸' },
              { name: 'Design', emoji: '🎨' },
              { name: 'Marketing', emoji: '📱' },
              { name: 'Real Estate', emoji: '🏠' },
              { name: 'E-commerce', emoji: '🛍️' }
            ].map((industry) => (
              <div key={industry.name} className="flex items-center gap-2 text-muted-foreground">
                <span>{industry.emoji}</span>
                <span className="text-sm font-medium">{industry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
