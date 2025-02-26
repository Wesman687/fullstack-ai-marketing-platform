'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CrawlViewer from './CrawlViewer';
import ActionDropdown from './ActionDropDown';
import toast from 'react-hot-toast';

interface CrawlRequest {
  id: string;
  url: string;
  status: string;
  name: string;
  tag: string;
  createdAt: string;
  fields: [{ fields: string[] }];
}
interface CrawlResult {
    id: string;
    jobId: string;
    userId: string;
    data: Record<string, string>;
    createdAt: string;
  }

interface CrawlHistoryProps {
  setTag: React.Dispatch<React.SetStateAction<string>>;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  setFields: React.Dispatch<React.SetStateAction<string[]>>;
  setNameOfCrawl: React.Dispatch<React.SetStateAction<string>>;
}

const CrawlHistory = ({ setTag, setUrl, setFields, setNameOfCrawl }: CrawlHistoryProps) => {
  const [crawlRequests, setCrawlRequests] = useState<CrawlRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCrawlViewer, setShowCrawlViewer] = useState(false);
  const [crawlId, setCrawlId] = useState('');

  // ✅ Fetch all crawl requests for the user
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/resend-crawl/${request.id}`);
      if (response.status === 200) {
        toast.success('Crawl request resent successfully.');
      }
    } catch (err) {
      console.error('❌ Resend Error:', err);
    }
  };

  const reloadData = (request: CrawlRequest) => {
    setNameOfCrawl(request.name);
    setUrl(request.url);
    setTag(request.tag);
    setFields(request.fields[0].fields);
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

  // ✅ Download Crawl Request Data
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
        const csvData = convertToCSV(rawData);
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
  
  const convertToCSV = (data: CrawlResult[]): string => {
    if (data.length === 0) return '';
  
    // ✅ Parse JSON from `data` field and get headers dynamically
    const parsedDataArray = data.map((row) => {
      try {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; // Handle both string and parsed JSON
      } catch (error) {
        console.error("❌ Error parsing JSON:", error);
        return {}; // Return empty object on failure
      }
    });
  
    // ✅ Extract unique headers dynamically
    const headers = [...new Set(parsedDataArray.flatMap(Object.keys))];
  
    // ✅ Convert data objects to CSV rows
    const rows = parsedDataArray.map((parsedData) =>
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
    const interval = setInterval(fetchCrawlRequests, 1000);
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
      <div className="my-10 border p-4 border-gray-200 bg-white rounded-lg shadow-lg w-full">
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
                    <td className="border p-2 flex justify-center">
                      <ActionDropdown
                        onView={() => {
                          setShowCrawlViewer(true);
                          setCrawlId(request.id);
                        }}
                        onDownloadJSON={() => downloadCrawlRequest(request.id, 'json')}
                        onDownloadCSV={() => downloadCrawlRequest(request.id, 'csv')}
                        onResend={() => resendCrawlRequest(request)}
                        onDelete={() => deleteCrawlRequest(request.id)}
                        onReload={() => reloadData(request)}
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
