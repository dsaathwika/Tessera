/**
 * EventEditor.tsx
 *
 * Provides a form for creating or editing events, including validation and submission to Supabase.
 * Exports the Event type and EventEditor component.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './EventEditor.css';

export type Event = {
  booked_count?: number;
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
    if (eventToEdit) {
      setEvent({
        ...eventToEdit,
        date: new Date(eventToEdit.date).toISOString().substring(0, 16),
      });
    } else {
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
    <div className="event-modal-overlay">
      <div className="event-modal-card">
        <div className="event-modal-header">
          <h2>{eventToEdit ? 'Edit Event' : 'Create Event'}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="event-modal-close"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="event-modal-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="event-name">Name</label>
              <input 
                id="event-name"
                name="name" 
                value={event.name} 
                onChange={handleChange} 
                required 
                placeholder="Event name"
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="event-description">Description</label>
              <textarea 
                id="event-description"
                name="description" 
                value={event.description} 
                onChange={handleChange}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-date">Date & Time</label>
              <input 
                id="event-date"
                type="datetime-local" 
                name="date" 
                value={event.date} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-capacity">Capacity</label>
              <input 
                id="event-capacity"
                type="number" 
                name="capacity" 
                value={event.capacity} 
                onChange={handleChange} 
                required 
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="event-modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="event-modal-btn event-modal-btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="event-modal-btn event-modal-btn-save"
            >
              {loading ? (
                <>
                  <svg className="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                  </svg>
                  {eventToEdit ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}