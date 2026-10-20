import { Router, type IRouter, type Request, type Response } from "express";
import {
  BookStationBody,
  BookStationParams,
  BookStationResponse,
  FinishChargingSessionBody,
  FinishChargingSessionParams,
  FinishChargingSessionResponse,
  GetDeviceStationStateParams,
  GetDeviceStationStateResponse,
  GetRelayStatusQueryParams,
  GetRiderPenaltyParams,
  GetRiderPenaltyResponse,
  GetStationParams,
  GetStationResponse,
  GetStationsResponse,
  StartReservedChargeBody,
  StartReservedChargeParams,
  StartReservedChargeResponse,
} from "@workspace/api-zod";
import { getSupabaseServiceClient } from "../lib/supabase";

type UnknownRecord = Record<string, unknown>;

const router: IRouter = Router();
const SETUP_MESSAGE =
  "The CLICK Supabase schema is not installed. Run artifacts/click-ev-booking/supabase/schema.sql in the project's Supabase SQL Editor.";

function asRecord(value: unknown): UnknownRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return {};
}

function serializeStation(value: unknown): UnknownRecord {
  const row = asRecord(value);
  const bufferEnd =
    typeof row.buffer_end_time === "string" ? row.buffer_end_time : null;
  const bufferRemaining = bufferEnd
    ? Math.max(0, Math.ceil((Date.parse(bufferEnd) - Date.now()) / 1000))
    : 0;

  return {
    id: Number(row.id),
    station_name: row.station_name,
    location: row.location,
    relay_status: row.relay_status,
    slot_status: row.slot_status,
    current_rider: typeof row.current_rider === "string" ? row.current_rider : null,
    next_rider: typeof row.next_rider === "string" ? row.next_rider : null,
    buffer_end_time: bufferEnd,
    slot_start_time:
      typeof row.slot_start_time === "string" ? row.slot_start_time : null,
    slot_end_time:
      typeof row.slot_end_time === "string" ? row.slot_end_time : null,
    penalty_status: row.penalty_status,
    charge_started_at:
      typeof row.charge_started_at === "string" ? row.charge_started_at : null,
    updated_at: row.updated_at,
    buffer_remaining_seconds: bufferRemaining,
  };
}

function serializeAction(value: unknown): unknown {
  const action = asRecord(value);
  return {
    station: serializeStation(action.station),
    action: action.action,
    message: action.message,
  };
}

function respondWithSupabaseError(
  req: Request,
  res: Response,
  error: unknown,
): void {
  const details = asRecord(error);
  const cause = asRecord(details.cause);
  const code = typeof details.code === "string" ? details.code : "";
  const message = typeof details.message === "string" ? details.message : "";
  const errorName = typeof details.name === "string" ? details.name : "UnknownError";
  const causeCode = typeof cause.code === "string" ? cause.code : undefined;

  if (message === "Supabase server credentials are not configured.") {
    res.status(503).json({
      error: "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Replit Secrets, then restart the API Server.",
    });
    return;
  }

  if (
    code === "PGRST205" ||
    code === "PGRST204" ||
    code === "PGRST202" ||
    code === "42P01" ||
    code === "42703" ||
    message.includes("Could not find the table") ||
    message.includes("function public.click_")
  ) {
    res.status(503).json({ error: SETUP_MESSAGE });
    return;
  }

  if (code === "42501") {
    req.log.warn({ code, errorName, category: "supabase_station_access_denied" }, "CLICK station access was denied");
    res.status(503).json({
      error:
        "CLICK could not access its station-state function. Run the full schema.sql and confirm the Supabase URL and service-role key belong to the same project.",
    });
    return;
  }

  if (code === "P0002") {
    res.status(404).json({ error: "Charging station not found." });
    return;
  }

  if (code === "P0001") {
    res.status(409).json({ error: message || "This charging action is not available." });
    return;
  }

  if (message.toLowerCase().includes("fetch failed")) {
    req.log.error({ code, errorName, causeCode, category: "network_fetch_failed" }, "Supabase request failed");
    res.status(503).json({
      error: "CLICK could not reach Supabase. Check the project URL and confirm the Supabase project is available.",
    });
    return;
  }

  req.log.error({ code, errorName, causeCode, category: "supabase_request_failed" }, "Supabase request failed");
  res.status(503).json({
    error: "The charging station service is temporarily unavailable. Please retry.",
  });
}

function getStationId(
  req: Request,
  res: Response,
  schema: typeof GetStationParams,
): number | null {
  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Station ID must be a valid integer." });
    return null;
  }
  return parsed.data.id;
}

async function reconcileStation(id: number): Promise<unknown> {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("click_reconcile_station", {
    p_station_id: id,
  });
  if (error) throw error;
  return data;
}

