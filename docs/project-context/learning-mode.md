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

## Attempt-first workflow

For a given small step, the developer may attempt the implementation
themselves before asking the agent to take over. When that happens,
look for these inline markers and respond accordingly — do not guess
intent from the code state alone, since an empty function body could
mean "didn't attempt" or "tried and gave up":

- `CLAUDE-REVIEW`: the developer wrote this and wants it checked.
  Review for correctness first; if it's right, say so briefly and
  move on — don't over-explain something that's already correct.
- `CLAUDE-WRITE`: not attempted. Implement it and explain the
  reasoning at the normal teaching-mode depth (see above).
- `CLAUDE-STUCK`: the developer tried and got stuck, or believes
  their attempt is wrong. Their attempt is left in place below the
  marker — read it first. Explain specifically what was wrong with
  their approach (not just what the correct approach is) before or
  alongside giving the corrected implementation.

If a step has no markers at all (the developer didn't attempt
anything), fall back to the default teaching-mode behavior described
above. Not every step needs to go through this attempt-first flow —
the developer decides per step whether to attempt it themselves,
based on whether the logic is genuinely new to them or something
they already have a strong instinct for from prior experience.

> When this project moves from the learning phase into efficiency-
> first production work, remove the reference to this file from
> `AGENTS.md` rather than editing this file in place — the rest of
> the project structure stays unchanged.