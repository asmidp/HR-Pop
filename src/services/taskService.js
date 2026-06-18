import { supabase } from "./supabase";

export const TASK_COLUMNS = [
  "id",
  "task_name",
  "description",
  "assigned_to",
  "start_date",
  "due_date",
  "priority",
  "status",
  "created_by",
  "created_at",
  "updated_at",
].join(",");

export const EMPTY_TASK_FORM = {
  task_name: "",
  description: "",
  assigned_to: "",
  start_date: "",
  due_date: "",
  priority: "Medium",
  status: "Pending",
};

const FRIENDLY_TASK_ERROR =
  "We couldn't load task data right now. Please refresh and try again.";
const FRIENDLY_SAVE_ERROR =
  "We couldn't save the task. Please check the fields and try again.";
const FRIENDLY_DELETE_ERROR =
  "We couldn't delete the task. Please try again.";

function resultWithFriendlyError(error, friendlyMessage, context) {
  if (error) {
    console.error(context, error);
    return {
      data: null,
      error,
      friendlyMessage,
    };
  }

  return null;
}

function sortTasks(tasks = []) {
  return [...tasks].sort((first, second) => {
    const firstDueDate = first.due_date || "9999-12-31";
    const secondDueDate = second.due_date || "9999-12-31";

    if (firstDueDate !== secondDueDate) {
      return firstDueDate.localeCompare(secondDueDate);
    }

    const firstCreatedAt = first.created_at || "";
    const secondCreatedAt = second.created_at || "";
    return secondCreatedAt.localeCompare(firstCreatedAt);
  });
}

export function cleanTaskPayload(task) {
  return {
    task_name: task.task_name?.trim() || "Untitled task",
    description: task.description?.trim() || null,
    assigned_to: task.assigned_to?.trim() || null,
    start_date: task.start_date || null,
    due_date: task.due_date || null,
    priority: task.priority || "Medium",
    status: task.status || "Pending",
  };
}

export async function fetchTasks() {
  const { data: { user },} = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const failed = resultWithFriendlyError(error, FRIENDLY_TASK_ERROR, "Supabase fetchTasks failed");
  return failed ?? { data: sortTasks(data ?? []), error: null, friendlyMessage: "" };
}
export async function fetchAllTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const failed = resultWithFriendlyError(
    error,
    FRIENDLY_TASK_ERROR,
    "Supabase fetchAllTasks failed"
  );

  return failed ?? {
    data: sortTasks(data ?? []),
    error: null,
    friendlyMessage: "",
  };
}

export async function fetchTaskById(taskId) {
  const { data, error } = await supabase.from("tasks").select(TASK_COLUMNS).eq("id", taskId).single();

  const failed = resultWithFriendlyError(error, "We couldn't find that task.", "Supabase fetchTaskById failed");
  return failed ?? { data, error: null, friendlyMessage: "" };
}

export async function createTask(task) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let assignedUserId = user.id;

const { data: profile } = await supabase
  .from("profiles")
  .select("id, full_name")
  .eq("email", task.assigned_to)
  .single();

  console.log("Assigned email:", task.assigned_to);
  console.log("Found profile:", profile);

  if (profile) {
  assignedUserId = profile.id;
  task.assigned_to = profile.full_name;
}


console.log("Final assignedUserId:", assignedUserId);

const payload = {
  ...cleanTaskPayload(task),
  assigned_to: task.assigned_to || user.user_metadata?.name,
  user_id: assignedUserId,
  created_by: user.id,
};

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select(TASK_COLUMNS)
    .single();

  const failed = resultWithFriendlyError(
    error,
    FRIENDLY_SAVE_ERROR,
    "Supabase createTask failed"
  );

  return failed ?? {
    data,
    error: null,
    friendlyMessage: "",
  };
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(cleanTaskPayload(updates))
    .eq("id", taskId)
    .select(TASK_COLUMNS)
    .single();

  const failed = resultWithFriendlyError(error, FRIENDLY_SAVE_ERROR, "Supabase updateTask failed");
  return failed ?? { data, error: null, friendlyMessage: "" };
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  const failed = resultWithFriendlyError(error, FRIENDLY_DELETE_ERROR, "Supabase deleteTask failed");
  return failed ?? { data: true, error: null, friendlyMessage: "" };
}
