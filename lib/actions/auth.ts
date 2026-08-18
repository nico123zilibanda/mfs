"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/auth/server";
import { loginSchema, LoginInput } from "@/lib/schemas/auth";

export async function loginAdmin(input: LoginInput) {
  const validated = loginSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Invalid login data.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    console.error(error);

    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  return {
    success: true,
    message: "Login successful.",
  };
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}