'use client';

import axios from 'axios';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import CrawlResultModal from './CrawlResultModal'; // Import the new component
import ActionDropdownViewer from './ActionDropDownViewer';


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
        const response = await axios.get<{ crawlResults: CrawlResult[] }>(`/api/crawl/result/${id}`);
        console.log(response.data.crawlResults)
        const results = response.data.crawlResults.map((result) => ({
          ...result,
          data: typeof result.data === 'string' ? JSON.parse(result.data) : result.data, // Handle both stringified and parsed JSON
        }));

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
    console.log(result)
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
      // ✅ Update local state
      const updatedResults = crawlResults.map((result) => {
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

      setCrawlResults(updatedResults);  // Update state instantly for UI feedback
      setEditingCell(null);  // Close the editing mode

      // ✅ Send updated data to the backend (without JSON.stringify)
      try {
        const updatedData = updatedResults.find((r) => r.id === editingCell.id)?.data;
        if (updatedData) {
          await axios.patch(`/api/crawl/result/${editingCell.id}`, {
            data: updatedData,  // Send as object directly
          });
        }
      } catch (error) {
        console.error('❌ Error updating field:', error);
      }
    }
  };

  const handleSaveFromModal = async (updatedData: Record<string, string>) => {
    if (selectedResult) {
      // ✅ Update local state for instant UI feedback
      const updatedResults = crawlResults.map((result) =>
        result.id === selectedResult.id
          ? { ...result, data: updatedData }
          : result
      );

      setCrawlResults(updatedResults);  // Update local state

      // ✅ Send full updated data to the server
      try {
        await axios.patch(`/api/crawl/result/${selectedResult.id}`, {
          data: updatedData,  // Send the object directly
        });
      } catch (error) {
        console.error('❌ Error updating from modal:', error);
      }
    }
  };



  // ✅ Delete an entire column from all records
  const handleDeleteColumn = async (field: string) => {
    // 1️⃣ Remove the field from local state
    const updatedResults = crawlResults.map((result) => {
      const updatedData = { ...result.data };
      delete updatedData[field]; // Remove the specific field from data
      return {
        ...result,
        data: updatedData,
      };
    });

    // 2️⃣ Update local state for UI
    setCrawlResults(updatedResults);
    setHeaders((prev) => prev.filter((header) => header !== field));

    // 3️⃣ Send update requests for affected rows
    try {
      await axios.delete(`/api/crawl/result`, {
        data: { job_id: crawlResults[0].jobId, remove_field: field }, // Send data payload
      });
    } catch (error) {
      console.error("❌ Error deleting column:", error);
    }
  }
  const handleDeleteRow = async (id: string) => {
    try {
      // Optimistically remove row from UI
      setCrawlResults((prevResults) => prevResults.filter((result) => result.id !== id));

      // Send DELETE request to API
      await axios.delete(`/api/crawl/result/${id}`);
    } catch (error) {
      console.error("❌ Error deleting row:", error);
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
