'use client';

import React from 'react';
import AgentWorkspaceLayout from '../agent-workspace/AgentWorkspaceLayout';

interface AgentWorkspaceViewProps {
  activeSubScreen: string;
}

export function AgentWorkspaceView({ activeSubScreen }: AgentWorkspaceViewProps) {
  return (
    <div className="h-full w-full">
      <AgentWorkspaceLayout activeSubScreen={activeSubScreen} />
    </div>
  );
}
