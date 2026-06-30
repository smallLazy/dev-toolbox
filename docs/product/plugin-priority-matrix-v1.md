# Plugin Priority Matrix v1.0

---

## Scoring Model

Each plugin scored on:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Frequency** | 40% | How often a developer uses this (daily=10, weekly=7, monthly=3) |
| **Value** | 30% | Time saved per use (minutes) |
| **Complexity** | 20% | Inverse of effort (small=10, medium=5, large=2) |
| **Uniqueness** | 10% | Can't easily do this elsewhere? (unique=10, common=3) |

**Score = Frequency×0.4 + Value×0.3 + Complexity×0.2 + Uniqueness×0.1**

---

## Sprint 01 — Core Utilities

| Plugin | Freq | Value | Cmplx | Uniq | Score | Priority |
|--------|------|-------|-------|------|-------|----------|
| JSON | 10 | 5 | 10 | 7 | 7.5 | P0 |
| Base64 | 8 | 3 | 10 | 5 | 6.3 | P0 |
| URL | 8 | 3 | 10 | 5 | 6.3 | P0 |
| Timestamp | 9 | 5 | 10 | 7 | 7.7 | P0 |
| Hash | 7 | 3 | 10 | 5 | 6.0 | P0 |
| AES | 5 | 2 | 10 | 10 | 5.6 | P0 |
| UUID | 6 | 2 | 10 | 5 | 5.3 | P1 |

---

## Sprint 02 — Text & Format

| Plugin | Freq | Value | Cmplx | Uniq | Score | Priority |
|--------|------|-------|-------|------|-------|----------|
| Regex | 9 | 10 | 5 | 7 | 8.0 | P0 |
| SQL Formatter | 6 | 5 | 5 | 3 | 4.6 | P1 |
| YAML | 5 | 3 | 10 | 5 | 5.2 | P1 |
| Markdown | 4 | 5 | 5 | 3 | 4.2 | P1 |
| HTML Escape | 4 | 2 | 10 | 3 | 4.4 | P1 |

---

## Sprint 03 — Network

| Plugin | Freq | Value | Cmplx | Uniq | Score | Priority |
|--------|------|-------|-------|------|-------|----------|
| cURL | 8 | 8 | 2 | 7 | 6.5 | P0 |
| JWT Decoder | 7 | 5 | 10 | 7 | 6.8 | P0 |
| HTTP Headers | 5 | 3 | 5 | 5 | 4.4 | P1 |
| GraphQL | 3 | 5 | 2 | 7 | 3.9 | P1 |

---

## Sprint 05 — AI

| Plugin | Freq | Value | Cmplx | Uniq | Score | Priority |
|--------|------|-------|-------|------|-------|----------|
| AI JSON Repair | 7 | 10 | 5 | 10 | 7.8 | P0 |
| AI Regex | 6 | 10 | 5 | 10 | 7.4 | P0 |
| AI Prompt | 8 | 5 | 10 | 7 | 7.0 | P0 |
| AI Commit | 9 | 3 | 5 | 7 | 6.0 | P1 |

---

> **版本**: v1.0
