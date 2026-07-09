---
status: active
last_reviewed: 2026-07-08
owner: dev-tools
---
# UI Copy Language Guidelines v1.0 — Dev Toolbox

> **Rule**: Developer Toolbox is a developer-facing tool. Default UI language is **English**.
> Exceptions for Chinese require explicit justification and full-page consistency.

---

## 1. Default Language

**English is the default UI language** for all user-visible copy in Dev Toolbox.

Rationale:
- The target audience is developers, who use English technical terms daily.
- The existing tool ecosystem (Base64, JWT, URL, AES, Hash, Unicode, Diff, Markdown, XML, YAML, SQL, Timestamp, UUID) is already English-first.
- Mixing Chinese and English on the same page creates cognitive friction and localization debt.

---

## 2. Scope

This guideline covers ALL user-visible copy in the application:

| Surface | Examples |
|---|---|
| Sidebar labels | `Base64`, `JWT`, `URL`, `PHP Codec` |
| Plugin `name` field | `definePlugin({ name: 'PHP Codec' })` |
| Page titles | `<h1>PHP Codec</h1>` |
| Page subtitles / descriptions | `Compatible with PHP base_encryption()...` |
| Mode labels | `Encode` / `Decode` (not `编码` / `解码`) |
| Buttons | `Encode`, `Decode`, `Clear`, `Swap`, `Copy` |
| Input labels | `Input`, `Output` |
| Placeholders | `Enter text to encode...` |
| Help text / tooltips | `Note: This is not encryption.` |
| Empty states | `No tools found` |
| Toast messages | `Copied to clipboard` |
| Error messages | `Invalid input: expected Base64 string` |
| Pipeline step labels | `URL Encode (PHP)` |
| Info card content | Pipeline flow descriptions, notes |
| Migration banners | `You were redirected from...` |
| Test assertions (UI text) | `expect(wrapper.text()).toContain('Encode')` |
| Search keywords | `'php', 'base64', 'encode'` (English preferred; CN allowed per exception) |

---

## 3. Tool Naming

### 3.1 Sidebar / Plugin Name / Page Title

```
✅ PHP Codec
✅ Base64
✅ JSON Formatter
✅ JWT
✅ AES
✅ Hash
✅ Unicode
✅ Diff
✅ Markdown
✅ XML
✅ YAML
✅ SQL Formatter
✅ Timestamp
✅ UUID Generator

❌ PHP 兼容编码
❌ Base64 编解码
❌ JSON 格式化工具
```

Rule: **Use the English technical name**. Do not translate tool names into Chinese.

### 3.2 Multi-word Names

Use Title Case for tool names:

```
✅ PHP Codec
✅ JSON Formatter
✅ HTTP Client
✅ SQL Formatter

❌ Php codec
❌ json formatter
❌ HTTP client
```

### 3.3 New Tool Naming Checklist

When creating a new tool, the `name` field must be:

- [ ] In English
- [ ] Title Case (each word capitalized)
- [ ] Uses the standard technical term (e.g., `URL Encode`, not `Url Encode`)
- [ ] No Chinese characters
- [ ] Consistent with existing tool naming conventions

---

## 4. UI Element Rules

### 4.1 Mode / Tab Labels

```
✅ Encode / Decode
✅ Encrypt / Decrypt
✅ Format / Minify
✅ Request / Response

❌ 编码 / 解码
❌ 加密 / 解密
❌ 格式化 / 压缩
```

### 4.2 Button Labels

```
✅ Encode, Decode, Clear, Swap, Copy, Execute
✅ Format, Minify, Validate

❌ 编码, 解码, 清空, 交换, 复制, 执行
```

### 4.3 Input / Output Labels

```
✅ Input
✅ Output

❌ 输入内容
❌ 输出结果
❌ 原始内容
❌ 编码结果
```

### 4.4 Placeholders

```
✅ Enter text to encode...
✅ Enter text to decode...
✅ Paste Base64 string...
✅ Enter JSON to format...

❌ 输入要编码的内容...
❌ 粘贴已编码的字符串...
```

