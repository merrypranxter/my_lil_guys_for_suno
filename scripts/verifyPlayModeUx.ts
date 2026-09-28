import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const mouth = readFileSync(new URL('../src/components/MouthLabPanel.tsx', import.meta.url), 'utf8');

assert.ok(app.includes("const DEFAULT_PLAY_MODULE_OPEN"), 'App should define a reduced play-mode drawer set.');
assert.ok(app.includes("['stack', 'controls', 'mouth', 'output'].includes(item.id)"), 'Play mode should prioritize Stack, Controls, Mouth, and Output.');
assert.ok(app.includes("QUICK PLAY"), 'App should expose the Quick Play strip.');
assert.ok(app.includes("MAKE IT WEIRDER"), 'Quick Play should expose Make It Weirder.');
assert.ok(app.includes("OPEN LAB"), 'Quick Play should expose Open Lab.');
assert.ok(app.includes("PLAY MODE"), 'Full lab should be able to return to Play Mode.');
assert.ok(app.includes("compactMode={uiMode === 'play'}"), 'Mouth Lab should receive compact play-mode state.');

assert.ok(mouth.includes("PLAY MODE MOUTH"), 'Mouth Lab should expose a compact front door.');
assert.ok(mouth.includes("EVOLVE AGAIN"), 'Existing mouth should have a one-click evolve action.');
assert.ok(mouth.includes("MAKE A WEIRD MOUTH"), 'Empty Mouth Lab should have a one-click starter action.');
assert.ok(mouth.includes("BREED / EVOLUTION"), 'Compact mouth should offer a direct route into breeding/evolution.');
assert.ok(mouth.includes("WHAT THE FUCK WAS THAT?"), 'Specimen capture must remain available from compact mode.');
assert.ok(mouth.includes("OPEN MOUTH LAB"), 'Advanced Mouth controls must remain accessible.');
assert.ok(mouth.includes("HIDE MOUTH LAB / BACK TO PLAY MODE"), 'Mouth Lab should collapse back to the quick surface.');

console.log('Play Mode UX verification passed:', {
  coreModules: ['stack', 'controls', 'mouth', 'output'],
  quickActions: ['generate', 'make-it-weirder', 'mouth', 'open-lab'],
  mouthActions: ['evolve-again', 'make-weird-mouth', 'breed-evolution', 'specimen', 'open-lab'],
});
