# PowerBI Ecommerce Dashboard

A comprehensive, real-time ecommerce analytics dashboard that unifies data from multiple sales and marketing platforms into a single, powerful interface. Built with modern web technologies to provide actionable insights for ecommerce businesses.

![Dashboard Preview](./client/src/assets/preview.png)

## 🚀 Features

### Dashboard Pages
- **Revenue Overview**: Track total revenue, profit margins, and sales trends across all channels
- **Marketing Performance**: Analyze ROAS, ad spend efficiency, and campaign performance
- **Product Analysis**: Deep dive into product-level metrics, best sellers, and inventory insights
- **Customer Analytics**: Customer segmentation, lifetime value, and retention metrics
- **Email Marketing**: Email campaign performance, open rates, and conversion tracking

### Platform Integrations
Connect and sync data from 9+ major platforms:
- Google Analytics
- Facebook Ads
- YouTube Analytics
- Amazon Seller Central
- eBay
- Walmart Marketplace
- Shopify
- WooCommerce
- Magento

### Advanced Capabilities
- **Real-time Data Updates**: Live sales and performance metrics
- **Drill-down Analytics**: Click through from high-level metrics to granular details
- **Role-Based Access Control**: 3 user roles with 48 granular permissions
- **Team Management**: Collaborate with team members with controlled access
- **Data Export**: PDF and Excel reports with scheduled delivery
- **Interactive Charts**: Hover, filter, and customize visualizations
- **Saved Configurations**: Save and reuse dashboard configurations

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Chart.js & Recharts** - Data visualization
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express** - Web server
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Database ORM
- **MySQL** - Database
- **Google Auth Library** - OAuth authentication
- **AWS SDK** - S3 storage integration

### Development & Testing
- **Vitest** - Testing framework
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **pnpm** - Package manager

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18+ installed
- **pnpm** package manager (`npm install -g pnpm`)
- **MySQL** database (v8.0+ recommended)
- Environment variables configured (see below)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ldt28/powerbi-ecommerce-dashboard.git
cd powerbi-ecommerce-dashboard
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/powerbi_dashboard

# Authentication
OWNER_OPEN_ID=your-owner-open-id
SESSION_SECRET=your-session-secret-key

# AWS S3 (Optional - for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Google OAuth (for Google Analytics integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Port Configuration
PORT=3000
```

### 4. Set Up Database

Run database migrations:

```bash
pnpm db:push
```

This will create all necessary tables including:
- Users and authentication
- API credentials for platform integrations
- Sales data storage
- Ad spend tracking
- Data sync logs
- Team permissions

## 🚀 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build for production:

```bash
pnpm build
pnpm start
```

### Run Tests

Execute the test suite:

```bash
pnpm test
```

### Code Quality

Check TypeScript types:
```bash
pnpm check
```

Format code:
```bash
pnpm format
```

## 📊 Project Structure

```
powerbi-ecommerce-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── _core/         # Core utilities and configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── index.html
├── server/                # Express backend
│   ├── _core/            # Core server configuration
│   ├── db/               # Database utilities
│   ├── integrations/     # Platform API integrations
│   ├── notifications/    # Notification services
│   ├── platform-apis/    # Platform-specific API handlers
│   ├── routers/          # tRPC routers
│   ├── services/         # Business logic services
│   └── db.ts             # Database connection
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Database schema definitions
│   ├── meta/             # Drizzle metadata
│   └── migrations/       # SQL migrations
├── shared/               # Shared types and utilities
├── patches/              # npm patches
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── vitest.config.ts      # Vitest configuration
```

## 🔐 Authentication & Authorization

### User Roles

1. **Owner**: Full access to all features and settings
2. **Admin**: Manage team, configure integrations, view all data
3. **Viewer**: Read-only access to dashboards and reports

### Permissions System

The application implements a granular permission system with 48 distinct permissions across categories:
- Dashboard viewing
- Data export
- Integration management
- Team management
- Report scheduling
- Configuration changes

## 🔌 Platform Integration Setup

### Connecting Google Analytics

1. Navigate to Settings → Integrations
2. Click "Connect" on Google Analytics card
3. Authorize with your Google account
4. Select the properties to sync
5. Configure sync frequency

### Connecting Facebook Ads

1. Go to Settings → Integrations
2. Click "Connect" on Facebook Ads card
3. Log in to Facebook Business Manager
4. Grant ad account permissions
5. Select accounts to track

### Other Platforms

Each platform has specific setup instructions available in the application's integration wizard. Generally, you'll need:
- API credentials or OAuth access
- Account/Property IDs
- Permission grants for data access

## 📈 Data Sync

The application automatically syncs data from connected platforms based on configured schedules:
- **Real-time**: Critical metrics (sales, conversions)
- **Hourly**: Campaign performance data
- **Daily**: Comprehensive reports and aggregations
- **Weekly**: Historical data backups

Manual sync is also available for each integration.

## 📤 Export & Reporting

### Export Formats
- **PDF**: Professional reports with charts and summaries
- **Excel**: Raw data with pivot table capabilities

### Scheduled Reports
Configure automated report delivery:
- Choose recipients
- Set frequency (daily, weekly, monthly)
- Select data ranges and metrics
- Customize branding and formatting

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test -- dashboard-analytics.test.ts

# Run tests with coverage
pnpm test -- --coverage
```

Test coverage includes:
- Dashboard functionality
- Platform integrations
- Data analytics calculations
- Export utilities
- Authentication flows
- RBAC permissions

## 🛡️ Security Considerations

- All API tokens are encrypted at rest
- HTTPS required in production
- Session-based authentication with secure cookies
- Rate limiting on API endpoints
- Input validation with Zod schemas
- CORS configuration for cross-origin requests

## 🚨 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify `DATABASE_URL` in `.env` is correct
2. Ensure MySQL server is running
3. Check database exists and user has permissions
4. Test connection: `mysql -u username -p -h localhost`

### Platform Integration Failures

1. Verify API credentials are valid and not expired
2. Check platform API status pages for outages
3. Review sync logs in Admin → Sync History
4. Re-authenticate if tokens have expired

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .pnpm-store
pnpm install

# Rebuild
pnpm build
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style (Prettier configured)
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/ldt28/powerbi-ecommerce-dashboard/issues)
- Documentation: Check the `/docs` folder for detailed guides

## 🗺️ Roadmap

- [ ] Mobile responsive improvements
- [ ] Additional platform integrations (TikTok Ads, Pinterest)
- [ ] AI-powered insights and recommendations
- [ ] Custom metric builder
- [ ] White-label customization options
- [ ] Multi-currency support
- [ ] Advanced forecasting models

---

Built with ❤️ using React, TypeScript, and modern web technologies.