### 4.5 Help Text / Notes

```
✅ Note: This is not encryption. It is a compatibility encoding pipeline.
✅ Equivalent to PHP base_encryption() / filter()

❌ 注意：这不是加密，只是兼容编码管道。
```

### 4.6 Empty States

```
✅ No tools found
✅ No history yet
✅ Enter input to see output

❌ 未找到工具
❌ 暂无历史记录
```

### 4.7 Toast / Notification Messages

```
✅ Copied to clipboard
✅ Encoding failed: invalid input
✅ Settings saved

❌ 已复制到剪贴板
❌ 编码失败：无效输入
```

### 4.8 Error Messages

```
✅ Invalid Base64 input
✅ Decoding failed at step: Base64 Decode
✅ Unknown preset: foo

❌ 无效的 Base64 输入
❌ 解码失败
```

---

## 5. Technical Terms — Keep English

The following technical terms MUST remain in English in all UI copy:

| Category | Terms |
|---|---|
| Encoding | URL Encode, URL Decode, Base64, Base64 Encode, Base64 Decode, Unicode |
| Crypto | AES, RSA, SM2, SM3, SM4, Encrypt, Decrypt, Key, IV, Padding |
| Data formats | JSON, XML, YAML, CSV, Markdown, HTML |
| Web | JWT, URL, HTTP, REST, GraphQL, WebSocket, cURL |
| Database | SQL, MySQL, PostgreSQL |
| Time | Timestamp, Unix, UTC, ISO 8601 |
| General | Encode, Decode, Format, Parse, Input, Output, Pipeline |

**Never translate these.** Even if the rest of the page is in Chinese, technical terms stay in English.

---

## 6. No Mixed Language on One Page

> **One page, one language.**

If a page starts in English, ALL user-visible copy on that page must be English.
If a page is explicitly approved for Chinese, ALL user-visible copy on that page must be Chinese.

### 6.1 What "Mixed" Means

```
❌ BAD — Chinese title, English buttons:
   页面标题：PHP 兼容编码
   [编码] [解码] [Clear] [Swap]

❌ BAD — English title, Chinese buttons:
   Page Title: PHP Codec
   [编码] [解码] [Clear] [Swap]

❌ BAD — English labels, Chinese help text:
   Input: _______________
   注意：这不是加密算法

✅ GOOD — All English:
   Page Title: PHP Codec
   [Encode] [Decode] [Clear] [Swap]
   Input: _______________
   Note: This is not encryption.
```

### 6.2 Detection Checklist

When reviewing a new tool page, scan for:

- [ ] Title is consistent with button/mode language
- [ ] Labels are consistent with placeholder language
- [ ] Help text is consistent with error message language
- [ ] No single Chinese character appears among English UI elements
- [ ] No single English word appears among Chinese UI elements

---

## 7. Chinese Language — Allowed Scenarios

Chinese is allowed ONLY in these specific scenarios:

### 7.1 Chinese-specific Tools

Tools whose primary purpose involves Chinese language processing:

```
Example: Chinese-to-Pinyin converter
Page name: 拼音转换 (Pinyin)
Description: 汉字转拼音，支持多音字
```

Justification: The tool's domain is the Chinese language itself.

### 7.2 Chinese Business Names

When a tool integrates with a Chinese-named service:

```
Example: 企业微信 (WeCom) integration
Example: 禅道 (Zentao) integration
```

The service name may use Chinese, but all operational UI (buttons, labels, help text) must be consistently Chinese.

### 7.3 Explicit Product Requirement

When the product owner explicitly requires Chinese UI for a specific tool.
Document the decision in the Plugin's README.md with rationale.

### 7.4 When Chinese Is Chosen — Full Chinese Requirement

If a page is approved for Chinese:

