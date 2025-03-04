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
  const [editableData, setEditableData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setEditableData(data); // ✅ Ensure the modal loads with the latest data
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleInputChange = (key: string, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: value, // ✅ Create a new object to trigger re-render
    }));
  };

  const handleSave = () => {
    onSave(editableData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full h-fit max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative 
                      sm:w-full sm:h-full sm:max-h-fit flex flex-col sm:justify-center">
        {Object.keys(editableData).length === 0 ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">📝 Edit Crawl Result</h2>

            <div className="space-y-3 overflow-y-auto max-h-[70vh] sm:max-h-[80vh] px-2">
              {Object.entries(editableData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-gray-600 font-medium capitalize text-sm sm:text-base">{key}</label>
                  {key === "description" || key === "desc" ? (
                    <Textarea
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm sm:text-base"
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="p-2 border border-gray-300 rounded text-sm sm:text-base"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
              >
                ✅ Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
