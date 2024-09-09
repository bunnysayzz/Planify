import React, { useState, useEffect, useRef } from 'react';
import { FaPencilAlt, FaTrash, FaChevronDown, FaCalendarAlt } from 'react-icons/fa';
import { useDrag } from 'react-dnd';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    date: string;
    priority: string;  // Add priority here
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onChangeStatus: (id: string, status: string) => Promise<void>;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onChangeStatus }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'TASK_CARD',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleStatusChange = async (status: string) => {
    await onChangeStatus(task.id, status);
    setDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-orange-100 text-orange-500';
      case 'Medium':
        return 'bg-red-100 text-red-500';
      case 'Low':
        return 'bg-blue-100 text-blue-500'; // Changed low priority color
      default:
        return '';
    }
  };

  const statusBorderColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'border-l-4 border-purple-500';
      case 'IN PROGRESS':
        return 'border-l-4 border-yellow-500';
      case 'COMPLETED':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(task.id);
    }
  };
  return (
    <div ref={dragRef} className={`bg-white rounded-lg shadow-md p-4 mb-4 relative border border-gray-200 flex flex-col justify-between ${isDragging ? 'opacity-50' : ''} ${statusBorderColor(task.status)}`}>
      <div className={`absolute top-2 left-2 text-xs font-semibold ${priorityColor(task.priority)} rounded-full px-2 py-1`}>
        {task.priority}
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-600"></p>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span><h3 className="text-lg font-bold mb-2">{task.title}</h3></span>
        <div className="relative" ref={dropdownRef}>
          <button onClick={handleDropdownToggle} className="text-gray-500 hover:text-gray-700">
            <FaChevronDown className="h-5 w-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
              <div className="px-4 py-2 text-gray-700">Change Status</div>
              <div className="border-t border-gray-200"></div>
              <button onClick={() => handleStatusChange('TODO')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">TODO</button>
              <button onClick={() => handleStatusChange('IN PROGRESS')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">IN PROGRESS</button>
              <button onClick={() => handleStatusChange('COMPLETED')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">COMPLETED</button>
            </div>
          )}
        </div>
      </div>
      <p className={`text-sm text-gray-600 mb-4 ${task.description ? 'mb-4' : 'mb-0'}`}>{task.description}</p>
      <hr className="my-4 border-t border-gray-200 w-full" />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-sm text-gray-500">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          <span className="text-gray-500">{new Date(task.date).toLocaleDateString('en-GB')}</span>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(task.id)} className="text-gray-500 hover:text-gray-700">
            <FaPencilAlt className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="text-gray-500 hover:text-gray-700">
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;