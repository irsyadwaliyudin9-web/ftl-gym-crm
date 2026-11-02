// Supabase Edge Function: member-expiry-reminder
// Runs via pg_cron daily at 08:00 WIB to detect members expiring within 7 days
// and send automated WhatsApp reminders via WA Gateway.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MemberExpiryRecord {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  expiry_date: string;
  package_type: string;
  club_name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const waGatewayKey = Deno.env.get("WA_GATEWAY_API_KEY") ?? "";
    const waGatewayUrl = Deno.env.get("WA_GATEWAY_URL") ?? "https://api.fonnte.com/send";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate dates in Asia/Jakarta (WIB)
    // 7 days window: today to today + 7 days
    const now = new Date();
    const targetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    // Fetch members whose package expires between today and 7 days
    const { data: expiringMembers, error: fetchError } = await supabase
      .from("members")
      .select(`
        id,
        member_code,
        full_name,
        phone,
        expiry_date,
        package_type,
        clubs ( name )
      `)
      .eq("status", "active")
      .gte("expiry_date", todayStr)
      .lte("expiry_date", targetDateStr);

    if (fetchError) {
      throw fetchError;
    }

    const notificationsSent: Array<{ memberId: string; phone: string; status: string }> = [];

    for (const member of expiringMembers || []) {
      const daysLeft = Math.ceil(
        (new Date(member.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const clubName = (member as any).clubs?.name || "FitLead Gym";
      const message = `Halo Kak ${member.full_name}! 💪\n\nKami dari *${clubName}* ingin mengingatkan bahwa paket membership FitLead Anda (${member.member_code}) akan berakhir dalam *${daysLeft} hari* lagi pada tanggal *${member.expiry_date}*.\n\nYuk perpanjang sekarang di Front Desk atau hubungi kami untuk mendapatkan promo spesial perpanjangan & free bonus 1 sesi PT!\n\nTetap semangat latihan! 🔥`;

      let sendStatus = "skipped_no_key";

      if (waGatewayKey && member.phone) {
        try {
          const waRes = await fetch(waGatewayUrl, {
            method: "POST",
            headers: {
              Authorization: waGatewayKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              target: member.phone,
              message: message,
            }),
          });
          sendStatus = waRes.ok ? "sent" : "failed";
        } catch (e) {
          sendStatus = "error";
        }
      }

      notificationsSent.push({
        memberId: member.id,
        phone: member.phone,
        status: sendStatus,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Diproses: ${notificationsSent.length} member akan kadaluarsa dalam 7 hari.`,
        data: notificationsSent,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal Edge Function Error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
