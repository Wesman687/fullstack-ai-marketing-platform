'use client'
import React, { useEffect, useState, useCallback } from 'react'
import UploadStepHeader from './UploadStepHeader'
import UploadStepBody from './UploadStepBody'
import ConfirmationModal from '../ConfirmationModal'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Asset } from '@/server/db/schema/schema'
interface ManageUploadStepProps {
  projectId: string
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  async function deleteAsset(assetId: string) {
    setIsDeleting(true)
    try {
      // ✅ Make a DELETE request to the API
      await axios.delete(`/api/assets/${projectId}?assetId=${assetId}`, {
        method: 'DELETE',
      })
      toast.success('Asset deleted successfully')
      setDeleteAssetId(null)
    } catch (error) {
      console.error('Failed to delete asset', error)
      toast.error('Failed to delete asset')
    } finally {
      setIsDeleting(false)
      setDeleteAssetId(null)
    }
    fetchAssets()
  }
  const fetchAssets = useCallback(async () => {
    setIsLoading(true); 
    try {
        const response = await axios.get<{ assets: Asset[] }>(`/api/assets/${projectId}`);
        console.log("✅ Assets Response:", response.data); // Debugging
        setUploadedAssets(response.data.assets || []); // ✅ Ensure always an array
    } catch (error) {
        console.error("❌ Failed to fetch assets", error);
        setUploadedAssets([]); // ✅ Prevents `map` errors
    } finally {
        setIsLoading(false);
    }
}, [projectId]); // ✅ Add dependencies
  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])
  return (
    <div>
      <UploadStepHeader projectId={projectId} />
      <UploadStepBody uploadedAssets={uploadedAssets} isLoading={isLoading} setDeleteAssetId={setDeleteAssetId} />
      <ConfirmationModal isOpen={!!deleteAssetId}
        title='Delete Asset'
        message={`Would you like to delete this asset, this action cannot be undone?`}
        onClose={() => { setDeleteAssetId(null) }}
        onConfirm={() => {
          console.log('Deleting asset', deleteAssetId)
          if (deleteAssetId) {
            deleteAsset(deleteAssetId)
          }
          setDeleteAssetId(null)

        }}
        isLoading={isDeleting}
      />

    </div>
  )
}

export default ManageUploadStep
