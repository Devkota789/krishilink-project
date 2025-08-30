# KrishiLink Admin Panel

A comprehensive administrative interface for managing the entire KrishiLink agricultural marketplace system.

## 🚀 Features

### 📊 Dashboard Overview
- **Key Performance Indicators (KPIs)**: Real-time statistics for users, products, orders, and revenue
- **Interactive Charts**: User growth trends and product performance analytics
- **Recent Activity Feed**: System-wide activity monitoring
- **Quick Actions**: Direct access to all management functions
- **System Health Monitoring**: Database, API services, storage, and uptime status

### 👥 User Management
- **User List**: Complete user database with search and filtering
- **Role Management**: Admin, Farmer, and Buyer role assignments
- **Status Control**: Activate/deactivate user accounts
- **User Details**: Comprehensive user information and activity tracking
- **Bulk Operations**: Mass user updates and management

### 🍎 Product Management
- **Product Catalog**: Complete product database management
- **Status Control**: Activate/deactivate products
- **Content Moderation**: Review and approve product listings
- **Performance Analytics**: Track product sales and popularity
- **Bulk Operations**: Mass product updates

### 📦 Order Management
- **Order Processing**: Complete order lifecycle management
- **Status Updates**: Approve, reject, process, and complete orders
- **Order Analytics**: Revenue tracking and order patterns
- **Customer Support**: Order history and customer information

### 📈 Analytics & Reports
- **User Growth Analytics**: Registration trends and user behavior
- **Revenue Analysis**: Financial performance and trends
- **Product Performance**: Top-selling products and categories
- **Geographic Distribution**: User and order location analytics
- **Custom Reports**: Exportable data in multiple formats

### ⚙️ System Settings
- **General Configuration**: Site name, maintenance mode, registration settings
- **Email Settings**: SMTP configuration and notification preferences
- **Security Settings**: Session timeout, 2FA, rate limiting
- **Backup & Maintenance**: Database optimization and system cleanup

### 🔒 Security & Access Control
- **Role-Based Access**: Admin-only functionality
- **Audit Logging**: Complete system activity tracking
- **Content Moderation**: Report handling and content management
- **User Activity Monitoring**: Suspicious activity detection

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- React 18+
- Existing KrishiLink project setup

### 1. Add Admin Panel Route
The admin panel is already added to your routing configuration in `src/App.jsx`:

```jsx
<Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
```

### 2. Access Control
The admin panel automatically checks for admin role access:

```jsx
if (!user || user.role !== 'admin') {
  return <div className="admin-unauthorized">Access Denied</div>;
}
```

### 3. API Integration
The admin panel uses the dedicated `adminAPI` for all administrative operations:

```jsx
import { adminAPI } from '../api/adminAPI';
```

## 📱 Usage

### Accessing the Admin Panel
1. Navigate to `/admin` in your application
2. Ensure you're logged in with an admin role
3. The panel will automatically load dashboard data

### Dashboard Navigation
- **Dashboard**: Overview with KPIs and quick actions
- **Users**: User management and role administration
- **Products**: Product catalog and content moderation
- **Orders**: Order processing and management
- **Analytics**: Detailed reports and insights
- **Settings**: System configuration and maintenance

### Quick Actions
- **Manage Users**: Direct access to user management
- **Review Products**: Product approval and moderation
- **Process Orders**: Order status updates
- **View Analytics**: Detailed reporting
- **System Settings**: Configuration management
- **Export Data**: Download reports in CSV format

## 🔧 API Endpoints

### User Management
```javascript
// Get all users
adminAPI.getAllUsers()

// Update user status
adminAPI.updateUserStatus(userId, status)

// Delete user
adminAPI.deleteUser(userId)

// Bulk user operations
adminAPI.bulkUpdateUsers(userIds, updateData)
```

### Product Management
```javascript
// Get all products (admin view)
adminAPI.getAllProductsAdmin()

// Update product status
adminAPI.updateProductStatus(productId, isActive)

// Delete product
adminAPI.deleteProductAdmin(productId)
```

### Order Management
```javascript
// Get all orders
adminAPI.getAllOrders()

// Update order status
adminAPI.updateOrderStatus(orderId, statusData)
```

