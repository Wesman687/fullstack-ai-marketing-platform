'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CrawlViewer from './CrawlViewer';

interface CrawlRequest {
    id: string;
    url: string;
    status: string;
    name: string;
    createdAt: string;
}

const CrawlHistory = () => {
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
    const convertToCSV = (data: string[]) => {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]).join(','); // Extract headers
        const rows = data
            .map((row) =>
                Object.values(row)
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes
                    .join(',')
            )
            .join('\n');

        return `${headers}\n${rows}`;
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
    const downloadCrawlRequest = async (id: string, type: string,) => {
        try {
            const response = await axios.get(`/api/crawl/results/${id}`);
            const data = response.data.data;

            if (type === 'csv') {
                const csvData = convertToCSV(data);

                // Create a Blob and trigger the download
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `crawl_request_${id}.csv`;
                link.click();
            } else {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

    useEffect(() => {
        fetchCrawlRequests(); // Initial fetch
    
        const interval = setInterval(() => {
          fetchCrawlRequests(); // Ping every 1 second
        }, 1000);
    
        return () => clearInterval(interval); // Cleanup on unmount
      }, []);

    if (loading || error) return <div className='p-24 w-full h-full flex justify-center '>
        <p>🔄 Loading crawl history...</p>
        {error && <p className="text-red-500">{error}</p>}
        </div>
        

    return (
        <>
        <div className="my-10 border p-4 border-gray-200  bg-white rounded-lg shadow-lg w-full justify-center items-center">
            <h1 className="text-2xl font-bold mb-4 text-center">📜 Crawl History</h1>

            {crawlRequests.length === 0 ? (
                <p className="text-center">No crawl requests found.</p>
            ) : (
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200 whitespace-nowrap">
                            <th className="p-2  border ">Name</th>
                            <th className="p-2 border truncate">URL</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Created Date</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crawlRequests.map((request) => (
                            <tr key={request.id} className="text-center">
                                <td className="border p-2 max-w-[100px] truncate overflow-hidden whitespace-nowrap">{request.name}</td>
                                <td className="border p-2 max-w-[300px] overflow-hidden truncate whitespace-nowrap">{request.url}</td>
                                <td className="border p-2">{request.status}</td>
                                <td className="border p-2">{(new Date(request.createdAt).toLocaleString()).slice(0,10)}</td>
                                <td className="border p-2 flex gap-2 justify-center">
                                        <button className="bg-blue-600 text-white px-8 py-4rounded" 
                                        onClick={()=>{

                                            setShowCrawlViewer(true);
                                            setCrawlId(request.id);
                                        }}>👁️ Show</button>

                                    {/* ✅ Download Crawl */}
                                    <button
                                        className="bg-green-600 text-white p-1 rounded"
                                        onClick={() => downloadCrawlRequest(request.id, "json")}
                                    >
                                        📥 Download
                                    </button>
                                    <button
                                        className="bg-green-600 text-white p-1 rounded"
                                        onClick={() => downloadCrawlRequest(request.id, "csv")}
                                    >
                                        📥 Download CSV
                                    </button>

                                    {/* ✅ Delete Crawl */}
                                    <button
                                        className="bg-red-600 text-white p-1 rounded"
                                        onClick={() => deleteCrawlRequest(request.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        {showCrawlViewer && <CrawlViewer id={crawlId} />}
        </>
    );
};

export default CrawlHistory;
