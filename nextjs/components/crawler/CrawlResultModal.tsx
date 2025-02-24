'use client';

import { Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Textarea } from '@headlessui/react';

interface CrawlResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, string>;
  onSave: (updatedData: Record<string, string>) => void;
}

export default function CrawlResultModal({
  isOpen,
  onClose,
  data,
  onSave,
}: CrawlResultModalProps) {
  const [editableData, setEditableData] = useState(data);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    setEditableData(data);
    setLoading(false);
  }, [data]);

  if (!isOpen) return null;

  const handleInputChange = (key: string, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave(editableData);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {loading ? <div><Loader2 /></div> : <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-red-600">
          <X size={20} />
        </button>

        {/* Content */}
        <h2 className="text-xl font-bold mb-4">📝 Edit Crawl Result</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-600 font-medium capitalize">{key}</label>
              {key === "description" || key === "desc" ? 
              <Textarea               
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="p-2 border border-gray-300 rounded"
              />:
              <Input
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="p-2 border border-gray-300 rounded"
              />}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✅ Save Changes
          </button>
        </div>
      </div>}
    </div>
  );
}
