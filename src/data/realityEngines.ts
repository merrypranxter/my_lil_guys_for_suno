import { RealityDimension, RealityEngine } from '../types';
import { FORMAT_ENGINES } from './realityFormats';
import { ROLE_ENGINES } from './realityRoles';

/**
 * Reality Engines are intentionally separate from Little Guys.
 *
 * Little Guys govern HOW a song thinks.
 * Reality Engines govern WHERE the lyrics believe they are, WHO is speaking,
 * WHAT kind of event/media format is happening, and WHAT state the performer
 * is operating under.
 *
 * FORMAT and ROLE are populated in Job 2. Later jobs add WORLD, SPECIES,
 * VENUE, HEADSPACE, ALTERED STATE, and TONE.
 */
export const REALITY_ENGINES: RealityEngine[] = [
  ...FORMAT_ENGINES,
  ...ROLE_ENGINES,
];

export const REALITY_DIMENSION_LABELS: Record<RealityDimension, string> = {
  format: 'FORMAT',
  role: 'ROLE',
  world: 'WORLD',
  species: 'SPECIES / ORIGIN',
  venue: 'VENUE',
  headspace: 'HEADSPACE / STATE',
  alteredState: 'ALTERED STATE',
  tone: 'TONE',
};

export const REALITY_DIMENSION_JURISDICTIONS: Record<RealityDimension, string> = {
  format: 'Sequence, recurring segments, turn-taking, lyric architecture, and event/media mechanics.',
  role: 'Diction, expertise, obligations, procedural habits, and what the speaker believes their job requires.',
  world: 'Background ontology, institutions, hazards, assumptions, and what counts as normal in this reality.',
  species: 'Embodiment, sensory assumptions, native priorities, physical constraints, and reference frame.',
  venue: 'Immediate environmental constraints, available objects, local procedures, and spatial affordances.',
  headspace: 'Attention, salience, emotional weighting, interruption, working-memory pressure, and behavioral tempo.',
  alteredState: 'Identity, time, embodiment, perception, source attribution, semantic bandwidth, and reality-testing transformations.',
  tone: 'Delivery surface and performance coloration without overriding the operational mechanisms of other layers.',
};

export function getRealityEngine(id: string): RealityEngine | undefined {
  return REALITY_ENGINES.find((engine) => engine.id === id);
}

export function getRealityEngines(ids: string[]): RealityEngine[] {
  return ids
    .map((id) => getRealityEngine(id))
    .filter((engine): engine is RealityEngine => Boolean(engine));
}

export function getRealityEnginesByDimension(dimension: RealityDimension): RealityEngine[] {
  return REALITY_ENGINES.filter((engine) => engine.dimension === dimension);
}
