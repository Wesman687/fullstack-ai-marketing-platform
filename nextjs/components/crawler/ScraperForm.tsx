'use client';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import PaginationSettings, { PaginationMethods } from './PaginationSettings';
import BulkUrl from './scraperInput/BulkUrl';
import ScraperUrlInput from './scraperInput/ScraperUrlInput';
import toast from 'react-hot-toast';
import CrawlHistoryTab from './CrawlHistoryTab';
import CookieManager from './CookieManager';
import ScraperFields from './scraperInput/ScraperFields';

interface ScraperFormProps {
    mode: 'crawl' | 'scrape';
}
export interface PaginationInterface {
    [key: string]: {
        name: string;
        desc: string;
    }
}
export interface CookieInterface {
    name: string;
    value: string;
    domain: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    expires?: number;
}
export interface CrawlConfigInterface {
    urls: string[];
    name: string;
    customSelector: string;
    tag: string;
    fields: string[];
    sheetId: string;
    paginationMethod: keyof PaginationInterface;
    url: string;
    pages: number;
    cookies?: CookieInterface[];
}

export default function ScraperForm({ mode }: ScraperFormProps) {
    const isScraper = mode === 'scrape';
    const [isClient, setIsClient] = useState(false);
    const [crawlConfig, setCrawlConfig] = useState({
        urls: [''], // Multiple URLs for Scrape, Single for Crawl
        name: '',
        customSelector: '',
        tag: '',
        fields: [] as string[],
        sheetId: '',
        paginationMethod: 'NO_PAGINATION' as keyof PaginationInterface,
        url: '',
        pages: 5,
        cookies: [] as CookieInterface[],
    } as CrawlConfigInterface);
    const [typing, setTyping] = useState(false);
    const [tempUrl, setTempUrl] = useState(''); // Temporary URL while typing
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [cooldown, setCooldown] = useState(false);

    const fetchUserId = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/user');
            setUserId(data.userId);
        } catch (error) {
            console.error('❌ Error fetching user ID:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    // ✅ Fetch User ID
    useEffect(() => {
        setLoading(true);
        fetchUserId().then(() => setIsClient(true)); // ✅ Wait for fetchUserId() before setting client state
    }, [fetchUserId]);

    const startScrape = useCallback(async () => {
    }, []);
    const startCrawl = useCallback(async () => {
        const payload = {
            ...crawlConfig,
            userId,
        }
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API}/crawl/start`, payload);
            toast.success(`${mode === 'crawl' ? 'Crawling' : 'Scraping'} started! Data will be available soon.`);
        } catch (error) {
            console.error(`❌ ${mode} failed:`, error);
            toast.error(`${mode} request failed.`);
        } finally {
            setIsProcessing(false);
        }
        setIsProcessing(false);
    }, [crawlConfig, userId, mode]);
    const validateCrawlConfig = useCallback(() => {
        if (!crawlConfig.url.trim()) {
            toast.error('❌ URL is required.');
            return false;
        }
        if (!crawlConfig.name.trim()) {
            toast.error('❌ Name is required.');
            return false;
        }
        if (!crawlConfig.tag.trim()) {
            toast.error('❌ Tag is required.');
            return false;
        }
        if (crawlConfig.fields.length === 0) {
            toast.error('❌ At least one field must be selected.');
            return false;
        }
        return true;
    }, [crawlConfig]);
    const processingTimeOut =  useCallback(() => {
        if (!validateCrawlConfig()) return;

        if (cooldown) {
            toast.error('⏳ Please wait before starting another crawl.');
            return;
        }

        if (!userId) {
            toast.error('❌ User ID not found. Please refresh the page.');
            return;
        }

        setIsProcessing(true);
        setCooldown(true); // Prevent spamming

        if (mode === "crawl") startCrawl();
        else startScrape();

        // ⏳ Set cooldown timer (10 seconds)
        setTimeout(() => setCooldown(false), 10000);
    }, [validateCrawlConfig, cooldown, userId, mode, startCrawl, startScrape]);


    // ✅ Clear Data
    const clearData = () => {
        setIsProcessing(false);
        setCrawlConfig({
            urls: [''],
            name: '',
            customSelector: '',
            tag: '',
            fields: [],
            sheetId: '',
            paginationMethod: PaginationMethods.NO_PAGINATION.name as keyof PaginationInterface,
            url: '',
            pages: 5,
        })
    };
    const handleInputChange = useCallback((key: keyof CrawlConfigInterface, value: string) => {
        setCrawlConfig((prev) => ({ ...prev, [key]: value }));
    }, []);
    const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempUrl(e.target.value);
        setTyping(true);
    }, []);

    return isClient ? (
        <>
            <div className="p-4 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
                {!isScraper && <PaginationSettings crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} />}
                <h1 className="text-xl font-bold">{isScraper ? '🖥️ Browser Scraper' : '🌐 Smart Web Crawler'}</h1>
                <ScraperUrlInput setCrawlConfig={setCrawlConfig} typing={typing} setTyping={setTyping} tempUrl={tempUrl} handleUrlChange={handleUrlChange} />

                {mode === "scrape" && (<BulkUrl crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} />)}
                <input
                    type="text"
                    placeholder={`Enter ${mode} Name (Optional)`}
                    value={crawlConfig.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />
                <input
                    type="text"
                    placeholder="Google Sheet ID (Premium Feature)"
                    value={crawlConfig.sheetId}
                    onChange={(e) => handleInputChange('sheetId', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🔹 Custom Selector & Pagination */}
                <input
                    type="text"
                    placeholder="Custom CSS Selector (optional)"
                    value={crawlConfig.customSelector}
                    onChange={(e) => handleInputChange('customSelector', e.target.value)}
                    className="border rounded p-2 w-full mt-3"
                />

                {/* 🎯 Selectors Input */}
                <div className="flex items-center mt-3 mb-4">
                    <input
                        type="text"
                        placeholder="Item You are Selecting ..(eg: Venue, Shoes, Book)"
                        value={crawlConfig.tag}
                        onChange={(e) => handleInputChange('tag', e.target.value)}
                        className="border rounded p-2 flex-grow"
                    />
                </div>
                <ScraperFields crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} />
                <CookieManager crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} />

                <div className="flex justify-center gap-6 mt-4">
                    <button
                        onClick={processingTimeOut}
                        className="bg-blue-600 text-white px-3 py-2 rounded transition duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95"
                        disabled={isProcessing}
                    >
                        {isProcessing ? `${isScraper ? 'Scraping...' : 'Crawling...'} 🔄` : `Start ${isScraper ? 'Scraping' : 'Crawling'} 🚀`}
                    </button>

                    <button
                        onClick={clearData}
                        className="bg-red-500 text-white px-16 py-2 rounded transition duration-300 hover:bg-red-600 hover:scale-105 active:scale-95"
                    >
                        🗑 Clear
                    </button>
                </div>

            </div>
            {!loading && <CrawlHistoryTab crawlConfig={crawlConfig} setCrawlConfig={setCrawlConfig} handleUrlChange={handleUrlChange} isScraper={isScraper} />
            }
        </>
    ) : null
}
