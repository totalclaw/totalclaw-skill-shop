---
name: role-121dc0c
displayName: "安全事件调查员防御工作流"
description: "安全事件调查员 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全事件调查员的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "安全事件调查员"
      - "defensive"
      - "security risk"
    roleName: "安全事件调查员"
    roleSlug: "role-121dc0c"
    category: "安全与风控"
    safetyMode: "defensive"
---
# 安全事件调查员 Defensive Workflow

Use when 安全事件调查员 needs to triage alerts, preserve evidence, coordinate incident response, or write a defensive investigation note.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Classify the signal by impact, affected asset, confidence, containment status, and evidence quality.
4. Preserve the timeline, involved systems, analyst decisions, and handoffs so the investigation remains reproducible.
5. Recommend defensive containment, monitoring, recovery, and communication actions for owner approval.

## Outputs

- Incident triage note
- Evidence timeline
- Containment and recovery checklist

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
