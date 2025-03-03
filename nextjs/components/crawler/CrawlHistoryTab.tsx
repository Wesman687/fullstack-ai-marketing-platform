import React, { useState } from 'react'
import CrawlHistory from './CrawlHistory';
import { CrawlConfigInterface } from './ScraperForm';
import CrawlViewer from './CrawlViewer';

interface CrawlHistoryTabInterface {
        crawlConfig: CrawlConfigInterface;
      setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
      handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  
      isScraper: boolean;
}

export default function CrawlHistoryTab({crawlConfig, setCrawlConfig, handleUrlChange, isScraper}: CrawlHistoryTabInterface) {
  const [activeTab, setActiveTab] = useState<'crawler' | 'browser'>(isScraper ? "browser" : "crawler");
  const [showCrawlViewer, setShowCrawlViewer] = useState(false);
  const [crawlId, setCrawlId] = useState<string>('');
  
    return (
        <>
      <div className="my-10 max-h-[40vh] overflow-scroll overflow-x-hidden border p-4 border-gray-200 bg-white rounded-lg shadow-lg w-full">
        <div className="flex border-b">
          <button
            className={`p-3 flex-1 text-center ${
              activeTab === 'crawler' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('crawler')}
          >
            📜  Crawl History
          </button>
          <button
            className={`p-3 flex-1 text-center ${
              activeTab === 'browser' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('browser')}
          >
            📜  Scraper History
          </button>
  
  
      </div>
        <>
        {activeTab === 'crawler' ? <CrawlHistory mode="crawl" crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} handleUrlChange={handleUrlChange} setCrawlId={setCrawlId} setShowCrawlViewer={setShowCrawlViewer} crawlId={crawlId}  /> 
        : <CrawlHistory mode="scrape" crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} handleUrlChange={handleUrlChange} setCrawlId={setCrawlId} setShowCrawlViewer={setShowCrawlViewer} crawlId={crawlId} />}</>

        </div>
        {showCrawlViewer && <CrawlViewer id={crawlId} />}

        </>
    );
  }