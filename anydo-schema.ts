// Anydo-style task management schema
// Ready to plug into a React/TS project (e.g. with a form, DB layer, or API)

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  freq: RecurrenceFreq;
  interval: number;        // every N days/weeks/months/years
  daysOfWeek?: number[];   // 0-6 (Sun-Sat), for weekly recurrence
  endDate?: string;        // ISO date, optional
}

export interface Reminder {
  id: string;
  remindAt: string;        // ISO datetime
  method?: 'push' | 'email';
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;    // ISO datetime
  dueDate?: string;        // ISO date or datetime
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  reminders: Reminder[];
  recurrence?: Recurrence;
  order: number;           // manual sort position within list
  createdAt: string;       // ISO datetime
  updatedAt: string;       // ISO datetime
}

export interface TaskList {
  id: string;
  name: string;
  color?: string;          // hex, for UI
  icon?: string;
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

// Convenience shape for a fully-populated list view
export interface TaskListWithTasks extends TaskList {
  tasks: Task[];
}
