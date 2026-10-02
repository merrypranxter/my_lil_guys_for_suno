# Lil Guys Lab MCP

Lil Guys can now expose a **local MCP laboratory** that lets an MCP-capable AI agent conduct multi-generation prompt experiments without Merry copy/pasting every intermediate result.

The MCP layer does **not** send anything to Suno. It ends by exporting finished Suno-ready STYLE / LYRICS / CAPTION packages for the human to run in Suno manually.

## What this gives you

The agent can:

- start named experiment modes;
- generate several descendants per generation;
- inspect the outputs;
- keep survivors;
- carry ancestry into the next generation;
- star results and attach feedback;
- stop according to a recipe;
- export the surviving Suno-ready packages;
- preserve a local lab notebook between conversations.

Built-in experiment modes:

- PETRI DISH
- DEEP BORE
- CROSSBREED
- NOVELTY HUNT
- FAVORITE DNA
- OPERATOR STRESS TEST
- MUTATION LADDER
- FAMILY TREE
- ALIEN INVASION
- ANTI-MERRY
- BONE PICKER
- TOURNAMENT

The recipes intentionally use qualitative selection pressure instead of fake art scores. The agent is told to preserve useful diversity and record why it kept a branch.

---

## Easiest setup: Google Antigravity

Current Antigravity supports local MCP servers launched from its MCP config.

### 1. Install this repo normally

From the Lil Guys project directory:

```bash
npm install
```

### 2. Tell the MCP Lab where Lil Guys is running

If you run Lil Guys locally at the normal development URL:

```bash
npm run mcp:setup
```

That targets:

```text
http://127.0.0.1:3000
```

If Lil Guys is deployed somewhere else, use the deployed URL:

```bash
npm run mcp:setup -- --app-url https://YOUR-LIL-GUYS-URL
```

The setup script writes:

```text
.agents/mcp_config.json
```

It preserves other servers already in that file and adds a server named:

```text
lil-guys-lab
```

The generated entry launches this repo's MCP process with `npm run mcp`.

### 3. Refresh Antigravity MCP servers

In Antigravity:

**MCP Servers → Manage MCP Servers → Refresh**

You should see **lil-guys-lab** and its tools.

### 4. Check the connection

Ask:

```text
Use lil-guys-lab and check its connection.
```

The `lab_check_connection` tool reports the Lil Guys URL, model, whether the app sees its Gemini API key, and where the MCP notebook is stored.

---

## Running an experiment

A minimal request:

```text
Use Lil Guys Lab.

Seed:
The universe has a customer service department.

Run PETRI DISH.
Fuck-around 75.
Go four generations.
You choose survivors.
At the end give me only the surviving Suno-ready packages and a short lineage summary.
```

The agent can now:

1. call `lab_start`;
2. call `lab_generate_generation`;
3. inspect the returned STYLE / CAPTION / lyric preview;
4. fetch full candidates with `lab_get_result` when needed;
5. select survivors with `lab_select_survivors`;
6. call `lab_next_move`;
7. repeat until the recipe stops;
8. call `lab_finish`;
9. call `lab_export_suno`.

No intermediate copy/paste is required.

---

## Human-selection mode

If you want the machine to generate but **you** decide what breeds:

```text
Start a FAMILY TREE experiment on this seed.
Selection mode human.
Show me each generation and wait for me to choose survivors.
```

The agent should generate the population, show it to you, and then record your survivor choices.

---

## "Fuck-around" control

Every session has a `fuckAround` value from 0–100.

Rough meaning:

- 0–29 — one meaningful change at a time;
- 30–54 — moderate mutation while keeping ancestry obvious;
- 55–79 — high mutation and non-obvious consequences;
- 80–100 — feral structural mutation while keeping the seed/ancestry recognizable.

The original user seed remains the sovereign subject. MCP mutation instructions are supplied through Lil Guys' existing novelty/preference context rather than replacing the seed text.

---

## The MCP tools

### `lab_check_connection`

Checks the Lil Guys API target.

### `lab_list_recipes`

Lists the experiment recipes, their phases, selection pressure, defaults, and stop rules.

