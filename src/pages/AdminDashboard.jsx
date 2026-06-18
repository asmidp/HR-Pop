import { useEffect, useMemo, useState } from "react";
import { fetchAllTasks } from "../services/taskService";
import { supabase } from "../services/supabase";
import { getTaskStats, getTaskTiming } from "../utils/taskUtils";

function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: tasksData }, { data: profilesData }] =
        await Promise.all([
          fetchAllTasks(),
          supabase
            .from("profiles")
            .select("id,email,full_name,role"),
        ]);

      setTasks(tasksData ?? []);
      setEmployees(
        (profilesData ?? []).filter(
          (profile) => profile.role === "employee"
        )
      );

      setLoading(false);
    }

    loadData();
  }, []);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const overdueTasks = tasks.filter(
    (task) => getTaskTiming(task) === "Overdue"
  );
  const managerTasks = tasks.filter(
  (task) => task.assigned_to === "manager@company.com"
    );

  const employeeWorkload = employees.map((employee) => ({
    name: employee.full_name || employee.email,
    count: tasks.filter(
      (task) => task.assigned_to === employee.email
    ).length,
  }));

  if (loading) {
    return <div className="loading-card">Loading admin dashboard...</div>;
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>HR Manager Dashboard</h1>
        </div>
        <p className="page-note">
          Organisation-wide task and employee overview.
        </p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
        </article>

        <article className="stat-card">
          <span>Total Tasks</span>
          <strong>{stats.total}</strong>
        </article>

        <article className="stat-card">
          <span>Open Tasks</span>
          <strong>{stats.open}</strong>
        </article>

        <article className="stat-card">
            <span>My Tasks</span>
            <strong>{managerTasks.length}</strong>
        </article>

        <article className="stat-card danger">
          <span>Overdue Tasks</span>
          <strong>{overdueTasks.length}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
  <section className="card-panel">
    <div className="section-head">
      <h2>Employees</h2>
    </div>

    <ul className="compact-list">
      {employeeWorkload.map((employee) => (
        <li key={employee.name}>
          <strong>{employee.name}</strong>
          <span>{employee.count} task(s)</span>
        </li>
      ))}
    </ul>
  </section>

  <section className="card-panel">
    <div className="section-head">
      <h2>My Tasks</h2>
      <span>{managerTasks.length}</span>
    </div>

    {managerTasks.length ? (
      <ul className="compact-list">
        {managerTasks.map((task) => (
          <li key={task.id}>
            <strong>{task.task_name}</strong>
            <span>{task.status}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p>No tasks assigned to you.</p>
    )}
  </section>

  <section className="card-panel">
    <div className="section-head">
      <h2>Overdue Tasks</h2>
    </div>

    <ul className="compact-list">
      {overdueTasks.slice(0, 10).map((task) => (
        <li key={task.id}>
          <strong>{task.task_name}</strong>
          <span>{task.assigned_to}</span>
        </li>
      ))}
    </ul>
  </section>
</div>
    </section>
  );
}

export default AdminDashboard;