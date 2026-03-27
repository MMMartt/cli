# File Audit Log (Drive/Docs/Sheets)

This document explains the new file-operation audit log behavior and a quick local test flow.

## What This Feature Logs

When `gws` calls file-related APIs, it appends one JSON line per successful request:

- `drive.files.*`
- `docs.documents.*`
- `sheets.spreadsheets.*`

Each event includes:

- `service`, `resource`, `methodId`, `operation`, `status`
- `requestIds` (for example `fileId` / `documentId` / `spreadsheetId`)
- `touchedEntities`

For label-aware scenarios, `touchedEntities` includes:

- `driveLabels` (raw `drive.files.listLabels` payload)
- `classificationLabelValue` (derived values from label fields, usually selection option IDs)

## Log File Path

- Env var override: `GOOGLE_WORKSPACE_CLI_FILE_AUDIT_LOG_FILE`
- Default path: `~/.config/gws/file-ops-audit.jsonl`

## Quick Local Test (Token-Only)

Use token auth only (no local login state):

```bash
export GOOGLE_WORKSPACE_CLI_TOKEN="<ACCESS_TOKEN>"
export GOOGLE_WORKSPACE_CLI_CONFIG_DIR="/tmp/gws-token-only"
export GOOGLE_APPLICATION_CREDENTIALS="/tmp/does-not-exist-adc.json"
export GOOGLE_WORKSPACE_CLI_FILE_AUDIT_LOG_FILE="/tmp/gws-audit.jsonl"

: > "$GOOGLE_WORKSPACE_CLI_FILE_AUDIT_LOG_FILE"

# Example: query known DSS files
target/debug/gws drive files list --params '{"q":"name = \"dss1\" or name = \"dss2\" or name = \"dss3\" or name = \"dss4\"","fields":"files(id,name)","pageSize":50}'

# Example: read labels for one file
target/debug/gws drive files listLabels --params '{"fileId":"<FILE_ID>"}'
```

Inspect audit output:

```bash
cat /tmp/gws-audit.jsonl | jq -c '{service,methodId,operation,requestIds,touchedEntities}'
```

## How to Distinguish DSS Levels

For the same label/field, different files can be distinguished by different `selection` values under:

- `touchedEntities[].driveLabels.labels[].fields.<fieldId>.selection[]`
- mirrored in `touchedEntities[].classificationLabelValue[]`

Example shape:

```json
{
  "service": "drive",
  "methodId": "drive.files.listLabels",
  "requestIds": ["<FILE_ID>"],
  "touchedEntities": [
    {
      "id": "<FILE_ID>",
      "classificationLabelValue": ["B7ECA7C5A0"],
      "driveLabels": {
        "labels": [
          {
            "id": "<LABEL_ID>",
            "fields": {
              "<FIELD_ID>": {
                "valueType": "selection",
                "selection": ["B7ECA7C5A0"]
              }
            }
          }
        ]
      }
    }
  ]
}
```

## Note About Human-Readable Label Names

Current audit logs store label values as IDs (for example selection option IDs).  
If you need display names like `Confidential - DSS-3`, resolve IDs via Drive Labels API metadata with additional label-read scopes.
