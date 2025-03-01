import { validateUrl } from "@/app/utils/validateUrl";
import axios from "axios";
import { useEffect, useState } from "react";
import { PaginationInterface } from "./ScraperForm";

interface PaginationSettingsProps {
  url: string;
  setPaginationMethod: (method: keyof PaginationInterface) => void;
  paginationMethod: keyof PaginationInterface;
}

export const PaginationMethods: PaginationInterface = {
  URL_PAGINATION: {
    desc: "URL-Based Pagination (e.g., ?page=)",
    name: "URL_PAGINATION",
  },
  LOAD_MORE_BUTTON: {
    desc: "Load More Button",
    name: "LOAD_MORE_BUTTON",
  },
  INFINITE_SCROLL: {
    desc: "Infinite Scroll",
    name: "INFINITE_SCROLL",
  },
  NO_PAGINATION: {
    desc: "No Pagination",
    name: "NO_PAGINATION",
  },
};

export default function PaginationSettings({
  url, setPaginationMethod, paginationMethod
}: PaginationSettingsProps) {
  const [error, setError] = useState<string>("");
  const [debouncedUrl, setDebouncedUrl] = useState<string>(url || "");

  // Function to detect pagination method dynamically
  const detectPaginationMethod = async (url: string) => {
    if (!validateUrl(url)) {
      setError("❌ Invalid URL. Please enter a valid URL.");
      return;
    }

    setError("");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API}/scrape/detect-pagination`, { url });
      console.log("🔍 Pagination Detection Started");

      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/scrape/get-pagination-result`, {
            params: { url },
          });

          if (response.status === 200 && response.data.paginationMethod) {
            console.log("✅ Pagination Detected:", response.data.paginationMethod);
            const detectedMethod = Object.keys(PaginationMethods).find(
              (key) => PaginationMethods[key as keyof PaginationInterface].name === response.data.paginationMethod
            ) as keyof PaginationInterface || "NO_PAGINATION"; // Default to NO_PAGINATION if not found

            setPaginationMethod(detectedMethod)
            return; // ✅ Stop polling
          }


        } catch (error) {
          console.log(`🔄 File not ready, retrying (${attempts + 1}/${maxAttempts})...`, error);
          setPaginationMethod("NO_PAGINATION");
          setError("Failed to detect pagination method.");
        }

        // Wait 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      }

      // ❌ If all attempts fail, set it to "NO_PAGINATION"
      console.log("❌ Pagination method not detected.");
      setPaginationMethod("NO_PAGINATION");
      setError("Failed to detect pagination method.");

    } catch (err) {
      console.error("Pagination detection error:", err);
      setError("Failed to detect pagination method.");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (url && validateUrl(url)) {
        setDebouncedUrl(url);
      }
    }, 5000); // ⏳ 500ms delay before setting debouncedUrl

    return () => clearTimeout(handler);
  }, [url]);

  useEffect(() => {
    if (debouncedUrl) {
      detectPaginationMethod(debouncedUrl);
    }
  }, [debouncedUrl]);

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Pagination Settings</h2>
      <p className="mt-2">
        Detected Method: <strong>{paginationMethod}</strong>
      </p>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        <h3 className="font-semibold">Manual Pagination Setup</h3>
        <select
          value={paginationMethod}
          onChange={(e) => setPaginationMethod(e.target.value as keyof PaginationInterface)}
          className="border p-2 w-full rounded mb-2"
        >
          <option value="">Select Pagination Method</option>
          {Object.entries(PaginationMethods).map(([key, label]) => (
            <option key={key} value={key}>
              {label.desc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
