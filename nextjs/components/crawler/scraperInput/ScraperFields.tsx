import React, { useState, useCallback, useMemo } from 'react';
import { CrawlConfigInterface } from '../ScraperForm';

interface ScraperFieldsProps {
    crawlConfig: CrawlConfigInterface;
    setCrawlConfig: React.Dispatch<React.SetStateAction<CrawlConfigInterface>>;
}

function ScraperFields({ crawlConfig, setCrawlConfig }: ScraperFieldsProps) {
    const [isBulkInputOpen, setIsBulkInputOpen] = useState(false);
    const [newField, setNewField] = useState('');
    const [bulkInput, setBulkInput] = useState('');

    // ✅ Bulk Add Fields
    const addBulkFields = useCallback(() => {
        const parsedFields = bulkInput
            .split(/[\n,]+/) // Split by newline or comma
            .map((field: string) => field.trim())
            .filter((field: string) => field !== '');

        setCrawlConfig((prev) => {
            const updatedFields = [...new Set([...prev.fields, ...parsedFields])]; // Ensure unique fields
            return prev.fields.length !== updatedFields.length ? { ...prev, fields: updatedFields } : prev;
        });

        setBulkInput('');
        setIsBulkInputOpen(false);
    }, [bulkInput, setCrawlConfig]);

    const addField = useCallback(() => {
        if (newField.trim() !== '') {
            setCrawlConfig((prev) => {
                if (!prev.fields.includes(newField.trim())) {
                    return { ...prev, fields: [...prev.fields, newField.trim()] };
                }
                return prev;
            });
            setNewField('');
        }
    }, [newField, setCrawlConfig]);

    // ✅ Remove Field
    const removeField = useCallback((index: number) => {
        setCrawlConfig((prev) => {
            const updatedFields = prev.fields.filter((_, i) => i !== index);
            return prev.fields.length !== updatedFields.length ? { ...prev, fields: updatedFields } : prev;
        });
    }, [setCrawlConfig]);

    // ✅ Memoize fields to prevent unnecessary re-renders
    const memoizedFields = useMemo(() => crawlConfig.fields, [crawlConfig.fields]);


    return (
        <>
            {/* Add Fields */}
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Add field (e.g., name)"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    className="border rounded p-2 flex-grow"
                />
                <button onClick={addField} className="bg-green-600 text-2xl px-4 py-1 text-white rounded">
                    +
                </button>
                <button onClick={() => setIsBulkInputOpen((prev) => !prev)} className="bg-blue-500 text-white px-4 py-2 rounded">
                    📋 Bulk Add
                </button>
            </div>

            {/* Bulk Add Fields */}
            {isBulkInputOpen && (
                <div className="mb-4">
                    <textarea
                        placeholder="Paste fields (comma or newline separated)"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        className="border rounded p-2 w-full h-24"
                    />
                    <button onClick={addBulkFields} className="mt-2 bg-blue-600 text-white p-2 rounded w-full">
                        Add Fields from List ➡️
                    </button>
                </div>
            )}

            {memoizedFields.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow max-h-48 overflow-y-auto">
                    <h2 className="text-lg font-medium mb-2">📋 Selected Fields:</h2>
                    <ul className="list-disc pl-5">
                        {memoizedFields.map((field, index) => (
                            <li key={`${field}-${index}`} className="flex justify-between items-center mb-1">
                                <span>{field}</span>
                                <button onClick={() => removeField(index)} className="text-red-500 hover:text-red-700">
                                    ❌
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

export default React.memo(ScraperFields);
