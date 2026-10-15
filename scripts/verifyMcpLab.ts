import assert from 'node:assert/strict';
import { EXPERIMENT_MODE_IDS, LAB_RECIPES, getLabRecipe, suggestedDirectives } from '../src/mcp/recipes';

assert.equal(LAB_RECIPES.length, EXPERIMENT_MODE_IDS.length, 'every experiment mode needs exactly one recipe');
assert.equal(new Set(LAB_RECIPES.map((recipe) => recipe.id)).size, LAB_RECIPES.length, 'recipe IDs must be unique');

for (const id of EXPERIMENT_MODE_IDS) {
  const recipe = getLabRecipe(id);
  assert.ok(recipe.name.trim(), id + ' needs a name');
  assert.ok(recipe.purpose.trim(), id + ' needs a purpose');
  assert.ok(recipe.defaultPopulation >= 1 && recipe.defaultPopulation <= 12, id + ' population must stay bounded');
  assert.ok(recipe.defaultDepth >= 1 && recipe.defaultDepth <= 12, id + ' depth must stay bounded');
  assert.ok(recipe.selectionPressure.length > 0, id + ' needs explicit selection pressure');
  assert.ok(recipe.phases.length > 0, id + ' needs at least one phase');
  assert.ok(recipe.stopRule.trim(), id + ' needs a stop rule');
  assert.ok(recipe.directiveBank.length > 0, id + ' needs mutation directives');

  const calm = suggestedDirectives(recipe, 0, 4, 10);
  const feral = suggestedDirectives(recipe, 1, 4, 95);
  assert.equal(calm.length, 4, id + ' should respect population');
  assert.equal(feral.length, 4, id + ' should respect population');
  assert.ok(calm.every((line) => line.includes('Mutation pressure: low')), id + ' calm pressure label');
  assert.ok(feral.every((line) => line.includes('Mutation pressure: feral')), id + ' feral pressure label');
}

console.log('MCP Lab recipe verification passed for ' + LAB_RECIPES.length + ' experiment modes.');
