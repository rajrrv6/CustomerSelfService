import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';
import { WorkflowToolbar } from '@/archive/old-builders/dialog-builder/WorkflowToolbar';

describe('Dialog Builder Subsystem QA Tests', () => {
  it('renders WorkflowToolbar options and handles adding nodes', () => {
    const handleAddNode = vi.fn();
    const handleUndo = vi.fn();
    const handleRedo = vi.fn();
    const handleZoomIn = vi.fn();
    const handleZoomOut = vi.fn();
    const handleZoomReset = vi.fn();
    const handleValidate = vi.fn();
    const handleStartSim = vi.fn();
    const handleResetSim = vi.fn();
    const handleOpenInspector = vi.fn();

    render(
      <WorkflowToolbar
        canUndo={true}
        canRedo={false}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={1.0}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onAddNode={handleAddNode}
        onValidate={handleValidate}
        validation={null}
        onStartSimulation={handleStartSim}
        onResetSimulation={handleResetSim}
        simulationActive={false}
        onOpenInspector={handleOpenInspector}
      />
    );

    // Zoom factor text
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Adding API node trigger
    const apiBtn = screen.getByRole('button', { name: /api/i });
    fireEvent.click(apiBtn);
    expect(handleAddNode).toHaveBeenCalledWith('api');

    // Undo trigger
    const undoBtn = screen.getByTitle('Undo');
    fireEvent.click(undoBtn);
    expect(handleUndo).toHaveBeenCalled();

    // Start Simulation trigger
    const simBtn = screen.getByRole('button', { name: /start sim/i });
    fireEvent.click(simBtn);
    expect(handleStartSim).toHaveBeenCalled();
  });

  it('displays validation success message when flow contains zero issues', () => {
    const noop = () => {};
    render(
      <WorkflowToolbar
        canUndo={false}
        canRedo={false}
        onUndo={noop}
        onRedo={noop}
        zoom={1.0}
        onZoomIn={noop}
        onZoomOut={noop}
        onZoomReset={noop}
        onAddNode={noop}
        onValidate={noop}
        validation={{ errors: [], warnings: [] }}
        onStartSimulation={noop}
        onResetSimulation={noop}
        simulationActive={false}
        onOpenInspector={noop}
      />
    );

    expect(screen.getByText(/structural integrity looks correct/i)).toBeInTheDocument();
  });

  it('displays warning panel when validation returns errors', () => {
    const noop = () => {};
    render(
      <WorkflowToolbar
        canUndo={false}
        canRedo={false}
        onUndo={noop}
        onRedo={noop}
        zoom={1.0}
        onZoomIn={noop}
        onZoomOut={noop}
        onZoomReset={noop}
        onAddNode={noop}
        onValidate={noop}
        validation={{ errors: ['Root node is missing trigger connection'], warnings: ['Orphan node detected'] }}
        onStartSimulation={noop}
        onResetSimulation={noop}
        simulationActive={false}
        onOpenInspector={noop}
      />
    );

    expect(screen.getByText('[ERROR] Root node is missing trigger connection')).toBeInTheDocument();
    expect(screen.getByText('[WARNING] Orphan node detected')).toBeInTheDocument();
  });
});
