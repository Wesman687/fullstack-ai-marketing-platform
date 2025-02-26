// components/ActionDropdown.tsx
'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface ActionDropdownProps {
  onView: () => void;
  onDownloadJSON: () => void;
  onDownloadCSV: () => void;
  onResend: () => void;
  onDelete: () => void;
  onReload: () => void;
}

const ActionDropdown = ({ onView, onDownloadJSON, onDownloadCSV, onResend, onDelete, onReload }: ActionDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="p-1 bg-gray-100 rounded hover:bg-gray-200">
        <MoreVertical size={18} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="rounded-lg shadow-lg bg-white p-2 cursor-pointer">
        <DropdownMenu.Item className="px-3 py-1 hover:bg-gray-100 rounded" onSelect={onView}>
          👁️ View
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 hover:bg-gray-100 rounded" onSelect={onDownloadJSON}>
          📥 Download JSON
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 hover:bg-gray-100 rounded" onSelect={onDownloadCSV}>
          📥 Download CSV
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 hover:bg-gray-100 rounded" onSelect={onResend}>
          🔄 Resend
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 text-red-500 hover:bg-red-100 rounded" onSelect={onDelete}>
          🗑️ Delete
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 text-blue-500 hover:bg-red-100 rounded" onSelect={onReload}>
           Reload Data
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ActionDropdown;
