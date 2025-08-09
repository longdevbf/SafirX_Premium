"use client"

import React from 'react'

interface ProfileLoadingProps {
  isCreatingUser?: boolean
  loadingNFTs?: boolean
}

export default function ProfileLoading({ isCreatingUser = false, loadingNFTs = false }: ProfileLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Loading Banner */}
      <div className="relative h-[300px] bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/30 rounded-full animate-pulse delay-0"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/20 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/40 rounded-full animate-pulse delay-200"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-full animate-pulse delay-300"></div>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white/50 rounded-full animate-bounce"></div>
        <div className="absolute top-32 right-32 w-6 h-6 bg-white/30 rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-24 left-32 w-3 h-3 bg-white/60 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-40 right-40 w-5 h-5 bg-white/40 rounded-full animate-bounce delay-300"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Enhanced Profile Loading */}
        <div className="relative mb-8 pt-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Enhanced Avatar Skeleton */}
              <div className="w-36 h-36 rounded-full bg-white shadow-2xl -mt-20 relative overflow-hidden">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-indigo-200 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/30 to-transparent animate-spin [animation-duration:3s]"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 via-transparent to-white/20 animate-pulse delay-100"></div>
              </div>

              <div className="flex-1 space-y-6">
                {/* Enhanced Loading Messages */}
                <div className="space-y-3">
                  <div className="h-10 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-lg w-72 animate-pulse [animation-duration:1.5s]"></div>
                  <div className="h-6 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200 rounded-lg w-48 animate-pulse [animation-duration:1.8s]"></div>
                </div>
                
                {/* Loading Status Message */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-6 h-6 border-3 border-purple-300 border-b-transparent rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="text-blue-800 font-semibold text-lg">
                        {isCreatingUser ? "🎉 Welcome! Setting up your profile..." : "📦 Loading your NFT collection..."}
                      </div>
                      <div className="text-blue-600">
                        {isCreatingUser 
                          ? "We're creating your account and preparing your personalized dashboard. This magical process will only take a moment!" 
                          : "Fetching your incredible NFT collection and portfolio data from the blockchain."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Steps for New User */}
                {isCreatingUser && (
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-green-700">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="font-medium">✅ Wallet connected successfully</span>
                      </div>
                      <div className="flex items-center gap-3 text-blue-700">
                        <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        </div>
                        <span className="font-medium">⚙️ Setting up your profile database...</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span>⏳ Preparing your NFT collection view</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 h-2 rounded-full animate-pulse [animation-duration:2s] w-3/4"></div>
                    </div>
                  </div>
                )}

                {/* Enhanced Bio Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200 rounded-lg w-full max-w-2xl animate-pulse [animation-duration:2s]"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 rounded-lg w-3/4 animate-pulse [animation-duration:2.2s]"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-indigo-200 to-gray-200 rounded-lg w-1/2 animate-pulse [animation-duration:1.8s]"></div>
                </div>

                {/* Enhanced Stats Skeleton */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-24 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full">
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-300 to-green-300 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-lg w-28 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Edit Button Skeleton */}
              <div className="h-12 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-xl w-36 animate-pulse [animation-duration:1.6s] shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border border-blue-200 rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
            <div className="text-center space-y-4 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-300 via-blue-200 to-indigo-300 rounded-full mx-auto animate-pulse [animation-duration:1.4s] shadow-lg"></div>
              <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg w-32 mx-auto animate-pulse [animation-duration:1.6s]"></div>
              <div className="text-xs text-blue-500 font-medium">Loading NFT count...</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-100 border border-emerald-200 rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
            <div className="text-center space-y-4 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-300 via-emerald-200 to-green-300 rounded-full mx-auto animate-pulse [animation-duration:1.8s] shadow-lg"></div>
              <div className="h-6 bg-gradient-to-r from-emerald-200 to-green-200 rounded-lg w-36 mx-auto animate-pulse [animation-duration:2s]"></div>
              <div className="text-xs text-emerald-500 font-medium">Loading wallet balance...</div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs & NFT Grid Loading */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div className="h-14 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-xl w-56 animate-pulse [animation-duration:1.5s] shadow-lg"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gradient-to-r from-emerald-200 to-green-200 rounded-xl w-36 animate-pulse [animation-duration:1.7s] shadow-md"></div>
              <div className="h-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl w-40 animate-pulse [animation-duration:1.9s] shadow-md"></div>
            </div>
          </div>

          {/* Enhanced NFT Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/90 rounded-2xl overflow-hidden shadow-xl border border-white/50 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
                <div className="aspect-square bg-gradient-to-br from-gray-200 via-blue-200 to-purple-200 animate-pulse relative overflow-hidden [animation-duration:2s]" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-pulse delay-75 [animation-duration:2.5s]"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white/60 rounded-full animate-pulse [animation-duration:1.5s]"></div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-blue-200 rounded-lg w-3/4 animate-pulse [animation-duration:1.8s]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/2 animate-pulse [animation-duration:2.2s]" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-lg w-16 animate-pulse [animation-duration:1.6s]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    <div className="h-4 bg-gradient-to-r from-emerald-200 to-green-200 rounded-lg w-12 animate-pulse [animation-duration:2s]" style={{ animationDelay: `${i * 0.25}s` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading Message for NFTs */}
          {loadingNFTs && (
            <div className="text-center mt-8 py-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-6 py-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 font-medium">Loading NFT collection from blockchain...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

