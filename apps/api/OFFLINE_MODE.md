# Offline Mode

## Overview

Offline mode allows the Typie API to run without making external network requests. This is useful for local development, testing, and running the application in environments without internet access.

## Configuration

Set the `OFFLINE_MODE` environment variable to control offline mode:

```bash
# Enable offline mode (default)
OFFLINE_MODE=true

# Disable offline mode (use external services)
OFFLINE_MODE=false
```

## Affected Services

When offline mode is enabled, the following external services are stubbed or disabled:

### Email (AWS SES)
- **Behavior**: Emails are logged to console instead of being sent
- **Log format**: `[Email Outbox] {"subject":"...","recipient":"...","bodyLength":...}`

### Slack
- **Behavior**: Messages are logged to console instead of being sent
- **Log format**: `[Slack Offline] {"channel":"...","message":"...",...}`

### Spellcheck
- **Behavior**: Returns empty results instead of calling external API
- **Log format**: `[Spellcheck Offline] Skipping check for text of length: ...`

### Payment Processing (PortOne)
- **Behavior**: All payment operations return error responses
- **Error message**: "Payment processing is unavailable in offline mode"

### Identity Verification (PortOne)
- **Behavior**: Returns error response
- **Error message**: "Identity verification is unavailable in offline mode"

### SSO Authentication
All SSO providers (Google, Naver, Kakao, Apple) throw errors in offline mode:
- **Error message**: "[Provider] Sign-In is unavailable in offline mode"

### In-App Purchase (App Store & Google Play)
- **Behavior**: Subscription verification throws errors
- **Error message**: "[Store] integration is unavailable in offline mode"

### Push Notifications (Firebase)
- **Behavior**: Notifications are logged to console instead of being sent
- **Log format**: `[Firebase Offline] Push notification skipped: {"userId":"...","title":"...","body":"..."}`

### Link Embedding (Iframely)
- **Behavior**: Throws error when attempting to unfurl URLs
- **Error message**: "Link embedding is unavailable in offline mode"

### Avatar Downloads
- **Behavior**: Falls back to randomly generated avatars instead of downloading from external URLs
- External avatar URLs are skipped during SSO sign-up

### Document Export
- **Behavior**: External images in documents are skipped during export
- **Log format**: `[Export Offline] Skipping external image download: ...`

### AI Assistant (BMO - Anthropic/Slack)
- **Behavior**: Skips processing of Slack mentions
- **Log format**: `[BMO Offline] Skipping Slack/Anthropic integration for event: ...`

## Frontend Integration

The frontend can query the offline mode status via GraphQL:

```graphql
query {
  systemInfo {
    offlineMode
  }
}
```

Use this query to:
- Hide or disable features that require external services
- Show explanatory messages to users
- Adjust UI based on available functionality

## Testing

To verify offline mode is working correctly:

1. Enable offline mode: `OFFLINE_MODE=true`
2. Start the API server
3. Check logs for offline mode indicators (e.g., `[Email Outbox]`, `[Slack Offline]`)
4. Verify no external HTTP requests are made
5. Confirm all operations that don't require external services work normally

## Best Practices

1. **Local Development**: Enable offline mode by default to avoid accidental external service usage
2. **CI/CD**: Enable offline mode in test environments to ensure tests are isolated
3. **Production**: Disable offline mode to enable full functionality
4. **Monitoring**: Monitor logs for offline mode indicators to ensure proper configuration

## Re-enabling Online Mode

To re-enable external services:

1. Set `OFFLINE_MODE=false` in your environment
2. Ensure all required API keys and credentials are configured
3. Restart the API server
4. Verify external services are functioning correctly
