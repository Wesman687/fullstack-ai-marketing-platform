export const validateUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        return /^https?:\/\//.test(parsedUrl.href); // ✅ Ensure correct protocol
    } catch (error) {
        console.error('❌ Invalid URL:', error);
        return false;
    }
};