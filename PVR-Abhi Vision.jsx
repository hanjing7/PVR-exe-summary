import { useState, useCallback } from "react";

// ─── Everpure tokens ──────────────────────────────────────────────────────────
const EV = {
  bg: "#fff5e3", bgCard: "#fffdf9", bgSurface: "#f0ece5", bgInput: "#efede8",
  fg: "#2d2a27", fgSecondary: "#73716f", fgTertiary: "#9e9b98",
  orange: "#ff7023", orangeDark: "#d55d1d",
  stone: "#d0c8ba", stone200: "#e7e3dc", stone100: "#efede8",
  sage: "#8fa596", sageDark: "#5a6359", cinnamon: "#bd673d", danger: "#da4d72",
  radius: "8px", shadow: "0 2px 8px rgba(45,42,39,0.08)", shadowMd: "0 4px 16px rgba(45,42,39,0.10)",
};

// ─── Raw Data ────────────────────────────────────────────────────────────────
const OUTAGES = [
  { appliance_id: "579d7a17", appliance_name: "gf1-purefb041-01", date: "2025-04-24", root_cause: "SW – Configuration", summary: "CH4 went down while awaiting FB11 replacement", minutes: 15 },
  { appliance_id: "9ae6638f-feb", appliance_name: "gf0-purefb024-01", date: "2023-02-10", root_cause: "SW – Purity / Firmware", summary: "FlashRecovery outage – FPGA causing CH6 to exceed N-2", minutes: 60 },
  { appliance_id: "1014397", appliance_name: "gf2-pureaz101-03", date: "2025-11-07", root_cause: "Human – Partner", summary: "CT0 offline – wrong cables pulled during controller replacement", minutes: 106.25 },
  { appliance_id: "a5f5bf2d", appliance_name: "gf2-purefb061-01", date: "2025-05-29", root_cause: "SW – Purity / Firmware", summary: "Upgrade failed – congo-up etcd conversion issue", minutes: 145 },
  { appliance_id: "9ae6638f-jan", appliance_name: "gf0-purefb024-01", date: "2023-01-18", root_cause: "SW – Purity / Firmware", summary: "No authorities running on all blades – CH6-FM2 failed boot drive", minutes: 1231 },
];
const OUTAGE_MAP = {};
OUTAGES.forEach(o => { OUTAGE_MAP[o.appliance_id] = o; });

const ORG = { name: "PNC Financial Services Group", uptime: 99.9997 };

