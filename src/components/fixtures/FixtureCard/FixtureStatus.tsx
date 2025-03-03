
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface FixtureStatusProps {
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' | string;
}

export const FixtureStatus = ({ status }: FixtureStatusProps) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          variant: 'default' as const,
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          variant: 'destructive' as const,
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3 mr-1 animate-pulse" />
        };
      case 'SCHEDULED':
      default:
        return {
          label: 'Scheduled',
          variant: 'outline' as const,
          icon: <Clock className="h-3 w-3 mr-1" />
        };
    }
  };

  const { label, variant, icon } = getStatusDetails();

  return (
    <Badge variant={variant} className="flex items-center text-xs">
      {icon}
      {label}
    </Badge>
  );
};
