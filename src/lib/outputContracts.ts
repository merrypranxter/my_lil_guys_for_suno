import type { BoxType } from '../types';
import { TARGETS } from './proceduralGenerator';

export interface OutputBoxes {
  style: string;
  lyrics: string;
  caption: string;
}

export interface OutputContractViolation {
  boxType: BoxType;
  length: number;
  min: number;
  max: number;
}

export function getOutputContractViolations(boxes: OutputBoxes): OutputContractViolation[] {
  return (Object.keys(TARGETS) as BoxType[]).flatMap((boxType) => {
    const target = TARGETS[boxType];
    const length = (boxes[boxType] || '').length;
    return length < target.min || length > target.max
      ? [{ boxType, length, min: target.min, max: target.max }]
      : [];
  });
}

export function outputContractsPass(boxes: OutputBoxes): boolean {
  return getOutputContractViolations(boxes).length === 0;
}

export function enforceOutputContract(boxType: BoxType, text: string): string {
  const target = TARGETS[boxType];
  if (!target) return text;
  const trimmed = text.trim();
  if (trimmed.length <= target.max) return trimmed;

  let result = trimmed.slice(0, target.max);
  const lastPunct = Math.max(
    result.lastIndexOf('. '),
    result.lastIndexOf('] '),
    result.lastIndexOf('\n'),
  );
  if (lastPunct >= target.min) result = result.slice(0, lastPunct + 1).trim();
  return result;
}

export function enforceOutputContracts(boxes: OutputBoxes): {
  boxes: OutputBoxes;
  adjusted: BoxType[];
} {
  const adjusted: BoxType[] = [];
  const next = { ...boxes };

  (Object.keys(TARGETS) as BoxType[]).forEach((boxType) => {
    const before = next[boxType] || '';
    const after = enforceOutputContract(boxType, before);
    if (after !== before) adjusted.push(boxType);
    next[boxType] = after;
  });

  return { boxes: next, adjusted };
}
