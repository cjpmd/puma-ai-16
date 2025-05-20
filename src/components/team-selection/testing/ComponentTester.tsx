
import React from 'react';
import { TeamSelectionManager } from '@/components/team-selection/TeamSelectionManager';
import { PerformanceCategory } from '@/types/player';

// This is a test component for development purposes only
export const ComponentTester = () => {
  const mockFixture = {
    id: '123',
    opponent: 'Test Team',
    date: '2023-01-01',
    is_home: true,
    format: '7-a-side'
  };
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Team Selection Component Tester</h1>
      <TeamSelectionManager 
        fixture={mockFixture as any} 
        onSuccess={() => console.log('Success')} 
        performanceCategory={PerformanceCategory.MESSI}
      />
    </div>
  );
};

export default ComponentTester;
