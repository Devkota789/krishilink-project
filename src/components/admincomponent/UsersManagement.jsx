import React, { useState } from 'react';

const UsersManagement = ({ 
  users, 
  searchTerm, 
  setSearchTerm, 
  userScope, 
  setUserScope, 
  onUserAction, 
  onLoadUsers 
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      onUserAction(selectedUser.id, 'delete');
      setShowUserModal(false);
      setSelectedUser(null);
    }
  };

  const cancelDelete = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="users-management">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="search-filter">
          <div className="filter-group">
            <button 
              className={`admin-tab ${userScope === 'all' ? 'active' : ''}`} 
              onClick={() => { setUserScope('all'); onLoadUsers(); }}
            >
              All
            </button>
            <button 
              className={`admin-tab ${userScope === 'farmers' ? 'active' : ''}`} 
              onClick={() => { setUserScope('farmers'); onLoadUsers(); }}
            >
              Farmers
            </button>
            <button 
              className={`admin-tab ${userScope === 'buyers' ? 'active' : ''}`} 
              onClick={() => { setUserScope('buyers'); onLoadUsers(); }}
            >
              Buyers
            </button>
            <button 
              className={`admin-tab ${userScope === 'active' ? 'active' : ''}`} 
              onClick={() => { setUserScope('active'); onLoadUsers(); }}
            >
              Active
            </button>
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role || 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td className="action-buttons">
                  {user.status === 'active' ? (
                    <button 
                      onClick={() => onUserAction(user.id, 'deactivate')}
                      className="btn-deactivate"
                      title="Deactivate user"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button 
                      onClick={() => onUserAction(user.id, 'activate')}
                      className="btn-activate"
                      title="Activate user"
                    >
                      Activate
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteClick(user)}
                    className="btn-delete"
                    title="Delete user permanently"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Delete Confirmation Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content user-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm User Deletion</h3>
              <button className="btn-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-delete-warning">
                <div className="warning-icon">⚠️</div>
                <h4>This action cannot be undone!</h4>
                <p>You are about to permanently delete the following user:</p>
              </div>
              
              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedUser.fullName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">
                    <span className={`role-badge ${selectedUser.role || 'user'}`}>
                      {selectedUser.role || 'user'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedUser.status}`}>
                      {selectedUser.status}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Join Date:</span>
                  <span className="detail-value">{selectedUser.joinDate}</span>
                </div>
              </div>

              <div className="delete-consequences">
                <h5>This will permanently:</h5>
                <ul>
                  <li>Remove the user account</li>
                  <li>Delete all user data</li>
                  <li>Remove user's products and orders</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn-delete-confirm" 
                onClick={confirmDelete}
              >
                Delete User Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
