'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface ActionDropdownViewerProps {
  onView: () => void;
  onDelete: () => void;
}

const ActionDropdownViewer = ({ onView, onDelete }: ActionDropdownViewerProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="p-1 bg-gray-100 rounded hover:bg-gray-200">
        <MoreVertical size={18} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="rounded-lg shadow-lg bg-white p-2 cursor-pointer">
        <DropdownMenu.Item className="px-3 py-1 hover:bg-gray-100 rounded" onSelect={onView}>
          👁️ View
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-3 py-1 text-red-500 hover:bg-red-100 rounded" onSelect={onDelete}>
          🗑️ Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ActionDropdownViewer;
