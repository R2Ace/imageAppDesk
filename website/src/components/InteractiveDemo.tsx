import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, FileImage, Upload, AlertTriangle, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { fadeInUp, formatFileSize, generateRandomFileSize } from '../lib/utils'
import { canProcessImages, trackImageProcessing, getUsageLimitMessage, getUsageStats } from '../lib/usageLimit'

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
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [usageLimitMessage, setUsageLimitMessage] = useState('')
  const [conversionSettings, setConversionSettings] = useState({
    format: 'jpeg',
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    stripMetadata: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

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



  const resetDemo = () => {
    setFiles([])
    setTotalSaved(0)
    setIsProcessing(false)
    setShowSettings(false)
    setShowUsageLimit(false)
    // Reset conversion settings to defaults
    setConversionSettings({
      format: 'jpeg',
      quality: 80,
      maxWidth: 1920,
      maxHeight: 1080,
      stripMetadata: false
    })
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpgradeClick = () => {
    // Track upgrade click
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Upgrade Clicked', {
        source: 'Usage Limit Modal',
        current_usage: getUsageStats().totalImages
      })
    }
    
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' })
    }
    setShowUsageLimit(false)
  }

  // Real file compression function
  const compressImage = async (file: File): Promise<{ originalSize: number, compressedSize: number }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          resolve({
            originalSize: file.size,
            compressedSize: blob!.size
          })
        }, 'image/jpeg', 0.8) // 80% quality
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle real file uploads
  const handleRealFiles = async (fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (imageFiles.length === 0) {
      alert('Please select image files only.')
      return
    }

    // Check usage limits
    const limitCheck = canProcessImages(imageFiles.length)
    if (!limitCheck.canProcess) {
      setUsageLimitMessage(getUsageLimitMessage(limitCheck.reason!, limitCheck.remaining!))
      setShowUsageLimit(true)
      return
    }

    const newFiles: FileDemo[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalSize: file.size,
      optimizedSize: 0,
      status: 'waiting',
      progress: 0
    }))
    
    setFiles(newFiles)
    setShowSettings(true) // Show settings instead of auto-processing
    setTotalSaved(0)

    // Track real file upload
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Real Demo File Upload', {
        files_count: newFiles.length,
        total_size: imageFiles.reduce((acc, f) => acc + f.size, 0)
      })
    }
  }

  // Start processing with user settings
  const startProcessingWithSettings = async () => {
    setShowSettings(false)
    setIsProcessing(true)

    // Get the actual files from the last file input
    const fileInput = fileInputRef.current
    if (!fileInput?.files) return

    const imageFiles = Array.from(fileInput.files).filter(file => 
      file.type.startsWith('image/')
    )

    // Process files with user settings
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileDemo = files[i]
      
      setFiles(prev => prev.map(f => 
        f.id === fileDemo.id 
          ? { ...f, status: 'processing' as const }
          : f
      ))
      
      try {
        const result = await compressImage(file)
        
        setFiles(prev => prev.map(f => 
          f.id === fileDemo.id 
            ? { 
                ...f, 
                status: 'complete' as const, 
                optimizedSize: result.compressedSize,
                progress: 100 
              }
            : f
        ))
      } catch (error) {
        console.error('Compression failed:', error)
      }
    }

    // Calculate total savings and track usage
    setTimeout(() => {
      setFiles(current => {
        const savings = current.reduce((acc, file) => 
          acc + (file.originalSize - file.optimizedSize), 0
        )
        setTotalSaved(savings)
        
        // Track the image processing
        trackImageProcessing(current.length)
        
        return current
      })
    }, 100)
    
    setIsProcessing(false)
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleRealFiles(e.dataTransfer.files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleRealFiles(e.target.files)
    }
  }, [])

  return (
    <section id="demo" className="py-24 bg-secondary/50 relative overflow-hidden" data-tour="interactive-demo">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Try it Yourself
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Drop your images below and see Épure's instant compression in action - right in your browser!
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <motion.div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                      isDragOver
                        ? 'border-primary bg-primary/10 scale-105'
                        : isProcessing 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                    }`}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isProcessing) fileInputRef.current?.click()
                        }} 
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
                            <Upload className="mr-2 h-4 w-4" />
                            Select Images
                          </>
                        )}
                      </Button>
                      
                      {files.length > 0 && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            resetDemo()
                          }} 
                          variant="outline"
                          size="lg"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Conversion Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-xl p-6 border mt-6"
                    >
                      <h3 className="text-lg font-semibold mb-4">Conversion Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Output Format */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Output Format</label>
                          <select
                            value={conversionSettings.format}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, format: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          >
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                          </select>
                        </div>

                        {/* Quality */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Quality: {conversionSettings.quality}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={conversionSettings.quality}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Max Width */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Max Width (px)</label>
                          <input
                            type="number"
                            value={conversionSettings.maxWidth}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {/* Max Height */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Max Height (px)</label>
                          <input
                            type="number"
                            value={conversionSettings.maxHeight}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Strip Metadata Checkbox */}
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={conversionSettings.stripMetadata}
                            onChange={(e) => setConversionSettings(prev => ({ ...prev, stripMetadata: e.target.checked }))}
                            className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">Strip metadata (remove EXIF data)</span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-6">
                        <Button
                          onClick={startProcessingWithSettings}
                          variant="premium"
                          className="flex-1"
                        >
                          Start Processing ({files.length} files)
                        </Button>
                        <Button
                          onClick={() => {
                            setShowSettings(false)
                            setFiles([])
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File Processing List */}
                <AnimatePresence>
                  {files.length > 0 && !showSettings && (
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

        {/* Usage Limit Modal */}
        <AnimatePresence>
          {showUsageLimit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUsageLimit(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Free Limit Reached
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {usageLimitMessage}
                </p>
                
                <div className="bg-gradient-to-r from-primary/10 to-purple/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Desktop App Benefits</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Unlimited image processing</li>
                    <li>• 3x faster than browser version</li>
                    <li>• Complete privacy (no internet required)</li>
                    <li>• All formats including HEIC</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpgradeClick}
                    variant="premium"
                    className="flex-1"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Get Desktop App
                  </Button>
                  <Button
                    onClick={() => setShowUsageLimit(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Usage Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-6"
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Free trial: {Math.max(0, getUsageStats().dailyLimit - getUsageStats().totalImages)} images remaining today
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveDemo
