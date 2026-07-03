"use server";

import { createSupabaseServerClient } from "@/lib/auth/server";

import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export async function loginAdmin(input: LoginInput) {
  // 1. Validate input
  const validated = loginSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Invalid login data.",
    };
  }

  const { email, password } = validated.data;

  // 2. Create Supabase SSR client
  const supabase = await createSupabaseServerClient();

  // 3. Attempt login
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  // 4. Handle error
  if (error || !data.session) {
    console.error("[loginAdmin]", error);

    return {
      success: false,
      message:
        "Invalid email or password. Please try again.",
    };
  }

  // 5. Success
  return {
    success: true,
    message: "Login successful.",
    data: {
      user: data.user,
      session: data.session,
    },
  };
}