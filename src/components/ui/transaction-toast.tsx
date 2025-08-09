"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, ExternalLink } from "lucide-react"

interface TransactionToastProps {
  isVisible: boolean
  txHash: string
  message?: string
  onClose: () => void
}

export const TransactionToast = ({ isVisible, txHash, message, onClose }: TransactionToastProps) => {
  const [progress, setProgress] = useState(100)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    let autoCloseTimer: NodeJS.Timeout | null = null
    
    if (isVisible) {
      setIsMounted(true)
      setProgress(100)
      
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            return 0
          }
          return prev - 2 // Decrease by 2% every 100ms (5 seconds total)
        })
      }, 100)

      // Auto close after 5 seconds
      autoCloseTimer = setTimeout(() => {
        setIsMounted(false)
        setTimeout(() => {
          onClose()
        }, 300) // Wait for animation to complete
      }, 5000)

      return () => {
        if (timer) clearInterval(timer)
        if (autoCloseTimer) clearTimeout(autoCloseTimer)
      }
    } else {
      setIsMounted(false)
    }
  }, [isVisible, onClose])

  // Don't render anything if not visible
  if (!isVisible) return null

  const explorerUrl = `https://explorer.oasis.io/testnet/sapphire/tx/${txHash}`

  const handleClose = () => {
    setIsMounted(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${
        isMounted 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-3 w-80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-800">
              {message || "Transaction Successful"}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded flex-1 mr-2 truncate">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default TransactionToast

