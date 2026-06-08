---
name: role-1otwuks
displayName: "灾��恢复专家防御工作流"
description: "灾��恢复专家 defensive operations, evidence review, and reporting workflow."
descriptionZh: "灾��恢复专家的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "灾��恢复专家"
      - "defensive"
      - "security risk"
    roleName: "灾��恢复专家"
    roleSlug: "role-1otwuks"
    category: "安全与风控"
    safetyMode: "defensive"
---
# 灾��恢复专家 Defensive Workflow

Use when 灾��恢复专家 needs to translate security signals into risk decisions, continuity plans, insurance evidence, or recovery actions.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Translate technical or operational observations into likelihood, impact, control strength, and residual-risk language.
4. Compare the issue against continuity, disaster recovery, insurance, vendor, or legal obligations as applicable.
5. Produce a decision memo with options, tradeoffs, required approvals, and review cadence.

## Outputs

- Risk decision memo
- Continuity or insurance evidence pack
- Residual-risk register

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
