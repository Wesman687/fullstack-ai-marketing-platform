'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CrawlHistory from './CrawlHistory';
import toast from 'react-hot-toast';

const SmartWebCrawler = () => {
  const [url, setUrl] = useState('');
  const [tag, setTag] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [newField, setNewField] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkInputOpen, setIsBulkInputOpen] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [nameOfCrawl, setNameOfCrawl] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Add Field
  const addField = () => {
    if (newField.trim() !== '') {
      setFields((prevFields) => [...prevFields, newField.trim()]);
      setNewField('');
    }
  };

  // ✅ Remove Field
  const removeField = (index: number) => {
    setFields((prevFields) => prevFields.filter((_, i) => i !== index));
  };

  // ✅ Clear All Inputs
  const clearForm = () => {
    setUrl('');
    setTag('');
    setFields([]);
    setNewField('');
    setIsCrawling(false);
  };
  const addBulkFields = () => {
    const parsedFields = bulkInput
      .split(/[\n,]+/) // Split by newline or comma
      .map((field: string) => field.trim())
      .filter((field: string) => field !== '');

    setFields((prevFields) => [...new Set([...prevFields, ...parsedFields])]);
    setBulkInput('');
    setIsBulkInputOpen(false);
  };

  // ✅ Crawl Data
  const crawlData = async () => {
    if (!url || !tag || fields.length === 0) {
      console.error('❌ URL, Tag, and at least one field are required.');
      return;
    }

    const payload = {
      userId,
      name: nameOfCrawl,
      url,
      tag,
      selectors: [
        {          
          fields,
        },
      ],
    };

    console.log('📦 Sending Payload:', payload);
    setIsCrawling(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/start-crawl`,
        payload,
        { timeout: 300000 } // ⏳ Set timeout to 5 minutes for crawling
      );

      toast.success('Crawling, Data will be ready shortly.')
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to crawl data. Please try again.');
      if (axios.isAxiosError(error) && error.response) {
        console.error(`API Error (${error.response.status}):`, error.response.data);
      } else {
        console.error('Unknown error occurred.');
      }
    } finally {
      setIsCrawling(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/user');
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } 
      finally {
        setLoading(false);
      }
    };
    fetchData();
},[])

  return (
    <>
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">🌐 Smart Web Crawler</h1>

      {/* URL Input */}
      <input
        type="text"
        placeholder="Enter the URL to crawl"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {/* Tag Input */}
      <input
        type="text"
        placeholder="Enter the title of the Crawl"
        value={nameOfCrawl}
        onChange={(e) => setNameOfCrawl(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {/* Tag Input */}
      <input
        type="text"
        placeholder="Enter the tag (e.g., venue, article)"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {/* Add Fields */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Add field (e.g., name)"
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button
          onClick={addField}
          className="bg-green-600 text-white p-2 rounded"
        >
          ➕
        </button>
        <button
          onClick={() => setIsBulkInputOpen(!isBulkInputOpen)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          📋 Bulk Add
        </button>
      </div>

      {/* Bulk Add Fields */}
      {isBulkInputOpen && (
        <div className="mb-4">
          <textarea
            placeholder="Paste fields (comma or newline separated)"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            className="border rounded p-2 w-full h-24"
          />
          <button
            onClick={addBulkFields}
            className="mt-2 bg-blue-600 text-white p-2 rounded w-full"
          >
            Add Fields from List ➡️
          </button>
        </div>
      )}


      {/* Display Fields */}
      {fields.length > 0 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">📋 Selected Fields:</h2>
          <ul className="list-disc pl-5">
            {fields.map((field, index) => (
              <li key={index} className="flex justify-between items-center mb-1">
                <span>{field}</span>
                <button
                  onClick={() => removeField(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={crawlData}
          disabled={isCrawling}
          className={`flex-1 p-2 rounded ${
            isCrawling ? 'bg-gray-400' : 'bg-blue-600 text-white'
          }`}
        >
          {isCrawling ? 'Crawling... 🔄' : 'Start Crawling 🚀'}
        </button>
        <button
          onClick={clearForm}
          disabled={isCrawling}
          className="flex-1 bg-red-500 text-white p-2 rounded"
        >
          Clear ❌
        </button>
      </div>

    </div>
    
      {!loading && <CrawlHistory />}
    </>
  );
};

export default SmartWebCrawler;
