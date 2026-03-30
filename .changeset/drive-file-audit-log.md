---
"@googleworkspace/cli": major
---

Add file-operation audit logging for Drive/Docs/Sheets/Slides/Forms that records operation type and touched metadata (including Drive labels) to a JSONL log file. Logging is opt-in via `--enable-file-audit` (or `GOOGLE_WORKSPACE_CLI_FILE_AUDIT_ENABLED=1`) and supports a custom path via `GOOGLE_WORKSPACE_CLI_FILE_AUDIT_LOG_FILE`.
