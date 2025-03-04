'use client';
import ScraperForm from '@/components/crawler/ScraperForm';
import React, { useState } from 'react';
export default function ScraperTab() {
  const [activeTab, setActiveTab] = useState<'crawl' | 'scrape'>('crawl');

  return (
    <>
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 🔹 Tab Selector */}
      <div className="flex border-b">
        <button
          className={`p-3 flex-1 text-center ${
            activeTab === 'crawl' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('crawl')}
        >
          🌐 Smart Web Crawler
        </button>
        <button
          className={`p-3 flex-1 text-center ${
            activeTab === 'scrape' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('scrape')}
        >
          🖥️ Browser Scraper
        </button>
      </div>


    </div>
      <ScraperForm mode={activeTab} /> 
      </>
  );
}
