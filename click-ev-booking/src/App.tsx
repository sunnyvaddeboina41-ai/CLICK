import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowDownToLine, BatteryCharging, Check, Clock3, PlugZap, RefreshCw, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  getGetRelayStatusQueryKey,
  getGetRiderPenaltyQueryKey,
  getGetStationQueryKey,
  getGetStationsQueryKey,
  useBookStation,
  useFinishChargingSession,
  useGetRelayStatus,
  useGetRiderPenalty,
  useGetStation,
  useGetStations,
  useStartReservedCharge,
  type BookStationMutationVariables,
  type FinishChargingSessionMutationVariables,
  type Station,
  type StartReservedChargeMutationVariables,
} from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import RoadmapPage from '@/pages/roadmap';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 4_000, refetchOnWindowFocus: true } },
});

const FALLBACK_STATION: Station = {
  id: 1,
  station_name: 'Madhapur Hub - Socket 1',
  location: 'Madhapur, Hyderabad',
  relay_status: false,
  slot_status: 'Available',
  current_rider: null,
  next_rider: null,
  buffer_end_time: null,
  slot_start_time: null,
  slot_end_time: null,
  penalty_status: false,
  charge_started_at: null,
  updated_at: '',
  buffer_remaining_seconds: 0,
};

function isMadhapurStation(station: Station) {
  return /madhapur/i.test(station.station_name) || /madhapur/i.test(station.location);
}

