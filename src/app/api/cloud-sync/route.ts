import { NextResponse } from "next/server";
import { supabase, isLiveSupabaseConfigured } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const CLOUD_SYNC_ID = "ff808181a09d98f701a1a4f542572aff";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_SYNC_ID}`;

// In-memory fallback in case of network latency
let memoryMembers: any[] = [];
let memoryTransactions: any[] = [];

// Helper to sanitize member fields for Supabase table schema
function sanitizeMemberForSupabase(m: any) {
  return {
    id: String(m.id),
    tenant_id: m.tenant_id || "tenant-ftl",
    club_id: m.club_id || "club-ftl-01",
    member_code: m.member_code,
    full_name: m.full_name,
    phone: m.phone,
    email: m.email || null,
    photo_url: m.photo_url || null,
    status: m.status || "pending_approval",
    package_type: m.package_type || "1_month",
    package_price: m.package_price || 0,
    start_date: m.start_date || new Date().toISOString().slice(0, 10),
    expiry_date: m.expiry_date || new Date().toISOString().slice(0, 10),
    qr_code_data: m.qr_code_data || "",
    notes: m.notes || null,
    payment_proof_status: m.payment_proof_status || "pending",
    rejection_reason: m.rejection_reason || null,
    selected_coach_id: m.selected_coach_id || null,
    selected_coach_name: m.selected_coach_name || null,
    selected_coach_sessions: m.selected_coach_sessions || 0,
    pt_sessions_remaining: m.pt_sessions_remaining || 0,
    pt_sessions_used: m.pt_sessions_used || 0,
    password: m.password || null,
    created_at: m.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function sanitizeTransactionForSupabase(t: any) {
  return {
    id: String(t.id),
    tenant_id: t.tenant_id || "tenant-ftl",
    club_id: t.club_id || "club-ftl-01",
    member_id: String(t.member_id),
    member_name: t.member_name || "",
    member_phone: t.member_phone || "",
    invoice_code: t.invoice_code || `INV-${Date.now()}`,
    transaction_type: t.transaction_type || "membership",
    title: t.title || "Transaksi Gym",
    description: t.description || "",
    amount: t.amount || 0,
    payment_method: t.payment_method || "tunai",
    payment_channel: t.payment_channel || "tunai_frontdesk",
    status: t.status || "pending",
    created_at: t.created_at || new Date().toISOString(),
    expires_at: t.expires_at || new Date(Date.now() + 3600000).toISOString(),
    paid_at: t.paid_at || null,
    confirmed_by: t.confirmed_by || null,
    details: t.details || {},
    updated_at: new Date().toISOString(),
  };
}

async function fetchFromCloud(): Promise<{ members: any[]; transactions: any[] }> {
  try {
    const res = await fetch(CLOUD_API_URL, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const json = await res.json();
      const members = json.data?.members || [];
      const transactions = json.data?.transactions || [];
      memoryMembers = members;
      memoryTransactions = transactions;
      return { members, transactions };
    }
  } catch (err) {
    console.warn("Failed to fetch from cloud sync:", err);
  }
  return { members: memoryMembers, transactions: memoryTransactions };
}

async function saveToCloud(members: any[], transactions: any[]) {
  memoryMembers = members;
  memoryTransactions = transactions;
  try {
    await fetch(CLOUD_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "OneOOneGym_Production_Data_v1",
        data: {
          members,
          transactions,
          updated_at: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    console.warn("Failed to save to cloud sync:", err);
  }
}

export async function GET() {
  const data = await fetchFromCloud();
  let mergedMembers = [...data.members];
  let mergedTransactions = [...data.transactions];

  // If Supabase live is configured, merge directly
  if (isLiveSupabaseConfigured()) {
    try {
      const [{ data: sbMembers, error: mErr }, { data: sbTx, error: txErr }] = await Promise.all([
        supabase.from("members").select("*").order("created_at", { ascending: false }),
        supabase.from("gym_transactions").select("*").order("created_at", { ascending: false }),
      ]);

      if (!mErr && Array.isArray(sbMembers) && sbMembers.length > 0) {
        const memberMap = new Map<string, any>();
        // First cloud members
        mergedMembers.forEach((m) => {
          memberMap.set(m.id, m);
          const p = (m.phone || "").replace(/[^0-9]/g, "");
          if (p) memberMap.set(p, m);
        });
        // Then Supabase members
        sbMembers.forEach((sm: any) => {
          memberMap.set(sm.id, sm);
          const p = (sm.phone || "").replace(/[^0-9]/g, "");
          if (p) memberMap.set(p, sm);
        });
        mergedMembers = Array.from(new Set(memberMap.values()));
      }

      if (!txErr && Array.isArray(sbTx) && sbTx.length > 0) {
        const txMap = new Map<string, any>();
        mergedTransactions.forEach((t) => txMap.set(t.id, t));
        sbTx.forEach((st: any) => txMap.set(st.id, st));
        mergedTransactions = Array.from(txMap.values());
      }
    } catch (err) {
      console.warn("Supabase fetch/merge warning:", err);
    }
  }

  // Sort so pending members are always at the top!
  mergedMembers.sort((a, b) => {
    const aPending = a.status === "pending_approval" || a.payment_proof_status === "pending" ? 1 : 0;
    const bPending = b.status === "pending_approval" || b.payment_proof_status === "pending" ? 1 : 0;
    if (aPending !== bPending) return bPending - aPending;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return NextResponse.json({
    success: true,
    source: isLiveSupabaseConfigured() ? "supabase-merged" : "cloud-cache",
    members: mergedMembers,
    transactions: mergedTransactions,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, member, transaction, memberId } = body;
    const { members, transactions } = await fetchFromCloud();

    let updatedMembers = [...members];
    let updatedTransactions = [...transactions];

    if (action === "register" && member) {
      // Ensure member is in pending_approval status
      const newMember = {
        ...member,
        status: "pending_approval",
        payment_proof_status: "pending",
        created_at: member.created_at || new Date().toISOString(),
      };
      const cleanPhone = (newMember.phone || "").replace(/[^0-9]/g, "");
      // Upsert: replace if existing phone or id
      updatedMembers = [
        newMember,
        ...updatedMembers.filter(
          (m) => m.id !== newMember.id && (m.phone || "").replace(/[^0-9]/g, "") !== cleanPhone
        ),
      ];

      if (transaction) {
        updatedTransactions = [
          transaction,
          ...updatedTransactions.filter((t) => t.id !== transaction.id),
        ];
      }

      // Sync to live Supabase backend
      if (isLiveSupabaseConfigured()) {
        try {
          await supabase.from("members").upsert(sanitizeMemberForSupabase(newMember));
          if (transaction) {
            await supabase.from("gym_transactions").upsert(sanitizeTransactionForSupabase(transaction));
          }
        } catch (sbErr) {
          console.warn("Supabase registration sync warning:", sbErr);
        }
      }
    } else if (action === "approve" && memberId) {
      updatedMembers = updatedMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: "active",
              payment_proof_status: "approved",
              approved_at: new Date().toISOString(),
            }
          : m
      );

      // Also update any pending transactions for this member to paid
      updatedTransactions = updatedTransactions.map((t) =>
        t.member_id === memberId && t.status === "pending"
          ? {
              ...t,
              status: "paid",
              paid_at: new Date().toISOString(),
              confirmed_by: "Staf Admin One O One Gym",
            }
          : t
      );

      // Sync approval to live Supabase backend
      if (isLiveSupabaseConfigured()) {
        try {
          await supabase.from("members").update({
            status: "active",
            payment_proof_status: "approved",
            updated_at: new Date().toISOString(),
          }).eq("id", memberId);

          await supabase.from("gym_transactions").update({
            status: "paid",
            paid_at: new Date().toISOString(),
            confirmed_by: "Staf Admin One O One Gym",
            updated_at: new Date().toISOString(),
          }).eq("member_id", memberId).eq("status", "pending");
        } catch (sbErr) {
          console.warn("Supabase approval sync warning:", sbErr);
        }
      }
    } else if (action === "reject" && memberId) {
      updatedMembers = updatedMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: "rejected",
              payment_proof_status: "rejected",
              rejected_at: new Date().toISOString(),
            }
          : m
      );

      // Sync rejection to live Supabase backend
      if (isLiveSupabaseConfigured()) {
        try {
          await supabase.from("members").update({
            status: "rejected",
            payment_proof_status: "rejected",
            updated_at: new Date().toISOString(),
          }).eq("id", memberId);
        } catch (sbErr) {
          console.warn("Supabase rejection sync warning:", sbErr);
        }
      }
    }

    await saveToCloud(updatedMembers, updatedTransactions);

    return NextResponse.json({
      success: true,
      members: updatedMembers,
      transactions: updatedTransactions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
