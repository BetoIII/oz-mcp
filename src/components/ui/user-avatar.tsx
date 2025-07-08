'use client'

import { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  alt?: string
  className?: string
}

export function UserAvatar({ src, name, alt = 'User', className = "w-8 h-8" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!src || imageError) {
    return (
      <div className={`${className} rounded-full bg-blue-100 border border-gray-200 flex items-center justify-center text-blue-600 font-medium text-sm`}>
        {getInitials(name)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} rounded-full border border-gray-200`}
      onError={() => setImageError(true)}
    />
  )
} 