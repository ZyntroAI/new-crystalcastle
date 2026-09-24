import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface AddTodoProps {
  onAdd: (title: string) => Promise<void> | void;
}

export const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    
    if (!trimmed) {
      setError('Todo title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd(trimmed);
      setTitle('');
    } catch (err) {
      setError('Failed to add todo — please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="New Todo"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
        disabled={isSubmitting}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Add Task
      </Button>
    </form>
  );
};
