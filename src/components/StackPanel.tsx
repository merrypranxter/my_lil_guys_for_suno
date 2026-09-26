import React, { useState } from 'react';
import { LittleGuy, SavedStack } from '../types';
import { ArrowUp, ArrowDown, X, Trash2, Bookmark, Dices, Flame, Sparkles, FolderHeart, FlaskConical } from 'lucide-react';
import { ACTIVE_GUY_MAX, getStackChemistry, STACK_RECIPES } from '../lib/mindStacking';
import { ALTERED_STATE_RECIPES } from '../data/alteredStateRecipes';

interface StackPanelProps {
  stackGuys: LittleGuy[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (guyId: string) => void;
  onClear: () => void;
  onRollOne: () => void;
  onRollStack: () => void;
  onFuckMeUp: () => void;
  onLoadRecipe: (recipeId: string) => void;
  savedStacks: SavedStack[];
  onSaveStack: (name: string) => void;
  onLoadSavedStack: (stack: SavedStack) => void;
  onDeleteSavedStack: (id: string) => void;
}

export function StackPanel({
  stackGuys,
  onReorder,
  onRemove,
  onClear,
  onRollOne,
  onRollStack,
  onFuckMeUp,
  onLoadRecipe,
  savedStacks,
  onSaveStack,
  onLoadSavedStack,
  onDeleteSavedStack,
}: StackPanelProps) {
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const chemistry = getStackChemistry(stackGuys);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim() && stackGuys.length === 0) return;
    onSaveStack(saveName.trim() || `Stack of ${stackGuys.length}`);
    setSaveName('');
    setIsSaving(false);
  };

  return (
    <div className="bg-[#0f121a] border border-[#202738] rounded-xl p-4 md:p-5 shadow-xl space-y-4">
      {/* Top Header & Fast Roll Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#1c2230]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            <h2 className="text-sm md:text-base font-bold font-mono tracking-wider text-white">
              CURRENT STACK ({stackGuys.length})
            </h2>
          </div>
          <p className="text-[11px] font-mono text-[#7d8ba1]">
            Order matters. Position 1 is the protected lead. If this pool exceeds the activation budget, each generation chooses a diverse subset instead of installing everybody.
          </p>
        </div>

        {/* Global Action Rollers */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onRollOne}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#161b26] border border-[#2c354a] text-xs font-mono text-[#cbd5e1] hover:text-[#00f0ff] hover:border-[#00f0ff] transition-colors active:scale-95"
            title="Pick a single random Little Guy"
          >
            <Dices className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>ROLL ONE</span>
          </button>

          <button
            type="button"
            onClick={onRollStack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#161b26] border border-[#2c354a] text-xs font-mono text-[#cbd5e1] hover:text-[#39ff14] hover:border-[#39ff14] transition-colors active:scale-95"
            title="Build a chemistry-aware stack of 2 to 4 compatible but distinct Little Guys"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>ROLL A STACK</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRecipes(!showRecipes)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#161b26] border border-[#2c354a] text-xs font-mono text-[#cbd5e1] hover:text-[#ff9dea] hover:border-[#ff4fd8] transition-colors active:scale-95"
            title="Open curated high-chemistry mind recipes"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#ff4fd8]" />
            <span>RECIPES</span>
          </button>

          <button
            type="button"
            onClick={onFuckMeUp}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#ff0055] to-[#ff7700] text-white font-mono text-xs font-extrabold shadow-[0_0_15px_rgba(255,0,85,0.4)] hover:brightness-110 active:scale-95 transition-all"
            title="Build a high-chaos stack with maximum productive cognitive friction"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>FUCK ME UP</span>
          </button>

          {stackGuys.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-md bg-[#1a1317] border border-[#3d1c25] text-[#f87171] hover:bg-[#2e151c] transition-colors"
              title="Clear active stack"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {stackGuys.length > ACTIVE_GUY_MAX && (
        <div className="rounded-lg border border-[#00f0ff]/35 bg-[#081820] px-3 py-2.5 font-mono">
          <div className="text-[11px] font-bold text-[#7ff7ff]">
            ACTIVATION BUDGET: {ACTIVE_GUY_MAX} / {stackGuys.length} MINDS PER RUN
          </div>
          <div className="mt-1 text-[10px] leading-relaxed text-[#7d8ba1]">
            Nothing was deleted. This is now a candidate pool. The lead stays installed; support, counterforce, and wildcard minds are selected for family and jurisdiction distance on each generation.
          </div>
        </div>
      )}

      {showRecipes && (
        <div className="p-3 bg-[#0a0c12] border border-[#40203d] rounded-lg space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-mono font-bold text-[#ff9dea]">CURATED RECIPES</div>
              <div className="text-[10px] font-mono text-[#6f7890]">Whole-stack altered-state machines plus hand-built mind combinations. The drug recipes deliberately leave WORLD blank.</div>
            </div>
            <button type="button" onClick={() => setShowRecipes(false)} className="text-[#7d8ba1] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold tracking-wider text-[#00f0ff]">ALTERED-STATE WHOLE-STACK RECIPES</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {ALTERED_STATE_RECIPES.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => {
                    onLoadSavedStack(recipe);
                    setShowRecipes(false);
                  }}
                  className="text-left p-2.5 rounded-lg bg-[#0d1619] border border-[#17414b] hover:border-[#00f0ff] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-white">{recipe.name}</span>
                    <span className="text-[9px] font-mono text-[#7ff7ff]">WORLD: OPEN</span>
                  </div>
                  <div className="text-[10px] text-[#8e99aa] mt-1 leading-snug">{recipe.description}</div>
                  <div className="text-[9px] font-mono text-[#d1a8ff] mt-1.5 leading-snug">
                    SOUND: {recipe.instrumentSummary}
                  </div>
                  <div className="text-[9px] font-mono text-[#6f7890] mt-1">
                    {recipe.guyIds.length} minds • {recipe.realityEngineIds.length} reality layers • {recipe.compositionEngineIds.length} composition engines
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-1 text-[10px] font-mono font-bold tracking-wider text-[#ff9dea]">MIND-ONLY RECIPES</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {STACK_RECIPES.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => {
                  onLoadRecipe(recipe.id);
                  setShowRecipes(false);
                }}
                className="text-left p-2.5 rounded-lg bg-[#12131d] border border-[#2b2840] hover:border-[#ff4fd8] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-white">{recipe.name}</span>
                  <span className="text-[9px] font-mono text-[#ffb4a2]">CHAOS {recipe.chaos.toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-[#8e99aa] mt-1 leading-snug">{recipe.description}</div>
                <div className="text-[9px] font-mono text-[#6f7890] mt-1.5">{recipe.guyIds.length} minds</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stack Items List */}
      {stackGuys.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-lg border border-dashed border-[#232a3b] bg-[#0c0e14]">
          <p className="text-xs md:text-sm font-mono text-[#64748b] mb-3">
            No Little Guys in the chamber. Select from the menagerie below or roll one.
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={onRollOne}
              className="px-3 py-1.5 rounded bg-[#1e2433] text-xs font-mono text-[#00f0ff] hover:bg-[#283145]"
            >
              Random Guy
            </button>
            <button
              type="button"
              onClick={onRollStack}
              className="px-3 py-1.5 rounded bg-[#1e2433] text-xs font-mono text-[#39ff14] hover:bg-[#283145]"
            >
              Smart Stack (2-4)
            </button>
            <button
              type="button"
              onClick={onFuckMeUp}
              className="px-3 py-1.5 rounded bg-[#3b1220] text-xs font-mono text-[#ff0055] hover:bg-[#52172b]"
            >
              FUCK ME UP
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {stackGuys.map((guy, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={guy.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg border transition-all ${
                  isPrimary
                    ? 'bg-[#151a24] border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                    : 'bg-[#10131c] border-[#22293b]'
                }`}
              >
                {/* Left: Position badge, Name, Subtitle & Jurisdiction */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center font-mono font-bold text-xs rounded px-2 py-1 flex-shrink-0 ${
                      isPrimary
                        ? 'bg-[#00f0ff] text-black font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                        : 'bg-[#1e2535] text-[#94a3b8]'
                    }`}
                  >
                    {isPrimary ? '1. PRIMARY' : `${index + 1}. MUTATOR`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm truncate">{guy.name}</span>
                      <span className="text-[11px] font-mono text-[#64748b] hidden sm:inline">— {guy.subtitle}</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#7d8ba1] flex items-center gap-2 mt-0.5">
                      <span>
                        Jurisdiction: <span className="text-[#39ff14] font-semibold">{guy.defaultJurisdiction}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Up / Down / Remove controls */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onReorder(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 rounded bg-[#181d2a] border border-[#2b3447] text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onReorder(index, index + 1)}
                    disabled={index === stackGuys.length - 1}
                    className="p-1 rounded bg-[#181d2a] border border-[#2b3447] text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(guy.id)}
                    className="p-1 rounded bg-[#1f1519] border border-[#3b2029] text-[#f87171] hover:bg-[#331c23] hover:text-white ml-1"
                    title="Remove from stack"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Stack & Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1c2230]">
        <div className="flex items-center gap-2">
          {isSaving ? (
            <form onSubmit={handleSave} className="flex items-center gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Stack name..."
                className="bg-[#0c0e14] border border-[#2b3447] rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#00f0ff]"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-[#00f0ff] text-black text-xs font-mono font-bold hover:brightness-110"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="px-2 py-1 text-xs font-mono text-[#94a3b8] hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsSaving(true)}
              disabled={stackGuys.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#161a24] border border-[#293245] text-xs font-mono text-[#cbd5e1] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>SAVE STACK</span>
            </button>
          )}

          {savedStacks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSavedList(!showSavedList)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#161a24] border border-[#293245] text-xs font-mono text-[#cbd5e1] hover:text-white"
            >
              <FolderHeart className="w-3.5 h-3.5 text-[#ff0055]" />
              <span>SAVED ({savedStacks.length})</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-[#62728d] text-right">
          {stackGuys.length > 0 ? (
            <>
              <div>
                {stackGuys.length} {stackGuys.length === 1 ? 'brain' : 'brains'} • {chemistry.families.length} {chemistry.families.length === 1 ? 'family' : 'families'} • chaos {chemistry.averageChaos}/5
              </div>
              <div className="uppercase tracking-wider text-[#8b95a8]">{chemistry.label} chemistry • pairing {chemistry.pairingScore}</div>
            </>
          ) : (
            'Idle'
          )}
        </div>
      </div>

      {/* Saved Stacks Drawer / Popover */}
      {showSavedList && savedStacks.length > 0 && (
        <div className="p-3 bg-[#0a0c12] border border-[#262f42] rounded-lg space-y-2 mt-2">
          <div className="text-xs font-mono font-bold text-[#94a3b8] mb-1">SAVED STACKS IN LOCALSTORAGE:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {savedStacks.map((saved) => (
              <div
                key={saved.id}
                className="flex items-center justify-between p-2 rounded bg-[#121620] border border-[#202738] text-xs font-mono"
              >
                <button
                  type="button"
                  onClick={() => onLoadSavedStack(saved)}
                  className="text-left truncate flex-1 hover:text-[#00f0ff]"
                >
                  <span className="font-bold text-white block truncate">{saved.name}</span>
                  <span className="text-[10px] text-[#64748b]">{saved.guyIds.length} Guys</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSavedStack(saved.id)}
                  className="p-1 text-[#f87171] hover:text-white ml-2"
                  title="Delete saved stack"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
