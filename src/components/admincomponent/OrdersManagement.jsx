import React from 'react';

const OrdersManagement = ({ 
  orders, 
  filterStatus, 
  setFilterStatus, 
  onOrderAction 
}) => {
  return (
    <div className="orders-management">
      <div className="section-header">
        <h2>Order Management</h2>
        <div className="search-filter">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.productCount} items</td>
                <td>₹{order.totalAmount}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td className="action-buttons">
                  {order.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => onOrderAction(order.id, 'approve')}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onOrderAction(order.id, 'reject')}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <button 
                      onClick={() => onOrderAction(order.id, 'complete')}
                      className="btn-complete"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersManagement;
