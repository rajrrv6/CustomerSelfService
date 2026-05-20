import React, { useState, useRef } from 'react';
import { WorkflowNode, WorkflowEdge } from '@/data/seed/workflowSeed';
import { IntentNode } from './nodes/IntentNode';
import { ApiNode } from './nodes/ApiNode';
import { DbNode } from './nodes/DbNode';
import { RagNode } from './nodes/RagNode';
import { BranchNode } from './nodes/BranchNode';
import { HandoffNode } from './nodes/HandoffNode';
import { DelayNode } from './nodes/DelayNode';
import { FormNode } from './nodes/FormNode';
import { CarouselNode } from './nodes/CarouselNode';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodePositionChange: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onDeleteEdge: (id: string) => void;
  onConnectNodes: (sourceId: string, targetId: string, label?: string) => void;
  panX: number;
  panY: number;
  zoom: number;
  onPan: (dx: number, dy: number) => void;
  activeNodeId: string | null;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodePositionChange,
  onDeleteNode,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onDeleteEdge,
  onConnectNodes,
  panX,
  panY,
  zoom,
  onPan,
  activeNodeId
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Port connection draft helper states
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [isTouchPanning, setIsTouchPanning] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Dragging individual nodes state variables
  const dragInfoRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  // Background grid panning events
  const handleMouseDown = (e: React.MouseEvent) => {
    // If user clicks directly on container backdrop, initiate pan
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onPan(e.clientX - panStart.x, e.clientY - panStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (target !== containerRef.current && target.tagName !== 'svg') return;
    const touch = e.touches[0];
    setIsTouchPanning(true);
    touchStartRef.current = { x: touch.clientX - panX, y: touch.clientY - panY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchPanning || !touchStartRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    onPan(touch.clientX - touchStartRef.current.x, touch.clientY - touchStartRef.current.y);
  };

  const handleTouchEnd = () => {
    setIsTouchPanning(false);
    touchStartRef.current = null;
  };

  // Node drag events callback orchestrator
  const startNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    dragInfoRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y
    };

    const handleNodeMove = (moveEvent: MouseEvent) => {
      if (!dragInfoRef.current) return;
      const info = dragInfoRef.current;
      const dx = (moveEvent.clientX - info.startX) / zoom;
      const dy = (moveEvent.clientY - info.startY) / zoom;
      onNodePositionChange(info.nodeId, info.nodeStartX + dx, info.nodeStartY + dy);
    };

    const handleNodeMouseUp = () => {
      dragInfoRef.current = null;
      window.removeEventListener('mousemove', handleNodeMove);
      window.removeEventListener('mouseup', handleNodeMouseUp);
    };

    window.addEventListener('mousemove', handleNodeMove);
    window.addEventListener('mouseup', handleNodeMouseUp);
  };

  const handleConnectPortClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!linkingSourceId) {
      setLinkingSourceId(nodeId);
    } else {
      if (linkingSourceId !== nodeId) {
        onConnectNodes(linkingSourceId, nodeId);
      }
      setLinkingSourceId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden relative cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {/* Visual Dot Grid Layer Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`
        }}
      />

      {/* Scaling container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`
        }}
      >
        {/* SVG connection lines layer */}
        <svg className="absolute inset-0 w-1000 h-750 pointer-events-none overflow-visible">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-selected"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            // Dimensions: nodes are 224px (w-56) wide, and approx 70px high
            const sx = sourceNode.x + 224;
            const sy = sourceNode.y + 35;
            const tx = targetNode.x;
            const ty = targetNode.y + 35;

            // Bezier curve control points coordinates calculation
            const cx1 = sx + 80;
            const cy1 = sy;
            const cx2 = tx - 80;
            const cy2 = ty;

            const pathData = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
            const isSelected = selectedEdgeId === edge.id;

            return (
              <g key={edge.id} className="pointer-events-auto cursor-pointer">
                {/* Thick invisible click helper path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEdge(edge.id);
                  }}
                />
                {/* Visual colored path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                  strokeWidth={isSelected ? '3' : '2'}
                  strokeDasharray={isSelected ? '4,4' : undefined}
                  markerEnd={`url(#${isSelected ? 'arrowhead-selected' : 'arrowhead'})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEdge(edge.id);
                  }}
                />
                {/* Optional Mid-path label */}
                {edge.label && (
                  <text
                    x={(sx + tx) / 2}
                    y={(sy + ty) / 2 - 8}
                    className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px] font-bold text-center"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isActive = activeNodeId === node.id;

          const sharedProps = {
            key: node.id,
            node,
            selected: isSelected,
            isActive,
            onSelect: () => onSelectNode(node.id),
            onDelete: () => onDeleteNode(node.id)
          };

          // Wrap drag mouse event capture
          const renderNode = () => {
            switch (node.type) {
              case 'intent':
                return <IntentNode {...sharedProps} />;
              case 'api':
                return <ApiNode {...sharedProps} />;
              case 'db':
                return <DbNode {...sharedProps} />;
              case 'rag':
                return <RagNode {...sharedProps} />;
              case 'branch':
                return <BranchNode {...sharedProps} />;
              case 'handoff':
                return <HandoffNode {...sharedProps} />;
              case 'delay':
                return <DelayNode {...sharedProps} />;
              case 'form':
                return <FormNode {...sharedProps} />;
              case 'carousel':
                return <CarouselNode {...sharedProps} />;
              default:
                return null;
            }
          };

          return (
            <div
              key={node.id}
              className="absolute"
              onMouseDown={(e) => {
                // Ignore drags if user clicks buttons/ports/inputs
                const target = e.target as HTMLElement;
                if (
                  target.tagName === 'BUTTON' ||
                  target.tagName === 'INPUT' ||
                  target.className.includes('bg-')
                ) {
                  return;
                }
                startNodeDrag(node.id, e);
              }}
            >
              {renderNode()}

              {/* Port connection click helpers */}
              {/* Output port click trigger */}
              {node.type !== 'handoff' && (
                <button
                  onClick={(e) => handleConnectPortClick(node.id, e)}
                  className={`absolute z-20 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-md transform hover:scale-125 transition-transform ${
                    linkingSourceId === node.id ? 'bg-amber-500 animate-ping' : 'bg-blue-500'
                  }`}
                  style={{
                    left: `${224 - 8}px`,
                    top: `${35 - 8}px`
                  }}
                  title="Connect from here"
                />
              )}

              {/* Input port target trigger */}
              {node.type !== 'intent' && linkingSourceId && linkingSourceId !== node.id && (
                <button
                  onClick={(e) => handleConnectPortClick(node.id, e)}
                  className="absolute z-20 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md transform hover:scale-125 transition-transform animate-pulse"
                  style={{
                    left: '-8px',
                    top: `${35 - 8}px`
                  }}
                  title="Link to here"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating hints */}
      <div className="hidden lg:block absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg max-w-60 text-[10px] font-semibold text-slate-500 leading-normal pointer-events-none">
        <p className="font-bold text-slate-800 dark:text-white mb-1">💡 Pro Tips:</p>
        <ul className="list-disc pl-3.5 space-y-0.5">
          <li>Pan: Left click backdrop & drag</li>
          <li>Move node: Click node header & drag</li>
          <li>Connect: Click blue dot, then click green target dot on another node</li>
          <li>Delete node: Click ✕ on header</li>
          <li>Delete link: Click link, press Delete or Backspace</li>
        </ul>
      </div>

      {/* Bottom overlay indicating active selection */}
      {selectedEdgeId && (
        <div className="hidden sm:flex absolute bottom-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 shadow-lg items-center gap-2 text-[10px]">
          <span className="font-mono text-slate-500 font-bold">Selected Link: {selectedEdgeId}</span>
          <button
            onClick={() => onDeleteEdge(selectedEdgeId)}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold"
          >
            Delete Link
          </button>
        </div>
      )}
    </div>
  );
}
