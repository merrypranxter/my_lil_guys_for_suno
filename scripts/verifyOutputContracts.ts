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

const repaired = enforceOutputContracts(broken);
assert(repaired.adjusted.length === 3, 'all invalid boxes should be adjusted');
assert(outputContractsPass(repaired.boxes), 'deterministic finalizer must make every box valid');

for (const boxType of ['style', 'lyrics', 'caption'] as const) {
  const text = repaired.boxes[boxType];
  const target = TARGETS[boxType];
  assert(
    text.length >= target.min && text.length <= target.max,
    boxType + ' must land inside ' + target.min + '–' + target.max + ', got ' + text.length,
  );
}

const styleShort = enforceOutputContract('style', '');
assert(styleShort.length >= 975 && styleShort.length <= 999, 'empty style should be repaired into range');

const lyricLong = enforceOutputContract('lyrics', 'Y'.repeat(7000));
assert(lyricLong.length >= 4900 && lyricLong.length <= 4999, 'overlong lyrics should be repaired into range');

const captionLong = enforceOutputContract('caption', 'Z'.repeat(1000));
assert(captionLong.length >= 490 && captionLong.length <= 499, 'overlong caption should be repaired into range');

const mixed = enforceOutputContracts({
  style: valid.style,
  lyrics: 'short',
  caption: valid.caption,
});
assert(mixed.boxes.style === valid.style, 'valid style must stay frozen while lyrics are repaired');
assert(mixed.boxes.caption === valid.caption, 'valid caption must stay frozen while lyrics are repaired');
assert(mixed.adjusted.length === 1 && mixed.adjusted[0] === 'lyrics', 'only lyrics should be adjusted');

console.log('Output contract verification passed:', {
  style: repaired.boxes.style.length,
  lyrics: repaired.boxes.lyrics.length,
  caption: repaired.boxes.caption.length,
});
