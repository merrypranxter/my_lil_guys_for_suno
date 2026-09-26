import React, { useState, useEffect } from 'react';
import { LITTLE_GUYS } from './data/littleGuys';
import { ArchivedRun, LittleGuy, BoxType, SavedStack, GenerationResponse, MusicBredGenome, MusicControls, MusicStackItem, PetriDishExperiment, PetriDishSibling, RealityChaosLevel } from './types';
import { generateProceduralTrack, clampAndPad, TARGETS } from './lib/proceduralGenerator';
import { ACTIVE_GUY_MAX, buildSmartStack, planGuyActivation, resolveRecipe } from './lib/mindStacking';
import { getMindMetadata } from './data/mindMetadata';
import { Header } from './components/Header';
import { GuyCard } from './components/GuyCard';
import { StackPanel } from './components/StackPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { RealityEnginePanel } from './components/RealityEnginePanel';
import { CompositionLabPanel } from './components/CompositionLabPanel';
import { MouthLabPanel } from './components/MouthLabPanel';
import { MusicSeedLabPanel } from './components/MusicSeedLabPanel';
import { PetriDishPanel } from './components/PetriDishPanel';
import { genomeToStackItem } from './lib/musicBreeding';
import { blendSiblingControls, buildSiblingMusicStack } from './lib/petriDish';
import { MUSIC_FEEDBACK_TAGS, compileMusicStack, musicGenomePhenotypeSignature } from './data/musicSeedSystem';
import { OutputBox } from './components/OutputBox';
import { ModuleDock, ModuleSection } from './components/ModuleShell';
import type { ModuleNavItem } from './components/ModuleShell';
import {
  getLastStack,
  setLastStack,
  getLastRealityEngineIds,
  setLastRealityEngineIds,
  getLastCompositionEngineIds,
  setLastCompositionEngineIds,
  getLastMusicStack,
  setLastMusicStack,
  getSavedMusicControls,
  setSavedMusicControls,
  getSavedRealityChaos,
  setSavedRealityChaos,
  getSavedEnergy,
  setSavedEnergy,
  getSavedSeed,
  setSavedSeed,
  getLastMouthGenome,
  setLastMouthGenome,
  getSavedMouthPromptMode,
  setSavedMouthPromptMode,
  getSavedMouthSemanticMode,
  setSavedMouthSemanticMode,
  getSavedStacks,
  saveStackToFavorites,
  deleteSavedStack,
  getRunArchive,
  saveGeneratedRun,
  updateArchivedRun,
  getRecentFingerprints,
  getLikedPreferenceSignals,
  getCompositionFavoriteSignals,
  getMusicPreferenceSignals,
  getLikedMusicMechanismWeights,
  getLikedMindWeights,
  getLikedRealityWeights,
  getNoveltyPressureSignals,
  getMouthNoveltyPressureSignals,
  getRecentMechanismSaturation,
  promoteGenomesFromRun,
  promoteMouthGenomeFromRun,
  runToMarkdown,
  archiveToMarkdown,
} from './lib/localStorage';
import { AlertCircle, Archive, Download, Layers, MessageSquare, Sparkles, Star, X } from 'lucide-react';
import type { MouthGenome, MouthPromptMode, MouthSemanticMode } from './mouthLab/types';
import { getMouthQuirkDefinition } from './mouthLab/quirks';
import { getMouthTrait } from './mouthLab/traits';

const UI_MODULES: ModuleNavItem[] = [
  { id: 'stack', label: 'STACK', tone: 'cyan' },
  { id: 'controls', label: 'CONTROLS', tone: 'lime' },
  { id: 'reality', label: 'REALITY', tone: 'pink' },
  { id: 'music', label: 'MUSIC SEEDS', tone: 'yellow' },
  { id: 'petri', label: 'PETRI DISH', tone: 'coral' },
  { id: 'composition', label: 'COMPOSITION', tone: 'violet' },
  { id: 'mouth', label: 'MOUTH LAB', tone: 'red' },
  { id: 'output', label: 'OUTPUT', tone: 'blue' },
  { id: 'minds', label: 'MINDS', tone: 'red' },
];

