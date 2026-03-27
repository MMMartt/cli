---
"@googleworkspace/cli": major
---

Add file-operation audit logging for Drive/Docs/Sheets that records operation type and touched metadata (including Drive labels) to a JSONL log file. This introduces a new env var (`GOOGLE_WORKSPACE_CLI_FILE_AUDIT_LOG_FILE`) and removes legacy compatibility aliases.
