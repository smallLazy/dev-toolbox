---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# Release Roadmap v1.0

---

## Version History

| Version | Date | Theme | Plugins | Status |
|---------|------|-------|---------|--------|
| v0.1.0-beta.1 | 2026-06-30 | MVP | Crypto, JSON, Base64, URL, Timestamp, Hash, JWT, Config | ✅ Released |
| v1.0.0-beta.1 | 2026-08 | Core Utilities | JSON+, Base64, URL, Timestamp, Hash, UUID, AES | 🎯 Next |
| v1.0.1-beta | 2026-08 | Text & Format | Regex, SQL, YAML, XML, Markdown, HTML, Unicode, Color | 📋 Planned |
| v1.1.0-beta | 2026-09 | Network | cURL, HTTP, GraphQL, WebSocket, JWT+, Request Decoder | 📋 Planned |
| v1.2.0 | 2026-10 | Enterprise | Sentry, GitHub, Gitee, Jira, 禅道, 企业微信, SM2/3/4 | 📋 Planned |
| v2.0.0 | 2026-12 | AI | AI JSON, AI Regex, AI SQL, AI Log, AI cURL, AI Commit | 📋 Planned |

---

## Milestones

### M1: Core Utilities Complete (v1.0.0-beta.1)
- 7 plugins with full implementation
- All 17 quality checks passing
- Published as GitHub Release

### M2: 20 Plugins (v1.0.1-beta)
- Text & Format toolkit complete
- Total: 20 official plugins

### M3: 30 Plugins (v1.1.0-beta)
- Network toolkit complete
- Total: 30 official plugins

### M4: Enterprise Ready (v1.2.0)
- Enterprise toolkit complete
- Total: 40+ official plugins
- First stable release (no -beta suffix)

### M5: AI Powered (v2.0.0)
- AI toolkit complete
- Total: 50+ official plugins
- Major version bump for AI capabilities

---

## Git Workflow

```
main ← release/v1.0.0-beta.1 ← feat/plugin/json
                               ← feat/plugin/base64
                               ← feat/plugin/uuid

Each plugin = one branch = one PR
Sprint branch groups multiple plugins for coordinated release
```

---

> **版本**: v1.0
