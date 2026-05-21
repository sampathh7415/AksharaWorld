# Runbook 02 — Google Sheets API Down

**Severity:** P2 (ops degraded, mock fallback active)  
**Target acknowledgment:** < 4 hours

## Symptoms

- Command Center shows stale or mock data
- `resilientFetch` logs circuit breaker open for Sheets adapter
- `/api/google/sheets` returns 5xx or timeout
- Telegram API failure alert (if wired)

## First response (15 min)

1. Check [Google Workspace Status](https://www.google.com/appsstatus/dashboard/).
2. Verify Google Cloud project: Sheets API enabled, quota not exceeded.
3. Confirm service account / OAuth credentials in Cloudflare Secrets not expired.

## Diagnosis

| Check | Action |
|-------|--------|
| Quota | Google Cloud Console → APIs → Sheets → Quotas |
| Credential rotation | Re-upload key; `wrangler secret put` |
| Spreadsheet ID | Env `SHEETS_SPREADSHEET_ID` matches SOT |
| Adapter fallback | Expected: mock data — document "read-only mode" to team |

## Recovery

1. Restore credentials or wait for Google outage end.
2. Hit `/api/google/sheets` until 200.
3. Reconcile: compare mock period logs vs Drive backup export.
4. Resume Sam cron-loop after writes confirmed.

## Prevention

- Daily Drive sync check (Sunday weekly ritual)
- Weekly export CSV to `07_Guardian_Ops/backups/`
