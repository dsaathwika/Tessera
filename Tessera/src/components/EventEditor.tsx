// src/components/EventEditor.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import './EventEditor.css'; // We'll create this file next

// Define the type for an Event object
export type Event = {
  booked_count: ReactNode;
  id?: string;
  name: string;
  description: string;
  date: string;
  capacity: number;
};

interface EventEditorProps {
  eventToEdit: Event | null;
  onClose: () => void;
  onSave: () => void;
}

export function EventEditor({ eventToEdit, onClose, onSave }: EventEditorProps) {
  const [event, setEvent] = useState<Event>({ name: '', description: '', date: '', capacity: 0, booked_count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If we are editing, populate the form with existing event data
    if (eventToEdit) {
      setEvent({
        ...eventToEdit,
        date: new Date(eventToEdit.date).toISOString().substring(0, 16), // Format for datetime-local input
      });
    } else {
      // Reset form if creating a new event
      setEvent({ name: '', description: '', date: '', capacity: 0, booked_count: 0 });
    }
  }, [eventToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const eventData = {
        ...event,
        date: new Date(event.date).toISOString(),
    };

    let response;
    if (eventToEdit?.id) {
      // Update existing event
      response = await supabase.from('events').update(eventData).eq('id', eventToEdit.id);
    } else {
      // Create new event
      response = await supabase.from('events').insert([eventData]);
    }

    if (response.error) {
      setError(response.error.message);
    } else {
      onSave();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{eventToEdit ? 'Edit Event' : 'Create New Event'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input name="name" value={event.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={event.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date and Time</label>
            <input type="datetime-local" name="date" value={event.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" name="capacity" value={event.capacity} onChange={handleChange} required min="0" />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}