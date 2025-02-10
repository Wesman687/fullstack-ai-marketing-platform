'use client'
import React from 'react'
import UploadStepHeader from './UploadStepHeader'
import UploadStepBody from './UploadStepBody'
import ConfirmationModal from '../ConfirmationModal'
interface ManageUploadStepProps {
  projectId: string
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = React.useState<string | null>(null)
  async function deleteAsset(assetId: string) {
    try {
      // ✅ Make a DELETE request to the API
      const response = await fetch(`/api/assets/${projectId}/${assetId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete asset')
      }
      // ✅ Remove the asset from the UI
      setDeleteAssetId(null)
    } catch (error) {
      console.error('Failed to delete asset', error)
    }
  }
  return (
    <div>
      <UploadStepHeader projectId={projectId} />
      <UploadStepBody projectId={projectId} setDeleteAssetId={setDeleteAssetId} />
      <ConfirmationModal isOpen={!!deleteAssetId} 
      title='Delete Asset' 
      message={`Would you like to delete this asset, this action cannot be undone?`} 
      onClose={() => {setDeleteAssetId(null)}}
      onConfirm={() => {
        console.log('Deleting asset', deleteAssetId)
        setDeleteAssetId(null)
      }}
      />

    </div>
  )
}

export default ManageUploadStep