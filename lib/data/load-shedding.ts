'use server';

import type { LoadSheddingStage } from '../domain/types';
import { createPublicServerClient } from '../supabase/serverClient';

/**
 * Fetch current load shedding stage for a given area.
 * Uses the EskomSePush API (free tier) or falls back to stored schedule.
 */
export async function getLoadSheddingStatus(areaCode?: string): Promise<LoadSheddingStage | null> {
  // Try the EskomSePush API first
  if (areaCode) {
    try {
      const apiKey = process.env.ESKOM_SE_PUSH_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://developer.sepush.co.za/business/2.0/area?id=${areaCode}`,
          {
            headers: { 'Token': apiKey },
            next: { revalidate: 300 }, // Cache for 5 minutes
          }
        );

        if (response.ok) {
          const data = await response.json();
          const area = data.area as Record<string, unknown>;
          const schedule = data as Record<string, unknown>;

          return {
            areaCode: areaCode,
            areaName: (area?.name as string) ?? areaCode,
            stage: parseStage(schedule?.info as Record<string, unknown> | undefined),
            currentlyInLoadShedding: isCurrentlyShedding(area?.schedule as Record<string, unknown> | undefined),
            nextStageChange: (schedule?.info as Record<string, unknown>)?.next_change as string ?? null,
            scheduleData: area?.schedule as Record<string, unknown> ?? {},
          };
        }
      }
    } catch {
      // Fall through to database
    }
  }

  // Fallback: check database
  try {
    const supabase = createPublicServerClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from('load_shedding_schedule')
      .select('*')
      .eq('area_code', areaCode ?? 'default')
      .single();

    if (data) {
      return {
        areaCode: String(data.area_code),
        areaName: String(data.area_name),
        stage: Number(data.stage),
        currentlyInLoadShedding: false, // Would need schedule parsing
        scheduleData: data.schedule_data as Record<string, unknown>,
      };
    }
  } catch {
    // No database available
  }

  return null;
}

/**
 * Get estimated delivery delay due to load shedding.
 */
export async function getDeliveryDelayEstimate(areaCode?: string): Promise<{
  delayMinutes: number;
  stage: number;
  message: string;
}> {
  const status = await getLoadSheddingStatus(areaCode);

  if (!status) {
    return { delayMinutes: 0, stage: 0, message: '' };
  }

  // Rough estimate: each stage adds ~15-30 min delay
  const delayMinutes = status.stage * 20;
  let message = '';

  if (status.stage === 0) {
    message = 'No load shedding — normal delivery times';
  } else if (status.stage <= 2) {
    message = `Stage ${status.stage} load shedding — deliveries may be delayed by ~${delayMinutes} min`;
  } else if (status.stage <= 4) {
    message = `Stage ${status.stage} load shedding — expect delays of ~${delayMinutes} min`;
  } else {
    message = `Stage ${status.stage} load shedding — significant delays expected (~${delayMinutes} min)`;
  }

  return { delayMinutes, stage: status.stage, message };
}

function parseStage(info: Record<string, unknown> | undefined): number {
  if (!info) return 0;
  const stageStr = String(info.current_stage ?? '');
  const match = stageStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function isCurrentlyShedding(schedule: Record<string, unknown> | undefined): boolean {
  if (!schedule) return false;
  // Simplified check — in production would parse the full schedule
  const now = new Date();
  const hour = now.getHours();
  // Load shedding typically happens in 2-hour blocks
  return schedule[String(hour)] !== undefined;
}
