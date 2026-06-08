---
name: role-1rwt00i
displayName: "安全社区经理防御工作流"
description: "安全社区经理 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全社区经理的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "安全社区经理"
      - "defensive"
      - "security risk"
    roleName: "安全社区经理"
    roleSlug: "role-1rwt00i"
    category: "安全与风控"
    safetyMode: "defensive"
---
# 安全社区经理 Defensive Workflow

Use when 安全社区经理 needs to define security product requirements, defensive telemetry, release readiness, or community coordination.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Define user need, abuse case, telemetry requirement, permission boundary, data retention, and support workflow.
4. Convert security requirements into product acceptance criteria, rollout checks, documentation updates, and operational dashboards.
5. Prepare release or community communication that avoids sensitive details while enabling defensive adoption.

## Outputs

- Security product requirement brief
- Telemetry and support workflow
- Release readiness checklist

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
