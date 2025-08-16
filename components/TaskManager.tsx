'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskStatus } from '@/lib/db/schema';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  Upload,
  Calendar,
  User,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string | null;
    email: string;
  };
  media: Array<{
    id: number;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: {
      id: number;
      name: string | null;
    };
  }>;
  comments: Array<{
    id: number;
    comment: string;
    createdAt: string;
    createdBy: {
      id: number;
      name: string | null;
    };
  }>;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/50',
    borderColor: 'border-gray-200 dark:border-gray-700/50'
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/50',
    borderColor: 'border-blue-200 dark:border-blue-700/50'
  },
  review: {
    label: 'In Review',
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/50',
    borderColor: 'border-yellow-200 dark:border-yellow-700/50'
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/50',
    borderColor: 'border-green-200 dark:border-green-700/50'
  }
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300',
  done: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTasks();
        setIsCreateModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTask.id,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        setIsEditModalOpen(false);
        setSelectedTask(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTasks();
        if (selectedTask?.id === taskId) {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    try {
      const response = await fetch('/api/tasks/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          comment: newComment,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        // Update selected task with new comments
        const updatedTask = await fetch(`/api/tasks?id=${selectedTask.id}`).then(res => res.json());
        setSelectedTask(updatedTask);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const uploadMedia = async () => {
    if (!selectedTask || !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask.id.toString());
      formData.append('file', selectedFile);

      const response = await fetch('/api/tasks/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchTasks();
        // Update selected task with new media
        const updatedTask = await fetch(`/api/tasks?id=${selectedTask.id}`).then(res => res.json());
        setSelectedTask(updatedTask);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status as TaskStatus,
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Board</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTasks = getTasksByStatus(status);
            const IconComponent = config.icon;
            
            return (
              <div
                key={status}
                className={`flex-1 flex flex-col ${config.bgColor} border-r border-gray-200 dark:border-gray-700 last:border-r-0 overflow-hidden`}
              >
                {/* Column Header */}
                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {config.label}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
                      {statusTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                  {statusTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg"
                      onClick={() => openDetailModal(task)}
                    >
                      <div className="space-y-3">
                        {/* Task Title */}
                        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight text-base">
                          {task.title}
                        </h4>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Task Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">
                              {task.createdBy.name || task.createdBy.email.split('@')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Task Actions/Badges */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            {task.media.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                <Paperclip className="w-3 h-3" />
                                <span>{task.media.length}</span>
                              </div>
                            )}
                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(task);
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Empty State */}
                  {statusTasks.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-16 px-4">
                      <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-3`}>
                        <IconComponent className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <p className="text-sm font-medium">No tasks in {config.label.toLowerCase()}</p>
                      <p className="text-xs mt-1">Tasks will appear here when added</p>
                    </div>
                  )}
                </div>

                {/* Add Task Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: status as TaskStatus }));
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full justify-start text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 py-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={TaskStatus.REVIEW}>Review</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateTask}>Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedTask.title}</span>
                  <Badge className={statusColors[selectedTask.status as keyof typeof statusColors]}>
                    {statusLabels[selectedTask.status as keyof typeof statusLabels]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Task Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Created by {selectedTask.createdBy.name || selectedTask.createdBy.email}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedTask.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedTask.description && (
                    <p className="text-gray-700 dark:text-gray-300">{selectedTask.description}</p>
                  )}
                </div>

                {/* Media Section */}
                <div>
                  <h4 className="font-semibold mb-2">Media Files</h4>
                  <div className="space-y-2">
                    {selectedTask.media.map((media) => (
                      <div key={media.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{media.fileName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({(media.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          by {media.uploadedBy.name || 'User'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Upload Media */}
                  <div className="mt-3 flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*,audio/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Button onClick={uploadMedia} disabled={!selectedFile}>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="font-semibold mb-2">Comments</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {comment.createdBy.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="mt-3 flex space-x-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                      rows={2}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