const DEFAULT_MODULE_OPEN = Object.fromEntries(UI_MODULES.map((item) => [item.id, true])) as Record<string, boolean>;

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [modelName, setModelName] = useState('gemini-3.5-flash-lite');
  const [hasApiKey, setHasApiKey] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const [stackGuyIds, setStackGuyIds] = useState<string[]>(() => {
    const saved = getLastStack();
    if (saved && saved.length > 0) return saved;
    return ['taxonomy-goblin', 'recall-mold', 'cosmic-clerk'];
  });

  const [realityEngineIds, setRealityEngineIds] = useState<string[]>(() => getLastRealityEngineIds());
  const [compositionEngineIds, setCompositionEngineIds] = useState<string[]>(() => getLastCompositionEngineIds());
  const [musicStack, setMusicStack] = useState<MusicStackItem[]>(() => getLastMusicStack());
  const [musicControls, setMusicControls] = useState<MusicControls>(() => getSavedMusicControls());
  const [realityChaos, setRealityChaos] = useState<RealityChaosLevel>(() => getSavedRealityChaos());
  const [savedStacks, setSavedStacks] = useState<SavedStack[]>(() => getSavedStacks());
  const [seed, setSeed] = useState<string>(() => getSavedSeed());
  const [energy, setEnergy] = useState<number>(() => getSavedEnergy());
  const [mouthGenome, setMouthGenome] = useState<MouthGenome | undefined>(() => getLastMouthGenome());
  const [mouthPromptMode, setMouthPromptMode] = useState<MouthPromptMode>(() => getSavedMouthPromptMode());
  const [mouthSemanticMode, setMouthSemanticMode] = useState<MouthSemanticMode>(() => getSavedMouthSemanticMode());

  const [outputs, setOutputs] = useState({
    style: '',
    lyrics: '',
    caption: '',
  });

  const [currentRun, setCurrentRun] = useState<ArchivedRun | null>(null);
  const [archiveCount, setArchiveCount] = useState(() => getRunArchive().length);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackTagsDraft, setFeedbackTagsDraft] = useState<string[]>([]);
  const [likedMechanismIdsDraft, setLikedMechanismIdsDraft] = useState<string[]>([]);
  const [dislikedMechanismIdsDraft, setDislikedMechanismIdsDraft] = useState<string[]>([]);
  const [likedMouthTraitIdsDraft, setLikedMouthTraitIdsDraft] = useState<string[]>([]);
  const [dislikedMouthTraitIdsDraft, setDislikedMouthTraitIdsDraft] = useState<string[]>([]);
  const [likedMouthQuirkIdsDraft, setLikedMouthQuirkIdsDraft] = useState<string[]>([]);
  const [dislikedMouthQuirkIdsDraft, setDislikedMouthQuirkIdsDraft] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [repairingBox, setRepairingBox] = useState<BoxType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('stack');
  const [moduleOpen, setModuleOpen] = useState<Record<string, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem('little-guys-ui-modules-v1');
      return saved ? { ...DEFAULT_MODULE_OPEN, ...JSON.parse(saved) } : DEFAULT_MODULE_OPEN;
    } catch {
      return DEFAULT_MODULE_OPEN;
    }
  });

  useEffect(() => {
    fetch('/api/info')
      .then(async (res) => {
        const text = await res.text();
        return JSON.parse(text);
      })
      .then((data) => {
        if (data.model) setModelName(data.model);
        if (typeof data.hasApiKey === 'boolean') setHasApiKey(data.hasApiKey);
      })
      .catch(() => {
        // Dev server / offline fallback
      });
  }, []);

  useEffect(() => {
    setLastStack(stackGuyIds);
  }, [stackGuyIds]);

  useEffect(() => {
    setLastRealityEngineIds(realityEngineIds);
  }, [realityEngineIds]);

  useEffect(() => {
    setLastCompositionEngineIds(compositionEngineIds);
  }, [compositionEngineIds]);

  useEffect(() => {
    setLastMusicStack(musicStack);
  }, [musicStack]);

  useEffect(() => {
    setSavedMusicControls(musicControls);
  }, [musicControls]);

  useEffect(() => {
    setSavedRealityChaos(realityChaos);
  }, [realityChaos]);

  useEffect(() => {
    setLastMouthGenome(mouthGenome);
  }, [mouthGenome]);

  useEffect(() => {
    setSavedMouthPromptMode(mouthPromptMode);
  }, [mouthPromptMode]);

  useEffect(() => {
    setSavedMouthSemanticMode(mouthSemanticMode);
  }, [mouthSemanticMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('little-guys-ui-modules-v1', JSON.stringify(moduleOpen));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }, [moduleOpen]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-ui-module="true"]'));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.getAttribute('data-module-id');
        if (id) setActiveModule(id);
      },
      { rootMargin: '-15% 0px -68% 0px', threshold: [0, 0.05, 0.2, 0.5] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [moduleOpen]);

  const setAllModules = (open: boolean) => {
    setModuleOpen(Object.fromEntries(UI_MODULES.map((item) => [item.id, open])) as Record<string, boolean>);
  };

  const toggleModule = (id: string) => {
    setModuleOpen((current) => ({ ...current, [id]: !current[id] }));
  };

  const jumpToModule = (id: string) => {
    setModuleOpen((current) => ({ ...current, [id]: true }));
    setActiveModule(id);
    window.setTimeout(() => {
      document.getElementById('module-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const handleSeedChange = (newSeed: string) => {
    setSeed(newSeed);
    setSavedSeed(newSeed);
  };

  const handleEnergyChange = (level: number) => {
    setEnergy(level);
    setSavedEnergy(level);
  };

  const handleToggleGuy = (guyId: string) => {
    setStackGuyIds((prev) => {
      if (prev.includes(guyId)) return prev.filter((id) => id !== guyId);
      return [...prev, guyId];
    });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setStackGuyIds((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleRemove = (guyId: string) => {
    setStackGuyIds((prev) => prev.filter((id) => id !== guyId));
  };

  const handleClear = () => {
    setStackGuyIds([]);
  };

  const handleRollOne = () => {
    const randomGuy = LITTLE_GUYS[Math.floor(Math.random() * LITTLE_GUYS.length)];
    setStackGuyIds([randomGuy.id]);
  };

  const handleRollStack = () => {
    const count = Math.floor(Math.random() * 3) + 2;
    const chosen = buildSmartStack(count, 'balanced', LITTLE_GUYS, getLikedMindWeights());
    setStackGuyIds(chosen.map((g) => g.id));
  };

  const handleFuckMeUp = () => {
    const count = Math.floor(Math.random() * 3) + 3;
    const chosen = buildSmartStack(count, 'feral', LITTLE_GUYS, getLikedMindWeights());
    setStackGuyIds(chosen.map((g) => g.id));
  };

  const handleLoadRecipe = (recipeId: string) => {
    const chosen = resolveRecipe(recipeId);
    if (chosen.length > 0) setStackGuyIds(chosen.map((g) => g.id));
  };

  const handleSaveStack = (name: string) => {
    setSavedStacks(
      saveStackToFavorites(
        name,
        stackGuyIds,
        realityEngineIds,
        realityChaos,
        compositionEngineIds,
        musicStack,
        musicControls,
        mouthGenome,
        mouthPromptMode,
        mouthSemanticMode
      )
    );
  };

  const handleLoadSavedStack = (saved: SavedStack) => {
    setStackGuyIds(saved.guyIds);
    setRealityEngineIds(saved.realityEngineIds || []);
    setCompositionEngineIds(saved.compositionEngineIds || []);
    setMusicStack(saved.musicStack || []);
    if (saved.musicControls) setMusicControls(saved.musicControls);
    if (saved.realityChaos) setRealityChaos(saved.realityChaos);
    setMouthGenome(saved.mouthGenome);
    setMouthPromptMode(saved.mouthPromptMode || 'bracketed');
    setMouthSemanticMode(saved.mouthSemanticMode || 'inherit');
  };

  const handleDeleteSavedStack = (id: string) => {
    setSavedStacks(deleteSavedStack(id));
  };


  const handleOpenPetriSibling = (experiment: PetriDishExperiment, sibling: PetriDishSibling) => {
    const challenge = experiment.challenge;
    setStackGuyIds([...challenge.guyIds]);
    setRealityEngineIds([...challenge.realityEngineIds]);
    setCompositionEngineIds([...challenge.compositionEngineIds]);
    setRealityChaos(challenge.realityChaos);
    handleSeedChange(challenge.seed);
    handleEnergyChange(challenge.energy);
    setMusicStack(buildSiblingMusicStack(challenge.baseMusicStack, sibling.genome));
    setMusicControls(blendSiblingControls(challenge.baseMusicControls, sibling.genome.controls));
    setMouthGenome(challenge.mouthGenome);
    setMouthPromptMode(challenge.mouthPromptMode || 'bracketed');
    setMouthSemanticMode(challenge.mouthSemanticMode || 'inherit');

    if (sibling.result && !sibling.result.error) {
      setOutputs({
        style: sibling.result.style,
        lyrics: sibling.result.lyrics,
        caption: sibling.result.caption,
      });
      setCurrentRun(null);
      setNoticeMessage(
        'Loaded Petri Dish sibling ' + sibling.genome.name + ' and restored the frozen challenge. The displayed dish result is a preview until you generate/archive it in the main lab.'
      );
    } else {
      setNoticeMessage(
        'Loaded Petri Dish sibling ' + sibling.genome.name + ' and restored the frozen challenge.'
      );
    }
    setErrorMessage(null);
    setModuleOpen((current) => ({ ...current, output: true }));
    window.setTimeout(() => {
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleStackPetriGenome = (genome: MusicBredGenome) => {
    const signature = musicGenomePhenotypeSignature(genome);
    const alreadyActive = musicStack.some(
      (item) =>
        !item.muted &&
        item.kind === 'genome' &&
        musicGenomePhenotypeSignature(item.genome) === signature
    );

    if (alreadyActive) {
      setNoticeMessage(
        'Phenotype already active. Duplicate genome copies no longer add hidden weight; change the existing strength if you want more influence.'
      );
      setErrorMessage(null);
      return;
    }

    setMusicStack((current) => [...current, genomeToStackItem(genome)]);
    setMusicControls((current) => blendSiblingControls(current, genome.controls));
    setNoticeMessage('Stacked bred genome ' + genome.name + ' into the main Music Seed Lab.');
    setErrorMessage(null);
  };

  const archiveGeneration = (data: GenerationResponse, effectiveModel: string, usedGuyIds: string[] = stackGuyIds) => {
    const style = data.style || '';
    const lyrics = data.lyrics || '';
    const caption = data.caption || '';
    const run = saveGeneratedRun({
      guyIds: [...usedGuyIds],
      realityEngineIds: [...realityEngineIds],
      compositionEngineIds: [...compositionEngineIds],
      musicStack: [...musicStack],
      musicControls: { ...musicControls },
      realityChaos,
      mouthGenome,
      mouthPromptMode,
      mouthSemanticMode,
      seed,
      energy,
      model: effectiveModel,
      style,
      lyrics,
      caption,
      charCounts: data.charCounts || {
        style: style.length,
        lyrics: lyrics.length,
        caption: caption.length,
      },
      fingerprint: data.fingerprint,
    });
    setCurrentRun(run);
    setArchiveCount(getRunArchive().length);
  };

  const handleGenerate = async () => {
    if (stackGuyIds.length === 0 || isGenerating) return;

    const activationPlan = planGuyActivation(
      stackGuyIds,
      energy >= 5 ? 'feral' : 'balanced',
      getLikedMindWeights()
    );
    const activeGuyIds = activationPlan.activeIds;
    if (activeGuyIds.length === 0) return;
    const activationNotice = activationPlan.capped
      ? 'Activation budget engaged: ' + activeGuyIds.length + ' of ' + activationPlan.requestedIds.length +
        ' selected minds are active this run. Lead preserved; the rest were chosen for family/jurisdiction distance.'
      : null;

    setIsGenerating(true);
    setErrorMessage(null);
    setNoticeMessage(null);
    setCurrentRun(null);

    const recentFingerprints = getRecentFingerprints(12);
    const likedSignals = [
      ...getCompositionFavoriteSignals(4),
      ...getMusicPreferenceSignals(4),
      ...getLikedPreferenceSignals(5),
    ].slice(0, 10);
    const noveltySignals = [
      ...getNoveltyPressureSignals(8),
      ...getMouthNoveltyPressureSignals(5),
    ].slice(0, 12);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guyIds: activeGuyIds,
          realityEngineIds,
          compositionEngineIds,
          musicStack,
          musicControls,
          realityChaos,
          seed,
          energy,
          recentFingerprints,
          likedSignals,
          noveltySignals,
          mouthGenome,
          mouthPromptMode,
          mouthSemanticMode,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: GenerationResponse & { notice?: string };

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) throw new Error('Server returned HTTP ' + response.status + '. Please try again.');
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) throw new Error(data?.error || 'HTTP error ' + response.status);

      const effectiveModel = data.model || modelName;
      if (data.model) setModelName(data.model);

      setOutputs({
        style: data.style || '',
        lyrics: data.lyrics || '',
        caption: data.caption || '',
      });
      archiveGeneration(data, effectiveModel, activeGuyIds);

      if (data.notice || activationNotice) setNoticeMessage([activationNotice, data.notice].filter(Boolean).join(' '));

      setModuleOpen((current) => ({ ...current, output: true }));
      setTimeout(() => {
        document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Primary generation interrupted, deploying Little Guy engine:', err?.message || err);

      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      const isNetworkOrPattern =
        err.name === 'TypeError' ||
        err.message?.includes('Load failed') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('pattern') ||
        err.message?.includes('NetworkError');

      if (isNetworkOrPattern || isAbort || err.message?.includes('high demand') || err.message?.includes('quota')) {
        try {
          const fallback = generateProceduralTrack({
            guyIds: activeGuyIds,
            realityEngineIds,
            compositionEngineIds,
            musicStack,
            musicControls,
            realityChaos,
            seed,
            energy,
            recentFingerprints,
            mouthGenome,
            mouthPromptMode,
            mouthSemanticMode,
          });
          const fallbackResponse: GenerationResponse = {
            style: fallback.style,
            lyrics: fallback.lyrics,
            caption: fallback.caption,
            fingerprint: fallback.fingerprint,
            model: 'procedural-synthesizer',
            charCounts: {
              style: fallback.style.length,
              lyrics: fallback.lyrics.length,
              caption: fallback.caption.length,
            },
          };
          setModelName('procedural-synthesizer');
          setOutputs({
            style: fallback.style,
            lyrics: fallback.lyrics,
            caption: fallback.caption,
          });
          archiveGeneration(fallbackResponse, 'procedural-synthesizer', activeGuyIds);
          setNoticeMessage([activationNotice, 'Generated track using the diverse procedural engine while AI models recalibrate.'].filter(Boolean).join(' '));
          setModuleOpen((current) => ({ ...current, output: true }));
          window.setTimeout(() => {
            document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        } catch (localErr) {
          console.error('Local fallback failed:', localErr);
        }
      }

      const friendlyMsg = isAbort
        ? 'Generation timed out. Please try again with a smaller stack or single guy.'
        : isNetworkOrPattern
        ? 'Network connection interrupted. Please click Generate again.'
        : err.message || 'Generation failed. Please try again.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const persistRepairToArchive = (type: BoxType, repairedText: string) => {
    if (!currentRun) return;
    const patch: any = {
      charCounts: {
        ...currentRun.charCounts,
        [type]: repairedText.length,
      },
    };
    patch[type] = repairedText;
    const updated = updateArchivedRun(currentRun.id, patch);
    if (updated) setCurrentRun(updated);
  };

  const handleRepairBox = async (type: BoxType) => {
    const currentText = outputs[type];
    if (!currentText || repairingBox) return;

    setRepairingBox(type);
    setErrorMessage(null);
    setNoticeMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxType: type, currentText }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        if (!response.ok) throw new Error('Server returned HTTP ' + response.status);
        throw new Error('Server returned an unreadable response format.');
      }

      if (!response.ok) throw new Error(data?.error || 'HTTP repair error ' + response.status);

      if (data.model && data.model !== 'calibrator-engine') setModelName(data.model);
      if (data.repairedText) {
        setOutputs((prev) => ({ ...prev, [type]: data.repairedText }));
        persistRepairToArchive(type, data.repairedText);
        setNoticeMessage('Calibrated ' + type.toUpperCase() + ' to ' + data.repairedText.length + ' characters.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Network/API repair unavailable; applying local algorithmic calibration:', err?.message || err);

      const target = TARGETS[type];
      if (target) {
        const paddingSnippet = '[CALIBRATION INVARIANT: Maintaining operational trajectory for ' + type.toUpperCase() + '. Baseline protocol sustained.]';
        const calibrated = clampAndPad(currentText, target.min, target.max, paddingSnippet);
        setOutputs((prev) => ({ ...prev, [type]: calibrated }));
        persistRepairToArchive(type, calibrated);
        setNoticeMessage('Calibrated ' + type.toUpperCase() + ' to ' + calibrated.length + ' characters (Target: ' + target.min + '–' + target.max + ').');
      } else {
        setErrorMessage('Failed to calibrate ' + type + ' length: ' + err.message);
      }
    } finally {
      setRepairingBox(null);
    }
  };

  const openFeedback = () => {
    if (!currentRun) return;
    setFeedbackDraft(currentRun.feedback || '');
    setFeedbackTagsDraft(currentRun.feedbackTags || []);
    setLikedMechanismIdsDraft(currentRun.likedMechanismIds || []);
    setDislikedMechanismIdsDraft(currentRun.dislikedMechanismIds || []);
    setLikedMouthTraitIdsDraft(currentRun.likedMouthTraitIds || []);
    setDislikedMouthTraitIdsDraft(currentRun.dislikedMouthTraitIds || []);
    setLikedMouthQuirkIdsDraft(currentRun.likedMouthQuirkIds || []);
    setDislikedMouthQuirkIdsDraft(currentRun.dislikedMouthQuirkIds || []);
    setFeedbackOpen(true);
  };

  const savePositiveFeedback = () => {
    if (!currentRun) return;
    const updated = updateArchivedRun(currentRun.id, {
      starred: true,
      feedback: feedbackDraft.trim(),
      feedbackTags: feedbackTagsDraft,
      likedMechanismIds: likedMechanismIdsDraft,
      dislikedMechanismIds: dislikedMechanismIdsDraft,
      likedMouthTraitIds: likedMouthTraitIdsDraft,
      dislikedMouthTraitIds: dislikedMouthTraitIdsDraft,
      likedMouthQuirkIds: likedMouthQuirkIdsDraft,
      dislikedMouthQuirkIds: dislikedMouthQuirkIdsDraft,
    });
    if (updated) {
      setCurrentRun(updated);
      const promoted = promoteGenomesFromRun(updated);
      const mouthPromoted = promoteMouthGenomeFromRun(updated);
      const parts = [
        'Fitness recorded.',
        promoted > 0
          ? promoted + ' music genome phenotype' + (promoted === 1 ? '' : 's') + ' earned durable breeding status.'
          : 'No music genome phenotype was present to promote.',
        mouthPromoted
          ? 'The active Mouth Lab phenotype entered breeding stock; explicit mouth-gene votes will bias species crossover while recent-use cooldown still protects novelty.'
          : 'No Mouth Lab phenotype was present to promote.',
      ];
      setNoticeMessage(parts.join(' '));
    }
    setFeedbackOpen(false);
  };

  const unstarCurrent = () => {
    if (!currentRun) return;
    const updated = updateArchivedRun(currentRun.id, { starred: false });
    if (updated) setCurrentRun(updated);
    setFeedbackOpen(false);
  };

  const exportCurrent = () => {
    if (!currentRun) return;
    const stamp = new Date(currentRun.createdAt).toISOString().replace(/[:.]/g, '-');
    downloadText('little-guy-run-' + stamp + '.md', runToMarkdown(currentRun));
  };

  const exportAll = () => {
    const runs = getRunArchive();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText('little-guy-machine-archive-' + stamp + '.md', archiveToMarkdown(runs));
  };

  const activeStackGuys: LittleGuy[] = stackGuyIds
    .map((id) => LITTLE_GUYS.find((g) => g.id === id))
    .filter((g): g is LittleGuy => Boolean(g));

  const currentFeedbackMechanisms = currentRun
    ? compileMusicStack(currentRun.musicStack || [], currentRun.musicControls).mechanisms.map((entry) => entry.mechanism)
    : [];
  const currentFeedbackMouthTraits = currentRun?.mouthGenome
    ? Array.from(
        new Set(currentRun.mouthGenome.assignments.flatMap((assignment) => assignment.traitIds)),
      )
        .map((id) => getMouthTrait(id))
        .filter((trait): trait is NonNullable<ReturnType<typeof getMouthTrait>> => Boolean(trait))
    : [];
  const currentFeedbackMouthQuirks = currentRun?.mouthGenome
    ? Array.from(
        new Set(
          currentRun.mouthGenome.quirks
            .filter((quirk) => quirk.enabled)
            .map((quirk) => quirk.quirkId),
        ),
      )
        .map((id) => getMouthQuirkDefinition(id))
        .filter((quirk): quirk is NonNullable<ReturnType<typeof getMouthQuirkDefinition>> => Boolean(quirk))
    : [];
  const mechanismSaturation = getRecentMechanismSaturation(8);
  const coolingMechanismCount = Object.values(mechanismSaturation).filter((value) => value >= 0.72).length;

  const filteredGuys = LITTLE_GUYS.filter((guy) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      guy.name.toLowerCase().includes(q) ||
      guy.subtitle.toLowerCase().includes(q) ||
      guy.rule.toLowerCase().includes(q) ||
      guy.defaultJurisdiction.toLowerCase().includes(q) ||
      getMindMetadata(guy.id).family.toLowerCase().includes(q) ||
      getMindMetadata(guy.id).compatibilityTags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#e0e6ed]">
      <Header modelName={modelName} hasApiKey={hasApiKey} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {noticeMessage && !errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#1e1b12] border border-[#854d0e] text-[#fef08a] flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-mono shadow-md">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#eab308] animate-pulse" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              className="text-[#fef08a]/80 hover:text-white hover:underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#2b1216] border border-[#7f1d1d] text-[#fca5a5] flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-mono shadow-lg animate-shake">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-3 py-1 bg-[#ef4444] text-black font-bold rounded hover:bg-[#f87171] transition-colors disabled:opacity-50"
              >
                Retry Now
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-white hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <ModuleDock
          items={UI_MODULES}
          activeId={activeModule}
          onJump={jumpToModule}
          onOpenAll={() => setAllModules(true)}
          onCloseAll={() => setAllModules(false)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ModuleSection
              id="stack"
              title="CURRENT STACK"
              eyebrow="01 • choose who is thinking"
              summary={activeStackGuys.length + ' selected • max ' + ACTIVE_GUY_MAX + ' active per generation'}
              tone="cyan"
              open={moduleOpen.stack}
              active={activeModule === 'stack'}
              onToggle={() => toggleModule('stack')}
            >
              <StackPanel
                stackGuys={activeStackGuys}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onClear={handleClear}
                onRollOne={handleRollOne}
                onRollStack={handleRollStack}
                onFuckMeUp={handleFuckMeUp}
                onLoadRecipe={handleLoadRecipe}
                savedStacks={savedStacks}
                onSaveStack={handleSaveStack}
                onLoadSavedStack={handleLoadSavedStack}
                onDeleteSavedStack={handleDeleteSavedStack}
              />
            </ModuleSection>
          </div>

          <div className="lg:col-span-5">
            <ModuleSection
              id="controls"
              title="GLOBAL CONTROLS"
              eyebrow="02 • seed / energy / generate"
              summary={'Seed: ' + (seed || 'random') + ' • Energy: ' + energy}
              tone="lime"
              open={moduleOpen.controls}
              active={activeModule === 'controls'}
              onToggle={() => toggleModule('controls')}
            >
              <ControlsPanel
                seed={seed}
                onSeedChange={handleSeedChange}
                energy={energy}
                onEnergyChange={handleEnergyChange}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={stackGuyIds.length > 0}
              />
            </ModuleSection>
          </div>
        </div>

        <ModuleSection
          id="reality"
          title="REALITY ENGINE"
          eyebrow="03 • destabilize the world"
          summary={realityEngineIds.length + ' engine' + (realityEngineIds.length === 1 ? '' : 's') + ' selected • chaos ' + realityChaos}
          tone="pink"
          open={moduleOpen.reality}
          active={activeModule === 'reality'}
          onToggle={() => toggleModule('reality')}
        >
          <RealityEnginePanel
            selectedIds={realityEngineIds}
            onChange={setRealityEngineIds}
            chaosLevel={realityChaos}
            onChaosChange={setRealityChaos}
            preferenceWeights={getLikedRealityWeights()}
          />
        </ModuleSection>

        <ModuleSection
          id="music"
          title="MUSIC SEED LAB"
          eyebrow="04 • behavior recipes / genes"
          summary={musicStack.length + ' music seed' + (musicStack.length === 1 ? '' : 's') + ' in the stack' + (coolingMechanismCount ? ' • ' + coolingMechanismCount + ' traits cooling' : '')}
          tone="yellow"
          open={moduleOpen.music}
          active={activeModule === 'music'}
          onToggle={() => toggleModule('music')}
        >
          <MusicSeedLabPanel
            stack={musicStack}
            onChange={setMusicStack}
            controls={musicControls}
            onControlsChange={setMusicControls}
            preferenceWeights={getLikedMusicMechanismWeights()}
            noveltySaturation={mechanismSaturation}
          />
        </ModuleSection>

        <ModuleSection
          id="petri"
          title="PETRI DISH"
          eyebrow="05 • breed / compare siblings"
          summary="Frozen challenge experiments and bred music genomes"
          tone="coral"
          open={moduleOpen.petri}
          active={activeModule === 'petri'}
          onToggle={() => toggleModule('petri')}
        >
          <PetriDishPanel
            guyIds={stackGuyIds}
            realityEngineIds={realityEngineIds}
            compositionEngineIds={compositionEngineIds}
            realityChaos={realityChaos}
            seed={seed}
            energy={energy}
            musicStack={musicStack}
            musicControls={musicControls}
            mouthGenome={mouthGenome}
            mouthPromptMode={mouthPromptMode}
            mouthSemanticMode={mouthSemanticMode}
            onOpenSibling={handleOpenPetriSibling}
            onStackSibling={handleStackPetriGenome}
          />
        </ModuleSection>

        <ModuleSection
          id="composition"
          title="COMPOSITION LAB"
          eyebrow="06 • structural music engines"
          summary={compositionEngineIds.length + ' composition engine' + (compositionEngineIds.length === 1 ? '' : 's') + ' selected'}
          tone="violet"
          open={moduleOpen.composition}
          active={activeModule === 'composition'}
          onToggle={() => toggleModule('composition')}
        >
          <CompositionLabPanel
            selectedIds={compositionEngineIds}
            onChange={setCompositionEngineIds}
          />
        </ModuleSection>

        <ModuleSection
          id="mouth"
          title="MOUTH LAB"
          eyebrow="07 • breed the vocal organism"
          summary={
            mouthGenome
              ? mouthGenome.parentDonorIds.length + ' parents • ' +
                mouthGenome.assignments.flatMap((assignment) => assignment.traitIds).length + ' traits • ' +
                mouthGenome.quirks.length + ' quirks'
              : 'No active mouth • breed 2–6 language parents'
          }
          tone="red"
          open={moduleOpen.mouth}
          active={activeModule === 'mouth'}
          onToggle={() => toggleModule('mouth')}
        >
          <MouthLabPanel
            genome={mouthGenome}
            promptMode={mouthPromptMode}
            semanticMode={mouthSemanticMode}
            sourceRunId={currentRun?.id}
            onGenomeChange={setMouthGenome}
            onPromptModeChange={setMouthPromptMode}
            onSemanticModeChange={setMouthSemanticMode}
            onNotice={setNoticeMessage}
          />
        </ModuleSection>

        <ModuleSection
          id="output"
          title="SUNO OUTPUT"
          eyebrow="08 • the three boxes"
          summary={currentRun ? 'Current run archived • ready to copy / repair / star' : 'Generate a run and the three Suno boxes land here'}
          tone="blue"
          open={moduleOpen.output}
          active={activeModule === 'output'}
          onToggle={() => toggleModule('output')}
        >
          <div id="output-section" className="space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
              <div>
                <h2 className="text-base md:text-lg font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#39ff14] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                  <span>THREE SUNO GENERATION BOXES</span>
                </h2>
                <p className="text-xs font-mono text-[#7d8ba1]">
                  Every completed run is archived locally. Recent musical territory is used to fight accidental genre monoculture.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={exportAll}
                  disabled={archiveCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#334155] bg-[#111827] text-[#cbd5e1] hover:border-[#00f0ff] hover:text-white disabled:opacity-40"
                >
                  <Archive className="w-3.5 h-3.5" />
                  EXPORT ALL .MD ({archiveCount})
                </button>

                {currentRun && (
                  <>
                    <button
                      type="button"
                      onClick={exportCurrent}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#334155] bg-[#111827] text-[#cbd5e1] hover:border-[#39ff14] hover:text-white"
                    >
                      <Download className="w-3.5 h-3.5" />
                      EXPORT CURRENT .MD
                    </button>

                    <button
                      type="button"
                      onClick={openFeedback}
                      className={
                        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-bold transition-colors ' +
                        (currentRun.starred
                          ? 'border-[#ffd84d] bg-[#2d2508] text-[#ffe680] hover:bg-[#3a3009]'
                          : 'border-[#ff4fd8] bg-[#251020] text-[#ff9dea] hover:bg-[#35152d]')
                      }
                    >
                      <Star className="w-3.5 h-3.5" fill={currentRun.starred ? 'currentColor' : 'none'} />
                      {currentRun.starred ? 'LIKED — EDIT FEEDBACK' : 'STAR THIS'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {currentRun?.fingerprint && (
              <div className="rounded-xl border border-[#252d3b] bg-[#0d1017] px-4 py-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7d8ba1] mb-2">
                  musical fingerprint saved with this run
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  {[
                    currentRun.fingerprint.genreFamily,
                    currentRun.fingerprint.rhythm,
                    currentRun.fingerprint.vocal,
                    currentRun.fingerprint.production,
                  ].map((item) => (
                    <span key={item} className="px-2 py-1 rounded border border-[#273248] bg-[#111827] text-[#a8d8ff]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-12">
                <OutputBox
                  type="style"
                  title="BOX 1 — STYLE"
                  subtitle="Productive Contradiction Under Constraint (Harmony, Melody, Rhythm, Timbre, Attitude, Anchor, Operators)"
                  targetRange={{ min: 975, max: 999, yellowTolerance: 50 }}
                  content={outputs.style}
                  onRepair={handleRepairBox}
                  isRepairing={repairingBox === 'style'}
                />
              </div>

              <div className="lg:col-span-12">
                <OutputBox
                  type="lyrics"
                  title="BOX 2 — LYRICS / CONTROL"
                  subtitle="Mutation Cycle: Form → Destabilize → Fracture → Collapse → Anchor Returns → Reform Stranger. Bracketed directives."
                  targetRange={{ min: 4900, max: 4999, yellowTolerance: 200 }}
                  content={outputs.lyrics}
                  onRepair={handleRepairBox}
                  isRepairing={repairingBox === 'lyrics'}
                />
              </div>

              <div className="lg:col-span-12">
                <OutputBox
                  type="caption"
                  title="BOX 3 — CAPTION"
                  subtitle="Compact publishable explanation of structural mechanisms and sonic trajectory"
                  targetRange={{ min: 490, max: 499, yellowTolerance: 35 }}
                  content={outputs.caption}
                  onRepair={handleRepairBox}
                  isRepairing={repairingBox === 'caption'}
                />
              </div>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection
          id="minds"
          title={'LITTLE GUY MENAGERIE (' + LITTLE_GUYS.length + ')'}
          eyebrow="08 • the minds"
          summary={searchQuery ? 'Filtering minds for: ' + searchQuery : 'Browse, search, add, remove — collapse this whole bastard when you are done'}
          tone="red"
          open={moduleOpen.minds}
          active={activeModule === 'minds'}
          onToggle={() => toggleModule('minds')}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base md:text-lg font-bold font-mono tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#ff0055]" />
                  <span>LITTLE GUY MENAGERIE ({LITTLE_GUYS.length})</span>
                </h2>
                <p className="text-xs font-mono text-[#7d8ba1]">
                  Click any specimen to add or remove from the selected pool. Pick as many as you want; each generation activates at most {ACTIVE_GUY_MAX} minds, preserving the first as lead when the pool is over budget.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter guys or rules..."
                  className="w-full bg-[#0a0c12] border border-[#232b3d] rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-[#556177] focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredGuys.map((guy) => {
                const stackIndex = stackGuyIds.indexOf(guy.id);
                const isSelected = stackIndex !== -1;
                return (
                  <GuyCard
                    key={guy.id}
                    guy={guy}
                    isSelected={isSelected}
                    stackPosition={isSelected ? stackIndex + 1 : null}
                    onToggle={handleToggleGuy}
                  />
                );
              })}
            </div>

            {filteredGuys.length === 0 && (
              <div className="py-12 text-center text-xs font-mono text-[#64748b]">
                No Little Guy matched "{searchQuery}".
              </div>
            )}
          </div>
        </ModuleSection>
      </main>

      <footer className="border-t border-[#161a24] bg-[#090b0e] py-6 px-4 text-center font-mono text-xs text-[#526077]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE LITTLE GUY MACHINE • SUNO COGNITIVE PROMPT GENERATOR</span>
          <span>DIVERSE MUSIC MEMORY • STAR FEEDBACK • MARKDOWN ARCHIVE</span>
        </div>
      </footer>

      {feedbackOpen && currentRun && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#ff4fd8]/50 bg-[#0d1017] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-[#252d3b]">
              <div>
                <h3 className="font-mono font-bold text-[#ffe680] flex items-center gap-2">
                  <Star className="w-4 h-4" fill="currentColor" />
                  TEACH THE LITTLE BASTARD
                </h3>
                <p className="mt-1 text-xs font-mono text-[#8d99aa]">
                  Tell it what worked — and what should NOT inherit. A star is weak whole-run evidence; explicit trait votes control reproductive pressure.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="p-1 text-[#7d8ba1] hover:text-white"
                aria-label="Close feedback"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-mono text-[#ffe680] mb-2">QUICK TAGS — WHAT WORKED?</div>
                <div className="flex flex-wrap gap-1.5">
                  {MUSIC_FEEDBACK_TAGS.map((tag) => {
                    const active = feedbackTagsDraft.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFeedbackTagsDraft((current) =>
                          current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
                        )}
                        className={
                          'rounded-full border px-2.5 py-1.5 text-[10px] font-mono font-bold transition-colors ' +
                          (active
                            ? 'border-[#ffd84d] bg-[#332b0d] text-[#ffe680]'
                            : 'border-[#343b4c] bg-[#11151d] text-[#8d99aa] hover:text-white')
                        }
                      >
                        {active ? '★ ' : ''}{tag}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] font-mono text-[#657187]">
                  Tags describe the overall result. The gene controls below decide what should actually reproduce.
                </p>
              </div>

              {currentFeedbackMechanisms.length > 0 && (
                <div className="rounded-xl border border-[#3f3546] bg-[#0a0b10] p-3">
                  <div className="text-xs font-mono text-[#c7a7ff] mb-1">TRAIT FITNESS — WHAT GETS TO BREED?</div>
                  <div className="text-[10px] font-mono text-[#69758a] mb-3">
                    A whole-song star is only weak evidence. Mark specific mechanisms to give them positive or negative inheritance pressure.
                  </div>
                  <div className="space-y-2">
                    {currentFeedbackMechanisms.map((mechanism) => {
                      const liked = likedMechanismIdsDraft.includes(mechanism.id);
                      const disliked = dislikedMechanismIdsDraft.includes(mechanism.id);
                      return (
                        <div key={mechanism.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-[#242b38] bg-[#0d1017] px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono font-black text-white">{mechanism.name}</div>
                            <div className="text-[9px] text-[#68758a] line-clamp-1">{mechanism.shortExplanation}</div>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setLikedMechanismIdsDraft((current) =>
                                  liked ? current.filter((id) => id !== mechanism.id) : [...current.filter((id) => id !== mechanism.id), mechanism.id]
                                );
                                setDislikedMechanismIdsDraft((current) => current.filter((id) => id !== mechanism.id));
                              }}
                              className={
                                'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                (liked
                                  ? 'border-[#39ff14] bg-[#102417] text-[#a7ff9f]'
                                  : 'border-[#334155] bg-[#111827] text-[#7d8ba1] hover:text-white')
                              }
                            >
                              ★ INHERIT
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDislikedMechanismIdsDraft((current) =>
                                  disliked ? current.filter((id) => id !== mechanism.id) : [...current.filter((id) => id !== mechanism.id), mechanism.id]
                                );
                                setLikedMechanismIdsDraft((current) => current.filter((id) => id !== mechanism.id));
                              }}
                              className={
                                'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                (disliked
                                  ? 'border-[#ef4444] bg-[#2b1216] text-[#fca5a5]'
                                  : 'border-[#334155] bg-[#111827] text-[#7d8ba1] hover:text-white')
                              }
                            >
                              ✕ SUPPRESS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(currentFeedbackMouthTraits.length > 0 || currentFeedbackMouthQuirks.length > 0) && (
                <div className="rounded-xl border border-[#55313f] bg-[#120c11] p-3">
                  <div className="text-xs font-mono text-[#ff9daf] mb-1">MOUTH FITNESS — WHICH WEIRD SHIT SHOULD REPRODUCE?</div>
                  <div className="text-[10px] font-mono text-[#7d6870] mb-3">
                    The whole star stays weak evidence. These explicit votes affect species crossover; recent-use cooldown can still temporarily push a beloved gene aside so Mouth Lab does not become one RRRRR-shaped monoculture.
                  </div>

                  {currentFeedbackMouthTraits.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[9px] font-mono font-black tracking-[0.14em] text-[#d7a7ff]">TRAITS</div>
                      {currentFeedbackMouthTraits.map((trait) => {
                        const liked = likedMouthTraitIdsDraft.includes(trait.id);
                        const disliked = dislikedMouthTraitIdsDraft.includes(trait.id);
                        return (
                          <div key={trait.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-[#322633] bg-[#0d0b10] px-3 py-2">
                            <div className="min-w-0">
                              <div className="text-[10px] font-mono font-black text-white">{trait.name}</div>
                              <div className="text-[9px] text-[#725f72] line-clamp-1">{trait.shortExplanation}</div>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setLikedMouthTraitIdsDraft((current) =>
                                    liked ? current.filter((id) => id !== trait.id) : [...current.filter((id) => id !== trait.id), trait.id]
                                  );
                                  setDislikedMouthTraitIdsDraft((current) => current.filter((id) => id !== trait.id));
                                }}
                                className={
                                  'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                  (liked
                                    ? 'border-[#39ff14] bg-[#102417] text-[#a7ff9f]'
                                    : 'border-[#3a3040] bg-[#111018] text-[#7d7183] hover:text-white')
                                }
                              >
                                ★ INHERIT
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDislikedMouthTraitIdsDraft((current) =>
                                    disliked ? current.filter((id) => id !== trait.id) : [...current.filter((id) => id !== trait.id), trait.id]
                                  );
                                  setLikedMouthTraitIdsDraft((current) => current.filter((id) => id !== trait.id));
                                }}
                                className={
                                  'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                  (disliked
                                    ? 'border-[#ef4444] bg-[#2b1216] text-[#fca5a5]'
                                    : 'border-[#3a3040] bg-[#111018] text-[#7d7183] hover:text-white')
                                }
                              >
                                ✕ SUPPRESS
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentFeedbackMouthQuirks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[9px] font-mono font-black tracking-[0.14em] text-[#ff9daf]">QUIRKS</div>
                      {currentFeedbackMouthQuirks.map((quirk) => {
                        const liked = likedMouthQuirkIdsDraft.includes(quirk.id);
                        const disliked = dislikedMouthQuirkIdsDraft.includes(quirk.id);
                        return (
                          <div key={quirk.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-[#3a2630] bg-[#100b0e] px-3 py-2">
                            <div className="min-w-0">
                              <div className="text-[10px] font-mono font-black text-white">{quirk.name}</div>
                              <div className="text-[9px] text-[#765f68] line-clamp-1">{quirk.shortExplanation}</div>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setLikedMouthQuirkIdsDraft((current) =>
                                    liked ? current.filter((id) => id !== quirk.id) : [...current.filter((id) => id !== quirk.id), quirk.id]
                                  );
                                  setDislikedMouthQuirkIdsDraft((current) => current.filter((id) => id !== quirk.id));
                                }}
                                className={
                                  'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                  (liked
                                    ? 'border-[#39ff14] bg-[#102417] text-[#a7ff9f]'
                                    : 'border-[#3a3040] bg-[#111018] text-[#7d7183] hover:text-white')
                                }
                              >
                                ★ INHERIT
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDislikedMouthQuirkIdsDraft((current) =>
                                    disliked ? current.filter((id) => id !== quirk.id) : [...current.filter((id) => id !== quirk.id), quirk.id]
                                  );
                                  setLikedMouthQuirkIdsDraft((current) => current.filter((id) => id !== quirk.id));
                                }}
                                className={
                                  'rounded border px-2 py-1 text-[9px] font-mono font-black ' +
                                  (disliked
                                    ? 'border-[#ef4444] bg-[#2b1216] text-[#fca5a5]'
                                    : 'border-[#3a3040] bg-[#111018] text-[#7d7183] hover:text-white')
                                }
                              >
                                ✕ SUPPRESS
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <label className="block">
                <span className="text-xs font-mono text-[#ff9dea] flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  WHAT DID YOU LIKE ABOUT THIS?
                </span>
                <textarea
                  value={feedbackDraft}
                  onChange={(e) => setFeedbackDraft(e.target.value)}
                  placeholder="Examples: the scat fighting the barbershop harmony; the rhythm was peppy without becoming EDM; the dry narrator turning into animal noises; the acoustic instruments; the way the anchor kept mutating..."
                  rows={6}
                  className="w-full resize-y rounded-xl border border-[#30384a] bg-[#080a0f] p-3 text-sm text-white placeholder-[#566173] focus:outline-none focus:border-[#ff4fd8]"
                />
              </label>

              {currentRun.fingerprint && (
                <div className="text-[11px] font-mono text-[#7d8ba1] rounded-lg border border-[#232b3d] bg-[#0a0c12] p-3">
                  <div className="text-[#a8d8ff] mb-1">It will also remember the musical fingerprint:</div>
                  {currentRun.fingerprint.genreFamily} • {currentRun.fingerprint.rhythm} • {currentRun.fingerprint.vocal} • {currentRun.fingerprint.production}
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-2">
                {currentRun.starred ? (
                  <button
                    type="button"
                    onClick={unstarCurrent}
                    className="px-4 py-2 rounded-lg border border-[#5b2330] text-[#ff9aa9] font-mono text-xs hover:bg-[#2b1216]"
                  >
                    UNSTAR
                  </button>
                ) : <span />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#334155] text-[#a8b3c5] font-mono text-xs hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={savePositiveFeedback}
                    className="px-4 py-2 rounded-lg bg-[#ffd84d] text-black font-mono font-bold text-xs hover:bg-[#ffe680]"
                  >
                    ★ SAVE AS LIKED
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
