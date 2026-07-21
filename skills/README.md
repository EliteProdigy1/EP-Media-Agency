# EP Skill Packages — Standard

**This directory is the single source of truth for EP's reusable skills.**
The Website Factory (this repo) owns each skill's *definition, workflow,
inputs, outputs, tool requirements, and portable instructions*. The Elite
Prodigy Command Center **consumes** the generated `REGISTRY.json` and layers
operational metadata (approval status, agent assignment, execution history,
connector status, errors, usage) on top — it never stores its own copy of a
skill definition.

## Layout

```
skills/
  <skill-slug>/
    SKILL.md            human documentation
    manifest.json       machine contract (drives REGISTRY.json)
    portable-prompt.md  runnable in Claude / ChatGPT / another agent
    CHANGELOG.md        version history
  REGISTRY.json         GENERATED from the manifests — do not hand-edit
  scripts/
    skill-index.js      builds + validates REGISTRY.json from the folders
```

`skill-slug` equals the skill `id` (kebab-case) for a 1:1 mapping with the
Command Center's operational metadata.

## SKILL.md must document
purpose · when to use · when **not** to use · required inputs · workflow ·
tools/connectors · outputs · approvals · failure handling · examples.

## manifest.json fields (validated)
`id · name · version · category · status · summary · limitations ·
authorizedAgents[] · requiredTools[] · optionalTools[] ·
connectors[{name,status}] · inputs[] · outputs[] · approvalRules ·
compatibility{claude,chatgpt,viktor} · sourceRepo · sourcePaths[] ·
lastVerified · workflows[] · relatedKnowledge[]`

`summary` (one-line purpose) and `limitations` are definitional and live in
the manifest so the Command Center never hand-copies a skill's description —
it reads them straight from the generated index.

**Status vocab:** `Ready · Connected · Ready to connect · Planned · Needs credentials`
**Connector/compatibility vocab:** `CONNECTED · AVAILABLE · READY TO CONNECT · MANUAL · PLANNED · UNSUPPORTED · UNKNOWN`

## portable-prompt.md
Must be runnable in Claude, ChatGPT, or another agent, and must explicitly
state which connectors/tools are required (and what to do when they are not
connected).

## Regenerating the index

```
npm run ep:skills:validate   # validate manifests (unique ids, required fields, vocab)
npm run ep:skills:index      # write skills/REGISTRY.json from the folders
```

`REGISTRY.json` is always fully reproducible from the source folders. No skill
record is hand-authored into the index.

## Ground rules
- Never invent capabilities. `status` and connector states are honest.
- The Command Center consumes the index; it must not fork or hand-maintain
  skill definitions.
- `lastVerified` reflects the last time the skill was actually run/checked.
