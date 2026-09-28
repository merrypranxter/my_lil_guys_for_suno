import { TARGETS } from '../src/lib/proceduralGenerator';
import {
  enforceOutputContract,
  enforceOutputContracts,
  getOutputContractViolations,
  outputContractsPass,
} from '../src/lib/outputContracts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const valid = {
  style: 'S'.repeat(980),
  lyrics: 'L'.repeat(4950),
  caption: 'C'.repeat(495),
};

assert(outputContractsPass(valid), 'valid boxes should pass');
assert(getOutputContractViolations(valid).length === 0, 'valid boxes should have no violations');

const untouched = enforceOutputContracts(valid);
assert(untouched.adjusted.length === 0, 'valid boxes should not be reported as adjusted');
assert(untouched.boxes.style === valid.style, 'valid style must be byte-for-byte unchanged');
assert(untouched.boxes.lyrics === valid.lyrics, 'valid lyrics must be byte-for-byte unchanged');
assert(untouched.boxes.caption === valid.caption, 'valid caption must be byte-for-byte unchanged');

const broken = {
  style: 'too short',
  lyrics: 'X'.repeat(6200),
  caption: 'tiny',
};

const finalized = enforceOutputContracts(broken);
assert(
  finalized.adjusted.length === 1 && finalized.adjusted[0] === 'lyrics',
  'deterministic finalizer should trim only; it must never pad short boxes',
);
assert(finalized.boxes.style === 'too short', 'short style must remain untouched rather than padded');
assert(finalized.boxes.caption === 'tiny', 'short caption must remain untouched rather than padded');
assert(
  finalized.boxes.lyrics.length >= TARGETS.lyrics.min &&
    finalized.boxes.lyrics.length <= TARGETS.lyrics.max,
  'overlong lyrics should be trimmed into range',
);
assert(
  getOutputContractViolations(finalized.boxes).some((item) => item.boxType === 'style') &&
    getOutputContractViolations(finalized.boxes).some((item) => item.boxType === 'caption'),
  'short boxes must remain visible violations for substantive repair',
);

const styleShort = enforceOutputContract('style', '');
assert(styleShort === '', 'empty style must not be padded');

const lyricLong = enforceOutputContract('lyrics', 'Y'.repeat(7000));
assert(lyricLong.length >= 4900 && lyricLong.length <= 4999, 'overlong lyrics should be trimmed into range');

const captionLong = enforceOutputContract('caption', 'Z'.repeat(1000));
assert(captionLong.length >= 490 && captionLong.length <= 499, 'overlong caption should be trimmed into range');

const mixed = enforceOutputContracts({
  style: valid.style,
  lyrics: 'short',
  caption: valid.caption,
});
assert(mixed.boxes.style === valid.style, 'valid style must stay frozen while lyrics remain short');
assert(mixed.boxes.caption === valid.caption, 'valid caption must stay frozen while lyrics remain short');
assert(mixed.boxes.lyrics === 'short', 'short lyrics must remain substantive-repair work, not local filler work');
assert(mixed.adjusted.length === 0, 'short-only input should not be mutated by deterministic finalizer');

for (const text of Object.values(finalized.boxes)) {
  assert(!text.includes('CONTRACT CONTINUATION'), 'finalizer must never inject CONTRACT CONTINUATION filler');
  assert(!text.includes('CALIBRATION INVARIANT'), 'finalizer must never inject CALIBRATION INVARIANT filler');
}

console.log('Output contract no-padding verification passed:', {
  styleViolation: finalized.boxes.style.length,
  trimmedLyrics: finalized.boxes.lyrics.length,
  captionViolation: finalized.boxes.caption.length,
});
