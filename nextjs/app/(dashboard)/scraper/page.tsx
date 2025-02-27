'use client';
import ScraperForm from '@/components/crawler/ScraperForm';
import React, { useState } from 'react';
export default function ScraperTab() {
  const [activeTab, setActiveTab] = useState<'crawler' | 'browser'>('crawler');

  return (
    <>
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 🔹 Tab Selector */}
      <div className="flex border-b">
        <button
          className={`p-3 flex-1 text-center ${
            activeTab === 'crawler' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('crawler')}
        >
          🌐 Smart Web Crawler
        </button>
        <button
          className={`p-3 flex-1 text-center ${
            activeTab === 'browser' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('browser')}
        >
          🖥️ Browser Scraper
        </button>
      </div>


    </div>
      <>{activeTab === 'crawler' ? <ScraperForm mode="crawl" /> : <ScraperForm mode="scrape" />}</>
      </>
  );
}