// ─── Appliance Topology Data ──────────────────────────────────────────────────
const SITES = [
  {
    site: "Pittsburgh, PA", abbr: "PIT",
    appliances: [
      { id: "A01", name: "gf0-pure-xl170-01", hw: "FA-XL", sub: "EG//Forever", status: "caution" },
      { id: "A02", name: "gf0-cleanrm-pure01", hw: "FA-C",  sub: "EG//Forever", status: "caution" },
      { id: "A03", name: "p-prdc-pure05",      hw: "FA-X",  sub: "EG//Forever", status: "caution" },
      { id: "A04", name: "gf0-pure119-01",     hw: "FA-X",  sub: "EG//Forever", status: "caution" },
      { id: "A05", name: "gf0-pure161",        hw: "FA-XL", sub: "Standard",    status: "caution" },
      { id: "A06", name: "gf0-purelab-01",     hw: "FA-X",  sub: "EG//Forever", status: "caution" },
      { id: "A07", name: "gf0-ucp13-pure01",   hw: "FA-X",  sub: "EG//Forever", status: "caution" },
      { id: "A08", name: "p-prdc-pure02",      hw: "FA-X",  sub: "EG//Forever", status: "ok" },
      { id: "A09", name: "gf0-nas02",          hw: "FB-S",  sub: "EG//Foundation", status: "caution" },
      { id: "A10", name: "gf0-pureaz101-04",   hw: "FA-XL", sub: "EG//Forever", status: "caution" },
      { id: "A11", name: "p-prdc-pure03",      hw: "FA-X",  sub: "EG//Forever", status: "caution" },
      { id: "579d7a17", name: "gf1-purefb041-01", hw: "FB", sub: "EG//Forever", status: "caution" },
      { id: "9ae6638f-jan", name: "gf0-purefb024-01", hw: "FB", sub: "EG//Foundation", status: "critical" },
      { id: "A14", name: "gf0-pure-c60-01",   hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "A15", name: "gf0-pure-c60-02",   hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "A16", name: "gf0-nas01",          hw: "FB",    sub: "EG//Foundation", status: "ok" },
      { id: "A17", name: "gf0-xl170-02",       hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "A18", name: "gf0-xl170-03",       hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "A19", name: "gf0-x90-01",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "A20", name: "gf0-x90-02",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
    ]
  },
  {
    site: "Sandston, VA", abbr: "SAN",
    appliances: [
      { id: "B01", name: "de3-pure-n110-01",   hw: "FA-XL", sub: "EG//Forever", status: "caution" },
      { id: "B02", name: "gf1-pureaz203-02",   hw: "FA-XL", sub: "EG//Forever", status: "caution" },
      { id: "B03", name: "gf1-pureaz205-01",   hw: "FA-XL", sub: "EG//Forever", status: "caution" },
      { id: "1014397", name: "gf2-pureaz101-03", hw: "FA-XL", sub: "EG//Forever", status: "critical" },
      { id: "a5f5bf2d", name: "gf2-purefb061-01", hw: "FB-S", sub: "EG//Forever", status: "critical" },
      { id: "B06", name: "gf1-xl170-01",       hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "B07", name: "gf1-xl170-02",       hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "B08", name: "gf1-x90-01",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B09", name: "gf1-x90-02",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B10", name: "gf1-x90-03",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B11", name: "gf1-x90-04",         hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B12", name: "gf1-c60-01",         hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "B13", name: "gf1-c60-02",         hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "B14", name: "gf1-nas01",          hw: "FB",    sub: "EG//Foundation",  status: "ok" },
      { id: "B15", name: "gf1-nas02",          hw: "FB",    sub: "EG//Foundation",  status: "ok" },
    ]
  },
  {
    site: "Ashburn, VA", abbr: "ASH",
    appliances: [
      { id: "C01", name: "gf2-xl170-01", hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "C02", name: "gf2-xl170-02", hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "C03", name: "gf2-xl170-03", hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "C04", name: "gf2-x90-01",   hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "C05", name: "gf2-x90-02",   hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "C06", name: "gf2-x90-03",   hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "C07", name: "gf2-x90-04",   hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "C08", name: "gf2-c60-01",   hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "C09", name: "gf2-c60-02",   hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "C10", name: "gf2-c60-03",   hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "C11", name: "gf2-nas01",    hw: "FB",    sub: "EG//Foundation",  status: "ok" },
      { id: "C12", name: "gf2-nas02",    hw: "FB",    sub: "EG//Foundation",  status: "ok" },
    ]
  },
  {
    site: "Rogers, AR", abbr: "ROG",
    appliances: [
      { id: "D01", name: "gf3-xl170-01", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "D02", name: "gf3-xl170-02", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "D03", name: "gf3-nas01",    hw: "FB",    sub: "EG//Foundation", status: "ok" },
    ]
  },
];

// ─── Visual config per HW type ────────────────────────────────────────────────
// Hardware uses hexagons with distinct fill + texture pattern
// Subscription shown as a small circle indicator
const HW_STYLE = {
  "FA-XL": { label: "FA//XL", fill: "#c9d9cf", stroke: "#7aaa90", patternId: "p-fa-xl", textFill: "#3a5447" },
  "FA-X":  { label: "FA//X",  fill: "#cfd8e3", stroke: "#7a9ab8", patternId: "p-fa-x",  textFill: "#2d4a5e" },
  "FA-C":  { label: "FA//C",  fill: "#ddd5c5", stroke: "#aa9070", patternId: "p-fa-c",  textFill: "#5e4a2d" },
  "FB-S":  { label: "FB//S",  fill: "#c5d5d9", stroke: "#6a9aaa", patternId: "p-fb-s",  textFill: "#1e4a55" },
  "FB":    { label: "FB",     fill: "#cccbd9", stroke: "#7a78aa", patternId: "p-fb",    textFill: "#35346a" },
};
const STATUS_OVERRIDE = {
  critical: { fill: "#da4d72", stroke: "#9b2040", textFill: "#fff" },
  caution:  { fill: "#e8d4b8", stroke: "#bd673d", textFill: "#5e3a10" },
};
const SUB_DOT = {
  "EG//Forever":    { color: "#5a6359", label: "EG//Forever" },
  "EG//Foundation": { color: "#8fa596", label: "EG//Foundation" },
  "Standard":       { color: "#9e9b98", label: "Standard" },
};

// ─── Hexagon math ─────────────────────────────────────────────────────────────
function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

// ─── SVG defs for patterns ────────────────────────────────────────────────────
function SvgDefs() {
  return (
    <defs>
      {/* FA-XL: thin diagonal lines */}
      <pattern id="p-fa-xl" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(58,84,71,0.16)" strokeWidth="1.4" />
      </pattern>
      {/* FA-X: scattered dots */}
      <pattern id="p-fa-x" patternUnits="userSpaceOnUse" width="7" height="7">
        <circle cx="3.5" cy="3.5" r="1.1" fill="rgba(45,74,94,0.18)" />
      </pattern>
      {/* FA-C: fine grid */}
      <pattern id="p-fa-c" patternUnits="userSpaceOnUse" width="7" height="7">
        <path d="M7,0 L0,0 0,7" fill="none" stroke="rgba(94,74,45,0.16)" strokeWidth="0.8" />
      </pattern>
      {/* FB-S: double diagonal */}
      <pattern id="p-fb-s" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-40)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(30,74,85,0.16)" strokeWidth="1.4" />
        <line x1="4" y1="0" x2="4" y2="8" stroke="rgba(30,74,85,0.09)" strokeWidth="0.7" />
      </pattern>
      {/* FB: wavy */}
      <pattern id="p-fb" patternUnits="userSpaceOnUse" width="9" height="9">
        <path d="M0,5 Q2.25,2.5 4.5,5 Q6.75,7.5 9,5" fill="none" stroke="rgba(53,52,106,0.16)" strokeWidth="0.8" />
      </pattern>
    </defs>
  );
}

