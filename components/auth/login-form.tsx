"use client";

import { useState, useTransition } from "react";

import { Eye, EyeOff, LogIn } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

import { loginAdmin } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();


  async function onSubmit(values: LoginInput) {
    try {
      const result = await loginAdmin(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.replace("/dashboard");
      router.refresh();

    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          startTransition(() => onSubmit(values))
        )}
        className="space-y-6"
      >

        {/* Email */}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>

              <FormLabel
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Barua pepe
              </FormLabel>


              <FormControl>

                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  disabled={isPending}
                  className="
                    h-12
                    rounded-xl

                    border-slate-300
                    bg-white

                    text-slate-900

                    placeholder:text-slate-400

                    transition

                    focus-visible:border-[#006b3c]
                    focus-visible:ring-[#006b3c]/30


                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-white

                    dark:placeholder:text-slate-500

                    dark:focus-visible:border-emerald-500
                    dark:focus-visible:ring-emerald-500/30
                  "
                  {...field}
                />

              </FormControl>


              <FormMessage />

            </FormItem>
          )}
        />



        {/* Password */}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>

              <FormLabel
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Nenosiri
              </FormLabel>


              <FormControl>

                <div className="relative">

                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="
                      h-12
                      rounded-xl
                      pr-12

                      border-slate-300
                      bg-white

                      text-slate-900

                      placeholder:text-slate-400

                      focus-visible:border-[#006b3c]
                      focus-visible:ring-[#006b3c]/30


                      dark:border-slate-700
                      dark:bg-slate-900
                      dark:text-white

                      dark:placeholder:text-slate-500

                      dark:focus-visible:border-emerald-500
                      dark:focus-visible:ring-emerald-500/30
                    "
                    {...field}
                  />


                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    aria-label={
                      showPassword
                        ? "Ficha nenosiri"
                        : "Onyesha nenosiri"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      rounded-lg
                      p-1

                      text-slate-400

                      transition

                      hover:bg-slate-100
                      hover:text-[#006b3c]


                      dark:text-slate-500

                      dark:hover:bg-slate-800
                      dark:hover:text-emerald-400
                    "
                  >

                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                  </button>

                </div>

              </FormControl>


              <FormMessage />

            </FormItem>
          )}
        />



        {/* Submit */}

        <Button
          type="submit"
          disabled={isPending}
          className="
            h-12
            w-full
            rounded-xl

            bg-[#006b3c]

            font-semibold
            text-white

            shadow-lg
            shadow-emerald-900/20

            transition

            hover:bg-[#005631]
            hover:shadow-emerald-900/30


            dark:bg-emerald-600
            dark:hover:bg-emerald-500

            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >

          <LogIn className="mr-2 h-4 w-4" />

          {isPending ? "Inaingia..." : "Ingia"}

        </Button>


      </form>
    </Form>
  );
}