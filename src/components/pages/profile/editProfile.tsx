"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

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
  onImageUpload: (type: 'avatar' | 'background') => void
}

export default function EditProfile({
  isOpen,
  onClose,
  editForm,
  setEditForm,
  onSave,
  onImageUpload
}: EditProfileProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Background Image */}
          <div className="space-y-2">
            <Label>Background Image</Label>
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
              {editForm.background && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${editForm.background}')` }}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onImageUpload('background')}
                className="absolute bottom-2 right-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={editForm.avatar || "/placeholder.svg"} />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onImageUpload('avatar')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter your display name"
            />
          </div>

          {/* Tag/Username */}
          <div className="space-y-2">
            <Label htmlFor="tag">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="tag"
                value={editForm.tag.replace('@', '')}
                onChange={(e) => setEditForm({ ...editForm, tag: '@' + e.target.value.replace('@', '') })}
                placeholder="username"
                className="pl-8"
              />
            </div>
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
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={onSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}