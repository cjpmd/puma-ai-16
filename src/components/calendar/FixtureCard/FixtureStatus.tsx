
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { KitIcon } from '@/components/fixtures/KitIcon';

interface FixtureStatusProps {
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' | 'TRAINING' | string;
}

export const FixtureStatus = ({ status }: FixtureStatusProps) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed',
          variant: 'default' as const,
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          isTraining: false
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          variant: 'destructive' as const,
          icon: <XCircle className="h-3 w-3 mr-1" />,
          isTraining: false
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3 mr-1 animate-pulse" />,
          isTraining: false
        };
      case 'TRAINING':
        return {
          label: 'Training',
          variant: 'outline' as const,
          icon: <KitIcon type="training" size={14} />,
          isTraining: true
        };
      case 'SCHEDULED':
      default:
        return {
          label: 'Scheduled',
          variant: 'outline' as const,
          icon: <Clock className="h-3 w-3 mr-1" />,
          isTraining: false
        };
    }
  };

  const { label, variant, icon, isTraining } = getStatusDetails();

  return (
    <Badge variant={variant} className="flex items-center text-xs">
      {icon}
      {isTraining ? <span className="ml-1">{label}</span> : label}
    </Badge>
  );
};
