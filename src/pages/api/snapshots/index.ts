import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

export const prerender = false;

const snapshotSchema = z.object({
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

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // Get snapshots with their entries

  const { data, error } = await supabase
    .from("snapshots")
    .select(
      `
      *,
      entries:snapshot_entries(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Snapshots GET Error]", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createClient(request.headers, cookies);
  if (!supabase) return new Response("Server Error", { status: 500 });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const parsed = snapshotSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { entries: requestedEntries, date } = parsed.data;

    if (date && new Date(date) > new Date()) {
      return new Response(JSON.stringify({ error: "Cannot create snapshots for future dates" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch active accounts for the user to validate all are present

    const { data: accounts, error: accountsError } = await supabase.from("accounts").select("id").eq("is_active", true);

    if (accountsError) {
      return new Response(JSON.stringify({ error: "Failed to fetch accounts for validation" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const activeAccountIds = (accounts as any[]).map((a) => String(a.id));
    const providedAccountIds = requestedEntries.map((e) => e.account_id);

    const activeSet = new Set(activeAccountIds);
    const providedSet = new Set(providedAccountIds);
    if (
      providedAccountIds.length !== activeAccountIds.length ||
      providedSet.size !== activeAccountIds.length ||
      !providedAccountIds.every((id) => activeSet.has(id))
    ) {
      return new Response(
        JSON.stringify({ error: "Snapshot must contain exactly one balance for each active account" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Insert Snapshot and Entries atomically via RPC
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: snapshotId, error: rpcError } = await supabase.rpc("create_snapshot_with_entries", {
      p_entries: requestedEntries,
      ...(date ? { p_date: date } : {}),
    });

    if (rpcError || !snapshotId) {
      console.error("[Snapshots POST Error]", rpcError);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the complete snapshot to return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: completeSnapshot, error: fetchError } = await supabase
      .from("snapshots")
      .select(
        `
        *,
        entries:snapshot_entries(*)
      `,
      )
      .eq("id", snapshotId)
      .single();

    if (fetchError) {
      // It was created, but we couldn't fetch it back.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return new Response(JSON.stringify({ id: snapshotId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(completeSnapshot), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Invalid Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
