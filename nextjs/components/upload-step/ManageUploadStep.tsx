'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import UploadStepHeader from './UploadStepHeader'
import UploadStepBody from './UploadStepBody'
import ConfirmationModal from '../ConfirmationModal'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Asset, AssetProcessingJob } from '@/server/db/schema/schema'
import { upload } from '@vercel/blob/client'

interface ManageUploadStepProps {
  projectId: string
}

function ManageUploadStep({ projectId }: ManageUploadStepProps) {
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [browserFiles, setBrowserFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [assetJobStatus, setAssetJobStatus] = useState<Record<string, string>>({

  });
  const prevAssetJobStatusRef = useRef<Record<string, string>>({});
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  async function deleteAsset(assetId: string) {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/projects/${projectId}/assets?assetId=${assetId}`);
      toast.success('Asset deleted successfully')
      fetchAssets()
    } catch (error) {
      console.error('Failed to delete asset', error)
      toast.error('Failed to delete asset')
    } finally {
      setIsDeleting(false)
      setDeleteAssetId(null)
    }
  }
  const fetchAssets = useCallback(async () => {
    if (uploadedAssets.length === 0) {
      setIsLoading(true)
    }
    try {
      const response = await axios.get<{ assets: Asset[] }>(`/api/projects/${projectId}/assets`)
      setUploadedAssets(response.data.assets || [])
    } catch (error) {
      console.error('❌ Failed to fetch assets', error)
      setUploadedAssets([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId, uploadedAssets.length])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const fetchAssetProcessingJobs = useCallback(async () => {
    const controller = new AbortController();
    try {
      const response = await axios.get<AssetProcessingJob[]>(
        `/api/projects/${projectId}/asset-processing-jobs`,
        { signal: controller.signal } // ✅ Attach AbortSignal to cancel previous requests
      );
      const newAssetJobStatus: Record<string, string> = {};
      response.data.forEach((job) => {
        newAssetJobStatus[job.assetId] = job.status;
      });
      setAssetJobStatus(newAssetJobStatus);
      const prevAssetJobStatus = prevAssetJobStatusRef.current;
      const isAnyStatusChangedToCompleted = response.data.some((job) => {
        const prevStatus = prevAssetJobStatus[job.assetId];
        const newStatus = job.status;
        return prevStatus !== "completed" && newStatus === "completed";
      });

      // Update the previous statuses reference
      prevAssetJobStatusRef.current = newAssetJobStatus;

      if (isAnyStatusChangedToCompleted) {
        console.log("Fetching files after status change to completed");
        await fetchAssets();
      }
  
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  
    return () => controller.abort(); // ✅ Cleanup function to cancel previous request
  }, [projectId]); // ✅ Only depends on `projectId`
   // ✅ Ensures only one request runs at a time

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAssetProcessingJobs();
    }, 5000);
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleUpload = async () => {
    setUploading(true)
    try {
      const uploadPromises = browserFiles.map(async (file) => {
        const fileData = {
          projectId,
          title: file.name,
          file: getFileType(file),
          mimeType: file.type,
          size: file.size,
        }

        const filename = `${projectId}/${file.name}`
        await upload(filename, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: true,
          clientPayload: JSON.stringify(fileData),
        })
      })

      const uploadResults = await Promise.all(uploadPromises);

      // Fetch assets
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetchAssets();

      toast.success(`Successfully uploaded ${uploadResults.length} files`);
      setBrowserFiles([]);
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to upload one or more files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFileType = (file: File) => {
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.startsWith('text/plain')) return 'text/plain'
    if (file.type.startsWith('text/markdown')) return 'text/markdown'
    return 'other'
  }

  return (
    <div>
      <UploadStepHeader
        handleUpload={handleUpload}
        uploading={uploading}
        browserFiles={browserFiles}
        setBrowserFiles={setBrowserFiles}
        inputFileRef={inputFileRef}
      />
      <UploadStepBody
        uploadedAssets={uploadedAssets}
        isLoading={isLoading}
        setDeleteAssetId={setDeleteAssetId}
        assetJobStatus={assetJobStatus}
      />
      <ConfirmationModal
        isOpen={!!deleteAssetId}
        title='Delete Asset'
        message={`Would you like to delete this asset, this action cannot be undone?`}
        onClose={() => {
          setDeleteAssetId(null)
        }}
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