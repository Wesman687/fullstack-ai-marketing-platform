import { validateUrl } from "@/app/utils/validateUrl";
import axios from "axios";
import { useEffect, useState } from "react";

interface PaginationSettingsProps {
  url: string;
  setPaginationMethod: (method: string) => void;
    paginationMethod: string;
}

export const PaginationMethods = {
  URL_PAGINATION: "URL-Based Pagination (e.g., ?page=)",
  LOAD_MORE_BUTTON: "Load More Button",
  INFINITE_SCROLL: "Infinite Scroll",
  NO_PAGINATION: "No Pagination Detected",
};

export default function PaginationSettings({
   url, setPaginationMethod, paginationMethod
}: PaginationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [detectedPagination, setDetectedPagination] = useState<string>("");
  const [testUrl, setTestUrl] = useState<string>(url || "");
  const [debouncedUrl, setDebouncedUrl] = useState<string>(url || "");

  // Function to detect pagination method dynamically
  const detectPaginationMethod = async (url: string) => {
    if (!validateUrl(url)) {
      setError("❌ Invalid URL. Please enter a valid URL.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/detect-pagination`, { url });      
      setPaginationMethod(response.data.paginationMethod);
      setDetectedPagination(response.data.paginationMethod);
      console.log(response.data.paginationMethod);
    } catch (err) {
      console.error("Pagination detection error:", err);
      setError("Failed to detect pagination method.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (url) detectPaginationMethod(url);
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      if (testUrl && validateUrl(testUrl)) {
        setDebouncedUrl(testUrl);
      }
    }, 5000); // ⏳ 500ms delay before setting debouncedUrl

    return () => clearTimeout(handler);
  }, [testUrl]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (url && validateUrl(url)) {
        setDebouncedUrl(url);
      }
    }, 5000); // ⏳ 500ms delay before setting debouncedUrl

    return () => clearTimeout(handler);
  }, [url]);
  

  // ✅ Auto-detect pagination when debounced URL changes
  useEffect(() => {
    if (debouncedUrl) detectPaginationMethod(debouncedUrl);
  }, [debouncedUrl]);

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Pagination Settings</h2>

      <input
        type="text"
        placeholder="Enter URL to detect pagination"
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
        className="border p-2 w-full rounded mb-4"
      />

      <button
        onClick={handleAutoDetect}
        disabled={!url || loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Detecting..." : "Auto-Detect Pagination"}
      </button>

      {detectedPagination && (
        <p className="mt-2">
          Detected Method: <strong>{detectedPagination}</strong>
        </p>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        <h3 className="font-semibold">Manual Pagination Setup</h3>
        <select
          value={paginationMethod}
          onChange={(e) => setPaginationMethod(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        >
          <option value="">Select Pagination Method</option>
          {Object.entries(PaginationMethods).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
