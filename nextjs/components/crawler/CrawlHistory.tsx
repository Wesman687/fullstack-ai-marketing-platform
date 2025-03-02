import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CrawlViewer from './CrawlViewer';
import ActionDropdown from './ActionDropDown';
import toast from 'react-hot-toast';
import { handleDownloadHTML, handleDownloadPDF, handleExportAndDownloadExcel, handleExportToGoogleSheets, updateGoogleSheetId } from './utils/crawlExport';
import { CrawlConfigInterface } from './ScraperForm';
import { CrawlResult } from '@/server/db/schema/db2schema';
import { pages } from 'next/dist/build/templates/app-page';

interface CrawlRequest {
  id: string;
  url: string;
  status: string;
  name: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  fields: string[];
  google_sheet_id: string;
  custom_selector: string;
}

interface CrawlHistoryProps {
  crawlConfig: CrawlConfigInterface;
  setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CrawlHistory = ({ crawlConfig, setCrawlConfig, handleUrlChange }: CrawlHistoryProps) => {
  const [crawlRequests, setCrawlRequests] = useState<CrawlRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCrawlViewer, setShowCrawlViewer] = useState(false);
  const [crawlId, setCrawlId] = useState('');

  // ✅ Fetch all crawl requests
  const fetchCrawlRequests = async () => {
    try {
      const response = await axios.get(`/api/crawl/requests`);
      setCrawlRequests(response.data.crawlRequests);
    } catch (err) {
      setError('Failed to fetch crawl requests.');
      console.error('❌ Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resendCrawlRequest = async (request: CrawlRequest) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/crawl/resend/${request.id}`);
      if (response.status === 200) {
        toast.success('Crawl request resent successfully.');
      }
    } catch (err) {
      console.error('❌ Resend Error:', err);
    }
  };

  // ✅ Update crawlConfig state in a single call
  const reloadData = (request: CrawlRequest) => {
    setCrawlConfig((prev) => ({
      ...prev,
      name: request.name || '',
      url: request.url || '',
      pages: request.pages ?? 5,
      tag: request.tag || '',
      fields: request.fields || [],
      sheetId: request.google_sheet_id || '',
      customSelector: request.custom_selector || '',
    }));

    handleUrlChange({ target: { value: request.url } } as React.ChangeEvent<HTMLInputElement>);
  };

  // ✅ Delete Crawl Request
  const deleteCrawlRequest = async (id: string) => {
    try {
      await axios.delete(`/api/crawl/requests/${id}`);
      setCrawlRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('❌ Delete Error:', err);
    }
  };
  const downloadCrawlRequest = async (id: string, type: string) => {
    try {
      const response = await axios.get<{ crawlResults: CrawlResult[] }>(`/api/crawl/result/${id}`);
      const rawData = response.data.crawlResults;

      console.log(rawData);

      // ✅ Extract parsed `data` field from each record
      const parsedDataArray = rawData.map((row) => {
        try {
          return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; // Handle both string and parsed JSON
        } catch (error) {
          console.error("❌ Error parsing JSON:", error);
          return {}; // Return empty object if parsing fails
        }
      });

      if (type === 'csv') {
        const csvData = convertToCSV(parsedDataArray);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crawl_request_${id}.csv`;
        link.click();
      } else {
        const jsonData = JSON.stringify(parsedDataArray, null, 2); // Pretty-print JSON

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crawl_request_${id}.json`;
        link.click();
      }
    } catch (err) {
      console.error('❌ Download Error:', err);
    }
  };

  // ✅ Convert JSON to CSV
  const convertToCSV = (data: Record<string, string>[]): string => {
    if (data.length === 0) return '';

    // ✅ Extract unique headers dynamically
    const headers = [...new Set(data.flatMap(Object.keys))];

    // ✅ Convert data objects to CSV rows
    const rows = data.map((parsedData) =>
      headers
        .map((header) => {
          const value = parsedData[header] || ''; // Handle missing values
          return `"${String(value).replace(/"/g, '""')}"`; // Escape double quotes
        })
        .join(',')
    );

    return `${headers.join(',')}\n${rows.join('\n')}`;
  };

  useEffect(() => {
    fetchCrawlRequests();
    const interval = setInterval(fetchCrawlRequests, 5000); // ⏳ Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || error)
    return (
      <div className="p-24 w-full h-full flex justify-center">
        <p>🔄 Loading crawl history...</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );

  return (
    <>
      <div className="my-10 max-h-[40vh] overflow-scroll overflow-x-hidden border p-4 border-gray-200 bg-white rounded-lg shadow-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">📜 Crawl History</h1>

        {crawlRequests.length === 0 ? (
          <p className="text-center">No crawl requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-xs sm:text-sm">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border hidden md:table-cell truncate">URL</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Created</th>
                  <th className="p-2 border">Updated</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {crawlRequests.map((request) => (
                  <tr key={request.id} className="text-center text-xs sm:text-sm">
                    <td className="border p-2 max-w-[100px] truncate">{request.name}</td>
                    <td className="border p-2 max-w-[300px] truncate hidden md:table-cell">{request.url}</td>
                    <td className="border p-2">{request.status}</td>
                    <td className="border p-2">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="border p-2">{new Date(request.updatedAt).toLocaleDateString()}</td>
                    <td className="border p-2 flex justify-center">
                      <ActionDropdown
                        onView={() => {
                          setShowCrawlViewer(true);
                          setCrawlId(request.id);
                        }}
                        onResend={() => resendCrawlRequest(request)}
                        onDelete={() => deleteCrawlRequest(request.id)}
                        onReload={() => reloadData(request)}
                        onDownloadJSON={() => downloadCrawlRequest(request.id, 'json')}
                        onDownloadCSV={() => downloadCrawlRequest(request.id, 'csv')}
                        onDownloadExcel={() => handleExportAndDownloadExcel(request.id)}
                        onDownloadPDF={() => handleDownloadPDF(request.id)}
                        onDownloadHTML={() => handleDownloadHTML(request.id)}
                        onExportGoogleSheets={() => handleExportToGoogleSheets(request.id)}
                        onUpdateSheets={() => updateGoogleSheetId(request.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCrawlViewer && <CrawlViewer id={crawlId} />}
    </>
  );
};

export default CrawlHistory;
