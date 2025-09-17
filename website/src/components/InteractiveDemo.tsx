import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, FileImage, Upload, AlertTriangle, Crown, Settings, X, Download, Check, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { fadeInUp, formatFileSize, generateRandomFileSize } from '../lib/utils'
import { canProcessImages, trackImageProcessing, getUsageLimitMessage, getUsageStats } from '../lib/usageLimit'

interface FileDemo {
  id: string
  name: string
  originalSize: number
  optimizedSize: number
  status: 'waiting' | 'processing' | 'complete' | 'error'
  progress: number
  size: number
  buffer?: ArrayBuffer
  format?: string
  quality?: number
  newName?: string
  downloadUrl?: string
  savings?: number
  error?: string
  success?: boolean
}

const InteractiveDemo = () => {
  const [files, setFiles] = useState<FileDemo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalSaved, setTotalSaved] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [usageLimitMessage, setUsageLimitMessage] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)
  const [settings, setSettings] = useState({
    format: 'jpeg',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
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
    setShowThankYou(false)
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }



  const handleUpgradeClick = () => {
    // Track upgrade click with more context
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Upgrade Clicked', {
        source: 'Usage Limit Modal',
        current_usage: getUsageStats().totalImages,
        files_processed: files.length,
        demo_session_duration: Date.now() - (window as any).demoStartTime || 0,
        user_agent: navigator.userAgent
      })
    }
    
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' })
    }
    setShowUsageLimit(false)
  }

  // Convert a single image using Canvas API
  const convertImage = (file: File, fileSettings?: { format: string, quality: number, maxWidth: number, maxHeight: number }): Promise<FileDemo> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          originalSize: file.size,
          optimizedSize: 0,
          status: 'error',
          progress: 0,
          size: file.size,
          error: 'Canvas not supported',
          success: false
        })
        return
      }
      
      const currentSettings = fileSettings || settings
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > currentSettings.maxWidth || height > currentSettings.maxHeight) {
          const ratio = Math.min(currentSettings.maxWidth / width, currentSettings.maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height
        
        // Draw and convert
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const originalSize = file.size
            const newSize = blob.size
            const savings = ((originalSize - newSize) / originalSize * 100)
            
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              originalSize,
              optimizedSize: newSize,
              status: 'complete',
              progress: 100,
              size: file.size,
              newName: `${file.name.split('.')[0]}.${currentSettings.format === 'jpeg' ? 'jpg' : currentSettings.format}`,
              downloadUrl: url,
              savings: savings > 0 ? savings : 0,
              success: true
            })
          } else {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              originalSize: file.size,
              optimizedSize: 0,
              status: 'error',
              progress: 0,
              size: file.size,
              error: 'Conversion failed',
              success: false
            })
          }
        }, `image/${currentSettings.format}`, currentSettings.quality)
      }
      
      img.onerror = () => {
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          originalSize: file.size,
          optimizedSize: 0,
          status: 'error',
          progress: 0,
          size: file.size,
          error: 'Invalid image file',
          success: false
        })
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

    const newFiles: FileDemo[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalSize: file.size,
      optimizedSize: 0,
      status: 'waiting' as const,
      progress: 0,
      size: file.size,
      buffer: undefined, // We'll load this when needed
      format: settings.format,
      quality: settings.quality * 100 // Convert to percentage
    }))
    
    setFiles(newFiles)
    setShowSettings(false) // Show conversion interface directly
    setTotalSaved(0)

    // Track real file upload
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Real Demo File Upload', {
        files_count: newFiles.length,
        total_size: imageFiles.reduce((acc, f) => acc + f.size, 0)
      })
    }
  }

  // Process all images with conversion
  const processImages = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    
    // Get the actual files from the last file input
    const fileInput = fileInputRef.current
    if (!fileInput?.files) return

    const imageFiles = Array.from(fileInput.files).filter(file => 
      file.type.startsWith('image/')
    )

    const processedResults: FileDemo[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileDemo = files[i]
      
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileDemo.id 
          ? { ...f, status: 'processing' as const, progress: 0 }
          : f
      ))
      
      try {
        // Create file-specific settings
        const fileSettings = {
          format: fileDemo.format || settings.format,
          quality: (fileDemo.quality || settings.quality * 100) / 100, // Convert back to decimal
          maxWidth: settings.maxWidth,
          maxHeight: settings.maxHeight
        }
        
        const result = await convertImage(file, fileSettings)
        
        // Update with result
        setFiles(prev => prev.map(f => 
          f.id === fileDemo.id 
            ? { 
                ...f, 
                ...result,
                status: result.success ? 'complete' as const : 'error' as const,
                progress: 100 
              }
            : f
        ))
        
        processedResults.push(result)
      } catch (error) {
        console.error('Conversion failed:', error)
        setFiles(prev => prev.map(f => 
          f.id === fileDemo.id 
            ? { 
                ...f, 
                status: 'error' as const,
                error: 'Conversion failed',
                success: false
              }
            : f
        ))
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
    
    // Show thank you message after processing
    setTimeout(() => {
      setShowThankYou(true)
    }, 500)
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

  // Download functionality
  const downloadFile = (file: FileDemo) => {
    if (!file.downloadUrl) return
    
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.download = file.newName || file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAll = () => {
    const successfulFiles = files.filter(f => f.success && f.downloadUrl)
    successfulFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100)
    })
  }

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
                {/* Drag & Drop Area - Only show when no files selected */}
                {files.length === 0 && (
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
                                          whileHover={{ 
                      borderColor: isProcessing ? undefined : "rgb(59, 130, 246)",
                      backgroundColor: isProcessing ? undefined : "rgba(59, 130, 246, 0.02)"
                    }}
                    transition={{ duration: 0.2 }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isProcessing && fileInputRef.current?.click()}
                      style={{ pointerEvents: 'auto' }}
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
                        className="min-w-40 relative z-10"
                        style={{ 
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          pointerEvents: 'all'
                        }}
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
                )}

                {/* Settings Panel */}
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Conversion Settings</h3>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Format
                        </label>
                        <select
                          value={settings.format}
                          onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="jpeg">JPEG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WebP</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality: {Math.round(settings.quality * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={settings.quality}
                          onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Width (px)
                        </label>
                        <input
                          type="number"
                          value={settings.maxWidth}
                          onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Height (px)
                        </label>
                        <input
                          type="number"
                          value={settings.maxHeight}
                          onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Conversion Interface - Show when files are selected */}
                {files.length > 0 && !showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {files.length} image{files.length !== 1 ? 's' : ''} ready
                        </h3>
                        <p className="text-gray-600">Configure settings and convert your images</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowSettings(!showSettings)}
                          variant="outline"
                          size="sm"
                        >
                          <Settings size={16} className="mr-2" />
                          Settings
                        </Button>
                        <Button
                          onClick={processImages}
                          disabled={isProcessing}
                          variant="premium"
                          size="sm"
                        >
                          {isProcessing ? 'Converting...' : `Convert ${files.length} Image${files.length !== 1 ? 's' : ''}`}
                        </Button>
                      </div>
                    </div>
                    
                    {/* File List */}
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                          
                          {/* Status Indicator */}
                          <div className="flex items-center gap-2">
                            {file.status === 'complete' && file.success ? (
                              <Check size={20} className="text-green-600" />
                            ) : file.status === 'error' ? (
                              <AlertCircle size={20} className="text-red-600" />
                            ) : file.status === 'processing' ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          
                          {/* Download Button */}
                          {file.status === 'complete' && file.success && file.downloadUrl && (
                            <Button
                              onClick={() => downloadFile(file)}
                              variant="outline"
                              size="sm"
                            >
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          setFiles([]);
                          resetDemo();
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Start Over
                      </Button>
                      {files.some(f => f.success && f.downloadUrl) && (
                        <Button
                          onClick={downloadAll}
                          variant="premium"
                          className="flex-1"
                        >
                          <Download size={16} className="mr-2" />
                          Download All
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}



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

                {/* Conversion Results Summary */}
                {files.some(f => f.status === 'complete') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conversion Results
                    </h3>
                    
                    <div className="space-y-3">
                      {files.filter(f => f.status === 'complete').map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            {file.success ? (
                              <Check size={20} className="text-green-600" />
                            ) : (
                              <AlertCircle size={20} className="text-red-600" />
                            )}
                            
                            <div>
                              <div className="font-medium text-gray-900">
                                {file.success ? file.newName : file.name}
                              </div>
                              {file.success ? (
                                <div className="text-sm text-gray-600">
                                  {formatFileSize(file.originalSize)} → {formatFileSize(file.optimizedSize)}
                                  {file.savings && file.savings > 0 && (
                                    <span className="text-green-600 ml-2">
                                      ({file.savings.toFixed(1)}% smaller)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-red-600">{file.error}</div>
                              )}
                            </div>
                          </div>
                          
                          {file.success && file.downloadUrl && (
                            <Button
                              onClick={() => downloadFile(file)}
                              variant="outline"
                              size="sm"
                            >
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 font-medium mb-2">
                        ⚡ Want 3x faster processing + advanced features?
                      </p>
                      <p className="text-blue-700 text-sm mb-3">
                        The desktop app processes images up to 3x faster with HEIC support, metadata removal, batch operations, and more formats.
                      </p>
                      <Button 
                        onClick={() => {
                          const pricingSection = document.getElementById('pricing')
                          if (pricingSection) {
                            pricingSection.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                        variant="premium"
                        size="sm"
                      >
                        Download Desktop App - $9 Lifetime
                      </Button>
                    </div>
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
        
        {/* Thank You Popup */}
        <AnimatePresence>
          {showThankYou && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowThankYou(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Thank You for Trying Épure! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You've saved <strong>{formatFileSize(totalSaved)}</strong> of storage space!
                  </p>
                  <p className="text-sm text-gray-500">
                    Want to process unlimited images without restrictions?
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      setShowThankYou(false)
                      // Scroll to pricing section
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    variant="premium"
                    className="w-full"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Get Épure for $9
                  </Button>
                  <Button
                    onClick={() => setShowThankYou(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Exploring
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default InteractiveDemo