### Analytics & Reports
```javascript
// Dashboard statistics
adminAPI.getDashboardStats()

// User growth analytics
adminAPI.getUserGrowthStats(period)

// Revenue analysis
adminAPI.getRevenueStats(period)

// Product performance
adminAPI.getProductPerformanceStats()
```

### System Operations
```javascript
// System settings
adminAPI.getSystemSettings()
adminAPI.updateSystemSettings(settings)

// Backup and maintenance
adminAPI.createBackup()
adminAPI.cleanupLogs()
adminAPI.optimizeDatabase()

// Data export
adminAPI.exportUsers(format, filters)
adminAPI.exportOrders(format, filters)
adminAPI.exportProducts(format, filters)
```

## 🎨 Customization

### Styling
The admin panel uses a comprehensive CSS system with:
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Material Design principles
- **Custom Themes**: KrishiLink brand colors
- **Interactive Elements**: Hover effects and animations

### Component Structure
```jsx
src/
├── pages/
│   ├── AdminPanel.jsx          # Main admin panel
│   └── AdminPanel.css          # Panel styling
├── components/
│   ├── AdminDashboard.jsx      # Dashboard component
│   └── AdminDashboard.css      # Dashboard styling
└── api/
    └── adminAPI.js             # Admin API functions
```

### Adding New Features
1. **Create Component**: Add new component in `src/components/`
2. **Add Route**: Include in admin panel tabs
3. **API Integration**: Add endpoints to `adminAPI.js`
4. **Styling**: Create corresponding CSS file

## 🔐 Security Considerations

### Access Control
- **Role Verification**: Admin-only access enforcement
- **Route Protection**: PrivateRoute wrapper for admin routes
- **Session Management**: Secure token handling

### Data Protection
- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization

### Audit Logging
- **Activity Tracking**: All admin actions are logged
- **User Accountability**: Action attribution to admin users
- **Compliance**: GDPR and data protection compliance

## 📊 Data Management

### Real-time Updates
- **Live Statistics**: Dashboard updates in real-time
- **Activity Feeds**: Recent system activity monitoring
- **Status Indicators**: Live system health monitoring

### Data Export
- **Multiple Formats**: CSV, Excel, PDF export options
- **Filtered Exports**: Custom data filtering and export
- **Scheduled Reports**: Automated report generation

### Backup & Recovery
- **Automated Backups**: Scheduled database backups
- **Data Recovery**: Point-in-time restoration
- **System Maintenance**: Regular optimization and cleanup

## 🚨 Troubleshooting

### Common Issues

#### Access Denied Error
```jsx
// Ensure user has admin role
if (user.role !== 'admin') {
  // Redirect to dashboard
  navigate('/dashboard');
}
```

#### API Connection Issues
```javascript
// Check API endpoint configuration
const BASE_URL = 'https://krishilink.shamir.com.np';
```

#### Styling Issues
- Verify CSS imports in component files
- Check for CSS class name conflicts
- Ensure responsive breakpoints are correct

### Performance Optimization
- **Lazy Loading**: Components load on demand
- **Data Caching**: API response caching
- **Image Optimization**: Compressed product images
- **Bundle Splitting**: Code splitting for better performance

## 🔄 Updates & Maintenance

### Regular Updates
- **Security Patches**: Monthly security updates
- **Feature Updates**: Quarterly feature releases
- **Bug Fixes**: Continuous bug resolution

### Monitoring
- **Performance Metrics**: Response time monitoring
- **Error Tracking**: Error logging and alerting
- **User Analytics**: Admin panel usage statistics

## 📞 Support

### Documentation
- **API Reference**: Complete endpoint documentation
- **Component Guide**: UI component usage examples
- **Troubleshooting**: Common issues and solutions

### Contact
- **Technical Support**: Development team support
- **Feature Requests**: New functionality suggestions
- **Bug Reports**: Issue reporting and tracking

## 📝 License

This admin panel is part of the KrishiLink project and follows the same licensing terms.

---

**Note**: This admin panel is designed for system administrators and requires appropriate access permissions. Always ensure proper security measures are in place before deployment.
