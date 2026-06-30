import { NextResponse } from "next/server";
import { fitbitFetch, getTokens } from "@/lib/fitbit";

export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await getTokens();
  if (!tokens) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const [activity, sleep, heart, profile] = await Promise.allSettled([
      fitbitFetch(`/1/user/-/activities/date/${today}.json`),
      fitbitFetch(`/1/user/-/sleep/date/${today}.json`),
      fitbitFetch(`/1/user/-/activities/heart/date/${today}/1d.json`),
      fitbitFetch(`/1/user/-/profile.json`),
    ]);

    const act = activity.status === "fulfilled" ? activity.value : null;
    const slp = sleep.status === "fulfilled" ? sleep.value : null;
    const hr = heart.status === "fulfilled" ? heart.value : null;
    const prof = profile.status === "fulfilled" ? profile.value : null;

    const summary = act?.summary ?? {};
    const sleepSummary = slp?.summary ?? {};
    const heartData = hr?.["activities-heart"]?.[0]?.value ?? {};
    const hrZones = heartData?.heartRateZones ?? [];
    const restingHR = heartData?.restingHeartRate ?? null;

    const totalSleepMinutes = sleepSummary?.totalMinutesAsleep ?? 0;
    const sleepHours = Math.floor(totalSleepMinutes / 60);
    const sleepMins = totalSleepMinutes % 60;

    return NextResponse.json({
      date: today,
      profile: {
        name: prof?.user?.displayName ?? "Gebruiker",
        avatar: prof?.user?.avatar150 ?? null,
      },
      steps: summary.steps ?? 0,
      stepsGoal: act?.goals?.steps ?? 10000,
      calories: summary.caloriesOut ?? 0,
      caloriesGoal: act?.goals?.caloriesOut ?? 2000,
      distance: +(summary.distances?.find((d: any) => d.activity === "total")?.distance ?? 0).toFixed(2),
      activeMinutes: (summary.fairlyActiveMinutes ?? 0) + (summary.veryActiveMinutes ?? 0),
      activeMinutesGoal: act?.goals?.activeMinutes ?? 30,
      floors: summary.floors ?? 0,
      restingHR,
      hrZones: hrZones.map((z: any) => ({
        name: z.name,
        minutes: z.minutes ?? 0,
        caloriesOut: +(z.caloriesOut ?? 0).toFixed(0),
        min: z.min,
        max: z.max,
      })),
      sleep: {
        totalMinutes: totalSleepMinutes,
        hours: sleepHours,
        mins: sleepMins,
        efficiency: slp?.sleep?.[0]?.efficiency ?? null,
        deep: sleepSummary?.stages?.deep ?? null,
        light: sleepSummary?.stages?.light ?? null,
        rem: sleepSummary?.stages?.rem ?? null,
        wake: sleepSummary?.stages?.wake ?? null,
      },
    });
  } catch (err: any) {
    if (err.message === "not_authenticated") {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    console.error("Fitbit data fetch error:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
