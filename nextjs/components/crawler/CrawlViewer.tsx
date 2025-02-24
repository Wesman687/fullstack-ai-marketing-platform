'use client';

import axios from 'axios';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import CrawlResultModal from './CrawlResultModal'; // Import the new component


interface CrawlViewerProps {
  id: string;
}

interface CrawlResult {
  id: string;
  jobId: string;
  userId: string;
  data: Record<string, string>;
  createdAt: string;
}

export default function CrawlViewer({ id }: CrawlViewerProps) {
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CrawlResult | null>(null);


  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/crawl/result/${id}`);
        const results: CrawlResult[] = response.data.crawlResults;

        if (results.length > 0) {
          const dynamicKeys = new Set<string>();
          results.forEach((result) => {
            Object.keys(result.data).forEach((key) => dynamicKeys.add(key));
          });

          setHeaders([...dynamicKeys]);
        }

        setCrawlResults(results);
      } catch (error) {
        console.error('❌ Error fetching crawl request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  const handleView = (result: CrawlResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };


  // ✅ Handle editing the full data string
  const handleEdit = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditedValue(value);
  };

  const handleSaveEdit = async () => {
    if (editingCell) {
      const updatedResults = crawlResults.map((result) => {
        if (result.id === editingCell.id) {
          return {
            ...result,
            data: {
              ...result.data,
              [editingCell.field]: editedValue,
            },
          };
        }
        return result;
      });

      setCrawlResults(updatedResults);
      setEditingCell(null);

      // Send the updated full data object as a string
      try {
        const updatedData = updatedResults.find((r) => r.id === editingCell.id)?.data;
        if (updatedData) {
          await axios.patch(`/api/crawl/result/${editingCell.id}`, {
            data: JSON.stringify(updatedData),
          });
        }
      } catch (error) {
        console.error('❌ Error updating field:', error);
      }
    }
  };
  const handleSaveFromModal = async (updatedData: Record<string, string>) => {
    if (selectedResult) {
      const updatedResults = crawlResults.map((result) =>
        result.id === selectedResult.id
          ? { ...result, data: updatedData }
          : result
      );

      setCrawlResults(updatedResults);

      // Send full updated data to the server
      try {
        await axios.patch(`/api/crawl/result/${selectedResult.id}`, {
          data: JSON.stringify(updatedData),
        });
      } catch (error) {
        console.error('❌ Error updating from modal:', error);
      }
    }
  };


  // ✅ Delete an entire column from all records
  const handleDeleteColumn = async (field: string) => {
    const updatedResults = crawlResults.map((result) => {
      const updatedData = { ...result.data };
      delete updatedData[field];
      return { ...result, data: updatedData };
    });

    setCrawlResults(updatedResults);
    setHeaders((prev) => prev.filter((header) => header !== field));

    // Send update requests for all rows
    try {
      await Promise.all(
        updatedResults.map((result) =>
          axios.patch(`/api/crawl/result/${result.id}`, {
            data: JSON.stringify(result.data),
          })
        )
      );
    } catch (error) {
      console.error('❌ Error deleting column:', error);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-lg">
          {crawlResults.length > 0 ? (
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
                {crawlResults.map((result, index) => (
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
                      <button
                        onClick={() => handleView(result)}
                        className="bg-blue-600 text-white p-1 rounded"
                      >
                        🔍 View
                      </button>

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
