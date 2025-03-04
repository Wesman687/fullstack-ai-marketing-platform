'use client';

import axios from 'axios';
import { Loader2, Trash2 } from 'lucide-react';
import {  useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ActionDropdownViewer from './ActionDropDownViewer';
import CrawlResultModal from './CrawlResultModal';


interface CrawlViewerProps {
  id: string;
  activeTab: 'crawl' | 'scrape';
}

export interface BaseResult {
  id: string;
  jobId: string;
  userId: string;
  data: Record<string, string>;
  createdAt: string;
  requestId: string;
  status: string;
}

export interface CrawlResult extends BaseResult {
  crawlData: CrawlResult;
}
export interface ScrapedResult extends BaseResult {
  scrapeData: ScrapedResult;
}
export type ResultResponse<T> = {
  results: T[];
};

export default function CrawlViewer({ id, activeTab }: CrawlViewerProps) {
  const [results, setResults] = useState<Array<CrawlResult | ScrapedResult>>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CrawlResult | ScrapedResult | null>(null);

  const headers = useMemo(() => {
    const dynamicKeys = new Set<string>();
    results.forEach((result) => Object.keys(result.data).forEach((key) => dynamicKeys.add(key)));
    return [...dynamicKeys];
  }, [results]);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get<ResultResponse< CrawlResult | ScrapedResult>>(`/api/${activeTab}/results/${id}`);
      setResults(response.data.results);
    } catch (error) {
      console.error('❌ Error fetching crawl request:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);


  const handleView = useCallback( (result: CrawlResult | ScrapedResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  },[])


  // ✅ Handle editing the full data string
  const handleEdit = useCallback((id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditedValue(value);
  },[])

  const handleSaveEdit = useCallback( async () => {
    if (editingCell) {
      // ✅ Update local state
      const updatedResults = results.map((result) => {
        if (result.id === editingCell.id) {
          return {
            ...result,
            data: {
              ...result.data,
              [editingCell.field]: editedValue,  // Update the edited field
            },
          };
        }
        return result;
      });

      setResults(updatedResults);  // Update state instantly for UI feedback
      setEditingCell(null);  // Close the editing mode

      // ✅ Send updated data to the backend (without JSON.stringify)
      try {
        const updatedData = updatedResults.find((r) => r.id === editingCell.id)?.data;
        if (updatedData) {
          await axios.patch(`/api/${activeTab}/results/${editingCell.id}`, {
            data: updatedData,  // Send as object directly
          });
        }
      } catch (error) {
        console.error('❌ Error updating field:', error);
      }
    }
  },[editingCell, results, editedValue, activeTab])

  const handleSaveFromModal = useCallback( async (updatedData: Record<string, string>) => {
    if (selectedResult) {
      // ✅ Update local state for instant UI feedback
      const updatedResults = results.map((result) =>
        result.id === selectedResult.id
          ? { ...result, data: updatedData }
          : result
      );

      setResults(updatedResults);  // Update local state

      // ✅ Send full updated data to the server
      try {
        await axios.patch(`/api/crawl/results/${selectedResult.id}`, {
          data: updatedData,  // Send the object directly
        });
      } catch (error) {
        console.error('❌ Error updating from modal:', error);
      }
    }
  },[results, selectedResult])



  // ✅ Delete an entire column from all records
 const handleDeleteColumn = useCallback(async (field: string) => {
    const updatedResults = results.map((result) => ({
      ...result,
      data: Object.fromEntries(Object.entries(result.data).filter(([key]) => key !== field)),
    }));

    setResults(updatedResults);

    try {
      await axios.delete(`/api/${activeTab}/results`, { data: { job_id: results[0]?.jobId, remove_field: field } });
    } catch (error) {
      console.error("❌ Error deleting column:", error);
    }
  }, [activeTab, results]);

  const handleDeleteRow = useCallback(async (id: string) => {
    setResults((prev) => prev.filter((result) => result.id !== id));

    try {
      await axios.delete(`/api/${activeTab}/results/${id}`);
    } catch (error) {
      console.error("❌ Error deleting row:", error);
    }
  }, [activeTab]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="p-4 shadow-lg max-w-screen-2xl overflow-y-hidden overflow-x-auto rounded-lg">
          {results.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border-b">#</th>
                  {headers.map((key) => (
                    <th key={key} className="p-2 border-b whitespace-nowrap relative group">
                      {key.toUpperCase()}
                      {/* 🗑️ Delete Column Button */}
                      <button
                        onClick={() => handleDeleteColumn(key)}
                        className="ml-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </th>
                  ))}
                  <th className="p-2 border-b whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.id} className="text-center hover:bg-gray-50">
                    <td className="p-2 text-center border-b">{index + 1}</td>
                    {headers.map((header) => (
                      <td key={header} className="p-2 border-b text-center truncate max-w-[150px]">
                        {/* 🔥 Editable Cell */}
                        {editingCell?.id === result.id && editingCell.field === header ? (
                          <Input
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            autoFocus
                            className="text-center items-center"
                          />
                        ) : (
                          <div
                            className={cn(
                              header === 'description' && 'relative group',
                              'flex items-center justify-center h-full w-full'
                            )}
                          >
                            {/* 🔍 Hover Tooltip for Description */}
                            <span
                              className={cn(
                                header === 'description'
                                  ? 'truncate max-w-[100px] cursor-pointer group-hover:underline'
                                  : 'text-center w-full'
                              )}
                              title={result.data[header] || 'N/A'}
                              onClick={() => handleEdit(result.id, header, result.data[header] || '')}
                            >
                              {result.data[header] || 'N/A'}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-2 border-b">
                      <ActionDropdownViewer
                        onView={() => handleView(result)}
                        onDelete={() => handleDeleteRow(result.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No crawl results found.</p>
          )}
        </div>
      )}
      <CrawlResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedResult?.data || {}}
        onSave={handleSaveFromModal}
      />

    </>
  );
}
