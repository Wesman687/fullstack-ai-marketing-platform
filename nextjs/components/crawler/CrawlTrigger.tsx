'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function DynamicCrawler() {
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState([{ field: '', selector: '' }]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [data, setData] = useState([]);


  const handleAddSelector = () => {
    setSelectors([...selectors, { field: '', selector: '' }]);
  };

  const handleCrawl = async () => {
    setIsCrawling(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/dynamic-crawl`,
        {
          url,
          selectors,
        },
        { timeout: 600000 } // 10 min timeout
      );

      if (response.status === 200) {
        setData(response.data.data);
      } else {
        console.error('Crawl failed:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Crawler Error:', error);
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h1 className="text-xl font-bold mb-4">Dynamic Crawler</h1>

      {/* Input for URL */}
      <input
        type="text"
        placeholder="Enter the website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 rounded border mb-4"
      />

      {/* Input for Selectors */}
      {selectors.map((selector, index) => (
        <div key={index} className="flex mb-2 gap-2">
          <input
            type="text"
            placeholder="Data Field (e.g., price)"
            value={selector.field}
            onChange={(e) =>
              setSelectors(
                selectors.map((sel, i) =>
                  i === index ? { ...sel, field: e.target.value } : sel
                )
              )
            }
            className="flex-1 p-2 rounded border"
          />
          <input
            type="text"
            placeholder="CSS Selector (e.g., .price)"
            value={selector.selector}
            onChange={(e) =>
              setSelectors(
                selectors.map((sel, i) =>
                  i === index ? { ...sel, selector: e.target.value } : sel
                )
              )
            }
            className="flex-1 p-2 rounded border"
          />
        </div>
      ))}

      {/* Add more selectors */}
      <button
        onClick={handleAddSelector}
        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
      >
        Add More Fields
      </button>

      {/* Start Crawler */}
      <button
        onClick={handleCrawl}
        disabled={isCrawling}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        {isCrawling ? 'Crawling...' : 'Start Crawl'}
      </button>

      {/* Display Results */}
      {data.length > 0 && (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="p-2 border-b">
                  {key.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, i) => (
                  <td key={i} className="p-2 border-b">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
