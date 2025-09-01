import React from 'react';

const AdminTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'products', label: '🍎 Products', icon: '🍎' },
    { id: 'orders', label: '📦 Orders', icon: '📦' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  return (
    <div className="admin-tabs">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;
