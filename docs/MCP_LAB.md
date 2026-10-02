# Lil Guys MCP Lab

Lil Guys MCP Lab turns the existing Little Guy Machine into an MCP-accessible experimental instrument.

The goal is not to automate Suno. The goal is to let an MCP-capable AI run a multi-generation Lil Guys experiment without making the human copy and paste outputs between generations.

The final harvest is still a set of Suno-ready:

- STYLE
- LYRICS / CONTROL
- CAPTION

The human can then run those in Suno manually.

## What the MCP Lab does

The MCP server wraps the existing Lil Guys `/api/generate` endpoint and adds a persistent experimental notebook plus pre-programmed session recipes.

Current experiment modes:

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

Each recipe defines its own:

- population size
- default depth
- mutation directives
- selection pressure
- generation phases
- stop condition

The connected AI acts as the scientist between generations. It can inspect the population, preserve multiple interesting branches, record why survivors were kept, and continue the lineage.

There is deliberately no universal numerical "quality" score.

## Architecture

```
MCP-capable AI host
        |
        | MCP over stdio
        v
Lil Guys MCP Lab
        |
        | HTTP /api/generate
        v
Existing Lil Guys server
        |
        v
Gemini generation
```

The MCP notebook is stored by default at:

```
~/.lil-guys-lab/notebook.json
```

Override that location with `LIL_GUYS_LAB_DIR`.

The Lil Guys app URL defaults to:

```
http://127.0.0.1:3000
```

Override it with `LIL_GUYS_APP_URL`.

## Setup — easiest path for Google Antigravity

Current Google Antigravity supports local stdio MCP servers from its MCP configuration. Lil Guys includes a setup script so you do not have to hand-build the JSON.

### 1. Install dependencies

From the repo folder:

```bash
npm install
```

### 2. Generate the Antigravity MCP config

If Lil Guys is running locally at the normal development URL:

```bash
npm run mcp:setup
```

If Lil Guys is already deployed:

```bash
npm run mcp:setup -- --app-url https://YOUR-LIL-GUYS-URL
```

This creates or updates:

```text
.agents/mcp_config.json
```

It preserves other MCP servers already in that file and adds `lil-guys-lab`.

The generated config launches this repo with:

```text
npm --prefix <THIS-REPO> run mcp
```

and stores MCP-only notebook data in:

```text
.lil-guys-lab/notebook.json
```

Both generated local files are gitignored.

### 3A. Local Lil Guys

You do **not** have to start Lil Guys manually.

When Antigravity launches `npm run mcp`:

- if Lil Guys is already running locally, MCP reuses it;
- if it is not running and no `LIL_GUYS_APP_URL` is configured, MCP starts the existing Lil Guys dev server itself;
- app logs are routed to stderr so they do not corrupt the MCP stdio protocol channel.

So for normal Antigravity use there is no second terminal ritual.

### 3B. Deployed Lil Guys

If you used `--app-url`, the local MCP process talks to the deployed Lil Guys `/api/generate` endpoint instead.

The deployed app must be reachable from your computer. Lil Guys still owns the Gemini API key; the MCP layer does not need a second Gemini key.

### 4. Refresh Antigravity

In Antigravity:

**MCP Servers → Manage MCP Servers → Refresh**

You should see **lil-guys-lab** and its tools.

### Manual / generic MCP configuration

If you use a different MCP-capable host, the server command is still simply:

```bash
npm run mcp
```

Point that host at this repo as a local stdio MCP server and set `LIL_GUYS_APP_URL` when the Lil Guys API is not local.

## Test it before involving an AI

Run the MCP Inspector:

```bash
npm run mcp:inspect
```

Connect and call:

```
lab_check_connection
```

A healthy response reports:

- the Lil Guys app URL
- app status
- active Gemini model
- whether the Lil Guys server sees a Gemini API key
- the local MCP notebook path

## The easy way to use it

The MCP server publishes a prompt named:

```
run-lab-experiment
```

An MCP-capable AI can invoke that prompt and conduct the whole experiment.

Natural-language examples:

> Run a Deep Bore session on "The answer was technically a shrimp." Fuck-around 70. Take it until the stop rule, then give me the Suno-ready survivors.

> Put "The universe has a customer service department" through Anti-Merry. Keep several structurally different branches alive. Harvest four finalists.

> Start a human-selection Petri Dish on "There is something living between the integers." Generate the first population and let me choose the survivors.

