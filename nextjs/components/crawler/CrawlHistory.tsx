import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import ActionDropdown from './ActionDropDown';
import toast from 'react-hot-toast';
import { handleDownloadHTML, handleDownloadPDF, handleExportAndDownloadExcel, handleExportToGoogleSheets, updateGoogleSheetId } from './utils/crawlExport';
import { CrawlConfigInterface } from './ScraperForm';
import ConfirmationModal from '../ConfirmationModal';


interface CrawlHistoryProps {
  crawlConfig: CrawlConfigInterface;
  setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  
  mode: "crawl" | "scrape";
  crawlId: string;
  setCrawlId: React.Dispatch<React.SetStateAction<string>>;
  setShowCrawlViewer: React.Dispatch<React.SetStateAction<boolean>>;
}
interface BaseRequest {
  id: string;
  name: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  google_sheet_id: string;
  pages: number;
  tag: string;
  fields: string[];
  custom_selector: string;
  data: string;
  urls: string[];
}
interface RequestData {
  [key: string]: string | number | boolean | null; // Allow structured, predictable data
}
interface CrawlRequest extends BaseRequest {
  crawlData: RequestData
}
interface ScrapedRequest extends BaseRequest {
  scrapeData: RequestData
}
type RequestType = CrawlRequest | ScrapedRequest;
const CrawlHistory = ({ mode, setCrawlConfig, handleUrlChange, crawlId, setCrawlId, setShowCrawlViewer }: CrawlHistoryProps) => {
  const isScraper = mode === 'scrape';
  const [requests, setRequests] = useState<Array<CrawlRequest | ScrapedRequest>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [request, setRequest] = useState<RequestType | null>(null);
  const [showGoogleSheetsErrorModal, setShowGoogleSheetsErrorModal] = useState(false);
  const [googleSheetsErrorMessage, setGoogleSheetsErrorMessage] = useState("");


  // ✅ Fetch all crawl requests
  const fetchRequests = useCallback(async () => {
    try {
      const response = await axios.get(`/api/${mode}/requests`);
      setRequests(response.data.results);
    } catch (err) {
      setError(`Failed to fetch ${mode} requests.`);
      console.error('❌ Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const resendCrawlRequest = useCallback( async (request: RequestType) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/${mode}/resend/${request.id}`);
      if (response.status === 200) {
        toast.success('Crawl request resent successfully.');
      }
    } catch (err) {
      console.error('❌ Resend Error:', err);
    }
  },[mode])

  // ✅ Update crawlConfig state in a single call
  const reloadData = useCallback( (request: RequestType) => {
    setCrawlConfig((prev) => ({
      ...prev,
      name: request.name || '',
      url: request.url || '',
      urls: request.urls || [],
      scrapeUrl: mode === 'scrape' ? request.url : '',
      pages: request.pages ?? 5,
      tag: request.tag || '',
      fields: request.fields || [],
      sheetId: request.google_sheet_id || '',
      customSelector: request.custom_selector || '',
    }))

    handleUrlChange({ target: { value: request.url } } as React.ChangeEvent<HTMLInputElement>);
  },[handleUrlChange, mode, setCrawlConfig])

  // ✅ Delete Crawl Request
  const deleteCrawlRequest = useCallback( async (id: string) => {
    try {
      await axios.delete(`/api/${mode}/requests/${id}`);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('❌ Delete Error:', err);
    }
  }, [mode])
  // ✅ Convert JSON to CSV
  const convertToCSV = useCallback( (data: Record<string, string>[]): string => {
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
  },[])
  const downloadCrawlRequest = useCallback( async (id: string, type: string) => {
    try {
        const response = await axios.get<{ results: RequestType[]}>(`/api/${mode}/results/${id}`);
        const rawData = response.data.results;
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
        link.download = `${mode}_request_${id}.csv`;
        link.click();
      } else {
        const jsonData = JSON.stringify(parsedDataArray, null, 2); // Pretty-print JSON

        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mode}_request_${id}.json`;
        link.click();
      }
    } catch (err) {
      console.error('❌ Download Error:', err);
    }
  },[convertToCSV, mode])
  

  useEffect(() => {
      fetchRequests()
      const interval = setInterval(fetchRequests, 5000);   
    return () => clearInterval(interval);
    
  }, [fetchRequests, isScraper]);

  if (loading || error)
    return (
      <div className="p-24 w-full h-full flex justify-center">
        <p>🔄 Loading crawl history...</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );

  return (
    <>

        {requests.length === 0 ? (
          <p className="text-center mt-10 mb-8">{isScraper ? "No Scraper requests found" : "No crawl requests found."}</p>
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
                {requests.map((request) => (
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
                        onResend={() => {
                          setRequest(request);
                          setShowRefreshModal(true);
                        }}
                        onDelete={() => {
                          setCrawlId(request.id);
                          setShowDeleteModal(true);
                        }}
                        onReload={() => reloadData(request)}
                        onDownloadJSON={() => downloadCrawlRequest(request.id, 'json')}
                        onDownloadCSV={() => downloadCrawlRequest(request.id, 'csv')}
                        onDownloadExcel={() => handleExportAndDownloadExcel(request.id, mode)}
                        onDownloadPDF={() => handleDownloadPDF(request.id, mode)}
                        onDownloadHTML={() => handleDownloadHTML(request.id, mode)}
                        onExportGoogleSheets={() => handleExportToGoogleSheets(request.id, mode, setGoogleSheetsErrorMessage, setShowGoogleSheetsErrorModal)}
                        onUpdateSheets={() => updateGoogleSheetId(request.id, mode)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Crawl Request"
        message="Are you sure you want to delete this crawl request?"
        onConfirm={() => {
          deleteCrawlRequest(crawlId);
          setShowDeleteModal(false);
        }}
        isLoading={loading}
        onClose={() => setShowDeleteModal(false)}
        />
        <ConfirmationModal 
        isOpen={showRefreshModal}
        title="Refresh Crawl Data"
        message="Are you sure you want to refresh this crawl request?"
        onConfirm={() => {
          if (request) resendCrawlRequest(request);
          setShowRefreshModal(false);
        }}
        isLoading={loading}
        onClose={() => setShowRefreshModal(false)}
        />
        <ConfirmationModal 
          isOpen={showGoogleSheetsErrorModal}
          title="Google Sheets Export Failed"
          message={googleSheetsErrorMessage}
          onConfirm={() => setShowGoogleSheetsErrorModal(false)}
          isLoading={false}
          onClose={() => setShowGoogleSheetsErrorModal(false)}
        />
      
    </>
  );
};

export default CrawlHistory;
