import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

export const prerender = false;

const updateSnapshotSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .optional(),
  entries: z.array(
    z.object({
      account_id: z.string(),
      balance: z.number(),
    }),
  ),
});

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  if (!id) return new Response("Missing snapshot ID", { status: 400 });

  const { error } = await supabase.from("snapshots").delete().eq("id", id);

  if (error) {
    console.error("[Snapshots DELETE Error]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 204 });
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  if (!id) return new Response("Missing snapshot ID", { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const parsed = updateSnapshotSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { entries, date } = parsed.data;

    // Use atomic RPC for update
    const { error: rpcError } = await supabase.rpc("update_snapshot_with_entries", {
      p_snapshot_id: id,
      p_entries: entries,
      p_date: date || null,
    });

    if (rpcError) {
      console.error("[Snapshots PUT Error]", rpcError);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = "Invalid Request";
    console.error("[Snapshots PUT Parse/Unknown Error]", err);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
