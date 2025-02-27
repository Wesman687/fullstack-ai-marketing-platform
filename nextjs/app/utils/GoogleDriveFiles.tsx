'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ Standardized Interface
interface ScrapedFile {
  id: string;
  file: string;  // File name
  summary: string; // Summarized content
  text: string; // Full extracted text
  link: string; // Google Drive file link
}

export default function GoogleDriveFiles() {
  const [files, setDriveFiles] = useState<ScrapedFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ScrapedFile | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    fetchScrapedData();
  }, []);

  const fetchScrapedData = async () => {
    console.log("🔍 Fetching Google Drive files & summaries...");
    setLoading(true);
    try {
        
      const { data } = await axios.get('/api/user');
      setUserId(data.userId);
      const response = await axios.get<{ extracted_data: ScrapedFile[] }>(
        `${process.env.NEXT_PUBLIC_API}/scrape/drive/${data.userId}`
      );
      console.log("✅ Files & Summaries:", response.data.extracted_data);
      setDriveFiles(response.data.extracted_data);
    } catch (error) {
      console.error("❌ Error fetching summarized files:", error);
      setError("Failed to fetch Google Drive files.");
    } finally {
      setLoading(false);
    }
  };

  const selectGoogleDriveFolder = async () => {
    const newFolderId = prompt("📂 Enter your Google Drive Folder ID:");
    if (!newFolderId) return;

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/drive/folder/${userId}`, {
        google_drive_folder_id: newFolderId,
      });

      toast.success("✅ Google Drive Folder ID saved!");
      fetchScrapedData();
    } catch (err) {
      console.error("❌ Error saving Google Drive Folder ID:", err);
      toast.error("❌ Failed to save Google Drive Folder ID.");
    }
  };

  if (loading) return <p>🔄 Loading files...</p>;

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-3">📂 Summarized Google Drive Files</h2>
      
      <button
        onClick={selectGoogleDriveFolder}
        className="bg-gray-200 px-3 py-1 rounded mb-3 text-sm"
      >
        🔄 Change Google Drive Folder
      </button>

      {error ? (
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={selectGoogleDriveFolder}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
          >
            🔗 Add Google Drive Folder
          </button>
        </div>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li 
              key={file.id} 
              className="border p-2 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedFile(file)}
            >
              <h3 className="font-semibold">{file.file}</h3>
              <p className="text-gray-700">{file.summary}</p>
              <a href={file.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Open File 📂
              </a>
            </li>
          ))}
        </ul>
      )}

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
            <h2 className="text-lg font-semibold">{selectedFile.file}</h2>
            <p className="text-sm text-gray-500">{selectedFile.summary}</p>
            <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-64 text-sm">{selectedFile.text}</pre>
            <button 
              onClick={() => setSelectedFile(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
