import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

export const prerender = false;

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["asset", "liability"]),
});

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const id = params.id;
  if (!id) return new Response("Missing ID", { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const parsed = accountSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await supabase
      .from("accounts")
      .update({
        name: parsed.data.name,
        type: parsed.data.type,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Invalid Request" }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const id = params.id;
  if (!id) return new Response("Missing ID", { status: 400 });

  const { error } = await supabase.from("accounts").update({ is_active: false }).eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
