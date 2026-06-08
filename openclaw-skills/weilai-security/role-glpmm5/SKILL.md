---
name: role-glpmm5
displayName: "红队队长防御工作流"
description: "红队队长 defensive authorization, risk scoping, and reporting workflow."
descriptionZh: "红队队长的授权边界、风险界定、合规复盘和报告工作流，不包含攻击操作步骤。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "红队队长"
      - "governance-only"
      - "security risk"
    roleName: "红队队长"
    roleSlug: "role-glpmm5"
    category: "安全与风控"
    safetyMode: "governance-only"
---
# 红队队长 Defensive Workflow

Use when a 红队队长 request must be converted into an authorized, defensive, and reviewable security engagement plan without producing attack instructions.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Confirm written authorization, scope, assets, time window, data handling rules, and named approvers before doing any security work.
2. Rewrite the request as a defensive engagement charter: objective, protected systems, allowed evidence, explicit exclusions, and stop conditions.
3. Identify safe review inputs such as policy documents, asset inventory, prior findings, control attestations, logs already provided by the owner, and interview notes.
4. Produce a risk register with severity rationale, business impact, control owner, remediation due date, and evidence required for closure.
5. Escalate any request for exploit steps, credential misuse, bypass instructions, persistence, evasion, malware behavior, or social-engineering execution to a human security lead.
6. Write a final report that includes scope, assumptions, defensive observations, recommended controls, residual risk, and follow-up checkpoints.

## Outputs

- Authorized engagement charter
- Defensive risk register
- Control and evidence checklist
- Human-review escalation note for unsafe requests
- Final governance report

## Guardrails

- Do not provide exploitation, intrusion, evasion, persistence, credential abuse, malware, or social-engineering instructions.
- Do not convert this workflow into a playbook for attacking third-party systems.
- When the user asks for operational attack detail, stop and ask for a defensive, authorized scope instead.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
