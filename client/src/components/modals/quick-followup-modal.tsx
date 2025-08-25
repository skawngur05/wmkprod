import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, ASSIGNEES } from '@shared/schema';
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
  "Follow-up call completed",
  "Site visit scheduled",
  "Quote requested",
  "Contract sent",
  "Payment discussion needed",
  "Custom note..."
];

export function QuickFollowupModal({ lead, show, onHide }: QuickFollowupModalProps) {
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
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
      setAssignedTo(lead.assigned_to || '');
    }
  }, [lead]);

  const resetForm = () => {
    setNextFollowupDate('');
    setAssignedTo('');
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
      assigned_to: assignedTo || null,
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
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-calendar-check me-2"></i>
              Follow-up Manager - {lead.name}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              data-testid="button-close-followup-modal"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Current Follow-up Date Display */}
              <div className="mb-3 p-3 bg-light border-start border-info border-4">
                <label className="form-label text-muted mb-1">
                  <i className="fas fa-history me-1"></i>Current Follow-up Date
                </label>
                <div className="fw-bold text-dark">
                  {lead.next_followup_date ? 
                    new Date(lead.next_followup_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'No follow-up date set'
                  }
                </div>
              </div>

              {/* New Follow-up Date */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-calendar-plus text-primary me-1"></i>New Follow-up Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  data-testid="input-followup-date"
                />
              </div>

              {/* Assign To */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-user-tag text-success me-1"></i>Assign To
                </label>
                <select
                  className="form-select form-select-lg"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  data-testid="select-assigned-to"
                >
                  <option value="">Select team member...</option>
                  {ASSIGNEES.map(member => (
                    <option key={member} value={member}>
                      {member.charAt(0).toUpperCase() + member.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Note Templates */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-sticky-note text-warning me-1"></i>Quick Note Templates
                </label>
                <select
                  className="form-select form-select-lg"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  data-testid="select-note-template"
                >
                  <option value="">Choose a quick note template...</option>
                  {quickNoteTemplates.map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>

              {/* Custom Note or Note Preview */}
              {selectedTemplate === 'Custom note...' ? (
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="fas fa-pen text-info me-1"></i>Custom Note
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Write your custom follow-up note here..."
                    data-testid="textarea-custom-note"
                  />
                </div>
              ) : selectedTemplate ? (
                <div className="mb-3">
                  <label className="form-label fw-semibold text-success">
                    <i className="fas fa-eye me-1"></i>Note Preview
                  </label>
                  <div className="p-3 bg-success-subtle border border-success-subtle rounded">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-quote-left text-success me-2"></i>
                      <span className="fw-medium">
                        [{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}] {quickNote}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Info Alert */}
              <div className="alert alert-info border-0 bg-info-subtle">
                <div className="d-flex align-items-center">
                  <i className="fas fa-lightbulb text-info me-3 fs-5"></i>
                  <div>
                    <strong>Quick Tip:</strong> Your note will be timestamped and added to the lead's history. 
                    {assignedTo && assignedTo !== lead.assigned_to && (
                      <>
                        <br />
                        <small>Lead will be reassigned to <strong>{assignedTo.charAt(0).toUpperCase() + assignedTo.slice(1)}</strong>.</small>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer bg-light">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-lg me-2" 
              onClick={handleClose}
              data-testid="button-cancel-followup"
            >
              <i className="fas fa-times me-2"></i>Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg px-4"
              onClick={handleSubmit}
              disabled={updateLeadMutation.isPending || (!nextFollowupDate && !quickNote && !customNote && !assignedTo)}
              data-testid="button-save-followup"
            >
              {updateLeadMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Updating Follow-up...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check me-2"></i>Update Follow-up
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}