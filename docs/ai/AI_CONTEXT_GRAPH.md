# AI Context Graph — Reading Order

> **Purpose**: Help AI Agents build mental context in the correct order. Follow this graph top-to-bottom.

---

## Primary Reading Path

```
                        AGENTS.md
                           │
                           ▼
                     AI_OVERVIEW.md
                     (Project intro)
                           │
                    ┌──────┴──────┐
                    ▼              ▼
         platform-freeze-v1.md   AI_ARCHITECTURE.md
         (What's frozen)         (Why Plugin Architecture)
                    │              │
                    └──────┬───────┘
                           ▼
              workspace-architecture-v1.md
              (Full Architecture SSOT)
                           │
                    ┌──────┴──────┐
                    ▼              ▼
         design-system-v2.md    feature-sdk-v1.md
         (Design SSOT)          (Feature SDK API)
                    │              │
                    ▼              ▼
         ui-guidelines-v1.md    plugin-sdk-v1.md
         icon-guidelines-v1.md  (Plugin SDK API)
         interaction-guidelines │
                    │              │
                    └──────┬───────┘
                           ▼
                  AI_PLUGIN_GUIDE.md
                  (How to create Plugins)
                           │
                           ▼
              plugin-definition-of-done-v1.md
              (DoD Checklist)
                           │
                    ┌──────┴──────┐
                    ▼              ▼
         AI_CODE_REVIEW.md     AI_RELEASE.md
         (Review checklist)    (Release checklist)
```

---

## Quick-Start Path (for simple tasks)

If the task is a **simple Plugin creation**, skip to:

```
AI_OVERVIEW.md → AI_PLUGIN_GUIDE.md → plugin-definition-of-done-v1.md
```

Then use the Generator:
```bash
npm run create-plugin <name>
```

---

## Deep-Dive Path (for architectural work)

If the task involves **understanding architecture deeply**:

```
AI_OVERVIEW.md
    → AI_ARCHITECTURE.md
    → workspace-architecture-v1.md (full spec)
    → AI_DECISIONS.md (why decisions were made)
```

---

## Design Path (for UI work)

If the task involves **UI or visual changes**:

```
AI_OVERVIEW.md
    → design-system-v2.md (Design SSOT)
    → ui-guidelines-v1.md (Page layout)
    → icon-guidelines-v1.md (Icon system)
    → interaction-guidelines-v1.md (Motion + States)
    → AI_UI_GUIDE.md (AI-specific UI rules)
```

---

## Review Path (for code review)

If the task is **reviewing a PR**:

```
AI_CODE_REVIEW.md (checklist)
    → plugin-definition-of-done-v1.md (DoD)
    → workspace-architecture-v1.md §8 (AI Rules)
    → design-system-v2.md §8 (AI Design Rules)
```

---

## Document Dependency Map

```
AGENTS.md                          ← Entry point (references all below)
  ├── AI_OVERVIEW.md               ← Project intro
  ├── AI_ARCHITECTURE.md           ← Architecture for AI
  │   └── workspace-architecture-v1.md  ← Architecture SSOT
  ├── AI_PLUGIN_GUIDE.md           ← Plugin dev guide
  │   ├── plugin-sdk-v1.md         ← Plugin SDK SSOT
  │   ├── feature-sdk-v1.md        ← Feature SDK SSOT
  │   ├── plugin-generator.md      ← Generator docs
  │   └── plugin-definition-of-done-v1.md ← DoD SSOT
  ├── AI_UI_GUIDE.md               ← UI dev guide
  │   ├── design-system-v2.md      ← Design SSOT
  │   ├── ui-guidelines-v1.md      ← UI patterns
  │   ├── icon-guidelines-v1.md    ← Icon rules
  │   └── interaction-guidelines-v1.md ← Interaction rules
  ├── AI_CODE_REVIEW.md            ← Review checklist
  ├── AI_RELEASE.md                ← Release checklist
  ├── AI_DECISIONS.md              ← Architecture decisions
  └── AI_PROMPT_CONVENTION.md      ← Prompt format standard
```

---

## File Responsibilities

| File | Role | Audience |
|------|------|----------|
| `AGENTS.md` | Universal entry point | All AI Agents |
| `CLAUDE.md` | Claude Code specifics | Claude Code only |
| `docs/ai/AI_OVERVIEW.md` | Project introduction | All AI Agents |
| `docs/ai/AI_ARCHITECTURE.md` | Architecture for AI | AI performing architectural work |
| `docs/ai/AI_PLUGIN_GUIDE.md` | Plugin dev guide | AI creating Plugins |
| `docs/ai/AI_UI_GUIDE.md` | UI dev guide | AI building UI |
| `docs/ai/AI_CODE_REVIEW.md` | Review checklist | AI reviewing PRs |
| `docs/ai/AI_RELEASE.md` | Release checklist | AI preparing releases |
| `docs/ai/AI_DECISIONS.md` | Decision records | AI questioning architecture |
| `docs/ai/AI_PROMPT_CONVENTION.md` | Prompt format | Human developers writing prompts |
| `docs/ai/AI_CONTEXT_GRAPH.md` | Reading order | All AI Agents (this file) |

---

## Recommended Reading Time

| Path | Est. Time | When |
|------|-----------|------|
| Quick-Start | 5 min | Creating a simple Plugin |
| Primary | 15 min | First time in repo |
| Deep-Dive | 30 min | Architectural work |
| Design | 20 min | UI work |
| Review | 10 min | PR review |

---

> **Start here**: Go back to [`AGENTS.md`](../../AGENTS.md) if you haven't read it yet.