async function respondWithDeviceState(
  req: Request,
  res: Response,
  id: number,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const station = asRecord(await reconcileStation(id));
    res.json(
      GetDeviceStationStateResponse.parse({
        id: Number(station.id),
        relay_status: station.relay_status,
        slot_status: station.slot_status,
        buffer_end_time: station.buffer_end_time ?? null,
        updated_at: station.updated_at,
      }),
    );
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
}

router.get("/stations", async (req, res): Promise<void> => {
  try {
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("charging_stations")
      .select("id")
      .order("id", { ascending: true });
    if (error) {
      respondWithSupabaseError(req, res, error);
      return;
    }

    const rows = await Promise.all(
      (data ?? []).map((station) => reconcileStation(Number(station.id))),
    );
    res.json(GetStationsResponse.parse(rows.map(serializeStation)));
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

router.get("/stations/:id", async (req, res): Promise<void> => {
  const id = getStationId(req, res, GetStationParams);
  if (id === null) return;

  try {
    const station = await reconcileStation(id);
    res.json(GetStationResponse.parse(serializeStation(station)));
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

router.post("/stations/:id/book", async (req, res): Promise<void> => {
  const id = getStationId(req, res, BookStationParams);
  if (id === null) return;
  const body = BookStationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Enter a rider name between 1 and 60 characters." });
    return;
  }

  try {
    const { data, error } = await getSupabaseServiceClient().rpc(
      "click_book_station",
      {
        p_station_id: id,
        p_rider_name: body.data.rider_name.trim(),
      },
    );
    if (error) {
      respondWithSupabaseError(req, res, error);
      return;
    }
    res.json(BookStationResponse.parse(serializeAction(data)));
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

router.post("/stations/:id/start", async (req, res): Promise<void> => {
  const id = getStationId(req, res, StartReservedChargeParams);
  if (id === null) return;
  const body = StartReservedChargeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Enter a rider name between 1 and 60 characters." });
    return;
  }

  try {
    const { data, error } = await getSupabaseServiceClient().rpc(
      "click_start_reserved_charge",
      {
        p_station_id: id,
        p_rider_name: body.data.rider_name.trim(),
      },
    );
    if (error) {
      respondWithSupabaseError(req, res, error);
      return;
    }
    res.json(StartReservedChargeResponse.parse(serializeAction(data)));
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

router.post("/stations/:id/finish", async (req, res): Promise<void> => {
  const id = getStationId(req, res, FinishChargingSessionParams);
  if (id === null) return;
  const body = FinishChargingSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Enter a rider name between 1 and 60 characters." });
    return;
  }

  try {
    const { data, error } = await getSupabaseServiceClient().rpc(
      "click_finish_charging_session",
      {
        p_station_id: id,
        p_rider_name: body.data.rider_name.trim(),
      },
    );
    if (error) {
      respondWithSupabaseError(req, res, error);
      return;
    }
    res.json(FinishChargingSessionResponse.parse(serializeAction(data)));
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

router.get("/device/stations/:id/state", async (req, res): Promise<void> => {
  const id = getStationId(req, res, GetDeviceStationStateParams);
  if (id === null) return;

  await respondWithDeviceState(req, res, id);
});

router.get("/relay-status", async (req, res): Promise<void> => {
  const rawStationId = req.query.station_id;
  const parsed = GetRelayStatusQueryParams.safeParse({ station_id: rawStationId });
  if (!parsed.success) {
    res.status(400).json({ error: "station_id must be a positive integer." });
    return;
  }

  await respondWithDeviceState(req, res, parsed.data.station_id);
});

router.get("/riders/:riderName/penalty", async (req, res): Promise<void> => {
  const parsed = GetRiderPenaltyParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid rider name." });
    return;
  }

  const riderName = parsed.data.riderName.trim();
  const riderNameKey = riderName.toLowerCase();
  try {
    const client = getSupabaseServiceClient();
    const [activeResult, countResult] = await Promise.all([
      client
        .from("rider_penalties")
        .select("penalty_until")
        .eq("rider_name_key", riderNameKey)
        .gt("penalty_until", new Date().toISOString())
        .order("penalty_until", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("rider_penalties")
        .select("id", { count: "exact", head: true })
        .eq("rider_name_key", riderNameKey),
    ]);

    if (activeResult.error) {
      respondWithSupabaseError(req, res, activeResult.error);
      return;
    }
    if (countResult.error) {
      respondWithSupabaseError(req, res, countResult.error);
      return;
    }

    const penaltyUntil =
      typeof activeResult.data?.penalty_until === "string"
        ? activeResult.data.penalty_until
        : null;
    res.json(
      GetRiderPenaltyResponse.parse({
        rider_name: riderName,
        active: penaltyUntil !== null,
        penalty_until: penaltyUntil,
        total_no_shows: countResult.count ?? 0,
      }),
    );
  } catch (error) {
    respondWithSupabaseError(req, res, error as { code?: string; message?: string });
  }
});

export default router;
