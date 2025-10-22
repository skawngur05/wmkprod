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
import { Separator } from '@/components/ui/separator';
import { Calendar, User, PenTool, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';

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
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-page'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followups'] });
      onHide();
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update follow-up", variant: "destructive" });
    }
  });

  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  };

  useEffect(() => {
    if (lead) {
      setNextFollowupDate(formatDateForInput(lead.next_followup_date));
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
    
    const todayDate = new Date();
    const today = todayDate.getFullYear() + '-' + 
                  String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(todayDate.getDate()).padStart(2, '0');

    const noteToAdd = selectedTemplate === 'Custom note...' ? customNote : quickNote;
    const timestampedNote = noteToAdd ? `[${today}] ${noteToAdd}` : '';
    
    const existingNotes = lead?.notes || '';
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${timestampedNote}`
      : timestampedNote;

    const mapAssignedTo = (value: string): string => {
      if (!value || value === '') return '';
      return value;
    };

    const updates = {
      next_followup_date: nextFollowupDate && nextFollowupDate.trim() ? String(nextFollowupDate.trim()) : null,
      assigned_to: mapAssignedTo(typeof assignedTo === 'string' ? assignedTo : ''),
      notes: updatedNotes || null,
      project_type: (lead?.project_type) || 'Residential'
    };

    updateLeadMutation.mutate(updates);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!lead) return null;

  const formatDisplayDate = (dateStr: string) => {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const tempDate = new Date(year, month - 1, day);
      const dayOfWeek = tempDate.getDay();
      
      return `${weekdayNames[dayOfWeek]}, ${monthNames[month - 1]} ${day}, ${year}`;
    }
    return dateStr;
  };

  const getTodayPreview = () => {
    const todayDate = new Date();
    return todayDate.getFullYear() + '-' + 
           String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + 
           String(todayDate.getDate()).padStart(2, '0');
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0" data-testid="quick-followup-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                Follow-up Manager
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Update follow-up details for <span className="font-semibold text-gray-900">{lead.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Current Status Card */}
          <Card className="border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Current Follow-up Date</span>
                  </div>
                  {lead.next_followup_date && (
                    <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="pl-7">
                  <p className="text-lg font-bold text-blue-800">
                    {lead.next_followup_date ? formatDisplayDate(lead.next_followup_date) : 'No follow-up date set'}
                  </p>
                  {lead.assigned_to && (
                    <div className="mt-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Assigned to: <span className="font-medium">{lead.assigned_to.charAt(0).toUpperCase() + lead.assigned_to.slice(1)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Update Follow-up Section */}
            <Card className="border-green-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Follow-up</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Assign To
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
                </div>
              </CardContent>
            </Card>

            {/* Quick Notes Section */}
            <Card className="border-orange-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <PenTool className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Add Note</h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
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

                {selectedTemplate === 'Custom note...' ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
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
                  <Card className="bg-green-50 border-green-200 mt-3">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-green-100 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 mb-1">Note Preview</p>
                          <p className="text-sm text-green-800">
                            [{getTodayPreview()}] {quickNote}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </CardContent>
            </Card>

            {/* Info Card */}
            {(nextFollowupDate || assignedTo || selectedTemplate) && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-amber-900">Summary of Changes</p>
                      <div className="text-amber-800 space-y-1">
                        {nextFollowupDate && (
                          <p>• Follow-up date will be set to: <span className="font-medium">{nextFollowupDate}</span></p>
                        )}
                        {assignedTo && assignedTo !== lead.assigned_to && (
                          <p>• Lead will be reassigned to: <span className="font-medium">{assignedTo.charAt(0).toUpperCase() + assignedTo.slice(1)}</span></p>
                        )}
                        {(quickNote || customNote) && (
                          <p>• A new note will be added to the lead's history</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <Separator />
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            className="min-w-[100px]"
            data-testid="button-cancel-followup"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateLeadMutation.isPending || (!nextFollowupDate && !quickNote && !customNote && !assignedTo)}
            className="min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            data-testid="button-save-followup"
          >
            {updateLeadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Update Follow-up
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
