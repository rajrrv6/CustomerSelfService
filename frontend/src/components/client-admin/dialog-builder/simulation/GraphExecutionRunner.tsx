'use client';

import React from 'react';
import { useDialogStore } from '../store/useDialogStore';
import { useUIStore } from '@/stores/uiStore';
import { DialogNode, DialogEdge } from '../types';

export function GraphExecutionRunner() {
  const lang = useUIStore((s) => s.lang);
  const isAr = lang === 'ar';

  const isSimulating = useDialogStore((s) => s.isSimulating);
  const activeSimNodeId = useDialogStore((s) => s.activeSimNodeId);
  const nodes = useDialogStore((s) => s.nodes);
  const edges = useDialogStore((s) => s.edges);
  const simVariables = useDialogStore((s) => s.simVariables);
  const simulationMode = useDialogStore((s) => s.simulationMode);

  // Zustand Store writers
  const setSimVariable = useDialogStore((s) => s.setSimVariable);
  
  // Custom execution trigger inside component
  React.useEffect(() => {
    // This is a runner engine helper component. It does not render anything.
  }, []);

  return null;
}

// Global evaluation helper for condition comparisons
export function evaluateCondition(varVal: string, op: string, compareVal: string): boolean {
  const numVal = parseFloat(varVal);
  const numCompare = parseFloat(compareVal);
  const isNum = !isNaN(numVal) && !isNaN(numCompare);

  switch (op) {
    case 'equals':
      return varVal === compareVal;
    case 'not_equals':
      return varVal !== compareVal;
    case 'greater_than':
      return isNum ? numVal > numCompare : varVal > compareVal;
    case 'less_than':
      return isNum ? numVal < numCompare : varVal < compareVal;
    case 'contains':
      return varVal.includes(compareVal);
    case 'not_contains':
      return !varVal.includes(compareVal);
    default:
      return false;
  }
}

// Variable mapper helper: parses string and replaces {{variable_name}} with current values
export function resolveTemplate(template: string, variables: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}
