import { motion } from 'framer-motion'
import { Sparkles, Github, Mail, Heart } from 'lucide-react'
import { fadeInUp } from '../lib/utils'

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center space-y-8"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Logo and tagline */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold">Épure</h3>
            </div>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The fastest, most private image converter for professionals who demand quality.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-white/70">
            <a 
              href="mailto:r2thedev@gmail.com" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Support
            </a>
            <a 
              href="https://github.com/R2Ace/imageAppDesk" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a 
              href="#privacy" 
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#terms" 
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/20"></div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/60">
            <p>&copy; 2025 Épure. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for creative professionals</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
