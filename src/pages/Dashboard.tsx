// src/pages/Dashboard.tsx


import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import '../App.css';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface DragItem {
  id: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveTask = async (task: { title: string; description: string; status: string; date: string; priority: string }) => {
    if (currentTask) {
      await updateDoc(doc(db, 'tasks', currentTask.id), task);
    } else {
      await addDoc(collection(db, 'tasks'), task);
    }
    setCurrentTask(null);
    setModalOpen(false);
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find((task) => task.id === id);
    setCurrentTask(task || null);
    setModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      await updateDoc(doc(db, 'tasks', id), { ...task, status: newStatus });
    }
  };

  const handleCreateTask = () => {
    setCurrentTask(null);
    setModalOpen(true);
  };

  const handleDrop = (item: DragItem, status: string) => {
    handleChangeStatus(item.id, status);
  };

  const StatusColumn = ({ status, children }: { status: string; children: React.ReactNode }) => {
    const [, drop] = useDrop({
      accept: 'TASK_CARD',
      drop: (item: DragItem) => handleDrop(item, status),
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    });

    return (
      <div ref={drop} className={`bg-white rounded-lg shadow-md p-4`}>
        {children}
      </div>
    );
  };

  const sortedTasks = tasks.sort((a, b) => {
    const priorityOrder: { [key: string]: number } = { High: 1, Medium: 2, Low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Desktop & Mobile Application</h1>
            <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={handleCreateTask}>Create Task</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-start">
          {['TODO', 'IN PROGRESS', 'COMPLETED'].map((status) => (
            <StatusColumn key={status} status={status}>
              <div className={`p-4 rounded-lg ${status === 'TODO' ? 'bg-purple-200' : status === 'IN PROGRESS' ? 'bg-yellow-200' : 'bg-green-200'}`}>
                <h2 className={`text-xl font-bold mb-4${status === 'TODO' ? 'text-purple-700' : status === 'IN PROGRESS' ? 'text-yellow-700' : 'text-green-700'}`}>{status}</h2>
              </div>
              <div className="mb-4"></div>
              {sortedTasks.filter((task) => task.status === status).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </StatusColumn>
          ))}
        </div>
        <TaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTask}
          task={currentTask || undefined}
        />
      </div>
    </DndProvider>
  );
};

export default Dashboard;