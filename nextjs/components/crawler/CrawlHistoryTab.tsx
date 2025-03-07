import React, {  useEffect, useState } from 'react'
import CrawlHistory from './CrawlHistory';
import { CrawlConfigInterface } from './ScraperForm';
import CrawlViewer from './CrawlViewer';

interface CrawlHistoryTabInterface {
      crawlConfig: CrawlConfigInterface;
      setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
      handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  
      mode: 'crawl' | 'scrape';
}

export default function CrawlHistoryTab({crawlConfig, setCrawlConfig, handleUrlChange, mode}: CrawlHistoryTabInterface) {
  const [activeTab, setActiveTab] = useState<'crawl' | 'scrape'>(mode);
  const [showCrawlViewer, setShowCrawlViewer] = useState(false);
  const [crawlId, setCrawlId] = useState<string>('');
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);
    return (
        <>
      <div className="my-10 max-h-[60vh] overflow-scroll overflow-x-hidden border p-4 border-gray-200 bg-white rounded-lg shadow-lg w-full">
        <div className="flex border-b">
          <button
            className={`p-3 flex-1 text-center ${
              activeTab === 'crawl' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('crawl')}
          >
            📜  Crawl History
          </button>
          <button
            className={`p-3 flex-1 text-center ${
              activeTab === 'scrape' ? 'border-b-4 border-blue-500 font-bold' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('scrape')}
          >
            📜  Scraper History
          </button> 
      </div>
        <>
         <CrawlHistory mode={activeTab} crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} handleUrlChange={handleUrlChange} setCrawlId={setCrawlId} setShowCrawlViewer={setShowCrawlViewer} crawlId={crawlId}  /> 
        </>

        </div>
        {showCrawlViewer && <CrawlViewer id={crawlId} activeTab={activeTab} />}
        </>
    );
  }