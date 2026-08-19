'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

import { useOpenAPI } from '@/hooks'

export function AddonToastBridge() {
  const api = useOpenAPI()

  useEffect(() => {
    if (!api?.events?.on) return

    const unsub = api.events.on('addons:toast', (toastData: any) => {
      console.log('🔔 [UI] Toast event received in renderer:', toastData)
      if (!toastData) return

      if (toastData.action === 'dismiss' && toastData.toastId) {
        toast.dismiss(toastData.toastId)
        return
      }

      const type = toastData.type ?? 'info'
      if (type === 'loading') {
        toast.loading(toastData.message, {
          id: toastData.toastId,
          description: toastData.title,
        })
      } else if (type === 'success') {
        toast.success(toastData.message, {
          id: toastData.toastId,
          description: toastData.title,
        })
      } else if (type === 'error') {
        toast.error(toastData.message, {
          id: toastData.toastId,
          description: toastData.title,
        })
      } else if (type === 'warning') {
        toast.warning(toastData.message, {
          id: toastData.toastId,
          description: toastData.title,
        })
      } else {
        toast.info(toastData.message, {
          id: toastData.toastId,
          description: toastData.title,
        })
      }
    })

    return () => {
      unsub?.()
    }
  }, [api])

  return null
}
