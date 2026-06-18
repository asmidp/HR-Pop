import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTasks } from "../services/taskService";
import { formatDateDisplay, getTaskStats, getTaskTiming } from "../utils/taskUtils";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const { data, error: taskError } = await fetchTasks();

      if (!active) {
        return;
      }

      if (taskError) {
        setError(taskError.friendlyMessage || "We couldn't load the dashboard right now.");
        setLoading(false);
        return;
      }

      setTasks(data ?? []);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const overdueTasks = tasks.filter((task) => getTaskTiming(task) === "Overdue");
  const dueTodayTasks = tasks.filter((task) => getTaskTiming(task) === "Due Today");
  const upcomingTasks = tasks.filter((task) => getTaskTiming(task) === "Upcoming").slice(0, 5);

  if (loading) {
    return <div className="loading-card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="status-card error-card">{error}</div>;
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <p className="page-note">Task health, overdue work, and follow-up priorities at a glance.</p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Tasks</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card">
          <span>Open Tasks</span>
          <strong>{stats.open}</strong>
        </article>
        <article className="stat-card">
          <span>Completed Tasks</span>
          <strong>{stats.completed}</strong>
        </article>
        <article className="stat-card danger">
          <span>Overdue Tasks</span>
          <strong>{stats.overdue}</strong>
        </article>
      </div>

      <div className="stats-grid secondary-grid">
        <article className="stat-card">
          <span>Due Today</span>
          <strong>{stats.dueToday}</strong>
        </article>
        <article className="stat-card">
          <span>Upcoming</span>
          <strong>{stats.upcoming}</strong>
        </article>
        <article className="stat-card">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="card-panel">
          <div className="section-head">
            <h2>Due Today</h2>
            <span>{dueTodayTasks.length} task{dueTodayTasks.length === 1 ? "" : "s"}</span>
          </div>
          {dueTodayTasks.length ? (
            <ul className="compact-list">
              {dueTodayTasks.map((task) => (
                <li key={task.id}>
                  <Link to={`/tasks/${task.id}`}>{task.task_name}</Link>
                  <span>{formatDateDisplay(task.due_date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No tasks are due today.</p>
          )}
        </section>

        <section className="card-panel">
          <div className="section-head">
            <h2>Overdue</h2>
            <span>{overdueTasks.length} task{overdueTasks.length === 1 ? "" : "s"}</span>
          </div>
          {overdueTasks.length ? (
            <ul className="compact-list">
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  <Link to={`/tasks/${task.id}`}>{task.task_name}</Link>
                  <span>{formatDateDisplay(task.due_date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No overdue tasks right now.</p>
          )}
        </section>

        <section className="card-panel card-panel-wide">
          <div className="section-head">
            <h2>Upcoming Follow-Ups</h2>
            <span>Next 5 tasks</span>
          </div>
          {upcomingTasks.length ? (
            <ul className="follow-up-list">
              {upcomingTasks.map((task) => (
                <li key={task.id}>
                  <div>
                    <Link to={`/tasks/${task.id}`}>{task.task_name}</Link>
                    <p>{task.assigned_to || "Unassigned"}</p>
                  </div>
                  <div className="follow-up-meta">
                    <span>{formatDateDisplay(task.due_date)}</span>
                    <span>{task.priority}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No upcoming tasks yet.</p>
          )}
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
