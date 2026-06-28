# Learning Mode (active during current project phase)

This project is currently in a learning-focused phase, not an
efficiency-first one. Apply the following on top of the standard
tech-stack and process rules:

- Implement one clearly-scoped small feature or sub-step at a time.
  Stop after completing it and wait for confirmation before moving on
  — do not chain multiple steps together unprompted.
- Explain key or non-trivial code as you write it, especially
  anything introducing a new concept, library, or pattern. Implement
  and explain together — do not silently complete a step and only
  explain if asked.
- Before implementing anything non-trivial (an architecture choice, a
  new pattern, introducing a new library), describe the approach and
  reasoning in plain text first, and wait for confirmation before
  writing any code. If the tool you're running in has a dedicated
  mode for this (e.g. Claude Code's Plan Mode, Codex's suggest mode),
  use it — but follow this instruction even without one.
- Stay strictly within the agreed scope for the current step. If the
  task seems to need more than what was agreed, stop and flag it
  rather than expanding the scope on your own.

> When this project moves from the learning phase into efficiency-
> first production work, remove the reference to this file from
> `AGENTS.md` rather than editing this file in place — the rest of
> the project structure stays unchanged.