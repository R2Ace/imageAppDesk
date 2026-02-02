import { motion } from 'framer-motion';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { Card } from './ui/card';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  slug: string;
  featured?: boolean;
}

const Blog = () => {
  // Blog posts - these would typically come from a CMS or markdown files
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How to Convert HEIC to JPG on Mac (3 Methods Compared)',
      excerpt: 'iPhone photos are saved as HEIC by default. Here are the fastest ways to convert them to JPG - from Preview to command line to dedicated apps.',
      category: 'Tutorial',
      readTime: '5 min',
      date: '2024-01-15',
      slug: 'heic-to-jpg-mac',
      featured: true
    },
    {
      id: '2',
      title: 'Why Web Converters Are a Privacy Nightmare',
      excerpt: 'What really happens when you upload files to online converters? We investigated the top 10 services and the results are concerning.',
      category: 'Privacy',
      readTime: '7 min',
      date: '2024-01-10',
      slug: 'web-converters-privacy'
    },
    {
      id: '3',
      title: 'Batch Image Conversion: A Photographer\'s Guide',
      excerpt: 'Converting hundreds of photos one by one is insane. Learn how to batch convert entire folders in seconds.',
      category: 'Workflow',
      readTime: '4 min',
      date: '2024-01-05',
      slug: 'batch-conversion-guide'
    },
    {
      id: '4',
      title: 'HEIC vs JPG vs WebP: Which Format Should You Use?',
      excerpt: 'A practical guide to image formats. When to use each one, and how to convert between them without losing quality.',
      category: 'Guide',
      readTime: '6 min',
      date: '2024-01-01',
      slug: 'image-formats-guide'
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

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <section className="py-24 bg-background" id="blog">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Resources
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Learn & Convert Smarter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, tutorials, and insights on file conversion, privacy, and productivity.
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent-warm/5 border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {featuredPost.category}
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 hover:text-primary transition-colors cursor-pointer">
                  {featuredPost.title}
                </h3>
                
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime} read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Regular Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {regularPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
            >
              <Card className="h-full p-6 bg-white border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-secondary text-foreground text-xs font-medium rounded">
                    {post.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border rounded-full text-foreground font-medium hover:border-primary hover:text-primary transition-all">
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
