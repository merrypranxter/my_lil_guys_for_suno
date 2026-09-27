import type { BoxType } from '../types';
import { TARGETS, clampAndPad } from './proceduralGenerator';

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

const PADDING_SNIPPETS: Record<BoxType, string> = {
  style:
    ' Preserve the anchor while one jurisdiction mutates at a time; keep every active system audible, separate, and causally legible.',
  lyrics:
    '[CONTRACT CONTINUATION: preserve the active anchor, mouth physics, rhythmic law, and current causal transformation; add only structurally necessary detail.]',
  caption:
    ' The result keeps each mechanism legible while the anchor survives mutation and returns carrying a useful structural scar.',
};

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
  if (text.length >= target.min && text.length <= target.max) return text;
  return clampAndPad(text, target.min, target.max, PADDING_SNIPPETS[boxType]);
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
