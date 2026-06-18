import { supabase } from "./supabase";

export function cleanEmployeePayload(employee) {
  return {
    name: employee.name?.trim() || null,
    email: employee.email?.trim() || null,
    department: employee.department?.trim() || null,
    role: employee.role?.trim() || null,
    joining_date: employee.joining_date || null,
  };
}

export async function createEmployee(employee) {
  const { data, error } = await supabase
    .from("employees")
    .insert(cleanEmployeePayload(employee))
    .select("id,name,email,department,role,joining_date")
    .single();

  if (error) {
    console.error("Supabase createEmployee failed", error);
    return {
      data: null,
      error,
      friendlyMessage: "Your account was created, but we couldn't save the employee details.",
    };
  }

  return { data, error: null, friendlyMessage: "" };
}
