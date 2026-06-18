import { supabase } from "./supabase";

export async function getCurrentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    console.log("User ID:", user.id);
console.log("Profile Data:", data);
console.log("Profile Error:", error);
  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
export async function fetchProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("full_name");

  return { data, error };
}