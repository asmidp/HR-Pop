import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EMPTY_TASK_FORM, createTask, fetchTasks } from "../services/taskService";
import { fetchProfiles } from "../services/profileService";
import { getCurrentProfile } from "../services/profileService";
import {
  formatDateDisplay,
  getPriorityTone,
  getTaskStats,
  getTaskTiming,
} from "../utils/taskUtils";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState(EMPTY_TASK_FORM);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
  let active = true;

  async function loadTasks() {
    const { data, error: taskError } = await fetchTasks();

    if (!active) return;

    if (taskError) {
      setError(taskError.friendlyMessage);
      setLoading(false);
      return;
    }

    setTasks(data ?? []);
    setLoading(false);
  }

      async function loadEmployees() {
      const { data } = await fetchProfiles();

      if (!active) return;

      setEmployees(data ?? []);
    }

    async function loadProfile() {
      const profile = await getCurrentProfile();

      if (!active) return;

      setProfile(profile);
    }

    loadTasks();
    loadEmployees();
    loadProfile();

  return () => {
    active = false;
  };
}, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const { data, error: createError, friendlyMessage } = await createTask(form);
    console.log("Created data:", data);
    console.log("Create error:", createError);
    console.log("Friendly message:", friendlyMessage);

    if (createError) {
      setError(friendlyMessage);
      setSaving(false);
      return;
    }

    setTasks((current) => [data, ...current]);
    setForm(EMPTY_TASK_FORM);
    setNotice("Task created.");
    setSaving(false);
  }

  const filteredTasks = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchTerm ||
        task.task_name?.toLowerCase().includes(searchTerm) ||
        task.assigned_to?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm);

      const taskTiming = getTaskTiming(task);
      const matchesStatus = statusFilter === "All" || task.status === statusFilter || taskTiming === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tasks]);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  if (loading) {
    return <div className="loading-card">Loading tasks...</div>;
  }

  if (error) {
    return <div className="status-card error-card">{error}</div>;
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Task Management</p>
          <h1>Tasks</h1>
        </div>
        <p className="page-note">Browse tasks, filter by timing, and open a task to update status or due date.</p>
      </div>

      <div className="stats-grid secondary-grid">
        <article className="stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </article>
        <article className="stat-card">
          <span>Upcoming</span>
          <strong>{stats.upcoming}</strong>
        </article>
        <article className="stat-card danger">
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </article>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <span>Search</span>
          <input
            className="input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Task name, assignee, description"
          />
        </label>

        <label className="search-field">
          <span>Filter</span>
          <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Due Today">Due Today</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Overdue">Overdue</option>
          </select>
        </label>
      </div>

      <form className="form-card task-form" onSubmit={handleCreateTask}>
        <div className="section-head">
          <h2>Create Task</h2>
          {notice ? <span className="success-text">{notice}</span> : null}
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Task Name</span>
            <input
              className="input"
              value={form.task_name}
              onChange={(event) => updateForm("task_name", event.target.value)}
              placeholder="Prepare offer letter"
              required
            />
          </label>

            {profile?.role === "admin" && (
            <label className="field">
              <span>Assigned To</span>

              <select
                className="input"
                value={form.assigned_to}
                onChange={(event) => updateForm("assigned_to", event.target.value)}
              >
                <option value="">Select Employee</option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.email}
                  >
                    {employee.full_name} ({employee.role})
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            <span>Start Date</span>
            <input
              className="input"
              type="date"
              value={form.start_date}
              onChange={(event) => updateForm("start_date", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Due Date</span>
            <input
              className="input"
              type="date"
              value={form.due_date}
              onChange={(event) => updateForm("due_date", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Priority</span>
            <select className="input" value={form.priority} onChange={(event) => updateForm("priority", event.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select className="input" value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea
            className="input"
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder="Add context, next steps, or notes"
            rows="3"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="button button-primary" type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create task"}
        </button>
      </form>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Timing</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length ? (
              filteredTasks.map((task) => {
                const timing = getTaskTiming(task);
                const statusClass = `status-${String(task.status || "").toLowerCase().replace(/\s+/g, "-")}`;

                return (
                  <tr key={task.id}>
                    <td>
                      <Link className="table-link" to={`/tasks/${task.id}`}>
                        {task.task_name}
                      </Link>
                    </td>
                    <td>{task.assigned_to || "Unassigned"}</td>
                    <td>{formatDateDisplay(task.due_date)}</td>
                    <td>
                      <span className={`badge priority-${getPriorityTone(task.priority)}`}>{task.priority || "Low"}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusClass}`}>{task.status}</span>
                    </td>
                    <td>
                      <span className={`badge timing-${timing.toLowerCase().replace(/\s+/g, "-")}`}>{timing}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">
                  <p className="empty-text">No tasks match the current filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Tasks;
