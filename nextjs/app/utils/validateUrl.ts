export const validateUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        return /^https?:\/\//.test(parsedUrl.href); // ✅ Ensure correct protocol
    } catch (_) {
        return false;
    }
};