> Run an Operator Stress Test on "Wake up, slut." Do not choose a winner. Explain what each operator actually changed.

## Tool surface

The connected AI sees these tools:

### `lab_check_connection`

Checks that the MCP process can reach Lil Guys.

### `lab_list_recipes`

Lists the experiment recipes, selection pressures, phases, and stop rules.

### `lab_plan`

Previews the generations, phases, mutation directives, stop rule, and maximum generation-call budget for a session **without making any generation calls**.

This is useful when you want to design the experiment first and only run it after the shape looks right.

### `lab_catalog`

Lets the connected AI browse the real IDs and rules already inside Lil Guys:

- Minds / Little Guys
- Reality Engines
- Composition Engines
- Music mechanisms
- Music recipes

This is what keeps autonomous setup from hallucinating fake component IDs. The AI can search the catalog and choose a small, legible stack with productive collisions instead of random soup.

### `lab_start`

Starts a persistent experiment. Important inputs include:

- seed
- mode
- population
- depth
- `fuckAround` from 0–100
- `selectionMode`: assistant, human, or mixed
- optional Little Guys / Reality / Composition engine IDs
- optional real Music mechanism IDs and Music recipe IDs discovered through `lab_catalog`

### `lab_generate_generation`

Generates the next population.

One branch equals one normal Lil Guys `/api/generate` request.

Calls are sequential rather than burst-fired.

### `lab_select_survivors`

Records the surviving branches and why they survived.

The AI is instructed to preserve useful diversity rather than inventing a universal art score.

### `lab_feedback`

Stars or unstars a result and attaches feedback/tags.

MCP Lab starred history becomes soft genetic material for FAVORITE DNA sessions.

### `lab_get_result`

Returns one complete result with full STYLE, LYRICS, CAPTION, fingerprint, ancestry, feedback, and tags.

### `lab_get_session`

Returns the full experiment state and lineage.

### `lab_list_sessions`

Lists recent experiments from the notebook.

### `lab_next_move`

Returns whether the session should generate again, select survivors, or harvest.

### `lab_finish`

Marks the experiment completed or abandoned without deleting its history.

### `lab_export_suno`

Harvests the **latest selected generation** by default as Suno-ready Markdown packages, so intermediate ancestors do not flood the final handoff. Star-only export is also available.

## Seed sovereignty

The original seed stays the seed throughout the experiment.

Lab instructions such as "invert causality" or "avoid the dominant metaphor" are supplied through Lil Guys' existing novelty/preference context. They are not appended to the semantic seed itself.

That means the evolutionary machinery can mutate how the seed is interpreted without silently replacing what the song is about.

## Calls and cost

The MCP layer itself does not add a paid model call just for bookkeeping.

Actual generation still uses the existing Lil Guys `/api/generate` route.

So:

```
population 6 × 4 generations = up to 24 generation calls
```

if every generation is run at full population.

Use smaller populations/depth for cheap exploratory runs and larger ones when deliberately bone-picking.

## Important current boundary: browser memory

The existing Lil Guys web UI stores a lot of its history, stars, feedback, genomes, and Petri Dishes in browser `localStorage`.

A separate MCP process cannot safely or magically reach into a browser's `localStorage`.

So MCP Lab v0.1 keeps its own notebook.

That means:

- MCP Lab sessions persist across MCP conversations.
- MCP Lab stars/feedback influence MCP Lab FAVORITE DNA.
- The browser's existing stars/feedback still behave normally inside the web app.
- The two archives are not automatically synchronized yet.

A future bridge can explicitly import/export browser archive data into the Lab notebook. That should be done deliberately rather than using brittle browser scraping.

## Human-selection mode

If `selectionMode` is `human`, the AI generates each population and then stops for the human to select survivors.

This preserves the current Petri Dish philosophy exactly.

If `selectionMode` is `assistant`, the AI follows the named recipe's selection pressure and continues without copy/paste.

`mixed` can be used when the AI normally selects but the human wants to intervene at important generations.

## Verification

Static recipe verification:

```bash
npm run verify:mcp-lab
```

TypeScript check:

```bash
npm run lint
```

Interactive MCP check:

```bash
npm run mcp:inspect
```

## What this version does NOT do

It does not submit anything to Suno.

It does not click around the Suno website.

It does not silently merge itself into the existing browser archive.

It does not expose a public unauthenticated MCP endpoint on the internet.

It does not merge code to `main` automatically.

Those boundaries are intentional.
