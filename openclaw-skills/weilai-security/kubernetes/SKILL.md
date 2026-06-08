---
name: kubernetes
displayName: "安全Kubernetes工程师防御工作流"
description: "安全Kubernetes工程师 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全Kubernetes工程师的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "网络安全攻防"
      - "安全Kubernetes工程师"
      - "defensive"
      - "cyber defense"
    roleName: "安全Kubernetes工程师"
    roleSlug: "kubernetes"
    category: "网络安全攻防"
    safetyMode: "defensive"
---
# 安全Kubernetes工程师 Defensive Workflow

Use when 安全Kubernetes工程师 needs to review secure architecture, hardening posture, control ownership, and remediation tracking.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Review trust boundaries, network exposure, identity controls, logging coverage, backup posture, and change history at a high level.
4. Prioritize hardening gaps by asset criticality, exploitability indicators, compensating controls, and operational risk.
5. Create an owner-ready remediation backlog with acceptance criteria and verification evidence.

## Outputs

- Secure architecture review note
- Hardening backlog
- Verification evidence checklist

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