// ─── Single hex node ─────────────────────────────────────────────────────────
function HexNode({ app, cx, cy, r, onEnter, onLeave, isHovered }) {
  const hw = HW_STYLE[app.hw] || HW_STYLE["FA-X"];
  const ov = STATUS_OVERRIDE[app.status];
  const fill   = ov ? ov.fill   : hw.fill;
  const stroke = ov ? ov.stroke : hw.stroke;
  const textFill = ov ? ov.textFill : hw.textFill;
  const hasOutage = !!OUTAGE_MAP[app.id];
  const rr = isHovered ? r * 1.18 : r;
  const pts = hexPts(cx, cy, rr);
  const sub = SUB_DOT[app.sub] || SUB_DOT["Standard"];

  return (
    <g style={{ cursor: "pointer" }}
      onMouseEnter={e => onEnter(app, e)}
      onMouseLeave={onLeave}>
      {/* glow ring on hover */}
      {isHovered && <polygon points={hexPts(cx, cy, rr + 5)} fill="none" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.25" />}
      {/* base fill */}
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={isHovered ? 2 : 1.2} />
      {/* texture */}
      {app.status !== "critical" && <polygon points={pts} fill={`url(#${hw.patternId})`} />}
      {/* hw label */}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill={textFill} style={{ userSelect: "none", pointerEvents: "none" }}>
        {hw.label}
      </text>
      {/* subscription dot — bottom-right corner, circle shape */}
      <circle cx={cx + rr * 0.58} cy={cy + rr * 0.56} r={4.5}
        fill={sub.color} stroke={EV.bgCard} strokeWidth={1.5} />
      {/* outage badge — top-left */}
      {hasOutage && (
        <g>
          <circle cx={cx - rr * 0.52} cy={cy - rr * 0.58} r={5.5}
            fill={app.status === "critical" ? "#9b2040" : EV.orange}
            stroke={EV.bgCard} strokeWidth={1.5} />
          <text x={cx - rr * 0.52} y={cy - rr * 0.58 + 3.5} textAnchor="middle"
            fontSize="8" fontWeight="800" fill="white" style={{ pointerEvents: "none" }}>!</text>
        </g>
      )}
    </g>
  );
}

// ─── Site cluster ─────────────────────────────────────────────────────────────
function SiteCluster({ siteData, hovered, onEnter, onLeave }) {
  const apps = siteData.appliances;
  const R = 20;
  const colW = R * Math.sqrt(3) + 4;
  const rowH = R * 1.5 + 3;
  const cols = Math.ceil(Math.sqrt(apps.length * 1.5));

  const positions = apps.map((_, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const offsetX = (row % 2 === 1) ? colW * 0.5 : 0;
    return {
      cx: col * colW + offsetX + R + 6,
      cy: row * rowH + R + 6,
    };
  });

  const svgW = cols * colW + R * 0.6 + 12;
  const svgH = Math.ceil(apps.length / cols) * rowH + R * 0.5 + 12;

  const criticalCount = apps.filter(a => a.status === "critical").length;
  const cautionCount  = apps.filter(a => a.status === "caution").length;

  return (
    <div style={{
      background: EV.bgSurface,
      border: `1px solid ${criticalCount > 0 ? "#f0c4cc" : EV.stone200}`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "inline-flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {/* site header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width={10} height={13} viewBox="0 0 10 13">
            <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" fill={EV.fgSecondary} />
            <circle cx="5" cy="5" r="2" fill={EV.bgCard} />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: EV.fg }}>{siteData.site}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {criticalCount > 0 && <span style={{ fontSize: 10, background: "#fce8ee", color: EV.danger, borderRadius: 20, padding: "1px 7px", fontWeight: 600 }}>{criticalCount} down</span>}
          {cautionCount > 0  && <span style={{ fontSize: 10, background: "#f7ece0", color: EV.cinnamon, borderRadius: 20, padding: "1px 7px", fontWeight: 500 }}>{cautionCount} caution</span>}
          <span style={{ fontSize: 10, color: EV.fgTertiary }}>{apps.length} total</span>
        </div>
      </div>

      {/* hex grid */}
      <svg width={svgW} height={svgH}>
        <SvgDefs />
        {apps.map((app, idx) => (
          <HexNode
            key={app.id}
            app={app}
            cx={positions[idx].cx}
            cy={positions[idx].cy}
            r={R}
            isHovered={hovered?.id === app.id}
            onEnter={onEnter}
            onLeave={onLeave}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Cluster View (full panel) ────────────────────────────────────────────────
function ClusterView() {
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState(null);
  const [filter, setFilter] = useState("all");

  const handleEnter = useCallback((app, e) => {
    setHovered(app);
    setPos({ x: e.clientX, y: e.clientY });
  }, []);
  const handleLeave = useCallback(() => {
    setHovered(null); setPos(null);
  }, []);

  const hwFilters = ["all", "FA-XL", "FA-X", "FA-C", "FB-S", "FB"];
  const statusFilters = ["critical", "caution"];

  const filteredSites = SITES.map(s => ({
    ...s,
    appliances: s.appliances.filter(a => {
      if (filter === "all") return true;
      if (hwFilters.includes(filter)) return a.hw === filter;
      return a.status === filter;
    })
  })).filter(s => s.appliances.length > 0);

  const outage = hovered ? OUTAGE_MAP[hovered.id] : null;
  const sub = hovered ? (SUB_DOT[hovered.sub] || SUB_DOT["Standard"]) : null;
  const hw = hovered ? (HW_STYLE[hovered.hw] || HW_STYLE["FA-X"]) : null;

  return (
    <div style={{ position: "relative" }}>
      {/* filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: EV.fgTertiary }}>Filter:</span>
        {[...hwFilters, ...statusFilters].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
            border: `1px solid ${filter === f ? EV.orangeDark : EV.stone200}`,
            background: filter === f ? EV.orangeDark : "transparent",
            color: filter === f ? "#fff5e3" : EV.fgSecondary,
            transition: "all 0.12s",
          }}>{f}</button>
        ))}
      </div>

      {/* legend */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: EV.fgTertiary, fontWeight: 600 }}>HARDWARE (hexagon)</span>
          {Object.entries(HW_STYLE).map(([hw, cfg]) => (
            <div key={hw} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width={14} height={14} viewBox="-8 -8 16 16">
                <defs>
                  <pattern id={`leg-${cfg.patternId}`} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(58,84,71,0.2)" strokeWidth="1.4" />
                  </pattern>
                </defs>
                <polygon points={hexPts(0, 0, 7)} fill={cfg.fill} stroke={cfg.stroke} strokeWidth={1} />
                <polygon points={hexPts(0, 0, 7)} fill={`url(#${cfg.patternId})`} />
              </svg>
              <span style={{ fontSize: 10, color: EV.fgSecondary }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div style={{ width: 1, background: EV.stone200, alignSelf: "stretch" }} />

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: EV.fgTertiary, fontWeight: 600 }}>SUBSCRIPTION (● dot)</span>
          {Object.entries(SUB_DOT).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: cfg.color, border: `1.5px solid ${EV.bgCard}` }} />
              <span style={{ fontSize: 10, color: EV.fgSecondary }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div style={{ width: 1, background: EV.stone200, alignSelf: "stretch" }} />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: EV.fgTertiary, fontWeight: 600 }}>STATUS</span>
          {[["#da4d72","Outage/Critical"],["#e8d4b8","Caution"],["#c9d9cf","OK"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c, border: `1px solid ${EV.stone200}` }} />
              <span style={{ fontSize: 10, color: EV.fgSecondary }}>{l}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: EV.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 7, color: "white", fontWeight: 800 }}>!</span>
            </div>
            <span style={{ fontSize: 10, color: EV.fgSecondary }}>Outage event</span>
          </div>
        </div>
      </div>

      {/* site clusters */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        {filteredSites.map(s => (
          <SiteCluster key={s.site} siteData={s} hovered={hovered} onEnter={handleEnter} onLeave={handleLeave} />
        ))}
      </div>

      {/* tooltip */}
      {hovered && pos && (
        <div style={{
          position: "fixed", left: pos.x + 14, top: pos.y + 10,
          background: EV.bgCard, border: `1px solid ${EV.stone200}`,
          borderRadius: 10, padding: "12px 14px", fontSize: 12, color: EV.fg,
          zIndex: 9999, minWidth: 200, maxWidth: 270, boxShadow: EV.shadowMd, pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: EV.orangeDark }}>{hovered.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: EV.fgTertiary }}>Hardware</span>
            <span style={{ fontWeight: 600 }}>{hw?.label}</span>
            <span style={{ color: EV.fgTertiary }}>Subscription</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sub?.color, flexShrink: 0 }} />
              {sub?.label}
            </span>
            <span style={{ color: EV.fgTertiary }}>Status</span>
            <span style={{ fontWeight: 600, color: hovered.status === "critical" ? EV.danger : hovered.status === "caution" ? EV.cinnamon : EV.sageDark }}>
              {hovered.status}
            </span>
          </div>
          {outage && (
            <div style={{ paddingTop: 8, borderTop: `0.5px solid ${EV.stone200}` }}>
              <div style={{ color: EV.danger, fontWeight: 700, fontSize: 11, marginBottom: 4 }}>⚠ Outage on record</div>
              <div style={{ fontSize: 11, color: EV.fgSecondary, marginBottom: 2 }}>{outage.root_cause}</div>
              <div style={{ fontSize: 11, color: EV.fgTertiary, marginBottom: 2 }}>{outage.date}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: EV.cinnamon }}>
                {Math.round(outage.minutes) >= 60
                  ? `${Math.floor(outage.minutes / 60)}h ${Math.round(outage.minutes % 60)}m`
                  : `${Math.round(outage.minutes)}m`} downtime
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Uptime Heatmap ───────────────────────────────────────────────────────────
function UptimeHeatmap() {
  const [tooltip, setTooltip] = useState(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const startDate = new Date(today); startDate.setFullYear(startDate.getFullYear()-1); startDate.setDate(1);

  const outageMap = {};
  OUTAGES.forEach(o => { if (!outageMap[o.date]) outageMap[o.date]=[]; outageMap[o.date].push(o); });

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months = [];
  const cur = new Date(startDate);
  while (cur <= today) { months.push(new Date(cur.getFullYear(), cur.getMonth(), 1)); cur.setMonth(cur.getMonth()+1); }

  function toDS(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function fmtD(s) { return new Date(s+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
  function fmtM(m) { if(m<60) return `${Math.round(m)}m`; const h=Math.floor(m/60),r=Math.round(m%60); return r?`${h}h ${r}m`:`${h}h`; }

  const totalMin = OUTAGES.reduce((s,o)=>s+o.minutes,0);

  return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        {[{label:"Array Uptime",value:`${ORG.uptime}%`,accent:EV.sageDark},{label:"Total Outage Time",value:fmtM(totalMin),accent:EV.danger},{label:"Outage Events",value:OUTAGES.length,accent:EV.cinnamon}].map(s=>(
          <div key={s.label} style={{background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:EV.radius,padding:"10px 16px",flex:"1 1 110px",minWidth:100}}>
            <div style={{fontSize:11,color:EV.fgSecondary,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:600,color:s.accent}}>{s.value}</div>
          </div>
        ))}
      </div>
      {months.map(ms=>{
        const me=new Date(ms.getFullYear(),ms.getMonth()+1,0);
        const cells=[];
        for(let d=1;d<=me.getDate();d++){
          const cd=new Date(ms.getFullYear(),ms.getMonth(),d);
          const ds=toDS(cd);
          if(cd>today||cd<startDate) cells.push({type:"future"});
          else if(outageMap[ds]) cells.push({type:"outage",ds,outages:outageMap[ds]});
          else cells.push({type:"ok"});
        }
        return (
          <div key={toDS(ms)} style={{display:"flex",alignItems:"center",marginBottom:3}}>
            <div style={{width:32,fontSize:10,color:EV.fgSecondary,textAlign:"right",paddingRight:6,flexShrink:0}}>{MONTHS[ms.getMonth()]}</div>
            <div style={{display:"flex",gap:3}}>
              {cells.map((c,i)=>{
                const bg=c.type==="ok"?EV.sage:c.type==="outage"?EV.danger:EV.stone200;
                return <div key={i} style={{width:14,height:14,borderRadius:3,background:bg,cursor:c.type==="outage"?"pointer":"default",flexShrink:0}}
                  onMouseEnter={c.type==="outage"?e=>setTooltip({ds:c.ds,outages:c.outages,x:e.clientX,y:e.clientY}):undefined}
                  onMouseLeave={()=>setTooltip(null)} />;
              })}
            </div>
          </div>
        );
      })}
      <div style={{display:"flex",gap:16,marginTop:12}}>
        {[[EV.sage,"Operational"],[EV.danger,"Outage"],[EV.stone200,"Outside window"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:EV.fgSecondary}}>
            <div style={{width:10,height:10,borderRadius:2,background:c,flexShrink:0}} />{l}
          </div>
        ))}
      </div>
      {tooltip&&(
        <div style={{position:"fixed",left:tooltip.x+10,top:tooltip.y+8,background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:10,padding:"10px 13px",fontSize:12,color:EV.fg,zIndex:9999,maxWidth:260,boxShadow:EV.shadowMd,pointerEvents:"none"}}>
          <div style={{fontSize:11,color:EV.fgSecondary,marginBottom:8,fontWeight:600}}>{fmtD(tooltip.ds)}</div>
          {tooltip.outages.map((o,i)=>(
            <div key={i} style={{marginBottom:i<tooltip.outages.length-1?8:0,paddingBottom:i<tooltip.outages.length-1?8:0,borderBottom:i<tooltip.outages.length-1?`0.5px solid ${EV.stone200}`:"none"}}>
              <div style={{fontWeight:600,fontSize:11,marginBottom:2}}>{o.appliance_name}</div>
              <div style={{color:EV.danger,fontSize:11,marginBottom:2}}>{o.root_cause}</div>
              <div style={{color:EV.fgSecondary,fontSize:11}}>Duration: {fmtM(o.minutes)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fleet Utilization ────────────────────────────────────────────────────────
const FLEET_DATA = [
  {name:"de3-pure-n109-01",hw:"FA-XL",util:1.0},{name:"de3-pure-n110-01",hw:"FA-XL",util:1.2},
  {name:"de3-pure-n111-01",hw:"FA-XL",util:0.3},{name:"de3-pure-n112-01",hw:"FA-XL",util:0.3},
  {name:"gf0-cleanrm-pure01",hw:"FA-C",util:0.2},{name:"gf0-cleanrm-pure02",hw:"FA-C",util:0.1},
  {name:"gf0-cleanrm-pure03",hw:"FA-C",util:0.1},{name:"gf0-nas01",hw:"FB-S",util:0.0},
  {name:"gf0-nas02",hw:"FB-S",util:0.0},{name:"gf0-pure-xl170-01",hw:"FA-XL",util:51.2},
  {name:"gf0-pure030-01",hw:"FA-X",util:1.8},{name:"gf0-pure030-02",hw:"FA-X",util:1.4},
  {name:"gf0-pure030-03",hw:"FA-X",util:1.9},{name:"gf0-pure030-04",hw:"FA-X",util:0.0},
  {name:"gf0-pure11-01a",hw:"FA-X",util:0.0},{name:"gf0-pure113-01",hw:"FA-X",util:0.0},
  {name:"gf0-pure113-02",hw:"FA-X",util:0.0},{name:"gf0-pure119-01",hw:"FA-X",util:36.4},
  {name:"gf0-pure119-02",hw:"FA-C",util:0.0},{name:"gf0-pure132-01",hw:"FA-C",util:3.4},
  {name:"gf0-pure155",hw:"FA-X",util:44.6},{name:"gf0-pure157-01",hw:"FA-X",util:14.2},
  {name:"gf0-pure157-02",hw:"FA-X",util:14.1},{name:"gf0-pure160",hw:"FA-XL",util:41.9},
  {name:"gf0-pure161",hw:"FA-XL",util:57.9},{name:"gf0-pure162",hw:"FA-XL",util:50.9},
  {name:"gf0-pure169-01",hw:"FA-XL",util:8.1},{name:"gf0-pure17",hw:"FA-X",util:0.6},
  {name:"gf0-pureaz101-01",hw:"FA-XL",util:29.8},{name:"gf0-pureaz101-02",hw:"FA-XL",util:31.4},
  {name:"gf0-pureaz101-03",hw:"FA-XL",util:40.9},{name:"gf0-pureaz101-04",hw:"FA-XL",util:48.8},
  {name:"gf0-pureaz205-02",hw:"FA-XL",util:11.8},{name:"gf0-pureaz205s-01",hw:"FA-XL",util:60.9},
  {name:"gf0-pureaz207-01",hw:"FA-XL",util:55.2},{name:"gf0-pureaz209-01",hw:"FA-XL",util:22.5},
  {name:"gf0-purefb001-01",hw:"FB",util:15.7},{name:"gf0-purefb010-01",hw:"FB",util:32.0},
  {name:"gf0-purefb021-01",hw:"FB",util:43.8},{name:"gf0-purefb023-01",hw:"FB",util:58.7},
  {name:"gf0-purefb024-01",hw:"FB",util:67.2},{name:"gf0-purelab-01",hw:"FA-X",util:7.5},
  {name:"gf0-purelab-02",hw:"FA-X",util:0.7},{name:"gf0-ucp13-pure01",hw:"FA-X",util:5.2},
  {name:"gf1-mip-c60-01",hw:"FA-C",util:51.7},{name:"gf1-mippure165-01",hw:"FA-XL",util:52.5},
  {name:"gf1-pure-xl170-01",hw:"FA-XL",util:71.9},{name:"gf1-pure110-01",hw:"FA-X",util:0.4},
  {name:"gf1-pure118-01",hw:"FA-X",util:0.0},{name:"gf1-pure118-02",hw:"FA-X",util:0.0},
  {name:"gf1-pure12-01",hw:"FA-X",util:33.8},{name:"gf1-pure12-02",hw:"FA-X",util:16.2},
  {name:"gf1-pure123-01",hw:"FA-X",util:46.6},{name:"gf1-pure123-02",hw:"FA-C",util:0.0},
  {name:"gf1-pure13-01",hw:"FA-X",util:0.7},{name:"gf1-pure134-01",hw:"FA-C",util:23.1},
  {name:"gf1-pure134-02",hw:"FA-C",util:5.5},{name:"gf1-pure156",hw:"FA-X",util:4.6},
  {name:"gf1-pure158-01",hw:"FA-X",util:70.2},{name:"gf1-pure158-02",hw:"FA-X",util:69.7},
  {name:"gf1-pure158-03",hw:"FA-X",util:69.8},{name:"gf1-pure158-04",hw:"FA-X",util:70.1},
  {name:"gf1-pure158-05",hw:"FA-X",util:70.6},{name:"gf1-pure158-06",hw:"FA-X",util:70.4},
  {name:"gf1-pure163",hw:"FA-XL",util:53.9},{name:"gf1-pure164",hw:"FA-XL",util:62.2},
  {name:"gf1-pure165",hw:"FA-XL",util:48.1},{name:"gf1-pureaz101-01",hw:"FA-XL",util:70.4},
  {name:"gf1-pureaz101-02",hw:"FA-XL",util:65.2},{name:"gf1-pureaz101-03",hw:"FA-XL",util:32.6},
  {name:"gf1-pureaz203-01",hw:"FA-XL",util:45.9},{name:"gf1-pureaz203-02",hw:"FA-XL",util:0.2},
  {name:"gf1-pureaz205-01",hw:"FA-XL",util:18.7},{name:"gf1-purefb040-01",hw:"FB",util:0.8},
  {name:"gf1-purefb041-01",hw:"FB",util:72.4},{name:"gf1-purefb042-01",hw:"FB",util:77.3},
  {name:"gf1-sae-purec60-01",hw:"FA-C",util:57.0},{name:"gf1-ucp11-pure01",hw:"FA-X",util:27.1},
  {name:"gf1-ucp11-pure02",hw:"FA-X",util:0.0},{name:"gf2-mip-c60-01",hw:"FA-C",util:51.7},
  {name:"gf2-mippure166-01",hw:"FA-XL",util:55.1},{name:"gf2-pure-xl170-01",hw:"FA-XL",util:63.9},
  {name:"gf2-pure108-01",hw:"FA-X",util:15.3},{name:"gf2-pure109-01",hw:"FA-X",util:3.3},
  {name:"gf2-pure124-01",hw:"FA-X",util:41.6},{name:"gf2-pure124-02",hw:"FA-C",util:0.0},
  {name:"gf2-pure136-01",hw:"FA-C",util:28.2},{name:"gf2-pure136-02",hw:"FA-C",util:17.6},
  {name:"gf2-pure14-01",hw:"FA-X",util:0.3},{name:"gf2-pure14-02",hw:"FA-X",util:0.0},
  {name:"gf2-pure15-01",hw:"FA-X",util:0.8},{name:"gf2-pure159-01",hw:"FA-X",util:70.7},
  {name:"gf2-pure159-02",hw:"FA-X",util:70.6},{name:"gf2-pure159-03",hw:"FA-X",util:70.1},
  {name:"gf2-pure159-04",hw:"FA-X",util:70.5},{name:"gf2-pure159-05",hw:"FA-X",util:70.1},
  {name:"gf2-pure159-06",hw:"FA-X",util:70.8},{name:"gf2-pure166",hw:"FA-XL",util:48.5},
  {name:"gf2-pure167",hw:"FA-XL",util:58.3},{name:"gf2-pure168",hw:"FA-XL",util:60.9},
  {name:"gf2-pure17",hw:"FA-X",util:38.7},{name:"gf2-pureaz101-01",hw:"FA-XL",util:59.2},
  {name:"gf2-pureaz101-02",hw:"FA-XL",util:46.6},{name:"gf2-pureaz101-03",hw:"FA-XL",util:24.7},
  {name:"gf2-pureaz203-01",hw:"FA-XL",util:30.8},{name:"gf2-pureaz205-01",hw:"FA-XL",util:30.7},
  {name:"gf2-pureaz205-02",hw:"FA-XL",util:0.1},{name:"gf2-purefb040-01",hw:"FB",util:0.3},
  {name:"gf2-purefb060-01",hw:"FB",util:73.6},{name:"gf2-purefb061-01",hw:"FB",util:68.4},
  {name:"gf2-sae-purec60-01",hw:"FA-C",util:57.4},{name:"gf2-ucp12-pure01",hw:"FA-X",util:1.3},
  {name:"gf2-ucp12-pure02",hw:"FA-X",util:0.0},{name:"p-cadc-pure01",hw:"FA-X",util:18.3},
  {name:"p-cadc-pure07",hw:"FA-X",util:28.2},{name:"p-cadc-pure08",hw:"FA-X",util:13.1},
  {name:"p-cadc-pure09",hw:"FA-X",util:18.4},{name:"p-cadc-pure10",hw:"FA-X",util:14.4},
  {name:"p-prdc-pure02",hw:"FA-X",util:49.0},{name:"p-prdc-pure03",hw:"FA-X",util:17.3},
  {name:"p-prdc-pure04",hw:"FA-X",util:38.3},{name:"p-prdc-pure05",hw:"FA-X",util:38.6},
  {name:"p-prdc-pure07",hw:"FA-X",util:23.8},{name:"p-prdc-pure08",hw:"FA-X",util:15.0},
  {name:"p-rich-pure09",hw:"FA-X",util:15.8},{name:"p-rich-pure10",hw:"FA-X",util:20.7},
  {name:"prdc-fb01",hw:"FB",util:3.6},
];

function utilColor(u) {
  if (u >= 80) return EV.danger;
  if (u >= 60) return EV.cinnamon;
  return EV.sage;
}

function FleetUtilization() {
  const [tooltip, setTooltip] = useState(null);

  // sort by util descending for the area-style view
  const sorted = [...FLEET_DATA].sort((a, b) => b.util - a.util);
  const avg = Math.round(FLEET_DATA.reduce((s, d) => s + d.util, 0) / FLEET_DATA.length * 10) / 10;
  const critical = FLEET_DATA.filter(d => d.util >= 80).length;
  const caution  = FLEET_DATA.filter(d => d.util >= 60 && d.util < 80).length;
  const healthy  = FLEET_DATA.filter(d => d.util < 60).length;

  const H = 120;       // chart height px
  const BAR_W = 6;     // bar width
  const GAP = 2;       // gap between bars
  const STEP = BAR_W + GAP;
  const W = sorted.length * STEP;

  return (
    <div>
      {/* summary stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Fleet avg utilization", value: `${avg}%`, accent: utilColor(avg) },
          { label: "Healthy  (<60%)",        value: healthy,   accent: EV.sage },
          { label: "Caution  (60–80%)",      value: caution,   accent: EV.cinnamon },
          { label: "Critical (>80%)",        value: critical,  accent: EV.danger },
        ].map(s => (
          <div key={s.label} style={{ background: EV.bgCard, border: `1px solid ${EV.stone200}`, borderRadius: EV.radius, padding: "8px 14px", flex: "1 1 100px", minWidth: 90 }}>
            <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* bar chart — scrollable if needed */}
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ position: "relative", width: W, height: H + 28, minWidth: "100%" }}>

          {/* threshold lines */}
          {[60, 80].map(thresh => {
            const y = H - (thresh / 100) * H;
            const isRed = thresh === 80;
            return (
              <div key={thresh} style={{
                position: "absolute", left: 0, right: 0, top: y,
                borderTop: `1px dashed ${isRed ? EV.danger : EV.cinnamon}`,
                opacity: 0.4, pointerEvents: "none",
              }}>
                <span style={{ position: "absolute", right: 2, top: -10, fontSize: 9, color: isRed ? EV.danger : EV.cinnamon, opacity: 0.9 }}>{thresh}%</span>
              </div>
            );
          })}

          {/* avg line */}
          {(() => {
            const y = H - (avg / 100) * H;
            return (
              <div style={{
                position: "absolute", left: 0, right: 0, top: y,
                borderTop: `1.5px solid ${EV.sageDark}`,
                opacity: 0.5, pointerEvents: "none",
              }}>
                <span style={{ position: "absolute", left: 2, top: -10, fontSize: 9, color: EV.sageDark }}>avg {avg}%</span>
              </div>
            );
          })()}

          {/* bars */}
          <svg width="100%" height={H} style={{ display: "block", overflow: "visible" }}>
            {sorted.map((d, i) => {
              const barH = Math.max(2, (d.util / 100) * H);
              const x = i * STEP;
              const y = H - barH;
              const color = utilColor(d.util);
              return (
                <g key={d.name}
                  onMouseEnter={e => setTooltip({ d, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: "pointer" }}>
                  {/* track */}
                  <rect x={x} y={0} width={BAR_W} height={H} rx={2} fill={EV.stone100} />
                  {/* fill */}
                  <rect x={x} y={y} width={BAR_W} height={barH} rx={2} fill={color} opacity={0.85} />
                </g>
              );
            })}
          </svg>

          {/* x-axis: hw type dots below each bar */}
          <div style={{ display: "flex", gap: GAP, marginTop: 4 }}>
            {sorted.map((d, i) => {
              const dotColor = HW_STYLE[d.hw]?.stroke || EV.stone;
              return (
                <div key={i} style={{ width: BAR_W, height: 4, borderRadius: 1, background: dotColor, flexShrink: 0, opacity: 0.7 }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* hw color key */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: EV.fgTertiary, alignSelf: "center" }}>HW key:</span>
        {Object.entries(HW_STYLE).map(([hw, cfg]) => (
          <div key={hw} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 4, borderRadius: 1, background: cfg.stroke }} />
            <span style={{ fontSize: 10, color: EV.fgSecondary }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x + 12, top: tooltip.y - 10,
          background: EV.bgCard, border: `1px solid ${EV.stone200}`,
          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: EV.fg,
          zIndex: 9999, boxShadow: EV.shadowMd, pointerEvents: "none", minWidth: 160,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: EV.orangeDark }}>{tooltip.d.name}</div>
          <div style={{ color: EV.fgSecondary, marginBottom: 2 }}>{HW_STYLE[tooltip.d.hw]?.label || tooltip.d.hw}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: utilColor(tooltip.d.util) }}>{tooltip.d.util}% utilized</div>
          <div style={{ fontSize: 10, color: EV.fgTertiary, marginTop: 3 }}>
            {tooltip.d.util >= 80 ? "Critical — above 80%" : tooltip.d.util >= 60 ? "Caution — 60–80%" : "Healthy — below 60%"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utilization Histogram ────────────────────────────────────────────────────
function UtilHistogram() {
  const [tooltip, setTooltip] = useState(null);

  const healthy  = FLEET_DATA.filter(d => d.util < 60).sort((a, b) => a.util - b.util);
  const caution  = FLEET_DATA.filter(d => d.util >= 60 && d.util < 80).sort((a, b) => a.util - b.util);
  const critical = FLEET_DATA.filter(d => d.util >= 80).sort((a, b) => a.util - b.util);

  const BLOCK = 10;  // block size px
  const GAP   = 2;   // gap between blocks
  const STEP  = BLOCK + GAP;

  const groups = [
    { label: "Healthy", sublabel: "< 60%",   items: healthy,  color: EV.sage,     bg: "#eaf3ee" },
    { label: "Caution", sublabel: "60–80%",  items: caution,  color: EV.cinnamon, bg: "#f7ece0" },
    { label: "Critical",sublabel: "> 80%",   items: critical, color: EV.danger,   bg: "#fce8ee" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        {groups.map(g => (
          <div key={g.label} style={{
            flex: "1 1 180px",
            background: g.bg,
            border: `1px solid ${EV.stone200}`,
            borderRadius: 10,
            padding: "12px 14px",
          }}>
            {/* group header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{g.items.length}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: EV.fg }}>{g.label}</span>
              <span style={{ fontSize: 10, color: EV.fgTertiary, marginLeft: "auto" }}>{g.sublabel}</span>
            </div>

            {/* block grid — each array = one block */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: GAP,
              minHeight: BLOCK,
            }}>
              {g.items.map((d, i) => (
                <div
                  key={d.name}
                  style={{
                    width: BLOCK,
                    height: BLOCK,
                    borderRadius: 2,
                    background: g.color,
                    opacity: 0.3 + (d.util / 100) * 0.7,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "opacity 0.1s, transform 0.1s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.3)";
                    setTooltip({ d, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    setTooltip(null);
                  }}
                />
              ))}
              {/* empty state */}
              {g.items.length === 0 && (
                <span style={{ fontSize: 11, color: EV.fgTertiary }}>None</span>
              )}
            </div>

            {/* hw breakdown mini-legend */}
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: "3px 8px" }}>
              {Object.entries(
                g.items.reduce((acc, d) => {
                  const k = HW_STYLE[d.hw]?.label || d.hw;
                  acc[k] = (acc[k] || 0) + 1;
                  return acc;
                }, {})
              ).map(([hw, count]) => (
                <span key={hw} style={{ fontSize: 9, color: g.color, fontWeight: 600 }}>
                  {hw} ×{count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x + 12, top: tooltip.y - 10,
          background: EV.bgCard, border: `1px solid ${EV.stone200}`,
          borderRadius: 8, padding: "8px 12px", fontSize: 11, color: EV.fg,
          zIndex: 9999, boxShadow: EV.shadowMd, pointerEvents: "none", minWidth: 150,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 3, color: EV.orangeDark }}>{tooltip.d.name}</div>
          <div style={{ color: EV.fgSecondary, marginBottom: 3 }}>{HW_STYLE[tooltip.d.hw]?.label || tooltip.d.hw}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: utilColor(tooltip.d.util) }}>{tooltip.d.util}%</div>
        </div>
      )}
    </div>
  );
}

// ─── Supporting charts ────────────────────────────────────────────────────────
function OutageBarChart() {
  const sorted=[...OUTAGES].sort((a,b)=>b.minutes-a.minutes);
  const maxMin=sorted[0].minutes;
  function fmtM(m){if(m<60)return`${Math.round(m)}m`;const h=Math.floor(m/60),r=Math.round(m%60);return r?`${h}h ${r}m`:`${h}h`;}
  return (
    <div>
      <div style={{marginBottom:12,fontSize:12,color:EV.fgSecondary}}>Duration per outage event</div>
      {sorted.map((o,i)=>(
        <div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
            <span style={{fontWeight:500,color:EV.fg}}>{o.appliance_name}</span>
            <span style={{color:EV.cinnamon}}>{fmtM(o.minutes)}</span>
          </div>
          <div style={{background:EV.stone100,borderRadius:4,height:8,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,background:o.minutes>200?EV.danger:o.minutes>60?EV.cinnamon:EV.sage,width:`${(o.minutes/maxMin)*100}%`}} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RootCauseChart() {
  const causes={};
  OUTAGES.forEach(o=>{const k=o.root_cause.split("–")[0].trim();if(!causes[k])causes[k]={count:0,minutes:0};causes[k].count++;causes[k].minutes+=o.minutes;});
  const entries=Object.entries(causes).sort((a,b)=>b[1].minutes-a[1].minutes);
  const colors=[EV.danger,EV.cinnamon,EV.sageDark,EV.sage];
  function fmtM(m){if(m<60)return`${Math.round(m)}m`;const h=Math.floor(m/60),r=Math.round(m%60);return r?`${h}h ${r}m`:`${h}h`;}
  return (
    <div>
      <div style={{marginBottom:12,fontSize:12,color:EV.fgSecondary}}>Outage minutes by root cause</div>
      {entries.map(([cause,data],i)=>{
        const total=entries.reduce((s,[,d])=>s+d.minutes,0);
        const pct=((data.minutes/total)*100).toFixed(0);
        return (
          <div key={cause} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:10,height:10,borderRadius:2,background:colors[i%colors.length],flexShrink:0}} />
            <div style={{flex:1,fontSize:11}}>
              <div style={{color:EV.fg,fontWeight:500}}>{cause}</div>
              <div style={{color:EV.fgSecondary}}>{data.count} event{data.count>1?"s":""} · {fmtM(data.minutes)}</div>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:colors[i%colors.length],minWidth:36,textAlign:"right"}}>{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

function OutageTable() {
  function fmtD(s){return new Date(s+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
  function fmtM(m){if(m<60)return`${Math.round(m)}m`;const h=Math.floor(m/60),r=Math.round(m%60);return r?`${h}h ${r}m`:`${h}h`;}
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${EV.stone200}`}}>
            {["Date","Appliance","Root Cause","Summary","Duration"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"6px 10px",color:EV.fgSecondary,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...OUTAGES].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((o,i)=>(
            <tr key={i} style={{borderBottom:`0.5px solid ${EV.stone200}`}}>
              <td style={{padding:"8px 10px",whiteSpace:"nowrap",color:EV.fgSecondary}}>{fmtD(o.date)}</td>
              <td style={{padding:"8px 10px",fontWeight:500,color:EV.fg,whiteSpace:"nowrap"}}>{o.appliance_name}</td>
              <td style={{padding:"8px 10px"}}>
                <span style={{background:EV.stone100,borderRadius:4,padding:"2px 6px",fontSize:10,color:EV.cinnamon,fontWeight:500}}>{o.root_cause}</span>
              </td>
              <td style={{padding:"8px 10px",color:EV.fgSecondary,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.summary}</td>
              <td style={{padding:"8px 10px",fontWeight:600,color:o.minutes>200?EV.danger:o.minutes>60?EV.cinnamon:EV.sageDark,whiteSpace:"nowrap"}}>{fmtM(o.minutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ title, subtitle, children, span=1 }) {
  return (
    <div style={{background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:12,padding:"20px 22px",gridColumn:`span ${span}`,boxShadow:EV.shadow}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:600,color:EV.fg}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:EV.fgSecondary,marginTop:2}}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{background:EV.bg,minHeight:"100vh",fontFamily:"'DM Sans','Inter',system-ui,sans-serif",padding:"28px 24px"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{marginBottom:24,display:"flex",alignItems:"baseline",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:EV.fg,margin:0}}>Uptime Dashboard</h1>
          <p style={{fontSize:13,color:EV.fgSecondary,margin:"4px 0 0"}}>{ORG.name} · Past 12 months</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:EV.bgSurface,borderRadius:EV.radius,padding:"6px 12px",fontSize:12}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:EV.sage}} />
          <span style={{color:EV.sageDark,fontWeight:600}}>{ORG.uptime}% uptime</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:16}}>
        <Panel title="Daily uptime heatmap" subtitle="Red = outage day · Hover for details" span={2}>
          <UptimeHeatmap />
        </Panel>
        <Panel title="Appliance topology" subtitle="Hexagon = hardware type · Dot = subscription tier · ! = outage on record · Hover any node for details" span={2}>
          <ClusterView />
        </Panel>
        <Panel title="Array fleet utilization" subtitle="127 appliances · sorted by utilization · hover for details · <60% healthy · 60–80% caution · >80% critical" span={2}>
          <FleetUtilization />
        </Panel>
        <Panel title="Utilization distribution" subtitle="Each block = one array · opacity reflects exact usage level · hover for name" span={2}>
          <UtilHistogram />
        </Panel>
        <Panel title="Outage duration" subtitle="Sorted by impact">
          <OutageBarChart />
        </Panel>
        <Panel title="Root cause breakdown" subtitle="By total downtime minutes">
          <RootCauseChart />
        </Panel>
        <Panel title="Outage log" subtitle="All events · Most recent first" span={2}>
          <OutageTable />
        </Panel>
      </div>
    </div>
  );
}
