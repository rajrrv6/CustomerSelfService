'use client';

import React from 'react';
import AgentWorkspaceLayout from '../agent-workspace/AgentWorkspaceLayout';

interface SupportAgentViewProps {
  activeSubScreen: string;
}

export function SupportAgentView({ activeSubScreen }: SupportAgentViewProps) {
  return (
    <div className="h-full w-full">
      <AgentWorkspaceLayout activeSubScreen={activeSubScreen} />
    </div>
  );
}

export default SupportAgentView;
