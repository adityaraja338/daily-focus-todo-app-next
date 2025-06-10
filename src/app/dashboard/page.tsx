'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, Task, CreateTaskData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import useDebounce from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';

const schema = yup.object({
  title: yup.string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: yup.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
}).required();

type TaskFormData = yup.InferType<typeof schema>;

export default function DashboardPage() {
  const { logout, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const limit = 10;
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    // Check authentication on mount and when isAuthenticated changes
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', page, debouncedSearch],
    queryFn: () => taskService.getTasks(page, limit, debouncedSearch),
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      setTitleLength(0);
      setDescriptionLength(0);
      setToast({ message: 'Task created successfully!', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Failed to create task', type: 'error' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setToast({ message: 'Task updated successfully!', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Failed to update task', type: 'error' });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setToast({ message: 'Task deleted successfully!', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Failed to delete task', type: 'error' });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Dashboard</h3>
            <p className="mt-2 text-sm text-gray-500">
              {error instanceof Error ? error.message : 'Failed to load tasks. Please try again.'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Todo App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Task</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                  Title
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    {...register('title')}
                    type="text"
                    maxLength={100}
                    onChange={(e) => {
                      setTitleLength(e.target.value.length);
                      register('title').onChange(e);
                    }}
                    className="block w-full rounded-md border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    placeholder="What needs to be done?"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-sm text-gray-500">
                      {titleLength}/100
                    </span>
                  </div>
                </div>
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <div className="relative rounded-md shadow-sm">
                  <textarea
                    {...register('description')}
                    maxLength={500}
                    onChange={(e) => {
                      setDescriptionLength(e.target.value.length);
                      register('description').onChange(e);
                    }}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors resize-none"
                    placeholder="Add details about your task..."
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-sm text-gray-500">
                      {descriptionLength}/500
                    </span>
                  </div>
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-8 mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-900 mb-2">
              Search Tasks
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={search}
                onChange={handleSearch}
                className="block w-full rounded-md border-gray-300 pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Search tasks..."
              />
              {isLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Tasks</h2>
            {data?.tasks?.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.tasks?.map((task: Task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateTaskMutation.mutate({ id: task._id, data: { completed: !task.completed } })}
                        className={`p-2 rounded-full ${
                          task.completed
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTaskMutation.mutate(task._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 