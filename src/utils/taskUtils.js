export function getLocalDateKey(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function normalizeDateKey(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

export function getTaskTiming(task, todayKey = getLocalDateKey()) {
  if (task?.status === "Completed") {
    return "Completed";
  }

  const dueDateKey = normalizeDateKey(task?.due_date);

  if (!dueDateKey) {
    return "No Due Date";
  }

  if (dueDateKey < todayKey) {
    return "Overdue";
  }

  if (dueDateKey === todayKey) {
    return "Due Today";
  }

  return "Upcoming";
}

export function getTaskStats(tasks) {
  const todayKey = getLocalDateKey();

  return tasks.reduce(
    (stats, task) => {
      const timing = getTaskTiming(task, todayKey);

      stats.total += 1;

      if (task.status === "Completed") {
        stats.completed += 1;
      }

      if (task.status !== "Completed") {
        stats.open += 1;
      }

      if (task.status === "Pending") {
        stats.pending += 1;
      }

      if (timing === "Due Today") {
        stats.dueToday += 1;
      }

      if (timing === "Upcoming") {
        stats.upcoming += 1;
      }

      if (timing === "Overdue") {
        stats.overdue += 1;
      }

      if (normalizeDateKey(task.due_date) && normalizeDateKey(task.due_date) < todayKey && task.status !== "Completed") {
        stats.activeOverdue += 1;
      }

      return stats;
    },
    {
      total: 0,
      open: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      dueToday: 0,
      upcoming: 0,
      activeOverdue: 0,
    },
  );
}

export function formatDateDisplay(value) {
  const dateKey = normalizeDateKey(value);

  if (!dateKey) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function formatDateInput(value) {
  return normalizeDateKey(value);
}

export function getPriorityTone(priority = "Low") {
  const normalized = String(priority).toLowerCase();

  if (normalized === "high") {
    return "high";
  }

  if (normalized === "medium") {
    return "medium";
  }

  return "low";
}
