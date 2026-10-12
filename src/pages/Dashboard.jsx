import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalLeaves: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0 });
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, leavesRes, balanceRes] = await Promise.all([
          API.get("/leaves/summary"),
          API.get(user?.role === "employee" ? "/leaves/my-leaves" : "/leaves"),
          API.get("/leaves/balance").catch(() => ({ data: [] }))
        ]);
        setSummary(summaryRes.data);
        setLeaves(leavesRes.data);
        setBalance(balanceRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box accent-blue">
          <span>Total Requests</span>
          <strong>{summary.totalLeaves}</strong>
        </div>
        <div className="stat-box accent-yellow">
          <span>Pending</span>
          <strong>{summary.pendingLeaves}</strong>
        </div>
        <div className="stat-box accent-green">
          <span>Approved</span>
          <strong>{summary.approvedLeaves}</strong>
        </div>
        <div className="stat-box accent-red">
          <span>Rejected</span>
          <strong>{summary.rejectedLeaves}</strong>
        </div>
      </div>

      {balance.length > 0 && (
        <div className="card">
          <h3>My Leave Balance ({new Date().getFullYear()})</h3>
          <div className="balance-grid">
            {balance.map((b) => (
              <div className="balance-item" key={b.leaveTypeId}>
                <span>{b.name}</span>
                <strong>{b.remaining} <small>/ {b.total} days left</small></strong>
                <em>{b.used} used, {b.pending} pending</em>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>{user?.role === "employee" ? "My Leave History" : "All Leave Requests"}</h3>

        {leaves.length === 0 ? (
          <p className="empty-state">No leave applications found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Manager Comment</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.Employee?.User?.name || "You"}</td>
                    <td>{leave.LeaveType?.name || "Leave"}</td>
                    <td>{leave.startDate} to {leave.endDate}</td>
                    <td>{leave.totalDays}</td>
                    <td>
                      <span className={`status-badge ${leave.status}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>{leave.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