### `lab_start`

Creates a persistent session and returns a scientist runbook for the connected agent.

### `lab_generate_generation`

Runs the next population. By default the recipe generates its own mutation directives. The agent can also provide explicit directives.

One Lil Guys API generation happens per branch, sequentially.

### `lab_select_survivors`

Records which result IDs survive and why.

### `lab_feedback`

Stars/un-stars a result and stores feedback/tags.

### `lab_get_result`

Returns one complete result, including full STYLE / LYRICS / CAPTION.

### `lab_get_session`

Returns the full experiment state and genealogy.

### `lab_list_sessions`

Lists recent experiments.

### `lab_next_move`

Tells the agent whether the next action is generate, select survivors, or harvest.

### `lab_finish`

Marks the experiment complete without deleting it.

### `lab_export_suno`

Exports surviving (or starred) outputs as Markdown containing complete Suno-ready STYLE / LYRICS / CAPTION boxes.

---

## Where the notebook lives

By default the setup script stores MCP-only experiment history here:

```text
.lil-guys-lab/notebook.json
```

That directory is gitignored.

### Important: browser archive vs MCP notebook

The existing Lil Guys UI keeps a large amount of its history and learned preference state in browser `localStorage`.

A stdio MCP process cannot magically read a browser's private `localStorage`.

So **v0.1 intentionally keeps a separate MCP notebook**.

That means:

- MCP stars/feedback persist across MCP sessions;
- FAVORITE DNA can learn from MCP-starred results;
- ordinary browser stars/feedback are still in the browser's existing archive;
- the two histories are not yet automatically merged.

A later phase can add a shared server-side Lab Store so browser play and MCP automation learn from the same exact archive. That is the clean long-term architecture.

---

## Local Lil Guys + local MCP

Terminal 1:

```bash
npm run dev
```

Terminal 2 is not normally required because the MCP host launches `npm run mcp` itself.

For debugging only:

```bash
npm run mcp:inspect
```

That opens the official MCP Inspector against the Lil Guys Lab stdio server.

---

## Deployed Lil Guys + local MCP

This is probably the easiest daily setup if the app is already deployed.

Run once:

```bash
npm run mcp:setup -- --app-url https://YOUR-DEPLOYED-LIL-GUYS-URL
```

Antigravity launches the MCP server locally, but generation requests go to the deployed Lil Guys `/api/generate` endpoint.

The local MCP notebook still stays on your computer.

---

## Environment variables

```text
LIL_GUYS_APP_URL
```

URL for the Lil Guys app/API. Defaults to `http://127.0.0.1:3000`.

```text
LIL_GUYS_LAB_DIR
```

Optional directory for the MCP notebook. The setup script points it at the repo's `.lil-guys-lab` directory.

Lil Guys itself still owns `GEMINI_API_KEY`; the MCP layer does not need a second Gemini key when it is calling the Lil Guys API.

---

## Example session patterns

### Bone Picker

```text
Use Lil Guys Lab.
Run BONE PICKER on:
"There is something living between the integers."

Go until the stop rule says the idea is stripped clean.
Choose survivors yourself.
Export the final descendants for Suno.
```

### Anti-Merry

```text
Run ANTI-MERRY on:
"Wake up, slut."

Use my MCP-starred history as repulsion pressure.
Find structures unlike what I usually keep.
Do not become bland just to be different.
```

### Operator Stress Test

```text
Run OPERATOR STRESS TEST.
Keep the seed and outer setup stable.
I want to see what each cognitive transformation actually does.
Do not collapse to one winner; give me the useful differences.
```

### Family Tree with human selection

```text
Run FAMILY TREE on this seed.
Keep three visibly different lineages alive.
I choose survivors at each generation.
Do not cross the families until they have distinct identities.
```

---

## What v0.1 deliberately does not do

- It does not control Suno.
- It does not silently post songs.
- It does not automatically declare one result objectively "best."
- It does not reach into browser `localStorage`.
- It does not mutate the main app's browser state.
- It does not expose secrets through MCP.

It is a **laboratory driver + notebook + genealogy + Suno export layer** around Lil Guys' existing generator.
