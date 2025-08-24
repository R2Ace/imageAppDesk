import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Zap, FileImage } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { fadeInUp, formatFileSize, generateRandomFileSize } from '../lib/utils'

interface FileDemo {
  id: string
  name: string
  originalSize: number
  optimizedSize: number
  status: 'waiting' | 'processing' | 'complete'
  progress: number
}

const InteractiveDemo = () => {
  const [files, setFiles] = useState<FileDemo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalSaved, setTotalSaved] = useState(0)

  const createDemoFile = (name: string): FileDemo => {
    const originalSize = generateRandomFileSize(2000000, 8000000) // 2-8MB
    const optimizedSize = Math.floor(originalSize * (0.3 + Math.random() * 0.4)) // 30-70% reduction
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      originalSize,
      optimizedSize,
      status: 'waiting',
      progress: 0
    }
  }

  const processFile = async (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'processing' as const, progress: 0 }
        : file
    ))

    // Simulate processing with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress }
          : file
      ))
    }

    // Complete processing
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const saved = file.originalSize - file.optimizedSize
        setTotalSaved(current => current + saved)
        return { ...file, status: 'complete' as const, progress: 100 }
      }
      return file
    }))
  }

  const startDemo = useCallback(async () => {
    // Track demo interaction
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Interactive Demo Started', {
        source: 'Demo Section'
      })
    }

    setIsProcessing(true)
    setFiles([])
    setTotalSaved(0)

    const demoFiles = [
      createDemoFile('vacation-photo.heic'),
      createDemoFile('presentation-slide.png'),
      createDemoFile('product-image.jpg'),
      createDemoFile('team-photo.tiff')
    ]

    setFiles(demoFiles)

    // Process files one by one with slight delays
    for (let i = 0; i < demoFiles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      processFile(demoFiles[i].id)
    }

    setIsProcessing(false)
  }, [])

  const resetDemo = () => {
    setFiles([])
    setTotalSaved(0)
    setIsProcessing(false)
  }

  return (
    <section id="demo" className="py-24 bg-secondary/50 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            See the Magic in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how Épure processes multiple image formats instantly with impressive compression
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8">
              {/* Demo Interface */}
              <div className="space-y-8">
                {/* Drag & Drop Area */}
                <div className="relative">
                  <motion.div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      isProcessing 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                    }`}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={isProcessing ? { y: [0, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FileImage className="w-16 h-16 text-primary mx-auto mb-4" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      Drag & Drop Images Here
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Support for HEIC, PNG, JPG, TIFF, WebP and more
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      <Button 
                        onClick={startDemo} 
                        disabled={isProcessing}
                        variant="premium"
                        size="lg"
                        className="min-w-40"
                      >
                        {isProcessing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Try Demo
                          </>
                        )}
                      </Button>
                      
                      {files.length > 0 && (
                        <Button 
                          onClick={resetDemo} 
                          variant="outline"
                          size="lg"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* File Processing List */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {files.map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                file.status === 'complete' ? 'bg-green-500' :
                                file.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-400'
                              }`} />
                              <span className="font-medium text-foreground">{file.name}</span>
                            </div>
                            
                            {file.status === 'complete' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Original</div>
                              <div className="font-semibold">{formatFileSize(file.originalSize)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Optimized</div>
                              <div className="font-semibold text-green-600">
                                {file.status === 'complete' ? formatFileSize(file.optimizedSize) : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Saved</div>
                              <div className="font-semibold text-primary">
                                {file.status === 'complete' 
                                  ? `${Math.round(((file.originalSize - file.optimizedSize) / file.originalSize) * 100)}%`
                                  : '—'
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          {file.status === 'processing' && (
                            <div className="mt-3">
                              <div className="bg-gray-200 rounded-full h-2">
                                <motion.div
                                  className="bg-primary h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${file.progress}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Summary Stats */}
                {totalSaved > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center"
                  >
                    <h4 className="text-2xl font-bold text-primary mb-2">
                      Total Space Saved: {formatFileSize(totalSaved)}
                    </h4>
                    <p className="text-muted-foreground">
                      Processing completed in just a few seconds with zero cloud uploads
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveDemo
