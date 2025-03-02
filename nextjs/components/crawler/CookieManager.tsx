import { useState } from "react";
import toast from "react-hot-toast";
import { CrawlConfigInterface } from "./ScraperForm";

interface CookieManagerProps {
    crawlConfig: CrawlConfigInterface;
    setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
}

export default function CookieManager({ crawlConfig, setCrawlConfig }: CookieManagerProps) {
    const [cookieOpen, setCookieOpen] = useState(false);
    const [cookiesAdded, setCookiesAdded] = useState(false);

    function handleCookieChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        try {
            const parsedCookies = JSON.parse(event.target.value);
            setCrawlConfig({ ...crawlConfig, cookies: parsedCookies });
        } catch (error) {
            toast.error("Invalid JSON format for cookies!");
            console.error("❌ Invalid JSON format for cookies:", error);
        }
    }

    function handleSubmit() {
        setCookiesAdded(true);
        setCookieOpen(false);
        alert("Cookies saved successfully!");
    }

    return (
        <>
        
        {!cookieOpen ? (
                <div
                    className="flex items-center justify-center w-full my-4 cursor-pointer text-gray-600 font-semibold text-lg hover:text-blue-600 transition-all"
                    onClick={() => setCookieOpen(true)}
                >
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-4">{cookiesAdded ? "Change Cookies" : "Add Cookies"}</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
            ) :
        <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md ">
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
                {cookiesAdded ? "Change Cookies" : "Add Cookies"}
            </h2>

            <textarea
                placeholder="Paste cookies as JSON here..."
                onChange={handleCookieChange}
                value={crawlConfig.cookies ? JSON.stringify(crawlConfig.cookies, null, 2) : ""}
                rows={5}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            {/* Button Group */}
            <div className="flex justify-between mt-4">
                <button
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded-lg transition-all"
                    onClick={handleSubmit}
                >
                    Save Cookies
                </button>
                <button
                    className="bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white rounded-lg transition-all"
                    onClick={() => setCookieOpen(false)}
                >
                    Cancel
                </button>
            </div>
        </div>}
        </>
    );
}