function AppHeader() {
  const [location] = useLocation();
  const [online, setOnline] = useState(navigator.onLine);
  const [deferredInstall, setDeferredInstall] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setDeferredInstall(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onInstall);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onInstall);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredInstall) return;
    await deferredInstall.prompt();
    setDeferredInstall(null);
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand" data-testid="link-click-home" aria-label="CLICK home">
        <span className="brand-mark">C</span>CLICK
      </Link>
      <nav className="app-nav" aria-label="Main navigation">
        <Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`} aria-current={location === '/' ? 'page' : undefined} data-testid="link-rider-dashboard">
          Dashboard
        </Link>
        <Link href="/roadmap" className={`nav-link ${location === '/roadmap' ? 'active' : ''}`} aria-current={location === '/roadmap' ? 'page' : undefined} data-testid="link-launch-roadmap">
          Launch roadmap
        </Link>
      </nav>
      <div className="topbar-right">
        {deferredInstall && <button className="install-btn" type="button" onClick={() => void triggerInstall()} data-testid="button-install"><ArrowDownToLine size={14} /> Install app</button>}
        <span className="connection-label">Madhapur, Hyderabad</span>
        <span className="live-chip" data-testid="status-connection"><span className="live-dot" />{online ? 'Online' : 'Offline'}</span>
      </div>
    </header>
  );
}

function Dashboard() {
  const cache = useQueryClient();
  const stationsQuery = useGetStations({ query: { queryKey: getGetStationsQueryKey(), refetchInterval: 8_000, retry: false } });
  const stations = stationsQuery.data;
  const stationFromList = useMemo(() => stations?.find(isMadhapurStation), [stations]);
  const stationId = stationFromList?.id ?? 1;
  const stationQuery = useGetStation(stationId, {
    query: { queryKey: getGetStationQueryKey(stationId), enabled: !stationsQuery.isLoading, refetchInterval: 5_000, retry: false },
  });
  const fetchedMadhapurStation =
    stationQuery.data && isMadhapurStation(stationQuery.data) ? stationQuery.data : undefined;
  const hasLiveStation = !!stationFromList || !!fetchedMadhapurStation;
  const station = fetchedMadhapurStation ?? stationFromList ?? FALLBACK_STATION;
  const deviceQuery = useGetRelayStatus({ station_id: stationId }, {
    query: { queryKey: getGetRelayStatusQueryKey({ station_id: stationId }), enabled: hasLiveStation, refetchInterval: 5_000 },
  });
  const [rider, setRider] = useState(() => localStorage.getItem('click-rider-name') ?? '');
  const penaltyQuery = useGetRiderPenalty(rider.trim(), {
    query: { queryKey: getGetRiderPenaltyQueryKey(rider.trim()), enabled: !!rider.trim(), refetchInterval: 15_000 },
  });
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const device = deviceQuery.data;
  const penalty = penaltyQuery.data;
  const book = useBookStation();
  const start = useStartReservedCharge();
  const finish = useFinishChargingSession();
  const busy = book.isPending || start.isPending || finish.isPending;
  const transitionRemaining = station?.buffer_end_time
    ? Math.max(0, Math.ceil((Date.parse(station.buffer_end_time) - clockNow) / 1000))
    : 0;
  const startWindowRemaining =
    station?.slot_status === 'Reserved' && station.buffer_end_time
      ? Math.max(
          0,
          Math.ceil(
            (Date.parse(station.buffer_end_time) + 10 * 60 * 1000 - clockNow) / 1000,
          ),
        )
      : 0;

  useEffect(() => {
    localStorage.setItem('click-rider-name', rider);
  }, [rider]);
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const flash = (message: string, error = false) => {
    setNotice({ message, error });
    window.setTimeout(() => setNotice(null), 4200);
  };
  const refreshState = async (riderName = rider) => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: getGetStationsQueryKey() }),
      cache.invalidateQueries({ queryKey: getGetStationQueryKey(stationId) }),
      cache.invalidateQueries({ queryKey: getGetRelayStatusQueryKey({ station_id: stationId }) }),
      ...(riderName.trim() ? [cache.invalidateQueries({ queryKey: getGetRiderPenaltyQueryKey(riderName.trim()) })] : []),
    ]);
  };
  const handleResult = async (result: { message: string }, riderName = rider) => {
    flash(result.message);
    await refreshState(riderName);
  };
  const handleError = (error: unknown) => {
    flash(error instanceof Error ? error.message : 'That did not go through. Check your connection and try again.', true);
  };
  const riderInput = () => {
    if (!hasLiveStation) {
      flash('Live Madhapur station data is not available yet. Booking is paused until it connects.', true);
      return null;
    }
    if (!rider.trim()) {
      flash('Add your name before booking a charging slot.', true);
      return null;
    }
    if (penalty?.active) {
      flash(`Booking is paused until ${formatTime(penalty.penalty_until)} because of a missed slot.`, true);
      return null;
    }
    return { rider_name: rider.trim() };
  };
  const queryError = hasLiveStation
    ? deviceQuery.error
    : stationsQuery.error ?? stationQuery.error;
  const responseBody =
    queryError && typeof queryError === 'object' && 'data' in queryError
      ? (queryError as { data?: unknown }).data
      : undefined;
  const serverError =
    responseBody && typeof responseBody === 'object' && 'error' in responseBody &&
    typeof responseBody.error === 'string'
      ? responseBody.error
      : null;
  const needsSupabaseSetup = !!serverError && (
    serverError.includes('CLICK Supabase schema is not installed') ||
    serverError.includes('CLICK could not access its station-state function')
  );
  const hasError = !!queryError;
  const stationReady = hasLiveStation && !needsSupabaseSetup && !hasError;
  const errorMessage = serverError ?? (
    queryError instanceof Error
      ? queryError.message
      : 'Couldn’t reach the station just now. Your booking status has not changed.'
  );
  const isBuffer = stationReady && station.slot_status === 'Buffer';
  const slotStatus = stationReady ? station.slot_status : undefined;
  const relayOn = stationReady && (device?.relay_status ?? station.relay_status);
  const riderForSlot = slotStatus === 'Reserved'
    ? station.next_rider ?? station.current_rider
    : station.current_rider;
  const isOwnSession = stationReady && !!rider.trim() && riderForSlot?.toLowerCase() === rider.trim().toLowerCase();
  const canStartReserved =
    slotStatus === 'Reserved' &&
    isOwnSession &&
    transitionRemaining <= 0 &&
    startWindowRemaining > 0;
  const stateForDisplay = stationReady
    ? device?.slot_status ?? slotStatus
    : needsSupabaseSetup
      ? 'Setup required'
      : hasError
        ? 'Unavailable'
        : 'Connecting';
  const statusClass = stationReady ? stateForDisplay?.toLowerCase() ?? 'available' : needsSupabaseSetup ? 'setup' : hasError ? 'unavailable' : 'connecting';
  const stationName = station.station_name;

  const bookSlot = () => {
    const data = riderInput();
    if (!data) return;
    const variables: BookStationMutationVariables = { id: stationId, data };
    book.mutate(variables, { onSuccess: (result) => void handleResult(result), onError: handleError });
  };
  const startSlot = () => {
    const data = riderInput();
    if (!data) return;
    const variables: StartReservedChargeMutationVariables = { id: stationId, data };
    start.mutate(variables, { onSuccess: (result) => void handleResult(result), onError: handleError });
  };
  const finishSlot = () => {
    const data = riderInput();
    if (!data) return;
    const variables: FinishChargingSessionMutationVariables = { id: stationId, data };
    finish.mutate(variables, { onSuccess: (result) => void handleResult(result), onError: handleError });
  };
  const retry = () => {
    void stationsQuery.refetch();
    void stationQuery.refetch();
    void deviceQuery.refetch();
    if (rider.trim()) void penaltyQuery.refetch();
  };

  return (
    <main className="app-shell">
      {!online && <div className="offline-banner" role="status" data-testid="status-offline">You’re offline. Live station updates and booking actions are paused.</div>}
      <section className="dashboard">
        <div className="page-heading">
          <div><div className="eyebrow">Rider charging dashboard</div><h1>One quick stop.<br className="mobile-break" /> Back on the road.</h1></div>
          <div className="refresh-note"><Activity size={14} /> Auto-refreshes every few seconds</div>
        </div>
        {notice && <div className={`toast-message ${notice.error ? 'error' : ''}`} role="status" data-testid="status-action-feedback">{notice.message}</div>}
        {hasError ? (
          <div className={`error-panel${needsSupabaseSetup ? ' setup-error-panel' : ''}`} role="alert" data-testid="status-station-error">
            {needsSupabaseSetup ? (
              <div className="error-copy">
                <strong className="error-title">Supabase station setup is required</strong>
                <p>Supabase is responding, but CLICK cannot confirm this station’s live state with the current setup.</p>
                <ol>
                  <li>Open the active Supabase project’s SQL Editor.</li>
                  <li>Run the full contents of <code>artifacts/click-ev-booking/supabase/schema.sql</code>.</li>
                  <li>Confirm the URL and service-role key belong to that same project, then retry.</li>
                </ol>
              </div>
            ) : (
              <span>{errorMessage}</span>
            )}
            <button className="retry-btn" onClick={retry} type="button" data-testid="button-retry">Retry connection</button>
          </div>
        ) : !hasLiveStation ? (
          <div className="station-sync-note" role="status" data-testid="status-station-sync">
            Showing the Madhapur station while live status connects. Booking stays paused until its Supabase record is confirmed.
          </div>
        ) : null}
          <div className="layout-grid">
            <section className="station-card" aria-label="Station booking">
              <div className="station-top">
                <div><div className="eyebrow">Your nearby charging point</div><h2 className="station-title" data-testid="text-station-name">{stationName}</h2><div className="station-subtitle">{station.location}</div></div>
                <span className={`status-pill ${statusClass}`} data-testid="status-slot"><span className="status-dot" />{stateForDisplay ?? 'Checking'}</span>
              </div>
              <div className={`station-visual${stationReady ? '' : ' station-visual-pending'}`}>
                <div className="visual-copy">
                  <div className="eyebrow">Socket 01 · Two-wheeler</div>
                  <h2>{!stationReady ? 'Station status syncing.' : slotStatus === 'Charging' ? 'Powering up.' : isBuffer ? 'Between riders.' : slotStatus === 'Reserved' ? 'Your slot is held.' : 'Ready when you are.'}</h2>
                  <p>{!stationReady ? 'Live status will appear when this station connects. Booking is paused until then.' : isBuffer ? 'Session Ended - Transition Window: Please unplug and clear the spot for the next rider. Reserve now; the relay remains off until the 10-minute window ends.' : slotStatus === 'Reserved' ? 'This slot is set aside for its rider. Charging starts after the transition buffer clears.' : slotStatus === 'Charging' ? `Charging session${station.current_rider ? ` · ${station.current_rider}` : ''}.` : 'A reliable top-up, right between deliveries.'}</p>
                </div>
                <div className="plug-art" aria-hidden="true"><PlugZap /></div>
                <div className="visual-state"><span className="relay-light" style={{ background: relayOn ? '#70d69d' : '#e9bd5e' }} />RELAY {relayOn ? 'ON' : 'OFF'} <span>·</span> {stationReady ? device ? 'DEVICE SYNCED' : 'STATION SYNC' : 'WAITING FOR LIVE STATE'}</div>
              </div>
              <div className="station-details">
                <div><div className="detail-label">Relay power</div><div className="detail-value" data-testid="text-relay-status">{relayOn ? 'Active' : 'Off'}</div></div>
                <div><div className="detail-label">{!stationReady ? 'Station state' : isBuffer ? 'Buffer ends in' : slotStatus === 'Reserved' ? (transitionRemaining > 0 ? 'Buffer ends in' : 'Start within') : slotStatus === 'Charging' ? 'Session started' : 'Slot state'}</div><div className="detail-value" data-testid="text-slot-timer">{!stationReady ? stateForDisplay : isBuffer ? formatDuration(transitionRemaining) : slotStatus === 'Reserved' ? formatDuration(transitionRemaining > 0 ? transitionRemaining : startWindowRemaining) : slotStatus === 'Charging' ? formatTime(station.charge_started_at) : slotStatus}</div></div>
                <div><div className="detail-label">{slotStatus === 'Reserved' ? 'Next rider' : 'Current rider'}</div><div className="detail-value" data-testid="text-current-rider">{riderForSlot || 'No rider yet'}</div></div>
              </div>
              <div className="divider" />
              <div className="action-area">
                {!stationReady && <><div className="action-caption">Booking is paused until the live Madhapur station record is confirmed.</div><button className="primary-btn" type="button" disabled data-testid="button-book"><Zap size={17} />Book &amp; Start Charge</button></>}
                {slotStatus === 'Available' && <><div className="action-caption">Book now to start charging as soon as the socket is ready.</div><button className="primary-btn" type="button" disabled={busy || !online || !!penalty?.active} onClick={bookSlot} data-testid="button-book"><Zap size={17} />{book.isPending ? 'Booking your slot…' : 'Book & Start Charge'}</button></>}
                {isBuffer && <><div className="action-caption">The relay remains OFF during the full 10-minute transition. You can reserve the next charge now.</div><button className="primary-btn" type="button" disabled={busy || !online || !!penalty?.active} onClick={bookSlot} data-testid="button-reserve"><Clock3 size={17} />{book.isPending ? 'Holding your slot…' : 'Reserve next slot'}</button></>}
                {slotStatus === 'Reserved' && <>
                  {isOwnSession ? <><div className="action-caption">{transitionRemaining > 0 ? `Your reservation is held. Start charging when the buffer clears in ${formatDuration(transitionRemaining)}.` : startWindowRemaining > 0 ? `Buffer cleared. Start charging within ${formatDuration(startWindowRemaining)} to keep your reservation.` : 'The 10-minute start window has closed. Checking your rider status…'}</div><button className="primary-btn" type="button" disabled={busy || !online || !canStartReserved || !!penalty?.active} onClick={startSlot} data-testid="button-start">{start.isPending ? 'Starting charge…' : <><BatteryCharging size={18} />Start charging</>}</button></> :
                     <div className="action-caption">Reserved for {station.next_rider || station.current_rider || 'another rider'}. This socket opens after their slot and transition buffer.</div>}
                </>}
                {slotStatus === 'Charging' && <>
                  {isOwnSession ? <><div className="action-caption">Finished charging? End your session to begin the 10-minute relay-off handoff.</div><button className="secondary-btn" type="button" disabled={busy || !online} onClick={finishSlot} data-testid="button-finish">{finish.isPending ? 'Ending session…' : <><Check size={17} />Finish charging</>}</button></> :
                    <div className="action-caption">This socket is in use{station.current_rider ? ` by ${station.current_rider}` : ''}. It will enter a 10-minute relay-off buffer when finished.</div>}
                </>}
              </div>
            </section>
            <aside className="side-stack">
              <section className="side-card">
                <div className="eyebrow">Rider details</div><h3>Who’s plugging in?</h3><p>Use the same name you’ll give at the station. Your booking and cooldown are tied to it.</p>
                <label className="input-label" htmlFor="rider-name" style={{ marginTop: 16 }}>Rider name</label>
                <div className="rider-edit"><input id="rider-name" className="rider-input" maxLength={60} value={rider} onChange={(event) => setRider(event.target.value)} placeholder="Enter your name" autoComplete="name" data-testid="input-rider-name" /><button className="save-name" type="button" onClick={() => { setRider(rider.trim()); flash(rider.trim() ? 'Rider details saved on this device.' : 'Enter your name to continue.', !rider.trim()); }} data-testid="button-save-name">Save</button></div>
              </section>
              <section className={`side-card penalty-card ${penalty?.active ? 'is-active' : ''}`}>
                <div className="eyebrow">Your booking status</div><h3>{penaltyQuery.isLoading ? 'Checking rider status…' : penalty?.active ? 'Cooldown is active' : 'You’re clear to book'}</h3>
                <p data-testid="status-penalty">{penaltyQuery.isLoading ? 'Checking your name against the station booking record.' : penalty?.active ? `Booking is paused until ${formatTime(penalty.penalty_until)}. A no-show is recorded if a reserved rider doesn’t start within the 10-minute start window.` : 'No active cooldown. If you reserve, please start within 10 minutes after the buffer ends.'}</p>
                <div className="penalty-count"><span>Total missed starts</span><strong data-testid="text-no-show-count">{penalty?.total_no_shows ?? '—'}</strong></div>
              </section>
              <section className="side-card rules-card">
                <div className="eyebrow">A clear handoff, every time</div><h3>How the slot works</h3>
                <div className="rule-line"><span className="rule-number">01</span><span>Finish a charge and the socket enters a 10-minute transition buffer. The relay is OFF.</span></div>
                <div className="rule-line"><span className="rule-number">02</span><span>Reserve during the buffer. Your slot is held, but charging cannot start until it ends.</span></div>
                <div className="rule-line"><span className="rule-number">03</span><span>Then you have 10 minutes to start. Missing that window triggers a rider cooldown.</span></div>
              </section>
            </aside>
          </div>
        <div className="bottom-note"><RefreshCw size={11} style={{ display: 'inline', marginRight: 5 }} /> Station status syncs across riders · Last update {station ? formatTime(station.updated_at) : '—'}</div>
      </section>
    </main>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function formatDuration(total: number) {
  const mins = Math.floor(total / 60).toString().padStart(2, '0');
  const secs = Math.floor(total % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
function formatTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <AppHeader />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/roadmap" component={RoadmapPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
