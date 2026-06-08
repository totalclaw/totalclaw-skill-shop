---
name: role-7a5fqg
displayName: "安全法律合规经理防御工作流"
description: "安全法律合规经理 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全法律合规经理的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "网络安全攻防"
      - "安全法律合规经理"
      - "defensive"
      - "cyber defense"
    roleName: "安全法律合规经理"
    roleSlug: "role-7a5fqg"
    category: "网络安全攻防"
    safetyMode: "defensive"
---
# 安全法律合规经理 Defensive Workflow

Use when 安全法律合规经理 needs to prepare defensible security governance, audit evidence, privacy controls, or regulatory follow-up.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Map each requirement to an internal control, evidence source, reviewer, status, and exception owner.
4. Flag missing evidence, conflicting ownership, overdue remediation, and policy gaps without overstating compliance status.
5. Draft an audit-ready summary with findings, corrective actions, due dates, and retained evidence references.

## Outputs

- Control-to-evidence matrix
- Audit finding summary
- Exception and remediation tracker

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
