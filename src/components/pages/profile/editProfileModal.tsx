"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Loader2, Crop as CropIcon } from "lucide-react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface EditProfileForm {
  name: string
  tag: string
  description: string
  avatar: string
  background: string
}

interface EditProfileProps {
  isOpen: boolean
  onClose: () => void
  editForm: EditProfileForm
  setEditForm: (form: EditProfileForm) => void
  onSave: () => void
}

export default function EditProfileModal({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  onSave
}: EditProfileProps) {
  const [isUploading, setIsUploading] = useState<{avatar: boolean, background: boolean}>({
    avatar: false,
    background: false
  })
  const [showCrop, setShowCrop] = useState(false)
  const [cropImage, setCropImage] = useState<string>('')
  const [cropType, setCropType] = useState<'avatar' | 'background'>('avatar')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleImageSelect = (type: 'avatar' | 'background') => {
    if (type === 'avatar') {
      avatarInputRef.current?.click()
    } else {
      backgroundInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(prev => ({ ...prev, [type]: true }))

    try {
      // Convert to base64 for crop editor
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setCropImage(base64)
        setCropType(type)
        setShowCrop(true)
        setIsUploading(prev => ({ ...prev, [type]: false }))
      }
      reader.onerror = () => {
        alert('Failed to read image file')
        setIsUploading(prev => ({ ...prev, [type]: false }))
      }
      reader.readAsDataURL(file)

    } catch (err) {
      console.error('Error reading file:', err)
      alert('Failed to upload image')
      setIsUploading(prev => ({ ...prev, [type]: false }))
    }

    // Reset input value
    e.target.value = ''
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    
    let aspectRatio = 1
    let cropWidth = 80
    
    if (cropType === 'background') {
      aspectRatio = 5
      cropWidth = 95
    } else {
      aspectRatio = 1
      cropWidth = 80
    }

    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: cropWidth,
        },
        aspectRatio,
        width,
        height,
      ),
      width,
      height,
    )
    
    setCrop(newCrop)
  }, [cropType])

  // FIX: Corrected getCroppedImg function
  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No 2d context'))
          return
        }

        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        canvas.width = crop.width
        canvas.height = crop.height

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height,
        )

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result as string)
          }
          reader.onerror = () => reject(new Error('Failed to read blob'))
          reader.readAsDataURL(blob)
        }, 'image/jpeg', 0.9)
      })
    },
    []
  )

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      alert('Please select a crop area first')
      return
    }

    if (completedCrop.width === 0 || completedCrop.height === 0) {
      alert('Please select a valid crop area')
      return
    }

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop)
      
      if (cropType === 'avatar') {
        setEditForm({ ...editForm, avatar: croppedImageUrl })
      } else {
        setEditForm({ ...editForm, background: croppedImageUrl })
      }
      
      handleCropCancel()
      
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }, [completedCrop, cropType, editForm, setEditForm, getCroppedImg])

  const handleCropCancel = () => {
    setShowCrop(false)
    setCropImage('')
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  const removeImage = (type: 'avatar' | 'background') => {
    if (type === 'avatar') {
      setEditForm({ ...editForm, avatar: '' })
    } else {
      setEditForm({ ...editForm, background: '' })
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('@', '')
    const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '')
    setEditForm({ ...editForm, tag: cleanValue })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Background Image - Điều chỉnh height cho tỷ lệ 5:1 */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div 
                className="relative h-[120px] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"  // Đổi từ 202px xuống 120px
                onClick={() => handleImageSelect('background')}
              >
                {editForm.background ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${editForm.background}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Click to upload banner image</p>
                      <p className="text-xs opacity-75">Recommended: 1200x240 (5:1 ratio)</p>  {/* Đổi text */}
                    </div>
                  </div>
                )}
                
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageSelect('background')
                    }}
                    disabled={isUploading.background}
                    className="bg-white/90 hover:bg-white"
                  >
                    {isUploading.background ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CropIcon className="w-4 h-4 mr-2" />
                    )}
                    {isUploading.background ? 'Uploading...' : 'Change & Crop'}
                  </Button>
                </div>

                {/* Remove button */}
                {editForm.background && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage('background')
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'background')}
                className="hidden"
              />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => handleImageSelect('avatar')}
                >
                  <Avatar className="w-20 h-20 border-2 border-gray-200">
                    <AvatarImage src={editForm.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg bg-gray-100">
                      {editForm.name ? editForm.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleImageSelect('avatar')
                      }}
                      disabled={isUploading.avatar}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      {isUploading.avatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CropIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Remove button */}
                  {editForm.avatar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage('avatar')
                      }}
                      className="absolute -top-1 -right-1 bg-white hover:bg-gray-100 p-1 h-6 w-6 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageSelect('avatar')}
                    disabled={isUploading.avatar}
                    className="w-full"
                  >
                    {isUploading.avatar ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CropIcon className="w-4 h-4 mr-2" />
                    )}
                    {isUploading.avatar ? 'Uploading...' : 'Upload & Crop Avatar'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image (1:1 ratio)
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your display name"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {editForm.name.length}/50 characters
              </p>
            </div>

            {/* Tag/Username */}
            <div className="space-y-2">
              <Label htmlFor="tag">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="tag"
                  value={editForm.tag}
                  onChange={handleUsernameChange}
                  placeholder="username"
                  className="pl-8"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, and underscores allowed. {editForm.tag.length}/20 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Bio</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {editForm.description.length}/200 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isUploading.avatar || isUploading.background}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={onSave}
                disabled={isUploading.avatar || isUploading.background || !editForm.name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Crop Modal */}
      <Dialog open={showCrop} onOpenChange={handleCropCancel}>
        <DialogContent className="sm:max-w-[90vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>
              Crop {cropType === 'avatar' ? 'Profile Picture' : 'Banner Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {cropImage && (
              <div className="flex justify-center">
                <div className="max-w-full max-h-[70vh] overflow-auto border rounded-lg">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={cropType === 'avatar' ? 1 : 5}
                    minWidth={cropType === 'avatar' ? 100 : 500}
                    minHeight={cropType === 'avatar' ? 100 : 100}
                    circularCrop={cropType === 'avatar'}
                    keepSelection
                    ruleOfThirds
                  >
                    <img
                      ref={imgRef}
                      src={cropImage}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        display: 'block'
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {cropType === 'avatar' 
                    ? 'Drag to adjust the square crop area for your profile picture'
                    : 'Drag to adjust the 5:1 banner crop area for your banner image'  // Đổi từ 3:1 thành 5:1
                  }
                </p>
                {completedCrop && (
                  <p className="text-xs text-green-600">
                    Crop area selected: {Math.round(completedCrop.width)} x {Math.round(completedCrop.height)} pixels
                    {cropType === 'background' && (
                      <span> (Ratio: {(completedCrop.width / completedCrop.height).toFixed(2)}:1)</span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" onClick={handleCropCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCropComplete} 
                  disabled={!completedCrop || completedCrop.width === 0 || completedCrop.height === 0}
                >
                  Apply Crop
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

