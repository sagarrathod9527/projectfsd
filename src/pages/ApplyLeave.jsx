import { useEffect, useState } from "react";
import API from "../api/axios";

const emptyForm = { leaveTypeId: "", startDate: "", endDate: "", reason: "" };

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  return diff > 0 ? diff : 0;
};

const ApplyLeave = () => {
  const [types, setTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }

  const loadData = async () => {
    try {
      const [typesRes, balanceRes] = await Promise.all([
        API.get("/leaves/types"),
        API.get("/leaves/balance")
      ]);
      setTypes(typesRes.data);
      setBalance(balanceRes.data);
      setForm((f) => (f.leaveTypeId || !typesRes.data.length ? f : { ...f, leaveTypeId: typesRes.data[0].id }));
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Could not load leave types" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const days = daysBetween(form.startDate, form.endDate);
  const selectedBalance = balance.find((b) => b.leaveTypeId === Number(form.leaveTypeId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await API.post("/leaves", { ...form, leaveTypeId: Number(form.leaveTypeId) });
      setMessage({ type: "success", text: res.data.message });
      setForm({ ...emptyForm, leaveTypeId: types[0]?.id || "" });
      loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Apply Leave failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Apply Leave</h2>

      {message && <div className={`notice ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Leave Type
          <select
            value={form.leaveTypeId}
            onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
            required
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedBalance && (
            <small className="hint">
              Remaining this year: {selectedBalance.remaining} of {selectedBalance.total} days
            </small>
          )}
        </label>

        <label>
          Start Date
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            min={form.startDate}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
          {days > 0 && <small className="hint">Total: {days} day{days > 1 ? "s" : ""}</small>}
        </label>

        <label>
          Reason
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows="4"
            required
          />
        </label>

        <button type="submit" className="primary-btn" disabled={submitting || !form.leaveTypeId}>
          {submitting ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;
