import { useEffect, useState } from "react";
import API from "../api/axios";

const ManagerApprovals = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await API.get("/leaves/pending");
      setPendingLeaves(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const comments = window.prompt(`Comment for this ${status === "approved" ? "approval" : "rejection"} (optional):`, "");
      if (comments === null) return; // cancelled
      await API.put(`/leaves/${id}/status`, { status, comments });
      fetchPending();
    } catch (error) {
      alert(error.response?.data?.message || "Could not update leave status");
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Manager</p>
          <h2>Leave Approvals</h2>
        </div>
      </div>

      <div className="card">
        {pendingLeaves.length === 0 ? (
          <p className="empty-state">No pending leave requests.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Days</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.Employee?.User?.name || "Employee"}</td>
                    <td>{leave.LeaveType?.name || "Leave"}</td>
                    <td>{leave.totalDays}</td>
                    <td>{leave.startDate} - {leave.endDate}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="success-btn" onClick={() => handleStatus(leave.id, "approved")}>Approve</button>
                        <button className="danger-btn" onClick={() => handleStatus(leave.id, "rejected")}>Reject</button>
                      </div>
                    </td>
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

export default ManagerApprovals;
