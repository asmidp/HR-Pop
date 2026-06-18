import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EMPTY_TASK_FORM, deleteTask, fetchTaskById, updateTask } from "../services/taskService";
import { formatDateDisplay, formatDateInput, getPriorityTone, getTaskTiming } from "../utils/taskUtils";

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(EMPTY_TASK_FORM);

  useEffect(() => {
    let active = true;

    async function loadTask() {
      const { data, error: taskError } = await fetchTaskById(taskId);

      if (!active) {
        return;
      }

      if (taskError) {
        setError(taskError.friendlyMessage || "We couldn't find that task.");
        setLoading(false);
        return;
      }

      setTask(data);
      setForm({
        task_name: data?.task_name ?? "",
        description: data?.description ?? "",
        assigned_to: data?.assigned_to ?? "",
        start_date: formatDateInput(data?.start_date),
        due_date: formatDateInput(data?.due_date),
        priority: data?.priority ?? "Medium",
        status: data?.status ?? "Pending",
      });
      setLoading(false);
    }

    loadTask();

    return () => {
      active = false;
    };
  }, [taskId]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const { data, error: updateError, friendlyMessage } = await updateTask(taskId, form);

    if (updateError) {
      setError(friendlyMessage);
      setSaving(false);
      return;
    }

    setTask(data);
    setNotice("Task updated.");
    setSaving(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this task? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setNotice("");

    const { error: deleteError, friendlyMessage } = await deleteTask(taskId);

    if (deleteError) {
      setError(friendlyMessage);
      setDeleting(false);
      return;
    }

    navigate("/tasks", { replace: true });
  }

  if (loading) {
    return <div className="loading-card">Loading task details...</div>;
  }

  if (error && !task) {
    return <div className="status-card error-card">{error}</div>;
  }

  if (!task) {
    return <div className="status-card">Task not found.</div>;
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Task Detail</p>
          <h1>{task.task_name}</h1>
        </div>
        <div className="header-actions">
          <Link className="button button-secondary" to="/tasks">
            Back to tasks
          </Link>
          <button className="button button-danger" type="button" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <article className="card-panel detail-panel">
          <h2>Full Task Details</h2>
          <dl className="detail-list">
            <div>
              <dt>Description</dt>
              <dd>{task.description || "No description provided."}</dd>
            </div>
            <div>
              <dt>Assigned To</dt>
              <dd>{task.assigned_to || "Unassigned"}</dd>
            </div>
            <div>
              <dt>Start Date</dt>
              <dd>{formatDateDisplay(task.start_date)}</dd>
            </div>
            <div>
              <dt>Due Date</dt>
              <dd>{formatDateDisplay(task.due_date)}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <span className={`badge priority-${getPriorityTone(task.priority)}`}>{task.priority || "Low"}</span>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`badge status-${String(task.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                  {task.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>Timing</dt>
              <dd>
                <span className={`badge timing-${getTaskTiming(task).toLowerCase().replace(/\s+/g, "-")}`}>
                  {getTaskTiming(task)}
                </span>
              </dd>
            </div>
          </dl>
        </article>

        <article className="card-panel detail-panel">
          <div className="section-head">
            <h2>Edit Task</h2>
            {notice ? <span className="success-text">{notice}</span> : null}
          </div>
          <form className="form-stack" onSubmit={handleSave}>
            <label className="field">
              <span>Task Name</span>
              <input
                className="input"
                value={form.task_name}
                onChange={(event) => updateForm("task_name", event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                className="input"
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                rows="4"
              />
            </label>

            <label className="field">
              <span>Assigned To</span>
              <input
                className="input"
                value={form.assigned_to}
                onChange={(event) => updateForm("assigned_to", event.target.value)}
              />
            </label>

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
              <span>Status</span>
              <select className="input" value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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

            {error ? <p className="form-error">{error}</p> : null}

            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default TaskDetail;
