# Supabase setup for CLICK

1. In the active Supabase project whose URL is saved in Replit Secrets, open **SQL Editor**.
2. Run the full contents of `schema.sql`. It creates or upgrades `public.charging_stations`, creates the no-show penalty table and state-transition functions, enables row-level security, and seeds station ID `1`.
3. Confirm station `1` is **Madhapur Hub - Socket 1** at **Madhapur, Hyderabad**.
4. Verify the API can read the station and exercise booking, buffer, reservation, charge-start, finish, and no-show transitions before connecting live hardware.
5. Restart the API Server workflow if it was already running before the Supabase secrets were added.

The station row includes `location`, `relay_status`, `slot_status`, `current_rider`, `next_rider`, `slot_start_time`, `slot_end_time`, `buffer_end_time`, and `penalty_status`, plus operational timestamps and no-show counts.

The service-role key is used only by the API server. Never copy it into browser code, firmware, or an ESP32. The preferred read-only ESP32 endpoint is:

```text
GET /api/relay-status?station_id=1
```

The existing path endpoint remains available:

```text
GET /api/device/stations/1/state
```

Both responses include `id`, `relay_status`, `slot_status`, `buffer_end_time`, and `updated_at`, with `Cache-Control: no-store`. Poll every 3–5 seconds. Keep the physical relay OFF for `Buffer` and `Reserved`; only energize it when a valid start is accepted and `relay_status` is `true`. On a stale response, network/API failure, reset, or invalid response, fail OFF.

The relay-status endpoint is read-only but does not yet authenticate individual devices. Before exposing a real station to public networks, add device-level authentication and commission it with a qualified electrician. Never treat application state as a substitute for certified electrical protection.
