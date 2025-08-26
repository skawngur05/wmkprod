import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, ASSIGNEES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, PenTool, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="quick-followup-modal">
        <DialogHeader className="space-y-3 pb-6 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Follow-up Manager
          </DialogTitle>
          <DialogDescription className="text-base">
            Update follow-up details for <span className="font-medium text-gray-900">{lead.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Follow-up Status Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-medium text-blue-900">Current Follow-up Date</Label>
              </div>
              <div className="text-lg font-semibold text-blue-800">
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
              {lead.assigned_to && (
                <Badge variant="outline" className="mt-2">
                  <User className="h-3 w-3 mr-1" />
                  {lead.assigned_to.charAt(0).toUpperCase() + lead.assigned_to.slice(1)}
                </Badge>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Follow-up Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                New Follow-up Date
              </Label>
              <Input
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                data-testid="input-followup-date"
                className="h-11"
              />
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                Assign To Team Member
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-11" data-testid="select-assigned-to">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNEES.map(member => (
                    <SelectItem key={member} value={member}>
                      {member.charAt(0).toUpperCase() + member.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Note Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <PenTool className="h-4 w-4 text-orange-600" />
                Quick Note Templates
              </Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-11" data-testid="select-note-template">
                  <SelectValue placeholder="Choose a quick note template..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {quickNoteTemplates.map(template => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Note or Note Preview */}
            {selectedTemplate === 'Custom note...' ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-indigo-600" />
                  Custom Note
                </Label>
                <Textarea
                  rows={4}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Write your custom follow-up note here..."
                  data-testid="textarea-custom-note"
                  className="resize-none"
                />
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Note Preview
                </Label>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-800 font-medium">
                          [{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}] {quickNote}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Info Card */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 mb-1">Quick Tip</p>
                    <p className="text-amber-800">
                      Your note will be timestamped and added to the lead's history.
                      {assignedTo && assignedTo !== lead.assigned_to && (
                        <>
                          {' '}Lead will be reassigned to <span className="font-medium">{assignedTo.charAt(0).toUpperCase() + assignedTo.slice(1)}</span>.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
                data-testid="button-cancel-followup"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateLeadMutation.isPending || (!nextFollowupDate && !quickNote && !customNote && !assignedTo)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                data-testid="button-save-followup"
              >
                {updateLeadMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Update Follow-up
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}