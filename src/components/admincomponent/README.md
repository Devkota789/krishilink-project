# Admin Components

This folder contains the modular components for the KrishiLink Admin Panel. The original bulky `AdminPanel.jsx` file has been refactored into smaller, more manageable components.

## Structure

```
admincomponent/
├── AdminPanel.jsx          # Main orchestrator component
├── AdminTabs.jsx           # Tab navigation component
├── DashboardSection.jsx    # Comprehensive dashboard with KPIs and charts
├── UsersManagement.jsx     # User management functionality
├── ProductsManagement.jsx  # Product management functionality
├── OrdersManagement.jsx    # Order management functionality
├── AnalyticsSection.jsx    # Analytics and reports section
├── SettingsSection.jsx     # System settings section
├── ProductDetailsModal.jsx # Product details modal
├── AdminPanel.css          # Styles for all admin components
├── index.js               # Export file for easy imports
└── README.md              # This documentation file
```

## Components

### AdminPanel.jsx
The main component that orchestrates all admin functionality. It manages:
- State management for all admin features
- API calls and data loading
- User authentication and authorization
- Tab switching logic

### DashboardSection.jsx
Comprehensive dashboard component with:
- Key Performance Indicators (KPIs)
- User growth charts and analytics
- Top performing products
- Recent system activity
- Quick action buttons
- System health indicators
- Real-time data loading with fallbacks

### AdminTabs.jsx
Handles the tab navigation between different admin sections:
- Dashboard
- Users
- Products
- Orders
- Analytics
- Settings

### UsersManagement.jsx
Manages user-related operations:
- Display user list with filtering
- User activation/deactivation
- **Enhanced user deletion with confirmation modal**
- Search and filter functionality
- Role-based user display
- Detailed user information before deletion

### ProductsManagement.jsx
Handles product-related operations:
- Display product grid
- Product activation/deactivation
- **Enhanced product deletion with confirmation modal**
- Product search functionality
- Product details modal integration
- Detailed product information before deletion

### OrdersManagement.jsx
Manages order-related operations:
- Display order list with status filtering
- Order approval/rejection
- Order completion
- Status-based actions

### AnalyticsSection.jsx
Displays analytics and reports:
- User growth charts
- Revenue analysis
- Product performance
- Geographic distribution

### SettingsSection.jsx
Manages system settings:
- General settings
- Email configuration
- Security settings
- Backup and maintenance
- **Security testing tools for user deletion permissions**

### ProductDetailsModal.jsx
Modal component for detailed product information:
- Product image display
- Product details
- Action buttons
- Raw JSON view

### ProductDeleteModal.jsx
Enhanced product deletion confirmation modal:
- Detailed product information display
- Clear warning about permanent deletion
- List of consequences (removes product, images, orders)
- Professional UI with warning colors and icons

### UserDeleteTest.jsx
Security testing component for user deletion permissions:
- Tests admin vs regular user delete endpoints
- Verifies backend security restrictions
- Provides security recommendations
- Authentication status verification

## Usage

To use the admin components, import from the main AdminPanel:

```jsx
import { AdminPanel } from '../components/admincomponent';

// Use in your app
<AdminPanel />
```

Or import individual components:

```jsx
import { 
  UsersManagement, 
  ProductsManagement, 
  OrdersManagement 
} from '../components/admincomponent';
```

## Benefits of This Refactor

1. **Modularity**: Each component has a single responsibility
2. **Maintainability**: Easier to find and fix issues
3. **Reusability**: Components can be reused in other parts of the app
4. **Testing**: Easier to write unit tests for individual components
5. **Performance**: Better code splitting and lazy loading opportunities
6. **Collaboration**: Multiple developers can work on different components simultaneously

## CSS

All styles are centralized in `AdminPanel.css` and follow a consistent design system with:
- Responsive design
- Modern UI with gradients and shadows
- Consistent color scheme
- Mobile-first approach

## API Integration

The components use dynamic imports for API calls to ensure proper error handling and fallbacks:
- User API operations
- Product API operations
- Order API operations
- Admin-specific API operations

## Security Features

### User Deletion Security
- **Admin-only deletion**: Uses `/api/Admin/deleteUser/{userId}` endpoint
- **Fallback protection**: Falls back to regular endpoint if admin endpoint fails
- **Enhanced confirmation**: Detailed modal with user information before deletion
- **Permission testing**: Built-in tools to verify backend security restrictions
- **Audit trail**: All deletion attempts are logged and tracked

### Backend Endpoints
- **Admin Delete**: `DELETE /api/Admin/deleteUser/{userId}` (Admin only)
- **Regular Delete**: `DELETE /api/User/Delete/{userId}` (Should be restricted)
- **Status Update**: `PUT /api/User/updateStatus` (Admin operations)
