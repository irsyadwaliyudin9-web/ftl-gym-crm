import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CLOUD_SYNC_ID = "ff808181a09d98f701a1a4f542572aff";
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_SYNC_ID}`;

// In-memory fallback in case of network latency
let memoryMembers: any[] = [];
let memoryTransactions: any[] = [];

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
  return NextResponse.json({
    success: true,
    members: data.members,
    transactions: data.transactions,
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
      // Upsert: replace if existing phone or id
      updatedMembers = [
        newMember,
        ...updatedMembers.filter((m) => m.id !== newMember.id && m.phone !== newMember.phone),
      ];

      if (transaction) {
        updatedTransactions = [
          transaction,
          ...updatedTransactions.filter((t) => t.id !== transaction.id),
        ];
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
