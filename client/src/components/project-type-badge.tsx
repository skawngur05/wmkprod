import { HardHat } from 'lucide-react';
import { Lead } from '@shared/schema';

interface ProjectTypeBadgeProps {
  lead: Lead;
  abbreviate?: boolean;
  className?: string;
}

export function ProjectTypeBadge({ lead, abbreviate = false, className = '' }: ProjectTypeBadgeProps) {
  const projectTypeLabel = abbreviate 
    ? (lead.project_type === 'Commercial' ? 'Com' : 'Res')
    : (lead.project_type === 'Commercial' ? 'Commercial' : 'Residential');

  // For Commercial projects with subcategory, use a combined badge design
  if (lead.project_type === 'Commercial' && lead.commercial_subcategory) {
    return (
      <div className={`inline-flex items-center ${className}`} data-testid="project-type-badge">
        <HardHat className="h-3 w-3 text-gray-600 mr-1" />
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-blue-200">
          {projectTypeLabel}: {lead.commercial_subcategory}
        </span>
      </div>
    );
  }

  // Default badge for residential or commercial without subcategory
  return (
    <div className={`flex items-center gap-1 ${className}`} data-testid="project-type-badge">
      <HardHat className="h-3 w-3 text-gray-600" />
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        lead.project_type === 'Commercial' 
          ? 'bg-blue-100 text-blue-700' 
          : 'bg-green-100 text-green-700'
      }`}>
        {projectTypeLabel}
      </span>
    </div>
  );
}
