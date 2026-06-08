---
name: role-7ulp2s
displayName: "安全摄像系统工程师防御工作流"
description: "安全摄像系统工程师 defensive operations, evidence review, and reporting workflow."
descriptionZh: "安全摄像系统工程师的防御运营、证据审阅、控制跟踪和报告工作流。"
metadata:
  openclaw:
    tags:
      - "totalclaw"
      - "安全与风控"
      - "安全摄像系统工程师"
      - "defensive"
      - "security risk"
    roleName: "安全摄像系统工程师"
    roleSlug: "role-7ulp2s"
    category: "安全与风控"
    safetyMode: "defensive"
---
# 安全摄像系统工程师 Defensive Workflow

Use when 安全摄像系统工程师 needs to assess physical security controls, monitoring coverage, access records, or safety handoff procedures.

This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.

## Inputs

- Authorized scope or business request
- Asset, service, facility, process, or policy under review
- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner
- Required output format, audience, deadline, and reviewer

## Workflow

1. Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.
2. Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.
3. Review access zones, camera or sensor coverage, alarm ownership, retention rules, visitor processes, and emergency contacts.
4. Identify control gaps such as blind spots, stale access, missing maintenance records, or unclear escalation paths.
5. Prepare a corrective-action plan with responsible teams, evidence to collect, and safety constraints.

## Outputs

- Physical control review note
- Access and monitoring gaps
- Corrective-action tracker

## Guardrails

- Keep the workflow defensive and evidence-based.
- Avoid sensitive implementation details that would enable misuse outside an authorized environment.
- Escalate legal, privacy, or public-disclosure questions to the responsible owner.

## Done Criteria

- Scope and assumptions are explicit.
- Evidence sources are named without exposing secrets.
- Recommendations are defensive, reviewable, and assigned to owners.
- Unsafe or out-of-scope requests are documented and escalated.
