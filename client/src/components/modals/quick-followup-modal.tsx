import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Lead } from '@shared/schema';
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

  // Fetch active users for assignment
  const { data: activeUsers = [] } = useQuery({
    queryKey: ['/api/users/active'],
    queryFn: async () => {
      const response = await fetch('/api/users/active');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!lead) throw new Error('No lead selected');
      const response = await apiRequest('PUT', `/api/leads/${lead.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up updated successfully!" });
      // Invalidate multiple query patterns to ensure all lead-related data refreshes
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] }); // For the leads page
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      onHide();
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update follow-up", variant: "destructive" });
    }
  });

  // Helper function to format date for input (timezone-safe)
  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    // If it's already a string in YYYY-MM-DD format, return as-is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // If it's a Date object or other format, convert to YYYY-MM-DD
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    // Use local time methods since we're storing as simple strings
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  };

  useEffect(() => {
    if (lead) {
      setNextFollowupDate(formatDateForInput(lead.next_followup_date));
      setAssignedTo(lead.assigned_to || ''); // Use the actual assigned_to value
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
    
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + 
                  String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(todayDate.getDate()).padStart(2, '0');

    const noteToAdd = selectedTemplate === 'Custom note...' ? customNote : quickNote;
    const timestampedNote = noteToAdd ? `[${today}] ${noteToAdd}` : '';
    
    // Append new note to existing notes
    const existingNotes = lead?.notes || '';
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${timestampedNote}`
      : timestampedNote;

    // Ensure assigned_to is a valid string
    const mapAssignedTo = (value: string): string => {
      if (!value || value === '') return '';
      // Return the value as-is since we now accept any valid user
      return value;
    };

    const updates = {
      next_followup_date: nextFollowupDate && nextFollowupDate.trim() ? String(nextFollowupDate.trim()) : null,
      assigned_to: mapAssignedTo(typeof assignedTo === 'string' ? assignedTo : ''),  // Ensure it's a valid string
      notes: updatedNotes || null,
      project_type: (lead?.project_type) || 'Residential' // Ensure project_type is always provided
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
                {lead.next_followup_date ? (() => {
                  const dateStr = lead.next_followup_date;
                  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    // Parse the date string directly without timezone conversion
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                       'July', 'August', 'September', 'October', 'November', 'December'];
                    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    
                    // Calculate day of week for the date
                    const tempDate = new Date(year, month - 1, day);
                    const dayOfWeek = tempDate.getDay();
                    
                    return `${weekdayNames[dayOfWeek]}, ${monthNames[month - 1]} ${day}, ${year}`;
                  }
                  // For other date formats, just return the string
                  return dateStr;
                })() : 
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
                ASSIGN TO: <span className="text-blue-600 font-normal normal-case">
                  {(lead?.assigned_to && lead.assigned_to !== 'undefined' && lead.assigned_to !== 'null') ? 
                    lead.assigned_to.charAt(0).toUpperCase() + lead.assigned_to.slice(1) : 
                    'No one assigned'}
                </span>
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-11" data-testid="select-assigned-to">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers.map((user: any) => (
                    <SelectItem key={user.username} value={user.full_name || user.username}>
                      {(user.full_name || user.username).charAt(0).toUpperCase() + (user.full_name || user.username).slice(1)}
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
                          [{(() => {
                            const todayDate = new Date();
                            return todayDate.getFullYear() + '-' + 
                                   String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                   String(todayDate.getDate()).padStart(2, '0');
                          })()} ] {quickNote}
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