'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface UploadLinkProps {
  projectId: string;
  fetchAssets: () => void;
}

function UploadLink({ projectId, fetchAssets }: UploadLinkProps) {
  const [videoLink, setVideoLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoLinkSubmit = async () => {
    if (!videoLink) {
      toast.error('Please provide a valid video link.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await axios.post(
        '/api/process-video-link',
        {
          videoUrl: videoLink,
          projectId,
        },
        {
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        }
      );

      if (response.status === 200) {
        toast.success('Video processed and uploaded successfully!');
        await fetchAssets();
        setVideoLink('');
      } else {
        toast.error(response.data.error || 'Failed to process the video link.');
      }
    } catch (error) {
      console.error('❌ Error processing video link:', error);
      toast.error('An error occurred while processing the video link.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Paste video link here"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        className="border rounded p-2 w-full"
      />
      <div className="w-full flex items-center justify-center">
        <button
          onClick={handleVideoLinkSubmit}
          className={`mt-2 bg-blue-600 text-white p-2 rounded ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Download & Process'}
        </button>
      </div>

      {isProcessing && (
        <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default UploadLink;
