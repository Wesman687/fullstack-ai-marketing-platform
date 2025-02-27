'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ Define types for Google Drive files & scraped data
interface GoogleDriveFile {
  id: string;
  name: string;
  link: string;
  summary: string; 
  file: string;  // File name
  text: string; // Full extracted text
}
// types.ts
export interface ScrapedFile {
    file: string;  // File name
    summary: string; // Summarized content
    text: string; // Full extracted text
    link: string; // Google Drive file link
  }
  

export default function GoogleDriveFiles({ userId }: { userId: string }) {
  const [files, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchDriveFiles();
  }, []);

  // ✅ Fetch Google Drive Files
  const fetchDriveFiles = async () => {
    console.log("🔍 Fetching Google Drive files...");
    console.log(`${process.env.NEXT_PUBLIC_API}/export/drive/files/${userId}`);
    try {
      setLoading(true);
      
      const { data } = await axios.get('/api/user');
      const response = await axios.get<{ files: GoogleDriveFile[] }>(
        `${process.env.NEXT_PUBLIC_API}/export/drive/files/${data.userId}`
      );
      console.log("✅ Google Drive Files:", response.data.files);
      setDriveFiles(response.data.files || []);
    } catch (err) {
      console.error("❌ Error fetching Google Drive files:", err);
      setError("Failed to fetch Google Drive files.");
    } finally {
      setLoading(false);
    }
  };


  // ✅ Handle Google Drive Folder Selection
  const selectGoogleDriveFolder = async () => {
    const newFolderId = prompt("📂 Enter your Google Drive Folder ID:");
    if (!newFolderId) return;

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/drive/folder/${userId}`, {
        google_drive_folder_id: newFolderId,
      });

      toast.success("✅ Google Drive Folder ID saved!");
      fetchDriveFiles(); // Reload files
    } catch (err) {
      console.error("❌ Error saving Google Drive Folder ID:", err);
      toast.error("❌ Failed to save Google Drive Folder ID.");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-3">📂 Exported Files</h2>

      {loading ? (
        <p>🔄 Loading files...</p>
      ) : error ? (
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={selectGoogleDriveFolder}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-3"
          >
            🔗 Add Google Drive Folder
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={selectGoogleDriveFolder}
            className="bg-gray-200 px-3 py-1 rounded mb-3 text-sm"
          >
            🔄 Change Google Drive Folder
          </button>

          {files.length === 0 ? (
            <p>No files found.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{file.name}</span>
                  <a
                    href={file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open 📂
                  </a>
                </li>
              ))}
            </ul>
          )}

        </>
      )}
    </div>
  );
}
