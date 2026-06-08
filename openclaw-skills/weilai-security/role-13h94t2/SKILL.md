---
name: role-13h94t2
displayName: "法证会计专家防御工作流"
description: "法证会计专家 defensive operations, evidence review, and reporting workflow."
descriptionZh: "法证会计专家的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "法证会计专家"
      - "defensive"
      - "security risk"
    roleName: "法证会计专家"
    roleSlug: "role-13h94t2"
    category: "安全与风控"
    safetyMode: "defensive"
---
# 法证会计专家 Defensive Workflow

Use when 法证会计专家 needs a defensive operating workflow for security review, control tracking, and stakeholder reporting.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Turn observations into a queue of defensive tasks with owners, priority, status, dependencies, and verification evidence.
4. Coordinate review with engineering, operations, legal, compliance, or business teams based on the affected control.
5. Close the loop with a concise status report and next review date.

## Outputs

- Defensive operations checklist
- Owner/action tracker
- Stakeholder status summary

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