```
✅ All English → All Chinese:
   - Sidebar label: Chinese
   - Plugin name: Chinese
   - Page title: Chinese
   - All buttons: Chinese
   - All labels: Chinese
   - All placeholders: Chinese
   - All help text: Chinese
   - All errors: Chinese
   - Technical terms: English (exception per Section 5)

❌ Never:
   - Chinese title with English buttons
   - English title with Chinese help text
   - Mixed mode labels (编码 / Decode)
```

---

## 8. Good / Bad Examples

### Example 1: PHP Codec Page

```
❌ BEFORE (mixed):
   Title: PHP Compatible
   Subtitle: PHP base_encryption / filter 兼容管道
   Mode: 编码 / 解码
   Input Label: 原始内容
   Placeholder: 输入要编码的内容...
   Button: 编码, 清空, 交换
   Help: 非加密算法，仅做编码混淆

✅ AFTER (all English):
   Title: PHP Codec
   Subtitle: Compatible with PHP base_encryption() / filter(): URL Encode(PHP) → Base64(no padding)
   Mode: Encode / Decode
   Input Label: Input
   Placeholder: Enter text to encode...
   Button: Encode, Clear, Swap
   Help: Note: This is not encryption. It is a compatibility encoding pipeline.
```

### Example 2: Hypothetical Chinese Tool

```
✅ CORRECT Chinese-only page:
   Title: 拼音转换器
   Subtitle: 汉字转拼音，支持多音字和声调
   Mode: 输入 / 输出
   Input Label: 输入汉字
   Placeholder: 请输入中文汉字...
   Button: 转换, 清空, 复制
   Help: 支持简体中文和繁体中文

❌ WRONG — mixed:
   Title: 拼音转换器
   Mode: Input / Output
   Button: 转换, Clear, 复制
```

### Example 3: Plugin Definition

```
✅ CORRECT:
   definePlugin({
     id: 'json-formatter',
     name: 'JSON Formatter',
     description: 'Format, validate, and minify JSON',
     keywords: ['json', 'format', 'validate', 'minify', 'beautify'],
   })

❌ WRONG:
   definePlugin({
     id: 'json-formatter',
     name: 'JSON 格式化',
     description: 'JSON 格式化和验证工具',
     keywords: ['json', 'format', 'json格式化'],
   })
```

---

## 9. Code Review Checklist — UI Copy

When reviewing a PR that adds or modifies a tool page, verify:

```
[ ] Plugin name is in English (or fully Chinese with justification)
[ ] Sidebar label matches plugin name language
[ ] Page title matches plugin name language
[ ] All mode labels / tabs are in the same language as the title
[ ] All button labels are in the same language as the title
[ ] All input/output labels are in the same language as the title
[ ] All placeholders are in the same language as the title
[ ] All help text / notes are in the same language as the title
[ ] All error messages are in the same language as the title
[ ] All empty states are in the same language as the title
[ ] All toast messages are in the same language as the title
[ ] No mixed CN/EN on the same page (except technical terms per Section 5)
[ ] Search keywords include both CN and EN terms for discoverability
[ ] Test assertions for UI text match the chosen language
[ ] New tool naming follows Title Case convention
```

---

## 10. Migration Guide — Existing Mixed-Language Tools

For existing tools with mixed CN/EN UI:

1. Identify all user-visible strings on the page.
2. Decide: English (default) or Chinese (needs justification).
3. Convert ALL strings to the chosen language.
4. Update plugin `name`, `description`, `keywords`.
5. Update test assertions that reference UI text.
6. Verify no regressions: `npx vue-tsc --noEmit && npm test`.

---

## 11. Enforcement

- New Plugin PRs: UI copy review is part of the standard code review checklist.
- CI: A future `scripts/ci/validate-ui-copy.ts` may auto-detect mixed-language pages.
- Presubmit: Run `grep -r '[\\u4e00-\\u9fff]' src/features/<new-plugin>/` to detect Chinese characters; verify they are intentional.

---

> **Remember**: Dev Toolbox is used by developers worldwide. English-first UI ensures consistency and avoids the maintenance burden of mixed-language copy.
