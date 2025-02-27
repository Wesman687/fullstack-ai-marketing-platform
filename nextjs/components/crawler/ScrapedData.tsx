'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ScrapedData {
  id: string;
  data: any;
  created_at: string;
}

export default function ScrapedDataPage() {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [selectors, setSelectors] = useState<string[]>([]);
  const [newSelector, setNewSelector] = useState<string>('');
  const [isScraping, setIsScraping] = useState<boolean>(false);

  useEffect(() => {
    fetchScrapedData();
  }, []);

  // ✅ Fetch Scraped Data
  const fetchScrapedData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/scrape/requests`);
      setScrapedData(response.data);
    } catch (error) {
      console.error('❌ Error fetching scraped data:', error);
      toast.error('Failed to load scraped data.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit Scrape Request
  const startScraping = async () => {
    if (!url || selectors.length === 0) {
      toast.error('Please enter a URL and at least one selector.');
      return;
    }

    setIsScraping(true);
    try {
      const payload = { url, selectors };
      await axios.post(`${process.env.NEXT_PUBLIC_API}/scrape/browser`, payload);
      toast.success('Scraping started! Data will be available soon.');
    } catch (error) {
      console.error('❌ Scraping failed:', error);
      toast.error('Scraping request failed.');
    } finally {
      setIsScraping(false);
      fetchScrapedData();
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">🔍 Scrape Data</h1>

      {/* 🔗 Enter URL */}
      <input
        type="text"
        placeholder="Enter URL to scrape..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded p-2 w-full mt-3"
      />

      {/* 🎯 Selectors Input */}
      <div className="flex items-center mt-3">
        <input
          type="text"
          placeholder="CSS Selector (e.g., .title)"
          value={newSelector}
          onChange={(e) => setNewSelector(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button onClick={() => {
          if (newSelector) {
            setSelectors([...selectors, newSelector]);
            setNewSelector('');
          }
        }} className="bg-green-500 text-white px-4 py-2 ml-2 rounded">
          ➕ Add
        </button>
      </div>

      {/* List of Selectors */}
      <ul className="mt-3">
        {selectors.map((selector, index) => (
          <li key={index} className="flex justify-between bg-gray-100 p-2 rounded">
            {selector}
            <button onClick={() => setSelectors(selectors.filter((_, i) => i !== index))}
              className="text-red-500">❌</button>
          </li>
        ))}
      </ul>

      {/* 🚀 Scrape Button */}
      <button
        onClick={startScraping}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4"
        disabled={isScraping}
      >
        {isScraping ? 'Scraping... 🔄' : 'Start Scraping 🚀'}
      </button>

      {/* 📜 Scraped Data */}
      <h2 className="text-lg font-semibold mt-6">📜 Scraped Data</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {scrapedData.length > 0 ? scrapedData.map((item) => (
            <li key={item.id} className="border p-2 rounded mb-2">
              <strong>{new Date(item.created_at).toLocaleString()}</strong>
              <pre className="bg-gray-100 p-2 mt-1 rounded">{JSON.stringify(item.data, null, 2)}</pre>
            </li>
          )): <p className="text-center">No crawl requests found.</p> }
        </ul>
      )}
    </div>
  );
}
