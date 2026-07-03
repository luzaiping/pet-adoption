<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-context -->
# Project Context

Before starting any task, read the following files in `docs/project-context/`:

- `tech-stack.md` — pinned dependency versions and coding/process
  conventions. Stable, rarely changes.
- `architecture-decisions.md` — confirmed architecture decisions
  (with reasoning) and explicitly rejected approaches. Check this
  before proposing a new architecture-level choice — it may already
  have been decided, or already tried and rejected.
- `progress-snapshot.md` — current state of the project: what's
  done, known issues, and next steps. This reflects current state,
  not a chronological log — trust it over inferring progress from
  reading code alone.
- `learning-mode.md` — if this file exists, it defines the current
  interaction style for this project (small steps, explain code,
  confirm before proceeding). If it's absent, default to normal
  efficiency-first behavior.
- `role.md` — If this file exists, it defines your role, responsibilities, and expected workflow. Follow the instructions and workflow defined in it strictly.

## Maintaining docs/project-context/

After completing a feature or sub-task:

- Always update `progress-snapshot.md` to reflect the new current
  state. Overwrite the relevant sections — do not append a
  chronological log entry.
- Only update `architecture-decisions.md` if this task introduced a
  new architecture decision, or reversed/changed an existing one.
  Leave it untouched otherwise.
- Commit documentation updates in a separate commit from code
  changes, so code diffs stay clean.

  
<!-- END:project-context -->