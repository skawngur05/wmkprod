import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QuickFollowupModalProps {
  lead: Lead | null;
  show: boolean;
  onHide: () => void;
}

const quickNoteTemplates = [
  "Sent a text message",
  "Sent an email",
  "Talked to client - interested",
  "Talked to client - needs time to decide", 
  "Left voicemail",
  "Scheduled callback",
  "Sent quote",
  "Meeting scheduled",
  "Waiting for approval",
  "Custom note..."
];

export function QuickFollowupModal({ lead, show, onHide }: QuickFollowupModalProps) {
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customNote, setCustomNote] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!lead) throw new Error('No lead selected');
      const response = await apiRequest('PUT', `/api/leads/${lead.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      onHide();
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update follow-up", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (lead) {
      setNextFollowupDate(lead.next_followup_date ? 
        new Date(lead.next_followup_date).toISOString().split('T')[0] : '');
    }
  }, [lead]);

  const resetForm = () => {
    setNextFollowupDate('');
    setQuickNote('');
    setSelectedTemplate('');
    setCustomNote('');
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template === 'Custom note...') {
      setQuickNote('');
    } else {
      setQuickNote(template);
      setCustomNote('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const noteToAdd = selectedTemplate === 'Custom note...' ? customNote : quickNote;
    const timestampedNote = noteToAdd ? `[${today}] ${noteToAdd}` : '';
    
    // Append new note to existing notes
    const existingNotes = lead?.notes || '';
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${timestampedNote}`
      : timestampedNote;

    const updates = {
      next_followup_date: nextFollowupDate ? new Date(nextFollowupDate) : null,
      notes: updatedNotes || null
    };

    updateLeadMutation.mutate(updates);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!lead) return null;

  return (
    <div 
      className={`modal fade ${show ? 'show' : ''}`} 
      style={{ display: show ? 'block' : 'none' }}
      data-testid="quick-followup-modal"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-calendar-alt text-primary me-2"></i>
              Quick Follow-up Update - {lead.name}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              data-testid="button-close-followup-modal"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-clock me-1"></i>Next Follow-up Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  data-testid="input-followup-date"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-sticky-note me-1"></i>Quick Note Template
                </label>
                <select
                  className="form-select"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  data-testid="select-note-template"
                >
                  <option value="">Select a template...</option>
                  {quickNoteTemplates.map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>

              {selectedTemplate === 'Custom note...' ? (
                <div className="mb-3">
                  <label className="form-label">Custom Note</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Enter your custom note here..."
                    data-testid="textarea-custom-note"
                  />
                </div>
              ) : selectedTemplate ? (
                <div className="mb-3">
                  <label className="form-label">Note Preview</label>
                  <div className="form-control bg-light" style={{ minHeight: '38px' }}>
                    <small className="text-muted">
                      [{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}] {quickNote}
                    </small>
                  </div>
                </div>
              ) : null}

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> This quick note will be added to the existing notes with today's date.
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              data-testid="button-cancel-followup"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={updateLeadMutation.isPending || (!nextFollowupDate && !quickNote && !customNote)}
              data-testid="button-save-followup"
            >
              {updateLeadMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>Update Follow-up
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}