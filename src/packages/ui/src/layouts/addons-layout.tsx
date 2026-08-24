'use client'

import { useNavigate, useParams } from 'react-router-dom'

import { AddonsManagerModal } from '@/components/addons-manager/addons-manager-modal'

export function AddonsLayout() {
  const navigate = useNavigate()
  const { workspaceId } = useParams()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1)
      } else {
        navigate(`/workspaces/${workspaceId}/time-entries`)
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <AddonsManagerModal open={true} onOpenChange={handleOpenChange} />
    </div>
  )
}
