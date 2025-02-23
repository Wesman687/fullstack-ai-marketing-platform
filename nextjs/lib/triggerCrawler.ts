import axios from 'axios';
export interface CrawlerResponse {
    baseUrl: string;
    cssSelector: string;
    requiredKeys: string[];
}

export async function triggerCrawler(baseUrl: string, cssSelector: string, requiredKeys: string[]) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_CRAWLER_API_URL}`, {
      base_url: baseUrl,
      css_selector: cssSelector,
      required_keys: requiredKeys,
    });

    if (response.status === 200) {
      // File download link (if CSV is returned)
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'crawl_results.csv';
      link.click();
    } else {
      console.log('No data found or an issue occurred.');
    }
  } catch (error) {
    console.error('❌ Crawler failed:', error);
  }
}
