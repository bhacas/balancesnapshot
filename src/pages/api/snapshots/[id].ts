import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

export const prerender = false;

const updateSnapshotSchema = z.object({
  date: z.string().optional(),
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
    return new Response(JSON.stringify({ error: error.message }), {
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

    if (date) {
        const { error: updateError } = await supabase.from("snapshots").update({ created_at: date }).eq("id", id);
        if (updateError) throw new Error(updateError.message);
    }

    const { error: deleteError } = await supabase.from("snapshot_entries").delete().eq("snapshot_id", id);
    if (deleteError) throw new Error(deleteError.message);

    const newEntries = entries.map(e => ({
        snapshot_id: id,
        account_id: e.account_id,
        balance: e.balance
    }));

    const { error: insertError } = await supabase.from("snapshot_entries").insert(newEntries);
    if (insertError) throw new Error(insertError.message);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Invalid Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
