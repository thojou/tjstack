---
name: spawn-subagent
description: >-
  Set the Task model from a tjstack role line before spawning a subagent.
  Use when a tjstack skill names a role in tjstack-models.mdc and a model class.
disable-model-invocation: true
---

# Spawn subagent

Each spawn names a role line in the `tjstack-models.mdc` rule (`~/.cursor/rules/tjstack-models.mdc`) and a class. Set `model` to that line's value. Leave `model` unset when the value is `auto` or `inherit-parent`. When the rule or the line is missing, resolve the class with the selection rules in `setup-tjstack` at the effort the caller names. Run `agent models` for that resolution. Do not pass a slug that command did not print. If the Task tool rejects a slug, use the closest valid slug of the same class from its error message and say so.
