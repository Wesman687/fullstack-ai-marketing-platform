import { validateUrl } from "@/app/utils/validateUrl";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CrawlConfigInterface, PaginationInterface } from "./ScraperForm";


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
interface PaginationSettingsProps {
  crawlConfig: CrawlConfigInterface;
  setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
}

export default function PaginationSettings({
  crawlConfig, setCrawlConfig,
}: PaginationSettingsProps) {
  const [error, setError] = useState<string>("");
  const [debouncedUrl, setDebouncedUrl] = useState<string>(crawlConfig.url || "");

  const updateCrawlConfig = useCallback(
    (key: keyof CrawlConfigInterface, value: string | number) => {
      setCrawlConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setCrawlConfig
    ]
  );

  // Function to detect pagination method dynamically
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (crawlConfig.url && validateUrl(crawlConfig.url)) {
        setDebouncedUrl(crawlConfig.url);
      }
    }, 5000); // ⏳ 500ms delay before setting debouncedUrl

    return () => clearTimeout(handler);
  }, [crawlConfig.url]);

  useEffect(() => {
    const detectPaginationMethod = async (url: string) => {
      if (!validateUrl(url)) {
        setError("❌ Invalid URL. Please enter a valid URL.");
        return;
      }
  
      setError("");
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API}/crawl/detect-pagination`, { url });
        console.log("🔍 Pagination Detection Started");
  
        let attempts = 0;
        const maxAttempts = 10;
  
        while (attempts < maxAttempts) {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/crawl/get-pagination-result`, {
              params: { url },
            });
  
            if (response.status === 200 && response.data.paginationMethod) {
              console.log("✅ Pagination Detected:", response.data.paginationMethod);
              const detectedMethod = Object.keys(PaginationMethods).find(
                (key) => PaginationMethods[key as keyof PaginationInterface].name === response.data.paginationMethod
              ) as keyof PaginationInterface || "NO_PAGINATION"; // Default to NO_PAGINATION if not found
  
              updateCrawlConfig("paginationMethod", detectedMethod);
              return; // ✅ Stop polling
            }
  
  
          } catch (error) {
            console.log(`🔄 File not ready, retrying (${attempts + 1}/${maxAttempts})...`, error);
            updateCrawlConfig("paginationMethod", "NO_PAGINATION");
            setError("Failed to detect pagination method.");
          }
  
          // Wait 5 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 5000));
          attempts++;
        }
  
        // ❌ If all attempts fail, set it to "NO_PAGINATION"
        console.log("❌ Pagination method not detected.");
        updateCrawlConfig("paginationMethod", "NO_PAGINATION");
        setError("Failed to detect pagination method.");
  
      } catch (err) {
        console.error("Pagination detection error:", err);
        setError("Failed to detect pagination method.");
      }
    };
  
    if (debouncedUrl) {
      detectPaginationMethod(debouncedUrl);
    }
  }, [debouncedUrl, updateCrawlConfig]);
  const paginationName = useMemo(() => {
    const method = crawlConfig.paginationMethod;
    return typeof method === "string" && PaginationMethods[method]
      ? PaginationMethods[method].name
      : "NO_PAGINATION"; // Default fallback
  }, [crawlConfig.paginationMethod]);
  


  return (
    <div className="p-4 border rounded mb-4">
      <div className="flex justify-between">
        <div>          
      <h2 className="text-xl font-bold mb-2">Pagination Settings</h2>
      <p className="mt-2">
        Detected Method: <strong>{paginationName ?? "Unknown"}</strong>
      </p>
        </div>
        <div className="flex items-center justify-center gap-5">

        {crawlConfig.paginationMethod == "INFINITE_SCROLL" ? <label>Max Scrolls: </label> : <label>Max Pages: </label>}
        <input
          type="text"
          placeholder="Enter Max Pages to Scrape (default: 5)"
          value={crawlConfig.pages}
          onChange={(e) =>
            updateCrawlConfig("pages", e.target.value ?? 5)
          }
          className="border rounded p-2 w-10 text-center"
          />
          </div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        <h3 className="font-semibold">Manual Pagination Setup</h3>
        <select
          value={crawlConfig.paginationMethod}
          onChange={(e) =>
            setCrawlConfig((prev) => ({
              ...prev,
              paginationMethod: e.target.value as keyof PaginationInterface, // ✅ Type assertion
            }))
          }
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
