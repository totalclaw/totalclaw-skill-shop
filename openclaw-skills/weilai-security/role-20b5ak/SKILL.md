---
name: role-20b5ak
displayName: "安全量子计算工程师防御工作流"
description: "安全量子计算工程师 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全量子计算工程师的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "网络安全攻防"
      - "安全量子计算工程师"
      - "defensive"
      - "cyber defense"
    roleName: "安全量子计算工程师"
    roleSlug: "role-20b5ak"
    category: "网络安全攻防"
    safetyMode: "defensive"
---
# 安全量子计算工程师 Defensive Workflow

Use when 安全量子计算工程师 needs to manage cryptographic assets, key lifecycle evidence, certificates, or encryption control reviews.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Inventory keys, certificates, algorithms, expiry dates, ownership, rotation state, storage controls, and access paths.
4. Check lifecycle gaps such as missing owners, stale certificates, weak policy exceptions, or incomplete rotation evidence.
5. Prepare a rotation or remediation plan with validation checks and rollback criteria.

## Outputs

- Cryptographic asset inventory
- Rotation plan
- Expiry and ownership exceptions

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
