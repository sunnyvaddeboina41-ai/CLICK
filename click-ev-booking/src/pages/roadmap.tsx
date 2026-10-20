import {
  Activity,
  ArrowDown,
  BadgeCheck,
  BatteryCharging,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardCheck,
  Cloud,
  HardHat,
  MapPin,
  Radio,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { Link } from 'wouter';

const readiness = [
  {
    week: '01',
    label: 'Restore the connection',
    title: 'Supabase integration gate',
    owner: 'Engineering',
    icon: Cloud,
    status: 'FIRST GATE',
    body: 'The Supabase endpoint was not reachable in the previous check. Restore connectivity before treating the database as ready.',
    tasks: [
      'Verify the active project URL and confirm the matching service-role key is configured server-side only.',
      'Run the supplied supabase/schema.sql in that project; confirm station 1 exists and the API can read and write expected state.',
      'Review RLS policies and test the allowed state transitions: Available → Charging → Buffer → Reserved → Charging.',
    ],
  },
  {
    week: '02',
    label: 'Choose one safe site',
    title: 'Scope & site selection',
    owner: 'Pilot lead + site host',
    icon: MapPin,
    status: 'ONE SITE FIRST',
    body: 'Start with one supervised Madhapur or Gachibowli location and one charging point. Add a second site only after the first is stable.',
    tasks: [
      'Shortlist a tea point or parking hub with predictable rider dwell time, a secure dry mounting position and clear access.',
      'Survey the supply, cable route, weather exposure, parking flow, emergency access and host operating hours on site.',
      'Name one CLICK pilot lead, one host contact and one qualified electrical professional before installation is scheduled.',
    ],
  },
  {
    week: '03',
    label: 'Agree the operating model',
    title: 'Partner onboarding',
    owner: 'Partnerships',
    icon: Building2,
    status: 'WRITTEN TERMS',
    body: 'Approach tea points and parking hubs across Madhapur, Gachibowli and Hitec City. No partner commitment is assumed.',
    tasks: [
      'Explain rider flow, footprint, support contact, site hours, access rules and the proposed 30-day pilot in plain language.',
      'Agree who pays for power, rider tariff or revenue share, access, responsibilities, insurance/liability, maintenance and exit terms in a written MoU.',
      'Have MoU terms, insurance coverage and installation requirements reviewed by local professionals before any live use.',
    ],
  },
  {
    week: '04',
    label: 'Build the control path',
    title: 'Device & API validation',
    owner: 'Engineering + electrician',
    icon: Radio,
    status: 'BENCH BEFORE MAINS',
    body: 'Validate the device and application together on a safe bench setup first. A green software state is never proof that a circuit is safe.',
    tasks: [
      'Exercise the device state endpoint at a 3–5 second polling interval; confirm fresh state, no-store behavior and recovery after reconnect.',
      'Require device authentication before connecting public hardware. Fail off on network/API loss, stale state, reset or invalid response.',
      'Test every state transition, duplicate request, restart and timeout; confirm the relay cannot energize during Buffer or Reserved.',
    ],
  },
  {
    week: '05',
    label: 'Install with qualified help',
    title: 'Electrical installation',
    owner: 'Qualified electrician',
    icon: HardHat,
    status: 'NO DIY MAINS WORK',
    body: 'All mains work and final component selection belong to a qualified electrician, based on the actual charger, supply and site conditions.',
    tasks: [
      'Assemble the ESP32 controller, a relay validated for the actual load, optional ACS712 telemetry and a suitable waterproof/weatherproof enclosure.',
      'A 30A relay is only a candidate: independently validate its rating for the actual load, switching duty, enclosure and fault conditions.',
      'Provide appropriately rated switching and protection, verified earthing, RCD/RCBO protection and accessible emergency isolation.',
      'Use a suitable weatherproof enclosure and strain relief. ACS712 telemetry is optional and is not a safety device.',
    ],
  },
  {
    week: '06',
    label: 'Prove it, then invite riders',
    title: 'Commissioning & training',
    owner: 'Pilot lead + site host',
    icon: ClipboardCheck,
    status: 'GO / NO-GO',
    body: 'Commission a single station with documented checks before inviting the 10-rider cohort. Keep a named human on support throughout.',
    tasks: [
      'Install and field-test the PWA on rider phones under the actual site network conditions before opening the pilot.',
      'Run supervised end-to-end bookings, buffer timing, no-show handling, emergency isolation and power/network interruption drills.',
      'Use verified rider accounts or an on-site identity check before allowing a relay start; the current demo name field is not proof of identity.',
      'Train riders on booking, arrival, plug-in checks, session finish, handoff, site etiquette and how to report a fault.',
      'Proceed only when safety checks, written site terms, device authentication, fail-off behavior and support coverage are all evidenced.',
    ],
  },
];

const pilotStages = [
  {
    days: 'DAYS 01–07',
    title: 'Small, supervised start',
    tone: 'pilot-mint',
    points: [
      'Invite 10 riders across Zomato, Zepto and Swiggy; confirm each rider understands the flow.',
      'Keep the site host and CLICK support contact reachable during every charging window.',
      'Review incidents and station state daily. Pause immediately on any safety concern.',
    ],
  },
  {
    days: 'DAYS 08–21',
    title: 'Observe real operations',
    tone: 'pilot-gold',
    points: [
      'Continue only if the first week has no unresolved safety issue and the device remains authenticated.',
      'Review bookings, completed sessions, availability, failures and rider feedback every week.',
      'Log faults with time, station state, network state, owner and resolution; never bypass a protection.',
    ],
  },
  {
    days: 'DAYS 22–30',
    title: 'Decide what comes next',
    tone: 'pilot-ink',
    points: [
      'Keep the same scope through the close-out; do not add sites or increase electrical load mid-pilot.',
      'Interview riders and host, reconcile the KPI log, and list open risks and operating costs for review.',
      'Make a documented go, extend-with-controls or stop decision before considering expansion.',
    ],
  },
];

const suggestedKpis = [
  { name: 'Successful sessions', definition: 'Completed sessions ÷ rider booking attempts', gate: 'Suggested: ≥ 90% by final 2 weeks' },
  { name: 'Station availability', definition: 'Available and usable hours ÷ planned staffed hours', gate: 'Suggested: ≥ 95% by final 2 weeks' },
  { name: 'Device/API freshness', definition: 'Valid authenticated state responses within 5 seconds', gate: 'Suggested: ≥ 99% during staffed hours' },
  { name: 'Safety incidents', definition: 'Electrical, overheating, water ingress or unsafe-use events', gate: 'Suggested: 0 unresolved; any incident pauses pilot' },
  { name: 'Rider experience', definition: 'Post-session rating and short qualitative feedback', gate: 'Suggested: ≥ 4.0 / 5 average' },
];

function Roadmap() {
  return (
    <main className="roadmap-page" data-testid="page-hyderabad-roadmap">
      <section className="roadmap-hero" aria-labelledby="roadmap-title">
        <div className="roadmap-hero-grid">
          <div className="roadmap-hero-copy">
            <div className="roadmap-kicker"><span>HYDERABAD LAUNCH ROADMAP</span><span className="kicker-rule" /></div>
            <h1 id="roadmap-title">Hyderabad<br /><em>Launch Roadmap</em></h1>
            <p className="roadmap-intro">Six weeks to get the site, power path and people ready. Then one measured month with 10 delivery riders in Madhapur / Gachibowli.</p>
            <div className="roadmap-hero-actions">
              <a href="#readiness" className="roadmap-jump" data-testid="link-roadmap-readiness">Explore the plan <ArrowDown size={15} aria-hidden="true" /></a>
              <span className="roadmap-small-note">ONE SITE FIRST · NO UNSUPERVISED MAINS WORK</span>
            </div>
          </div>
          <div className="roadmap-hero-stamp" aria-label="Six weeks readiness, followed by a 30-day pilot">
            <div className="stamp-orbit stamp-orbit-one" />
            <div className="stamp-orbit stamp-orbit-two" />
            <div className="stamp-center">
              <span>READY IN</span>
              <strong>06</strong>
              <span>WEEKS</span>
            </div>
            <div className="stamp-caption">THEN · 30 DAYS<br />10 RIDERS · 1 SITE</div>
          </div>
        </div>
        <div className="roadmap-hero-foot">
          <span>01 — PREPARE</span><span>02 — COMMISSION</span><span>03 — LEARN</span>
          <span className="roadmap-foot-line" />
        </div>
      </section>

      <section className="roadmap-gate" aria-label="First integration gate" data-testid="callout-supabase-gate">
        <div className="gate-icon"><CircleAlert size={20} aria-hidden="true" /></div>
        <div className="gate-copy">
          <span className="gate-label">FIRST INTEGRATION GATE · NOT YET VERIFIED</span>
          <p>The Supabase endpoint was unreachable in the previous check. Restore connectivity, verify the active URL and matching server-only service-role key, then apply and test <code>schema.sql</code>. Do not describe setup as complete until the API and state transitions pass.</p>
        </div>
        <span className="gate-number">GATE 00</span>
      </section>

      <section className="roadmap-section readiness-section" id="readiness" aria-labelledby="readiness-title">
        <div className="section-heading">
          <div>
            <div className="roadmap-kicker"><span>THE FIRST SIX WEEKS</span><span className="kicker-rule" /></div>
            <h2 id="readiness-title">Readiness, in order.</h2>
          </div>
          <p>Each week has a named owner and a proof point. If a gate is not met, the next step waits.</p>
        </div>
        <div className="readiness-list">
          {readiness.map((item, index) => {
            const Icon = item.icon;
            return (
              <article className={`readiness-row ${index === 0 ? 'is-first-gate' : ''}`} key={item.week} data-testid={`card-readiness-week-${item.week}`}>
                <div className="readiness-week">
                  <span className="week-number">{item.week}</span>
                  <span className="week-label">WEEK</span>
                </div>
                <div className="readiness-main">
                  <div className="readiness-meta"><span>{item.label}</span><span className="readiness-owner">OWNER · {item.owner}</span></div>
                  <h3>{item.title}</h3>
                  <p className="readiness-body">{item.body}</p>
                  <ul className="readiness-tasks">
                    {item.tasks.map((task, taskIndex) => <li key={taskIndex}><Check size={14} aria-hidden="true" /><span>{task}</span></li>)}
                  </ul>
                </div>
                <div className="readiness-side">
                  <span className={`readiness-icon ${index === 0 ? 'is-alert' : ''}`}><Icon size={19} aria-hidden="true" /></span>
                  <span className="readiness-status">{item.status}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="roadmap-safety" aria-labelledby="safety-title" data-testid="callout-electrical-safety">
        <div className="safety-header">
          <span className="safety-symbol"><ShieldCheck size={21} aria-hidden="true" /></span>
          <div>
            <div className="roadmap-kicker"><span>NON-NEGOTIABLE</span><span className="kicker-rule" /></div>
            <h2 id="safety-title">Power is a safety case,<br />not a product feature.</h2>
          </div>
        </div>
        <div className="safety-content">
          <p>Software can request a state. Only properly selected, installed and tested electrical protection can make the installation safe. No mains work by unqualified people.</p>
          <div className="safety-checks">
            <div><span className="safety-check-number">01</span><span>Site survey and actual load assessment by a qualified electrician.</span></div>
            <div><span className="safety-check-number">02</span><span>Appropriately rated switching and protection, verified earthing, RCD/RCBO, and accessible emergency isolation.</span></div>
            <div><span className="safety-check-number">03</span><span>Weatherproof enclosure, protected cable entry, and documented fail-off test on network/API loss.</span></div>
            <div><span className="safety-check-number">04</span><span>30A relay only if independently validated for this actual load. ACS712 is optional telemetry—not a safety device.</span></div>
          </div>
          <div className="safety-footer"><HardHat size={15} aria-hidden="true" /> MoU terms, insurance and installation requirements need local professional review.</div>
        </div>
      </section>

      <section className="roadmap-section pilot-section" id="pilot" aria-labelledby="pilot-title">
        <div className="section-heading pilot-heading">
          <div>
            <div className="roadmap-kicker"><span>AFTER COMMISSIONING</span><span className="kicker-rule" /></div>
            <h2 id="pilot-title">30 days. Small by design.</h2>
          </div>
          <div className="pilot-cohort"><Users size={16} aria-hidden="true" /><span>10 RIDERS</span><span className="cohort-divider" /><span>ZOMATO · ZEPTO · SWIGGY</span></div>
        </div>
        <div className="pilot-ribbon"><span>DAY 01</span><span className="ribbon-track"><i /></span><span>DAY 30</span><span className="ribbon-site"><MapPin size={13} aria-hidden="true" /> MADHAPUR / GACHIBOWLI</span></div>
        <div className="pilot-stages">
          {pilotStages.map((stage, index) => (
            <article className={`pilot-stage ${stage.tone}`} key={stage.days} data-testid={`card-pilot-stage-${index + 1}`}>
              <div className="pilot-stage-top"><span>{stage.days}</span><span className="pilot-stage-count">0{index + 1} / 03</span></div>
              <h3>{stage.title}</h3>
              <ul>{stage.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="daily-review">
          <div className="review-icon"><CalendarDays size={17} aria-hidden="true" /></div>
          <div><strong>Every day</strong><span>Check station state, incidents, support requests and session log.</span></div>
          <div className="review-divider" />
          <div><strong>Every week</strong><span>Review KPI trends, rider feedback, host experience and open actions.</span></div>
          <div className="review-owner"><Activity size={14} aria-hidden="true" /> Pilot lead owns the review log</div>
        </div>
      </section>

      <section className="roadmap-section metrics-section" aria-labelledby="metrics-title">
        <div className="section-heading metrics-heading">
          <div>
            <div className="roadmap-kicker"><span>MEASURE BEFORE EXPANDING</span><span className="kicker-rule" /></div>
            <h2 id="metrics-title">Suggested pilot KPIs.</h2>
          </div>
          <p>Proposed thresholds only—not commitments or established performance. Agree definitions and gates before Day 1.</p>
        </div>
        <div className="kpi-table" role="table" aria-label="Suggested pilot KPI targets" data-testid="table-suggested-kpis">
          <div className="kpi-row kpi-head" role="row"><span role="columnheader">MEASURE</span><span role="columnheader">HOW TO READ IT</span><span role="columnheader">SUGGESTED GATE</span></div>
          {suggestedKpis.map((kpi, index) => (
            <div className={`kpi-row ${index === suggestedKpis.length - 1 ? 'kpi-row-last' : ''}`} role="row" key={kpi.name} data-testid={`row-kpi-${index + 1}`}>
              <span className="kpi-name" role="cell">{kpi.name}</span>
              <span className="kpi-definition" role="cell">{kpi.definition}</span>
              <span className={`kpi-gate ${index === suggestedKpis.length - 1 ? 'kpi-gate-safety' : ''}`} role="cell">{kpi.gate}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="go-no-go" aria-labelledby="decision-title" data-testid="section-go-no-go">
        <div className="decision-mark"><BadgeCheck size={24} aria-hidden="true" /></div>
        <div className="decision-copy">
          <div className="roadmap-kicker"><span>DAY 30 DECISION</span><span className="kicker-rule" /></div>
          <h2 id="decision-title">Expand only when<br />the evidence says so.</h2>
          <p>Go only with zero unresolved safety issues, stable authenticated device/API behavior, documented site consent, trained riders and support capacity. Otherwise stop or extend with controls—never scale through an open risk.</p>
        </div>
        <div className="decision-options">
          <div><span className="decision-dot go" /><strong>GO</strong><span>Gates met; plan next site review.</span></div>
          <div><span className="decision-dot extend" /><strong>EXTEND</strong><span>Specific fixes, owners and dates agreed.</span></div>
          <div><span className="decision-dot stop" /><strong>STOP</strong><span>Safety, consent or reliability is unresolved.</span></div>
        </div>
      </section>

      <footer className="roadmap-footer">
        <Link className="roadmap-brand footer-brand" href="/" data-testid="link-roadmap-dashboard"><span className="roadmap-brand-mark">C</span><span>CLICK</span></Link>
        <span className="footer-note"><BatteryCharging size={14} aria-hidden="true" /> BUILT FOR THE SHIFT BETWEEN DELIVERIES.</span>
        <span className="footer-version"><Wrench size={13} aria-hidden="true" /> PILOT PLAN · V1</span>
      </footer>
    </main>
  );
}

export default Roadmap;
