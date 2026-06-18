import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../services/taskService";
import { getPriorityTone, getTaskTiming, normalizeDateKey } from "../utils/taskUtils";

function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCalendar() {
      const { data, error: taskError } = await fetchTasks();

      if (!active) {
        return;
      }

      if (taskError) {
        setError(taskError.friendlyMessage || "We couldn't load the calendar right now.");
        setLoading(false);
        return;
      }

      setTasks(data ?? []);
      setLoading(false);
    }

    loadCalendar();

    return () => {
      active = false;
    };
  }, []);

  const calendarEvents = useMemo(
    () =>
      tasks
        .filter((task) => task.due_date)
        .map((task) => ({
          id: String(task.id),
          title: task.task_name,
          start: normalizeDateKey(task.due_date),
          allDay: true,
          backgroundColor:
            task.status === "Completed"
              ? "#2d6a4f"
              : getPriorityTone(task.priority) === "high"
                ? "#c0392b"
                : getPriorityTone(task.priority) === "medium"
                  ? "#d97706"
                  : "#1d4ed8",
          borderColor:
            task.status === "Completed"
              ? "#2d6a4f"
              : getPriorityTone(task.priority) === "high"
                ? "#c0392b"
                : getPriorityTone(task.priority) === "medium"
                  ? "#d97706"
                  : "#1d4ed8",
          extendedProps: {
            task,
            timing: getTaskTiming(task),
          },
        })),
    [tasks],
  );

  if (loading) {
    return <div className="loading-card">Loading calendar...</div>;
  }

  if (error) {
    return <div className="status-card error-card">{error}</div>;
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Calendar View</p>
          <h1>Task Calendar</h1>
        </div>
        <p className="page-note">Tasks are plotted by due date so follow-ups stay visible across the month.</p>
      </div>

      <div className="calendar-shell">
        <div className="calendar-legend">
          <span><i className="legend-dot high" /> High priority</span>
          <span><i className="legend-dot medium" /> Medium priority</span>
          <span><i className="legend-dot low" /> Low priority</span>
          <span><i className="legend-dot completed" /> Completed</span>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={calendarEvents}
          height="auto"
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            navigate(`/tasks/${info.event.id}`);
          }}
          eventContent={(arg) => (
            <div className="calendar-event">
              <strong>{arg.event.title}</strong>
              <span>{arg.event.extendedProps.timing}</span>
            </div>
          )}
        />
      </div>
    </section>
  );
}

export default Calendar;
