import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ArrowRight, Download, Settings, RotateCcw, Check, AlertCircle, Eye } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { fadeInUp, formatFileSize, generateRandomFileSize } from '../lib/utils'
import { canProcessImages, trackImageProcessing, getUsageLimitMessage, getUsageStats } from '../lib/usageLimit'

interface SelectedFile {
  id: number
  name: string
  size: number
  preview: string
}

interface ConversionResult {
  downloadUrl: string
  newName: string
  originalSize: number
  newSize: number
  savings: number
  preview: string
}

const InteractiveDemo = () => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [usageLimitMessage, setUsageLimitMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset everything
  const resetConverter = () => {
    setSelectedFile(null)
    setResult(null)
    setShowPreview(false)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const fileWithPreview: SelectedFile = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      }
      setSelectedFile(fileWithPreview)
      setResult(null)
      setShowPreview(true)
    }
  }

  const handleUpgradeClick = () => {
    // Track upgrade click with more context
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Upgrade Clicked', {
        source: 'Browser Demo',
        converted_image: !!result,
        user_agent: navigator.userAgent
      })
    }
    
    // Scroll to pricing section
    const pricingSection = document.getElementById('pricing')
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Convert image using Canvas API
  const convertImage = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    
    try {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Canvas not supported')
      }
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = selectedFile.preview
      })
      
      // Set canvas dimensions to original image size
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Convert to blob
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(resolve, `image/${outputFormat}`, quality / 100)
      })
      
      if (blob) {
        const url = URL.createObjectURL(blob)
        const originalSize = selectedFile.size
        const newSize = blob.size
        const savings = ((originalSize - newSize) / originalSize * 100)
        
        setResult({
          downloadUrl: url,
          newName: `${selectedFile.name.split('.')[0]}.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`,
          originalSize,
          newSize,
          savings: savings > 0 ? savings : 0,
          preview: url
        })
      }
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Conversion failed. Please try a different image.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Drag and drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }, [])

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Download functionality
  const downloadFile = () => {
    if (result) {
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = result.newName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <section id="demo" className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden" data-tour="interactive-demo">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            Try Épure in Your Browser
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Convert images locally - no uploads, complete privacy
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600 font-medium">⚡ Browser Demo:</span>
            <span className="text-yellow-700 text-sm">Desktop app is 3x faster with HEIC support & advanced features</span>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-6xl mx-auto"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* 3-Step Process */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Step 1: Upload */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 p-6 text-center min-h-[280px] flex flex-col justify-center shadow-lg">
                <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Step 1
                </div>
                
                {!selectedFile ? (
                  <div
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Drag & Drop Image
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Or click to browse files
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, WebP
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onFileInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={selectedFile.preview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg mx-auto border-2 border-green-200"
                      />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                        <Check size={12} />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={resetConverter}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Change Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center">
              <ArrowRight size={32} className="text-gray-400" />
            </div>

            {/* Step 2: Convert */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 min-h-[280px] flex flex-col shadow-lg">
                <div className="absolute -top-3 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Step 2
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <Settings size={48} className="mx-auto text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Choose Output
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${quality}%, #e5e7eb ${quality}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={convertImage}
                  disabled={!selectedFile || isProcessing}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <span className="font-bold">ÉPURE</span>
                      Convert
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center">
              <ArrowRight size={32} className="text-gray-400" />
            </div>

            {/* Step 3: Download */}
            <div className="relative">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 min-h-[280px] flex flex-col justify-center shadow-lg">
                <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Step 3
                </div>
                
                {!result ? (
                  <div className="text-center">
                    <Download size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Download Result
                    </h3>
                    <p className="text-gray-600">
                      Your converted image will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="relative">
                      <img
                        src={result.preview}
                        alt="Converted"
                        className="w-24 h-24 object-cover rounded-lg mx-auto border-2 border-green-200"
                      />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                        <Check size={12} />
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{result.newName}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(result.originalSize)} → {formatFileSize(result.newSize)}
                      </p>
                      {result.savings > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          {result.savings.toFixed(1)}% smaller!
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={downloadFile}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 text-center mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                🎉 Conversion Complete!
              </h3>
              <p className="text-gray-700 mb-4">
                Your image was successfully converted and optimized.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Original Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatFileSize(selectedFile?.size || 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">New Size</p>
                  <p className="text-lg font-semibold text-gray-900">{formatFileSize(result.newSize)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Space Saved</p>
                  <p className="text-lg font-semibold text-green-600">{result.savings.toFixed(1)}%</p>
                </div>
              </div>
              
              <button
                onClick={resetConverter}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mr-4"
              >
                Convert Another Image
              </button>
            </motion.div>
          )}

          {/* Upgrade CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-2xl p-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ⚡ Want 3x Faster Processing + Pro Features?
              </h3>
              <p className="text-gray-700 mb-4">
                The desktop app processes images up to 3x faster with HEIC support, metadata removal, batch operations, and 20+ formats.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600" />
                  HEIC Support
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600" />
                  Batch Processing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600" />
                  Metadata Removal
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600" />
                  20+ Formats
                </div>
              </div>
              
              <button 
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-8 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Get Desktop App - $9 Lifetime
              </button>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

export default InteractiveDemo
