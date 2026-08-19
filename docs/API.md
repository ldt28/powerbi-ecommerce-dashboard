# API Documentation

This document provides comprehensive API reference for the PowerBI Ecommerce Dashboard backend.

## Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://your-domain.com`

## Authentication

All API requests require authentication via session cookies. The application uses secure, HTTP-only cookies for session management.

### Session Cookie
- **Name**: `session`
- **HttpOnly**: true
- **Secure**: true (production only)
- **SameSite**: strict

## tRPC API Endpoints

The application uses tRPC for type-safe API communication. All endpoints follow the pattern:

```
POST /trpc/[router].[procedure]
```

### Authentication Router (`auth`)

#### `auth.getSession`
Returns the current user's session information.

**Response:**
```typescript
{
  user: {
    id: string;
    openId: string;
    name: string | null;
    email: string | null;
    role: 'owner' | 'admin' | 'viewer';
    lastSignedIn: Date;
  } | null
}
```

#### `auth.logout`
Terminates the current session.

**Method**: POST  
**Body**: `{}`

---

### Dashboard Router (`dashboard`)

#### `dashboard.getRevenueOverview`
Retrieves revenue metrics for a specified date range.

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  channels?: string[];
  platforms?: string[];
}
```

**Response:**
```typescript
{
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  orders: number;
  averageOrderValue: number;
  revenueByChannel: Array<{ channel: string; revenue: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
}
```

#### `dashboard.getMarketingPerformance`
Retrieves marketing metrics and ROAS data.

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  platforms?: string[];
  campaigns?: string[];
}
```

**Response:**
```typescript
{
  totalAdSpend: number;
  totalRevenue: number;
  overallROAS: number;
  performanceByPlatform: Array<{
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  topCampaigns: Array<{
    name: string;
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
  }>;
}
```

#### `dashboard.getProductAnalysis`
Retrieves product-level analytics.

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  category?: string;
  limit?: number;
}
```

**Response:**
```typescript
{
  topProducts: Array<{
    productId: string;
    name: string;
    revenue: number;
    unitsSold: number;
    profitMargin: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  inventoryAlerts: Array<{
    productId: string;
    name: string;
    currentStock: number;
    threshold: number;
  }>;
}
```

#### `dashboard.getCustomerAnalytics`
Retrieves customer segmentation and lifetime value data.

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  segment?: 'new' | 'returning' | 'vip';
}
```

**Response:**
```typescript
{
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  retentionRate: number;
  segments: Array<{
    name: string;
    count: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}
```

#### `dashboard.getEmailMarketingMetrics`
Retrieves email campaign performance.

**Input:**
```typescript
{
  startDate: Date;
  endDate: Date;
  campaignId?: string;
}
```

**Response:**
```typescript
{
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  campaigns: Array<{
    id: string;
    name: string;
    sent: number;
    opens: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}
```

---

### Integrations Router (`integrations`)

#### `integrations.getConnections`
Lists all connected platform integrations.

**Response:**
```typescript
Array<{
  id: string;
  platform: 'google_analytics' | 'facebook_ads' | 'youtube' | 'amazon' | 'ebay' | 'walmart';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date | null;
  nextSync: Date | null;
  credentials: {
    hasAccessToken: boolean;
    expiresAt: Date | null;
  };
}>
```

#### `integrations.connectPlatform`
Initiates OAuth flow for platform connection.

**Input:**
```typescript
{
  platform: string;
  redirectUri: string;
}
```

**Response:**
```typescript
{
  authUrl: string;
}
```

#### `integrations.handleCallback`
Handles OAuth callback from platform.

**Input:**
```typescript
{
  platform: string;
  code: string;
  state: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;
}
```

#### `integrations.disconnectPlatform`
Removes platform connection.

**Input:**
```typescript
{
  platformId: string;
}
```

#### `integrations.triggerSync`
Manually triggers data sync for a platform.

**Input:**
```typescript
{
  platformId: string;
}
```

**Response:**
```typescript
{
  syncId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
```

---

### Team Router (`team`)

#### `team.getMembers`
Lists all team members.

**Response:**
```typescript
Array<{
  id: string;
  name: string | null;
  email: string | null;
  role: 'owner' | 'admin' | 'viewer';
  permissions: string[];
  lastActive: Date | null;
}>
```

#### `team.inviteMember`
Invites a new team member.

**Input:**
```typescript
{
  email: string;
  role: 'admin' | 'viewer';
  permissions?: string[];
}
```

#### `team.updateMemberRole`
Updates a team member's role.

**Input:**
```typescript
{
  userId: string;
  role: 'owner' | 'admin' | 'viewer';
}
```

#### `team.removeMember`
Removes a team member.

**Input:**
```typescript
{
  userId: string;
}
```

#### `team.updatePermissions`
Updates granular permissions for a role.

**Input:**
```typescript
{
  role: string;
  permissions: string[];
}
```

---

### Export Router (`export`)

#### `export.generatePDF`
Generates a PDF report.

**Input:**
```typescript
{
  reportType: 'revenue' | 'marketing' | 'products' | 'customers';
  startDate: Date;
  endDate: Date;
  includeCharts: boolean;
  branding?: {
    logoUrl?: string;
    companyName?: string;
  };
}
```

**Response:**
```typescript
{
  url: string;
  expiresAt: Date;
}
```

#### `export.generateExcel`
Generates an Excel spreadsheet with raw data.

**Input:**
```typescript
{
  reportType: 'revenue' | 'marketing' | 'products' | 'customers' | 'raw';
  startDate: Date;
  endDate: Date;
  sheets?: string[];
}
```

**Response:**
```typescript
{
  url: string;
  expiresAt: Date;
}
```

#### `export.scheduleReport`
Schedules automated report delivery.

**Input:**
```typescript
{
  reportType: string;
  format: 'pdf' | 'excel';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  config: {
    startDate: Date;
    endDate: Date;
    [key: string]: any;
  };
}
```

---

### Settings Router (`settings`)

#### `settings.getConfiguration`
Retrieves application configuration.

**Response:**
```typescript
{
  general: {
    companyName: string;
    timezone: string;
    currency: string;
  };
  notifications: {
    email: boolean;
    slack?: boolean;
  };
  dataRetention: {
    days: number;
  };
}
```

#### `settings.updateConfiguration`
Updates application configuration.

**Input:**
```typescript
{
  general?: {
    companyName?: string;
    timezone?: string;
    currency?: string;
  };
  notifications?: {
    email?: boolean;
    slack?: boolean;
  };
  dataRetention?: {
    days?: number;
  };
}
```

---

## Error Responses

All errors follow a consistent format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input parameters |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |
| `SYNC_FAILED` | 502 | Platform sync failed |
| `TOKEN_EXPIRED` | 401 | OAuth token expired |

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 100 requests per minute
- **Unauthenticated**: 10 requests per minute
- **Export endpoints**: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks

The application supports webhooks for real-time notifications.

### Available Events

- `sync.completed`: Data sync completed
- `sync.failed`: Data sync failed
- `report.generated`: Scheduled report generated
- `alert.threshold`: Metric threshold alert

### Webhook Payload

```typescript
{
  event: string;
  timestamp: Date;
  data: any;
  signature: string; // HMAC-SHA256 signature
}
```

### Verifying Webhooks

Verify webhook signatures using your webhook secret:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## Client Libraries

### TypeScript/JavaScript Example

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Usage
const revenue = await trpc.dashboard.getRevenueOverview.query({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});
```

### cURL Examples

```bash
# Get revenue overview
curl -X POST http://localhost:3000/trpc/dashboard.getRevenueOverview \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-token" \
  -d '{"json":{"startDate":"2024-01-01","endDate":"2024-01-31"}}'

# Trigger platform sync
curl -X POST http://localhost:3000/trpc/integrations.triggerSync \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-token" \
  -d '{"json":{"platformId":"ga-123"}}'
```

---

## Versioning

API version is included in the tRPC transformer. Current version: `1.0.0`

Breaking changes will increment the major version and be documented in release notes.
