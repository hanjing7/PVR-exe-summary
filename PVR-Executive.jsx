import { useState, useCallback, useEffect } from "react";

// ─── Everpure tokens ─────────────────────────────────────────────────────────
const EV = {
  bg: "#fff5e3", bgCard: "#fffdf9", bgSurface: "#f0ece5", bgInput: "#efede8",
  fg: "#2d2a27", fgSecondary: "#73716f", fgTertiary: "#73716f",
  orange: "#ff7023", orangeDark: "#d55d1d",
  stone: "#d0c8ba", stone200: "#e7e3dc", stone100: "#efede8",
  sage: "#8fa596", sageDark: "#5a6359", cinnamon: "#bd673d", danger: "#da4d72",
  radius: "8px", shadow: "0 2px 8px rgba(45,42,39,0.08)", shadowMd: "0 4px 16px rgba(45,42,39,0.10)",
};

// ─── Data ────────────────────────────────────────────────────────────────────
const ORG = { name: "PNC Financial Services Group", uptime: 99.9997 };

const OUTAGES = [
  { appliance_id: "579d7a17",     appliance_name: "gf1-purefb041-01", date: "2025-04-24", root_cause: "SW – Configuration",    summary: "CH4 went down while awaiting FB11 replacement",                    minutes: 15 },
  { appliance_id: "9ae6638f-feb", appliance_name: "gf0-purefb024-01", date: "2023-02-10", root_cause: "SW – Purity / Firmware", summary: "FlashRecovery outage – FPGA causing CH6 to exceed N-2",             minutes: 60 },
  { appliance_id: "1014397",      appliance_name: "gf2-pureaz101-03", date: "2025-11-07", root_cause: "Human – Partner",        summary: "CT0 offline – wrong cables pulled during controller replacement",   minutes: 106.25 },
  { appliance_id: "a5f5bf2d",     appliance_name: "gf2-purefb061-01", date: "2025-05-29", root_cause: "SW – Purity / Firmware", summary: "Upgrade failed – congo-up etcd conversion issue",                  minutes: 145 },
  { appliance_id: "9ae6638f-jan", appliance_name: "gf0-purefb024-01", date: "2023-01-18", root_cause: "SW – Purity / Firmware", summary: "No authorities running on all blades – CH6-FM2 failed boot drive", minutes: 1231 },
];
const OUTAGE_MAP = {};
OUTAGES.forEach(o => { OUTAGE_MAP[o.appliance_id] = o; });

const SITES = [
  {
    site: "Pittsburgh, PA", abbr: "PIT", address: "35 Summit Park Dr",
    lat: 40.44, lng: -79.99,
    appliances: [
      { id: "A01", name: "gf0-pure-xl170-01",  hw: "FA-XL", sub: "EG//Forever",    status: "caution" },
      { id: "A02", name: "gf0-cleanrm-pure01",  hw: "FA-C",  sub: "EG//Forever",    status: "caution" },
      { id: "A03", name: "p-prdc-pure05",        hw: "FA-X",  sub: "EG//Forever",    status: "caution" },
      { id: "A04", name: "gf0-pure119-01",       hw: "FA-X",  sub: "EG//Forever",    status: "caution" },
      { id: "A05", name: "gf0-pure161",          hw: "FA-XL", sub: "Standard",       status: "caution" },
      { id: "A06", name: "gf0-purelab-01",       hw: "FA-X",  sub: "EG//Forever",    status: "caution" },
      { id: "A07", name: "gf0-ucp13-pure01",     hw: "FA-X",  sub: "EG//Forever",    status: "caution" },
      { id: "A08", name: "p-prdc-pure02",        hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "A09", name: "gf0-nas02",            hw: "FB-S",  sub: "EG//Foundation", status: "caution" },
      { id: "A10", name: "gf0-pureaz101-04",     hw: "FA-XL", sub: "EG//Forever",    status: "caution" },
      { id: "A11", name: "p-prdc-pure03",        hw: "FA-X",  sub: "EG//Forever",    status: "caution" },
      { id: "579d7a17",     name: "gf1-purefb041-01", hw: "FB", sub: "EG//Forever",    status: "caution" },
      { id: "9ae6638f-jan", name: "gf0-purefb024-01", hw: "FB", sub: "EG//Foundation", status: "critical" },
      { id: "A14", name: "gf0-pure-c60-01",     hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "A15", name: "gf0-pure-c60-02",     hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "A16", name: "gf0-nas01",            hw: "FB",    sub: "EG//Foundation", status: "ok" },
      { id: "A17", name: "gf0-xl170-02",         hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "A18", name: "gf0-xl170-03",         hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "A19", name: "gf0-x90-01",           hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "A20", name: "gf0-x90-02",           hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
    ],
  },
  {
    site: "Sandston, VA", abbr: "SAN", address: "6000 Technology Blvd",
    lat: 37.52, lng: -77.31,
    appliances: [
      { id: "B01", name: "de3-pure-n110-01",  hw: "FA-XL", sub: "EG//Forever",    status: "caution" },
      { id: "B02", name: "gf1-pureaz203-02",  hw: "FA-XL", sub: "EG//Forever",    status: "caution" },
      { id: "B03", name: "gf1-pureaz205-01",  hw: "FA-XL", sub: "EG//Forever",    status: "caution" },
      { id: "1014397",  name: "gf2-pureaz101-03", hw: "FA-XL", sub: "EG//Forever", status: "critical" },
      { id: "a5f5bf2d", name: "gf2-purefb061-01", hw: "FB-S",  sub: "EG//Forever", status: "critical" },
      { id: "B06", name: "gf1-xl170-01",      hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "B07", name: "gf1-xl170-02",      hw: "FA-XL", sub: "EG//Forever",    status: "ok" },
      { id: "B08", name: "gf1-x90-01",        hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B09", name: "gf1-x90-02",        hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B10", name: "gf1-x90-03",        hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B11", name: "gf1-x90-04",        hw: "FA-X",  sub: "EG//Forever",    status: "ok" },
      { id: "B12", name: "gf1-c60-01",        hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "B13", name: "gf1-c60-02",        hw: "FA-C",  sub: "EG//Forever",    status: "ok" },
      { id: "B14", name: "gf1-nas01",         hw: "FB",    sub: "EG//Foundation",  status: "ok" },
      { id: "B15", name: "gf1-nas02",         hw: "FB",    sub: "EG//Foundation",  status: "ok" },
    ],
  },
  {
    site: "Ashburn, VA", abbr: "ASH", address: "3 colocation facilities",
    lat: 39.04, lng: -77.48,
    appliances: [
      { id: "C01", name: "gf2-xl170-01", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "C02", name: "gf2-xl170-02", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "C03", name: "gf2-xl170-03", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "C04", name: "gf2-x90-01",   hw: "FA-X",  sub: "EG//Forever",   status: "ok" },
      { id: "C05", name: "gf2-x90-02",   hw: "FA-X",  sub: "EG//Forever",   status: "ok" },
      { id: "C06", name: "gf2-x90-03",   hw: "FA-X",  sub: "EG//Forever",   status: "ok" },
      { id: "C07", name: "gf2-x90-04",   hw: "FA-X",  sub: "EG//Forever",   status: "ok" },
      { id: "C08", name: "gf2-c60-01",   hw: "FA-C",  sub: "EG//Forever",   status: "ok" },
      { id: "C09", name: "gf2-c60-02",   hw: "FA-C",  sub: "EG//Forever",   status: "ok" },
      { id: "C10", name: "gf2-c60-03",   hw: "FA-C",  sub: "EG//Forever",   status: "ok" },
      { id: "C11", name: "gf2-nas01",    hw: "FB",    sub: "EG//Foundation", status: "ok" },
      { id: "C12", name: "gf2-nas02",    hw: "FB",    sub: "EG//Foundation", status: "ok" },
    ],
  },
  {
    site: "Rogers, AR", abbr: "ROG", address: "1701 W Commerce Dr",
    lat: 36.33, lng: -94.12,
    appliances: [
      { id: "D01", name: "gf3-xl170-01", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "D02", name: "gf3-xl170-02", hw: "FA-XL", sub: "EG//Forever",   status: "ok" },
      { id: "D03", name: "gf3-nas01",    hw: "FB",    sub: "EG//Foundation", status: "ok" },
    ],
  },
];

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

const SUPPORT_DATA = {
  Proactive: {
    Closed: { count: 1622, bySev: {"1":40,"2":524,"3":931,"4":128}, byCat: {Hardware:642,Environmentals:595,Software:333,Upgrade:45,Dispatch:4,Administrative:2,Deployment:1} },
    Open:   { count: 5,    bySev: {"2":3,"4":1},                    byCat: {Hardware:2,Software:1,Upgrade:1} },
  },
  Reactive: {
    Closed: { count: 387,  bySev: {"2":57,"3":63,"4":268},          byCat: {Software:232,Hardware:121,Environmentals:26,Administrative:9} },
    Open:   { count: 5,    bySev: {"2":1,"3":1,"4":2},              byCat: {Software:2,Hardware:2} },
  },
};
const TOTAL_CASES = 2019; const PROACTIVE_N = 1627; const PROACTIVE_PCT = 80.6;
const SEV_COLOR = { "1":"#da4d72","2":"#ff7023","3":"#bd673d","4":"#8fa596" };
const SEV_LABEL = { "1":"Sev 1","2":"Sev 2","3":"Sev 3","4":"Sev 4" };
const CAT_COLOR = { Hardware:"#7a9ab8",Software:"#8fa596",Environmentals:"#bd673d",Upgrade:"#9a82b0",Administrative:"#9e9b98",Dispatch:"#d0c8ba",Deployment:"#c8cdd9" };

const SECURITY = {
  score:2.6,maxScore:5.0,totalAppliances:8,notPhoningHome:0,excluded:0,
  categories:{ compliance:{score:2,max:3}, operational:{score:0.6,max:2} },
  compliance:{
    basic:[
      {label:"Data at Rest Encryption",    status:"pass",count:null,detail:"All appliances are encrypted with DARE"},
      {label:"End-of-Life Purity version", status:"pass",count:null,detail:"No appliance is running End-of-life Purity version"},
      {label:"CVEs Critical & High",       status:"fail",count:4,   detail:"Review 4 appliances for critical or high CVEs"},
      {label:"Purity Optimizations",       status:"fail",count:4,   detail:"4 appliances need Purity optimizations"},
    ],
    advanced:[
      {label:"Access Control – Remote (LDAP, SAML, AD)",status:"warn",   count:5,detail:"5 appliances need remote access control review"},
      {label:"NTP Server – Configured and Synchronized", status:"warn",   count:8,detail:"8 appliances need NTP configuration"},
      {label:"Rapid Data Locking (RDL) Enabled",         status:"neutral",count:0,detail:"No appliances with RDL enabled"},
    ],
  },
  operational:[
    {label:"Password Hygiene",                status:"fail",count:8,   detail:"8 appliances have unsafe password configurations"},
    {label:"Public or Open Access to Buckets",status:"fail",count:1,   detail:"1 appliance has open or public access to buckets"},
    {label:"Remote Assist Activity 8+ hrs",   status:"pass",count:null,detail:"No appliance with remote assist exceeding 8 hrs"},
    {label:"Critical Alerts",                 status:"fail",count:6,   detail:"6 appliances have active critical alerts"},
  ],
};

const NDU_BY_YEAR = [
  {year:"2019",sw:5,hw:0},{year:"2020",sw:3,hw:1},{year:"2021",sw:39,hw:20},
  {year:"2022",sw:64,hw:2},{year:"2023",sw:110,hw:18},{year:"2024",sw:143,hw:39},
  {year:"2025",sw:223,hw:11},{year:"2026",sw:33,hw:4},
];
const NDU_TOTALS = {
  sw:NDU_BY_YEAR.reduce((s,d)=>s+d.sw,0),
  hw:NDU_BY_YEAR.reduce((s,d)=>s+d.hw,0),
  total:NDU_BY_YEAR.reduce((s,d)=>s+d.sw+d.hw,0),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtM(m){if(m<60)return`${Math.round(m)}m`;const h=Math.floor(m/60),r=Math.round(m%60);return r?`${h}h ${r}m`:`${h}h`;}
function utilColor(u){if(u>=80)return EV.danger;if(u>=60)return EV.cinnamon;return EV.sage;}
function hexPts(cx,cy,r){return Array.from({length:6},(_,i)=>{const a=(Math.PI/180)*(60*i-30);return`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;}).join(" ");}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return <div onClick={onClose} style={{ position:"absolute",inset:0,minHeight:"100%",background:"rgba(45,42,39,0.5)",zIndex:10000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"32px 24px" }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:16,padding:"24px 28px",width:"100%",maxWidth:960,boxShadow:"0 16px 48px rgba(45,42,39,0.18)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
        <div>
          <div style={{ fontSize:15,fontWeight:700,color:EV.fg }}>{title}</div>
          {subtitle && <div style={{ fontSize:11,color:EV.fgSecondary,marginTop:3 }}>{subtitle}</div>}
        </div>
        <button onClick={onClose} style={{ background:"transparent",border:`1px solid ${EV.stone200}`,borderRadius:6,padding:"4px 12px",fontSize:12,color:EV.fgSecondary,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginLeft:16 }}>✕ close</button>
      </div>
      {children}
    </div>
  </div>;
}

// ─── DETAIL COMPONENTS (reused in modals) ────────────────────────────────────

function UptimeHeatmapDetail() {
  const [tooltip, setTooltip] = useState(null);
  const today = new Date(); today.setHours(0,0,0,0);
  const startDate = new Date(today); startDate.setFullYear(startDate.getFullYear()-1); startDate.setDate(1);
  const outageMap = {};
  OUTAGES.forEach(o => { if (!outageMap[o.date]) outageMap[o.date] = []; outageMap[o.date].push(o); });
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months = []; const cur = new Date(startDate);
  while (cur <= today) { months.push(new Date(cur.getFullYear(), cur.getMonth(), 1)); cur.setMonth(cur.getMonth()+1); }
  function toDS(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function fmtD(s) { return new Date(s+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }
  const totalMin = OUTAGES.reduce((s,o) => s+o.minutes, 0);

  return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        {[{label:"Array Uptime",value:`${ORG.uptime}%`,accent:EV.sageDark},{label:"Total Outage Time",value:fmtM(totalMin),accent:EV.danger},{label:"Outage Events",value:OUTAGES.length,accent:EV.cinnamon}].map(s => (
          <div key={s.label} style={{background:EV.bgSurface,border:`1px solid ${EV.stone200}`,borderRadius:EV.radius,padding:"10px 16px",flex:"1 1 110px"}}>
            <div style={{fontSize:11,color:EV.fgSecondary,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:20,fontWeight:600,color:s.accent}}>{s.value}</div>
          </div>
        ))}
      </div>
      {months.map(ms => {
        const me = new Date(ms.getFullYear(), ms.getMonth()+1, 0);
        const cells = [];
        for (let d = 1; d <= me.getDate(); d++) {
          const cd = new Date(ms.getFullYear(), ms.getMonth(), d);
          const ds = toDS(cd);
          if (cd > today || cd < startDate) cells.push({type:"future"});
          else if (outageMap[ds]) cells.push({type:"outage", ds, outages:outageMap[ds]});
          else cells.push({type:"ok"});
        }
        return (
          <div key={toDS(ms)} style={{display:"flex",alignItems:"center",marginBottom:3}}>
            <div style={{width:32,fontSize:10,color:EV.fgSecondary,textAlign:"right",paddingRight:6,flexShrink:0}}>{MONTHS[ms.getMonth()]}</div>
            <div style={{display:"flex",gap:3}}>
              {cells.map((c,i) => {
                const bg = c.type === "ok" ? EV.sage : c.type === "outage" ? EV.danger : EV.stone200;
                const handleEnter = c.type === "outage" ? () => setTooltip(c) : undefined;
                return <div key={i} style={{width:14,height:14,borderRadius:3,background:bg,cursor:c.type==="outage"?"pointer":"default",flexShrink:0}} onMouseEnter={handleEnter} onMouseLeave={() => setTooltip(null)} />;
              })}
            </div>
          </div>
        );
      })}
      <div style={{display:"flex",gap:16,marginTop:12}}>
        {[[EV.sage,"Operational"],[EV.danger,"Outage"],[EV.stone200,"Outside window"]].map(([c,l]) => (
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:EV.fgSecondary}}>
            <div style={{width:10,height:10,borderRadius:2,background:c}}/>{l}
          </div>
        ))}
      </div>
      {tooltip && (
        <div style={{background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:10,padding:"10px 13px",fontSize:12,color:EV.fg,marginTop:12,maxWidth:260,boxShadow:EV.shadowMd}}>
          <div style={{fontSize:11,color:EV.fgSecondary,marginBottom:8,fontWeight:600}}>{fmtD(tooltip.ds)}</div>
          {tooltip.outages.map((o,i) => (
            <div key={i} style={{marginBottom:i<tooltip.outages.length-1?8:0}}>
              <div style={{fontWeight:600,fontSize:11}}>{o.appliance_name}</div>
              <div style={{color:EV.danger,fontSize:11}}>{o.root_cause}</div>
              <div style={{color:EV.fgSecondary,fontSize:11}}>Duration: {fmtM(o.minutes)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SvgDefs() {
  return (
    <defs>
      <pattern id="p-fa-xl" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="rgba(58,84,71,0.16)" strokeWidth="1.4"/></pattern>
      <pattern id="p-fa-x" patternUnits="userSpaceOnUse" width="7" height="7"><circle cx="3.5" cy="3.5" r="1.1" fill="rgba(45,74,94,0.18)"/></pattern>
      <pattern id="p-fa-c" patternUnits="userSpaceOnUse" width="7" height="7"><path d="M7,0 L0,0 0,7" fill="none" stroke="rgba(94,74,45,0.16)" strokeWidth="0.8"/></pattern>
      <pattern id="p-fb-s" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(30,74,85,0.16)" strokeWidth="1.4"/><line x1="4" y1="0" x2="4" y2="8" stroke="rgba(30,74,85,0.09)" strokeWidth="0.7"/></pattern>
      <pattern id="p-fb" patternUnits="userSpaceOnUse" width="9" height="9"><path d="M0,5 Q2.25,2.5 4.5,5 Q6.75,7.5 9,5" fill="none" stroke="rgba(53,52,106,0.16)" strokeWidth="0.8"/></pattern>
    </defs>
  );
}

function HexNode({app,cx,cy,r,onEnter,onLeave,isHovered}){
  const hw=HW_STYLE[app.hw]||HW_STYLE["FA-X"];const ov=STATUS_OVERRIDE[app.status];
  const fill=ov?ov.fill:hw.fill;const stroke=ov?ov.stroke:hw.stroke;const textFill=ov?ov.textFill:hw.textFill;
  const hasOutage=!!OUTAGE_MAP[app.id];const rr=isHovered?r*1.18:r;const pts=hexPts(cx,cy,rr);
  const sub=SUB_DOT[app.sub]||SUB_DOT["Standard"];
  return <g style={{cursor:"pointer"}} onMouseEnter={e=>onEnter(app,e)} onMouseLeave={onLeave}>
      {isHovered&&<polygon points={hexPts(cx,cy,rr+5)} fill="none" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.25"/>}
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={isHovered?2:1.2}/>
      {app.status!=="critical"&&<polygon points={pts} fill={`url(#${hw.patternId})`}/>}
      <text x={cx} y={cy-1} textAnchor="middle" fontSize="7" fontWeight="700" fill={textFill} style={{userSelect:"none",pointerEvents:"none"}}>{hw.label}</text>
      <text x={cx} y={cy+8} textAnchor="middle" fontSize="5.5" fontWeight="500" fill={sub.color} style={{userSelect:"none",pointerEvents:"none"}} opacity={0.9}>{app.sub==="EG//Forever"?"EG∞":app.sub==="EG//Foundation"?"EG/F":"STD"}</text>
      {hasOutage&&<g><circle cx={cx-rr*0.52} cy={cy-rr*0.58} r={5.5} fill={app.status==="critical"?"#9b2040":EV.orange} stroke={EV.bgCard} strokeWidth={1.5}/><text x={cx-rr*0.52} y={cy-rr*0.58+3.5} textAnchor="middle" fontSize="8" fontWeight="800" fill="white" style={{pointerEvents:"none"}}>!</text></g>}
    </g>;
}

function TopologyDetail() {
  const [hovered,setHovered]=useState(null);const [pos,setPos]=useState(null);const [filter,setFilter]=useState("all");
  const handleEnter=useCallback((app,e)=>{setHovered(app);setPos({x:e.clientX,y:e.clientY});},[]);
  const handleLeave=useCallback(()=>{setHovered(null);setPos(null);},[]);
  const hwFilters=["all","FA-XL","FA-X","FA-C","FB-S","FB"];const statusFilters=["critical","caution"];
  const filteredSites=SITES.map(s=>({...s,appliances:s.appliances.filter(a=>{if(filter==="all")return true;if(hwFilters.includes(filter))return a.hw===filter;return a.status===filter;})})).filter(s=>s.appliances.length>0);
  const outage=hovered?OUTAGE_MAP[hovered.id]:null;const sub=hovered?(SUB_DOT[hovered.sub]||SUB_DOT["Standard"]):null;const hw=hovered?(HW_STYLE[hovered.hw]||HW_STYLE["FA-X"]):null;
  return <div style={{position:"relative"}}>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,color:EV.fgSecondary}}>Filter:</span>
        {[...hwFilters,...statusFilters].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"2px 10px",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500,border:`1px solid ${filter===f?EV.orangeDark:EV.stone200}`,background:filter===f?EV.orangeDark:"transparent",color:filter===f?"#fff5e3":EV.fgSecondary}}>{f}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
        {filteredSites.map(s=>{
          const apps=s.appliances;const R=20;const colW=R*Math.sqrt(3)+4;const rowH=R*1.5+3;const cols=Math.ceil(Math.sqrt(apps.length*1.5));
          const positions=apps.map((_,idx)=>{const col=idx%cols;const row=Math.floor(idx/cols);const offsetX=(row%2===1)?colW*0.5:0;return{cx:col*colW+offsetX+R+6,cy:row*rowH+R+6};});
          const svgW=cols*colW+R*0.6+12;const svgH=Math.ceil(apps.length/cols)*rowH+R*0.5+12;
          const critN=apps.filter(a=>a.status==="critical").length;const cauN=apps.filter(a=>a.status==="caution").length;
          return <div key={s.site} style={{background:EV.bgSurface,border:`1px solid ${critN>0?"#f0c4cc":EV.stone200}`,borderRadius:12,padding:"12px 14px",display:"inline-flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:12,fontWeight:600,color:EV.fg}}>{s.site}</span>
                <div style={{display:"flex",gap:6}}>
                  {critN>0&&<span style={{fontSize:10,background:"#fce8ee",color:EV.danger,borderRadius:20,padding:"1px 7px",fontWeight:600}}>{critN} down</span>}
                  {cauN>0&&<span style={{fontSize:10,background:"#f7ece0",color:EV.cinnamon,borderRadius:20,padding:"1px 7px",fontWeight:500}}>{cauN} caution</span>}
                  <span style={{fontSize:10,color:EV.fgSecondary}}>{apps.length} total</span>
                </div>
              </div>
              <svg width={svgW} height={svgH}><SvgDefs/>{apps.map((app,idx)=><HexNode key={app.id} app={app} cx={positions[idx].cx} cy={positions[idx].cy} r={R} isHovered={hovered?.id===app.id} onEnter={handleEnter} onLeave={handleLeave}/>)}</svg>
            </div>;
        })}
      </div>
      {hovered&&<div style={{marginTop:12,background:EV.bgCard,border:`1px solid ${EV.stone200}`,borderRadius:10,padding:"12px 14px",fontSize:12,color:EV.fg,maxWidth:270,boxShadow:EV.shadowMd}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:EV.orangeDark}}>{hovered.name}</div>
        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"4px 10px",fontSize:11}}>
          <span style={{color:EV.fgSecondary}}>Hardware</span><span style={{fontWeight:600}}>{hw?.label}</span>
          <span style={{color:EV.fgSecondary}}>Subscription</span><span>{sub?.label}</span>
          <span style={{color:EV.fgSecondary}}>Status</span><span style={{fontWeight:600,color:hovered.status==="critical"?EV.danger:hovered.status==="caution"?EV.cinnamon:EV.sageDark}}>{hovered.status}</span>
        </div>
        {outage&&<div style={{paddingTop:8,borderTop:`0.5px solid ${EV.stone200}`,marginTop:8}}>
          <div style={{color:EV.danger,fontWeight:700,fontSize:11,marginBottom:4}}>⚠ Outage on record</div>
          <div style={{fontSize:11,color:EV.fgSecondary}}>{outage.root_cause} · {outage.date}</div>
          <div style={{fontSize:12,fontWeight:700,color:EV.cinnamon,marginTop:2}}>{fmtM(outage.minutes)} downtime</div>
        </div>}
      </div>}
    </div>;
}

function FleetDetail() {
  const [tooltip, setTooltip] = useState(null);
  const sorted = [...FLEET_DATA].sort((a,b) => b.util - a.util);
  const avg = Math.round(FLEET_DATA.reduce((s,d) => s + d.util, 0) / FLEET_DATA.length * 10) / 10;
  const critical = FLEET_DATA.filter(d => d.util >= 80).length;
  const caution = FLEET_DATA.filter(d => d.util >= 60 && d.util < 80).length;
  const healthy = FLEET_DATA.filter(d => d.util < 60).length;
  const H = 120; const BAR_W = 6; const GAP = 2; const STEP = BAR_W + GAP;
  const healthyGrp = FLEET_DATA.filter(d => d.util < 60).sort((a,b) => a.util - b.util);
  const cautionGrp = FLEET_DATA.filter(d => d.util >= 60 && d.util < 80).sort((a,b) => a.util - b.util);
  const criticalGrp = FLEET_DATA.filter(d => d.util >= 80).sort((a,b) => a.util - b.util);
  const BLOCK = 10; const BGAP = 2;
  const avgY = H - (avg / 100) * H;

  const summaryCards = [
    { label: "Fleet avg", value: `${avg}%`, accent: utilColor(avg) },
    { label: "Healthy <60%", value: healthy, accent: EV.sage },
    { label: "Caution 60–80%", value: caution, accent: EV.cinnamon },
    { label: "Critical >80%", value: critical, accent: EV.danger },
  ];

  const groups = [
    { label: "Healthy",  sublabel: "< 60%",  items: healthyGrp,  color: EV.sage,     bg: "#eaf3ee" },
    { label: "Caution",  sublabel: "60–80%", items: cautionGrp,  color: EV.cinnamon, bg: "#f7ece0" },
    { label: "Critical", sublabel: "> 80%",  items: criticalGrp, color: EV.danger,   bg: "#fce8ee" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: EV.bgSurface, border: `1px solid ${EV.stone200}`, borderRadius: EV.radius, padding: "8px 14px", flex: "1 1 90px", minWidth: 80 }}>
            <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ position: "relative", height: H + 28, minWidth: "100%" }}>
          {[60, 80].map(t => {
            const y = H - (t / 100) * H;
            const isR = t === 80;
            return (
              <div key={t} style={{ position: "absolute", left: 0, right: 0, top: y, borderTop: `1px dashed ${isR ? EV.danger : EV.cinnamon}`, opacity: 0.4, pointerEvents: "none" }}>
                <span style={{ position: "absolute", right: 2, top: -10, fontSize: 9, color: isR ? EV.danger : EV.cinnamon }}>{t}%</span>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: avgY, borderTop: `1.5px solid ${EV.sageDark}`, opacity: 0.5, pointerEvents: "none" }}>
            <span style={{ position: "absolute", left: 2, top: -10, fontSize: 9, color: EV.sageDark }}>avg {avg}%</span>
          </div>
          <svg width="100%" height={H} style={{ display: "block", overflow: "visible" }}>
            {sorted.map((d, i) => {
              const barH = Math.max(2, (d.util / 100) * H);
              const x = i * STEP;
              const y = H - barH;
              const color = utilColor(d.util);
              const handleEnter = e => setTooltip({ d, x: e.clientX, y: e.clientY });
              const handleLeave = () => setTooltip(null);
              return (
                <g key={d.name} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{ cursor: "pointer" }}>
                  <rect x={x} y={0} width={BAR_W} height={H} rx={2} fill={EV.stone100} />
                  <rect x={x} y={y} width={BAR_W} height={barH} rx={2} fill={color} opacity={0.85} />
                </g>
              );
            })}
          </svg>
          <div style={{ display: "flex", gap: GAP, marginTop: 4 }}>
            {sorted.map((d, i) => (
              <div key={i} style={{ width: BAR_W, height: 4, borderRadius: 1, background: HW_STYLE[d.hw]?.stroke || EV.stone, flexShrink: 0, opacity: 0.7 }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {groups.map(g => (
          <div key={g.label} style={{ flex: "1 1 160px", background: g.bg, border: `1px solid ${EV.stone200}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{g.items.length}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: EV.fg }}>{g.label}</span>
              <span style={{ fontSize: 10, color: EV.fgSecondary, marginLeft: "auto" }}>{g.sublabel}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: BGAP }}>
              {g.items.map((d, i) => {
                const onEnter = e => { e.currentTarget.style.transform = "scale(1.3)"; setTooltip({ d, x: e.clientX, y: e.clientY }); };
                const onLeave = e => { e.currentTarget.style.transform = "scale(1)"; setTooltip(null); };
                return (
                  <div key={d.name} style={{ width: BLOCK, height: BLOCK, borderRadius: 2, background: g.color, opacity: 0.3 + (d.util / 100) * 0.7, cursor: "pointer" }} onMouseEnter={onEnter} onMouseLeave={onLeave} />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tooltip && (
        <div style={{ marginTop: 10, background: EV.bgCard, border: `1px solid ${EV.stone200}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: EV.fg, boxShadow: EV.shadowMd, maxWidth: 200 }}>
          <div style={{ fontWeight: 700, marginBottom: 3, color: EV.orangeDark }}>{tooltip.d.name}</div>
          <div style={{ color: EV.fgSecondary, marginBottom: 2 }}>{HW_STYLE[tooltip.d.hw]?.label || tooltip.d.hw}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: utilColor(tooltip.d.util) }}>{tooltip.d.util}%</div>
        </div>
      )}
    </div>
  );
}

function SupportDetail() {
  const [tooltip, setTooltip] = useState(null);
  const [hovQ, setHovQ] = useState(null);
  const BLOCK = 7; const GAP = 1.5;
  const R = 52; const CX = 60; const CY = 60; const STROKE = 8;
  const circ = 2 * Math.PI * R;
  const proDash = (PROACTIVE_PCT / 100) * circ;

  function buildBlocks(data) {
    const b = [];
    ["1","2","3","4"].forEach(s => {
      const n = data.bySev[s] || 0;
      for (let i = 0; i < n; i++) b.push({ sev: s, color: SEV_COLOR[s] });
    });
    return b;
  }

  function BlockGrid({ blocks, quadKey }) {
    const isHov = hovQ === quadKey;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: GAP }} onMouseLeave={() => setTooltip(null)}>
        {blocks.map((b, i) => {
          const onEnter = e => {
            e.currentTarget.style.transform = "scale(1.4)";
            setTooltip({ sev: b.sev });
          };
          const onLeave = e => { e.currentTarget.style.transform = "scale(1)"; };
          return (
            <div key={i} style={{ width: BLOCK, height: BLOCK, borderRadius: 1.5, background: b.color, flexShrink: 0, opacity: isHov ? 0.95 : 0.75, cursor: "pointer" }} onMouseEnter={onEnter} onMouseLeave={onLeave} />
          );
        })}
      </div>
    );
  }

  const legendItems = [
    { c: EV.sageDark, l: "Proactive", v: "80.6%" },
    { c: EV.cinnamon, l: "Reactive", v: "19.4%" },
  ];

  const statCards = [
    { label: "Total",     value: TOTAL_CASES, accent: EV.fg },
    { label: "Proactive", value: PROACTIVE_N, accent: EV.sageDark },
    { label: "Open",      value: 10,          accent: EV.orange },
    { label: "Closed",    value: 2009,        accent: EV.fgSecondary },
  ];

  const quadrants = [
    { type: "Proactive", status: "Open",   data: SUPPORT_DATA.Proactive.Open,   bg: "#eef5f0", border: EV.sage },
    { type: "Proactive", status: "Closed", data: SUPPORT_DATA.Proactive.Closed, bg: "#f4f6f4", border: EV.stone200 },
    { type: "Reactive",  status: "Open",   data: SUPPORT_DATA.Reactive.Open,    bg: "#fdf3ec", border: EV.cinnamon },
    { type: "Reactive",  status: "Closed", data: SUPPORT_DATA.Reactive.Closed,  bg: "#faf8f5", border: EV.stone200 },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ background: EV.bgSurface, border: `1px solid ${EV.stone200}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <svg width={120} height={120}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.stone100} strokeWidth={STROKE} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.cinnamon} strokeWidth={STROKE} strokeDasharray={circ} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} opacity={0.35} />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.sageDark} strokeWidth={STROKE} strokeDasharray={`${proDash} ${circ - proDash}`} strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} />
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="16" fontWeight="700" fill={EV.sageDark}>{PROACTIVE_PCT}%</text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fill={EV.fgSecondary}>proactive</text>
          </svg>
          <div>
            {legendItems.map(m => (
              <div key={m.l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.c }} />
                <span style={{ fontSize: 12, color: EV.fgSecondary }}>{m.l}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: m.c, marginLeft: 4 }}>{m.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: EV.fgSecondary }}>{TOTAL_CASES.toLocaleString()} total cases</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: EV.bgSurface, border: `1px solid ${EV.stone200}`, borderRadius: EV.radius, padding: "10px 14px", flex: "1 1 70px" }}>
              <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.accent }}>{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, position: "relative", marginTop: 24 }}>
        <div style={{ position: "absolute", top: -18, left: "25%", fontSize: 10, fontWeight: 600, color: EV.orange, transform: "translateX(-50%)" }}>OPEN</div>
        <div style={{ position: "absolute", top: -18, right: "25%", fontSize: 10, fontWeight: 600, color: EV.fgSecondary, transform: "translateX(50%)" }}>CLOSED</div>
        {quadrants.map(q => {
          const key = `${q.type}-${q.status}`;
          const blocks = buildBlocks(q.data);
          const isOpen = q.status === "Open";
          const isPro = q.type === "Proactive";
          return (
            <div key={key} style={{ background: q.bg, border: `1px solid ${q.border}`, borderRadius: 8, padding: "12px 14px", minHeight: 100 }} onMouseEnter={() => setHovQ(key)} onMouseLeave={() => setHovQ(null)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isPro ? EV.sageDark : EV.cinnamon }}>{q.type} · {q.status}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: isOpen ? EV.orange : EV.fgSecondary }}>{q.data.count}</span>
              </div>
              <BlockGrid blocks={blocks} quadKey={key} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 6px", marginTop: 8 }}>
                {Object.entries(q.data.byCat).sort((a,b) => b[1] - a[1]).map(([cat, n]) => (
                  <span key={cat} style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: CAT_COLOR[cat] ? CAT_COLOR[cat] + "28" : EV.stone100, color: CAT_COLOR[cat] || EV.fgSecondary, border: `1px solid ${CAT_COLOR[cat] ? CAT_COLOR[cat] + "55" : EV.stone200}` }}>
                    {cat} {n}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: EV.fgSecondary, fontWeight: 600 }}>SEVERITY:</span>
        {["1","2","3","4"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: BLOCK, height: BLOCK, borderRadius: 1.5, background: SEV_COLOR[s] }} />
            <span style={{ fontSize: 10, color: EV.fgSecondary }}>{SEV_LABEL[s]}</span>
          </div>
        ))}
      </div>

      {tooltip && (
        <div style={{ marginTop: 10, background: EV.bgCard, border: `1px solid ${EV.stone200}`, borderRadius: 8, padding: "7px 11px", fontSize: 11, color: EV.fg, boxShadow: EV.shadowMd, display: "inline-block" }}>
          <div style={{ fontWeight: 700, color: SEV_COLOR[tooltip.sev] }}>{SEV_LABEL[tooltip.sev]}</div>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLE={pass:{bg:"#eef5f0",border:EV.sage,hex:EV.sageDark,icon:"✓"},fail:{bg:"#fce8ee",border:EV.danger,hex:EV.danger,icon:"!"},warn:{bg:"#f7f0e0",border:EV.cinnamon,hex:EV.cinnamon,icon:"!"},neutral:{bg:EV.stone100,border:EV.stone,hex:EV.fgSecondary,icon:"0"}};

function HexBadge({ count, status, size = 30 }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.neutral;
  const label = count !== null ? count : s.icon;
  return (
    <div style={{ width: size, height: size * 1.1, background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
      <span style={{ fontSize: size * 0.38, fontWeight: 800, color: s.hex, lineHeight: 1 }}>{label}</span>
    </div>
  );
}
function CatBar({ label, score, max, icon }) {
  const pct = score / max;
  const barColor = pct >= 0.7 ? EV.sageDark : pct >= 0.3 ? EV.cinnamon : EV.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `0.5px solid ${EV.stone200}` }}>
      <span style={{ fontSize: 13, color: EV.fgSecondary }}>{icon}</span>
      <span style={{ fontSize: 12, color: EV.fg, flex: 1 }}>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} style={{ width: 18, height: 5, borderRadius: 3, background: i < Math.round(score) ? barColor : EV.stone200 }} />
        ))}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: barColor, minWidth: 32, textAlign: "right" }}>{score}/{max}</span>
    </div>
  );
}
function RecRow({ item }) {
  const s = STATUS_STYLE[item.status] || STATUS_STYLE.neutral;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: `0.5px solid ${EV.stone200}` }}>
      <HexBadge count={item.count} status={item.status} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: EV.fg, marginBottom: 2 }}>{item.label}</div>
        <div style={{ fontSize: 11, color: item.status === "pass" ? EV.fgSecondary : s.hex }}>{item.detail}</div>
      </div>
    </div>
  );
}

function SecurityDetail() {
  const pct = SECURITY.score / SECURITY.maxScore;
  const scoreColor = pct >= 0.7 ? EV.sageDark : pct >= 0.4 ? EV.cinnamon : EV.danger;

  const summaryRows = [
    ["Scored appliances", SECURITY.totalAppliances],
    ["Not phoning home", SECURITY.notPhoningHome],
    ["Excluded", SECURITY.excluded],
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 24 }}>
      <div>
        <div style={{ position: "relative", width: 140, height: 156, margin: "0 auto" }}>
          <svg viewBox="0 0 140 160" width={140} height={156}>
            <path d="M70 4 L130 28 L130 90 C130 128 70 156 70 156 C70 156 10 128 10 90 L10 28 Z" fill={EV.bgSurface} stroke={EV.stone200} strokeWidth={1.5} />
            <clipPath id="sc"><path d="M70 4 L130 28 L130 90 C130 128 70 156 70 156 C70 156 10 128 10 90 L10 28 Z" /></clipPath>
            <rect x={0} y={160 - 160 * pct} width={140} height={160 * pct} fill={scoreColor} opacity={0.15} clipPath="url(#sc)" />
          </svg>
          <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{SECURITY.score}</div>
            <div style={{ fontSize: 11, color: EV.fgSecondary, marginTop: 2 }}>out of {SECURITY.maxScore}</div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <CatBar label="Compliance"  score={SECURITY.categories.compliance.score}  max={SECURITY.categories.compliance.max}  icon="⊙" />
          <CatBar label="Operational" score={SECURITY.categories.operational.score} max={SECURITY.categories.operational.max} icon="⚙" />
          {summaryRows.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: EV.fgSecondary, padding: "7px 0", borderBottom: `0.5px solid ${EV.stone200}` }}>
              <span>{l}</span>
              <span style={{ fontWeight: 600, color: EV.fg }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: EV.fg, marginBottom: 12 }}>⊙ Compliance</div>
        <div style={{ fontSize: 10, color: EV.fgSecondary, fontWeight: 600, marginBottom: 6 }}>BASIC</div>
        {SECURITY.compliance.basic.map(i => <RecRow key={i.label} item={i} />)}
        <div style={{ fontSize: 10, color: EV.fgSecondary, fontWeight: 600, marginTop: 14, marginBottom: 6 }}>ADVANCED</div>
        {SECURITY.compliance.advanced.map(i => <RecRow key={i.label} item={i} />)}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: EV.fg, marginBottom: 12 }}>⚙ Operational</div>
        {SECURITY.operational.map(i => <RecRow key={i.label} item={i} />)}
      </div>
    </div>
  );
}

function NDUDetail() {
  const [tooltip, setTooltip] = useState(null);
  const [hoverY, setHoverY] = useState(null);
  const maxT = Math.max(...NDU_BY_YEAR.map(d => d.sw + d.hw));
  const BAR_W = 48; const GAP = 12; const H = 160;
  const SW = EV.sage; const HW = EV.cinnamon;

  const summaryCards = [
    { label: "Total NDUs",       value: NDU_TOTALS.total,                accent: EV.fg,          bg: EV.bgSurface },
    { label: "Software (SwNDU)", value: NDU_TOTALS.sw,                   accent: EV.sageDark,    bg: "#eef5f0" },
    { label: "Hardware (HwNDU)", value: NDU_TOTALS.hw,                   accent: EV.cinnamon,    bg: "#f7ece0" },
    { label: "Since inception",  value: `${NDU_BY_YEAR.length} yrs`,     accent: EV.fgSecondary, bg: EV.bgSurface },
  ];

  const legend = [
    { c: SW, l: "Software NDU", v: NDU_TOTALS.sw },
    { c: HW, l: "Hardware NDU", v: NDU_TOTALS.hw },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${EV.stone200}`, borderRadius: EV.radius, padding: "8px 16px", flex: "1 1 90px" }}>
            <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ position: "relative", minWidth: "100%" }}>
          {[0.25, 0.5, 0.75, 1].map(p => {
            const y = H - H * p;
            const v = Math.round(maxT * p);
            return (
              <div key={p} style={{ position: "absolute", left: 0, right: 0, top: y, pointerEvents: "none" }}>
                <div style={{ borderTop: `0.5px dashed ${EV.stone200}`, position: "absolute", left: 0, right: 0 }} />
                <span style={{ position: "absolute", right: 0, top: -9, fontSize: 9, color: EV.fgSecondary }}>{v}</span>
              </div>
            );
          })}
          <svg width="100%" height={H + 28} style={{ display: "block", overflow: "visible" }}>
            {NDU_BY_YEAR.map((d, i) => {
              const x = i * (BAR_W + GAP);
              const swH = (d.sw / maxT) * H;
              const hwH = (d.hw / maxT) * H;
              const isHov = hoverY === d.year;
              const total = d.sw + d.hw;
              const onEnter = () => { setHoverY(d.year); setTooltip({ d }); };
              const onLeave = () => { setHoverY(null); setTooltip(null); };
              return (
                <g key={d.year} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: "pointer" }}>
                  <rect x={x} y={0} width={BAR_W} height={H} rx={4} fill={isHov ? EV.stone100 : "transparent"} />
                  {d.hw > 0 && <rect x={x} y={H - hwH} width={BAR_W} height={hwH} rx={4} fill={HW} opacity={isHov ? 1 : 0.8} />}
                  {d.sw > 0 && <rect x={x} y={H - hwH - swH} width={BAR_W} height={swH} rx={4} fill={SW} opacity={isHov ? 1 : 0.8} />}
                  {d.sw > 0 && d.hw > 0 && <rect x={x} y={H - hwH - 4} width={BAR_W} height={8} fill={SW} opacity={isHov ? 1 : 0.8} />}
                  <text x={x + BAR_W / 2} y={H - hwH - swH - 5} textAnchor="middle" fontSize="10" fontWeight="600" fill={EV.fgSecondary}>{total > 0 ? total : ""}</text>
                  <text x={x + BAR_W / 2} y={H + 16} textAnchor="middle" fontSize="11" fontWeight={isHov ? "700" : "400"} fill={isHov ? EV.fg : EV.fgSecondary}>{d.year}</text>
                  {d.year === "2026" && <text x={x + BAR_W / 2} y={H + 26} textAnchor="middle" fontSize="8" fill={EV.fgSecondary}>YTD</text>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        {legend.map(l => (
          <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.c }} />
            <span style={{ fontSize: 11, color: EV.fgSecondary }}>{l.l}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: EV.fg }}>{l.v}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: EV.fgSecondary, marginLeft: "auto" }}>2019 – 2026 · 2026 YTD</span>
      </div>

      {tooltip && (
        <div style={{ marginTop: 10, background: EV.bgCard, border: `1px solid ${EV.stone200}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: EV.fg, boxShadow: EV.shadowMd, display: "inline-block", minWidth: 140 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: EV.orangeDark, marginBottom: 6 }}>{tooltip.d.year}</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 10px", fontSize: 11 }}>
            <span style={{ color: EV.fgSecondary }}>SW</span><span style={{ fontWeight: 700, color: EV.sageDark }}>{tooltip.d.sw}</span>
            <span style={{ color: EV.fgSecondary }}>HW</span><span style={{ fontWeight: 700, color: EV.cinnamon }}>{tooltip.d.hw}</span>
            <span style={{ color: EV.fgSecondary }}>Total</span><span style={{ fontWeight: 700 }}>{tooltip.d.sw + tooltip.d.hw}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SVG US MAP (Everpure style) ─────────────────────────────────────────────
// Simple geographic projection of the 4 sites onto a fixed SVG viewport
const MAP_W = 520; const MAP_H = 280;
// lat/lng → x,y (simple equirectangular, tuned to CONUS bounds)
function project(lat, lng) {
  const minLng=-124, maxLng=-66, minLat=24, maxLat=50;
  const x = ((lng - minLng) / (maxLng - minLng)) * MAP_W;
  const y = MAP_H - ((lat - minLat) / (maxLat - minLat)) * MAP_H;
  return { x, y };
}

const SITE_META = SITES.map(s => {
  const apps = s.appliances;
  const fa = apps.filter(a => a.hw.startsWith("FA")).length;
  const fb = apps.filter(a => a.hw.startsWith("FB")).length;
  const pos = project(s.lat, s.lng);
  const critN = apps.filter(a => a.status === "critical").length;
  return { ...s, fa, fb, pos, critN };
});

// ─── Real US state boundaries ────────────────────────────────────────────────
// Loads GeoJSON from CDN once and caches it for all map instances
let US_STATES_CACHE = null;
let US_STATES_PROMISE = null;
let US_STATES_ERROR = null;

const GEOJSON_SOURCES = [
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
  "https://cdn.jsdelivr.net/gh/PublicaMundi/MappingAPI@master/data/geojson/us-states.json",
  "https://unpkg.com/us-atlas@3/states-10m.json",
];

async function tryFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

function loadUSStates() {
  if (US_STATES_CACHE) return Promise.resolve(US_STATES_CACHE);
  if (US_STATES_PROMISE) return US_STATES_PROMISE;
  US_STATES_PROMISE = (async () => {
    const errors = [];
    for (const url of GEOJSON_SOURCES) {
      try {
        const data = await tryFetch(url);
        // If the response is TopoJSON (has .type === "Topology"), skip it — we only handle GeoJSON
        if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
          US_STATES_CACHE = data;
          console.log("USMap: loaded from", url, "features:", data.features.length);
          return data;
        }
        errors.push(`${url} → not a FeatureCollection`);
      } catch (e) {
        errors.push(e.message);
      }
    }
    US_STATES_ERROR = errors.join(" | ");
    console.error("USMap: all sources failed:", US_STATES_ERROR);
    return null;
  })();
  return US_STATES_PROMISE;
}

// Project a GeoJSON polygon to SVG path using our equirectangular bounds
function geoToSvgPath(geojson, bounds) {
  const { minLng, maxLng, minLat, maxLat, width, height } = bounds;
  function proj(lng, lat) {
    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
    return [x, y];
  }
  function ringToPath(ring) {
    return ring.map(([lng, lat], i) => {
      const [x, y] = proj(lng, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join("") + "Z";
  }
  const paths = [];
  geojson.features.forEach(f => {
    const g = f.geometry;
    if (!g) return;
    if (g.type === "Polygon") {
      paths.push(g.coordinates.map(ringToPath).join(""));
    } else if (g.type === "MultiPolygon") {
      g.coordinates.forEach(poly => paths.push(poly.map(ringToPath).join("")));
    }
  });
  return paths;
}

function USMapBackground({ bounds }) {
  const [state, setState] = useState({ status: "loading", paths: null, err: null });
  useEffect(() => {
    let cancelled = false;
    loadUSStates().then(geo => {
      if (cancelled) return;
      if (geo) {
        try {
          const paths = geoToSvgPath(geo, bounds);
          setState({ status: "ready", paths, err: null });
        } catch (e) {
          setState({ status: "error", paths: null, err: e.message });
        }
      } else {
        setState({ status: "error", paths: null, err: US_STATES_ERROR || "unknown error" });
      }
    });
    return () => { cancelled = true; };
  }, [bounds.minLng, bounds.maxLng, bounds.minLat, bounds.maxLat, bounds.width, bounds.height]);

  return (
    <g>
      <rect x={0} y={0} width={bounds.width} height={bounds.height} fill="#e8e2d8"/>
      {state.status === "ready" && state.paths.map((d, i) => (
        <path key={i} d={d} fill="#ddd7cc" stroke={EV.stone200} strokeWidth={0.6} strokeLinejoin="round"/>
      ))}
      {state.status === "loading" && (
        <text x={bounds.width / 2} y={bounds.height / 2} textAnchor="middle" fontSize="11" fill={EV.fgSecondary} opacity="0.6">loading map…</text>
      )}
      {state.status === "error" && (
        <g>
          <text x={bounds.width / 2} y={bounds.height / 2 - 6} textAnchor="middle" fontSize="10" fill={EV.danger}>map load failed</text>
          <text x={bounds.width / 2} y={bounds.height / 2 + 8} textAnchor="middle" fontSize="8" fill={EV.fgSecondary}>check console</text>
        </g>
      )}
    </g>
  );
}

// Minimal CONUS path (simplified outline for clean rendering)
const CONUS = "M60,30 L80,20 L120,18 L160,22 L200,18 L240,16 L280,20 L310,18 L340,22 L370,28 L390,22 L410,28 L430,24 L450,30 L460,40 L470,55 L468,70 L480,80 L490,100 L488,120 L480,135 L470,150 L460,162 L445,170 L430,175 L410,178 L390,180 L370,178 L355,182 L340,190 L325,195 L310,198 L295,200 L280,202 L265,205 L250,208 L235,210 L220,208 L205,205 L190,202 L175,198 L158,195 L142,190 L128,185 L112,180 L96,175 L82,168 L70,158 L58,145 L50,130 L44,115 L42,98 L44,82 L48,66 L54,50 L60,38 Z";

function SiteMapTile() {
  const [hov, setHov] = useState(null);
  const totalApps = SITES.reduce((s, site) => s + site.appliances.length, 0);
  const maxCount = Math.max(...SITE_META.map(s => s.appliances.length));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: EV.fgSecondary }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: EV.sage }} />FlashArray
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: EV.fgSecondary }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: EV.sageDark }} />FlashBlade
        </div>
        <span style={{ fontSize: 11, color: EV.fgSecondary, marginLeft: 4 }}>Circle size = array count</span>
      </div>

      <div style={{ position: "relative", background: EV.bgSurface, borderRadius: 10, overflow: "hidden", border: `1px solid ${EV.stone200}` }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" style={{ display: "block" }}>
          {/* real US state boundaries */}
          <USMapBackground bounds={{ minLng: -124, maxLng: -66, minLat: 24, maxLat: 50, width: MAP_W, height: MAP_H }}/>

          {/* site circles */}
          {SITE_META.map(s => {
            const r = 14 + (s.appliances.length / maxCount) * 28;
            const isHov = hov === s.abbr;
            return (
              <g key={s.abbr} style={{ cursor: "pointer" }}
                onMouseEnter={() => setHov(s.abbr)}
                onMouseLeave={() => setHov(null)}>
                {/* FA outer ring */}
                <circle cx={s.pos.x} cy={s.pos.y} r={r} fill={EV.sage} fillOpacity={isHov ? 0.35 : 0.2} stroke={EV.sage} strokeWidth={isHov ? 2 : 1.2}/>
                {/* FB inner ring */}
                {s.fb > 0 && <circle cx={s.pos.x} cy={s.pos.y} r={r * 0.55} fill={EV.sageDark} fillOpacity={isHov ? 0.45 : 0.28} stroke={EV.sageDark} strokeWidth={1}/>}
                {/* critical indicator */}
                {s.critN > 0 && <circle cx={s.pos.x + r * 0.6} cy={s.pos.y - r * 0.6} r={5} fill={EV.danger} stroke={EV.bgCard} strokeWidth={1.5}/>}
                {/* center dot */}
                <circle cx={s.pos.x} cy={s.pos.y} r={3} fill={EV.bgCard} stroke={EV.sageDark} strokeWidth={1.5}/>
                {/* label */}
                <text x={s.pos.x} y={s.pos.y - r - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill={EV.fg}>{s.site}</text>
                <text x={s.pos.x} y={s.pos.y - r + 6} textAnchor="middle" fontSize="9" fill={EV.fgSecondary}>{s.appliances.length} arrays</text>
              </g>
            );
          })}
        </svg>

        {/* hover tooltip */}
        {hov && (() => {
          const s = SITE_META.find(x => x.abbr === hov);
          return (
            <div style={{ position: "absolute", bottom: 12, left: 12, background: EV.bgCard, border: `1px solid ${EV.stone200}`, borderRadius: 10, padding: "12px 16px", fontSize: 11, color: EV.fg, boxShadow: EV.shadowMd, minWidth: 180, pointerEvents: "none" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: EV.orangeDark, marginBottom: 6 }}>{s.site}</div>
              <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 8 }}>{s.address}</div>
              {[["Total arrays", s.appliances.length, EV.fg],["FlashArray", s.fa, EV.sage],["FlashBlade", s.fb, EV.sageDark],["Critical", s.critN, s.critN > 0 ? EV.danger : EV.fgSecondary]].map(([l,v,c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: EV.fgSecondary }}>{l}</span>
                  <span style={{ fontWeight: 700, color: c }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* site cards row */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {SITE_META.map(s => (
          <div key={s.abbr} style={{ flex: "1 1 100px", background: s.critN > 0 ? "#fce8ee" : EV.bgSurface, border: `1px solid ${s.critN > 0 ? "#f0c4cc" : EV.stone200}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: EV.fg, marginBottom: 2 }}>{s.abbr}</div>
            <div style={{ fontSize: 10, color: EV.fgSecondary, marginBottom: 8 }}>{s.site}</div>
            {[["Arrays", s.appliances.length, EV.fg],["FA", s.fa, EV.sage],["FB", s.fb, EV.sageDark]].map(([l,v,c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                <span style={{ color: EV.fgSecondary }}>{l}</span>
                <span style={{ fontWeight: 600, color: c }}>{v}</span>
              </div>
            ))}
            {s.critN > 0 && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: EV.danger }}>{s.critN} critical</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXEC SUMMARY TILES ───────────────────────────────────────────────────────

function MiniHeatmapStrip({ onHover, hovKey }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const outageMap = {};
  OUTAGES.forEach(o => { if (!outageMap[o.date]) outageMap[o.date] = []; outageMap[o.date].push(o); });
  const startDate = new Date(today); startDate.setFullYear(startDate.getFullYear()-1); startDate.setDate(1);
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months = []; const cur = new Date(startDate);
  while (cur <= today) { months.push(new Date(cur.getFullYear(), cur.getMonth(), 1)); cur.setMonth(cur.getMonth()+1); }
  function toDS(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  return (
    <div style={{ marginTop: 10 }}>
      {months.map(ms => {
        const me = new Date(ms.getFullYear(), ms.getMonth()+1, 0); const cells = [];
        for (let d = 1; d <= me.getDate(); d++) {
          const cd = new Date(ms.getFullYear(), ms.getMonth(), d); const ds = toDS(cd);
          if (cd > today || cd < startDate) cells.push({ type: "future", ds });
          else if (outageMap[ds]) cells.push({ type: "outage", ds, outages: outageMap[ds] });
          else cells.push({ type: "ok", ds });
        }
        return (
          <div key={toDS(ms)} style={{ display: "flex", alignItems: "center", marginBottom: 2, gap: 3 }}>
            <div style={{ width: 22, fontSize: 8, color: EV.fgSecondary, flexShrink: 0, textAlign: "right", paddingRight: 3 }}>{MONTHS[ms.getMonth()]}</div>
            <div style={{ display: "flex", gap: 1.5, flexWrap: "nowrap" }}>
              {cells.map((c, i) => {
                const isH = hovKey === c.ds && c.type !== "future";
                const onEnter = c.type === "outage" ? () => onHover && onHover(c) : undefined;
                const onLeave = c.type === "outage" ? () => onHover && onHover(null) : undefined;
                return (
                  <div key={i}
                    style={{ width: 8, height: 8, borderRadius: 1.5, background: c.type === "outage" ? EV.danger : c.type === "ok" ? EV.sage : EV.stone100, opacity: c.type === "ok" ? 0.6 : 1, flexShrink: 0, cursor: c.type === "outage" ? "pointer" : "default", transform: isH ? "scale(1.6)" : "scale(1)", transition: "transform 0.1s" }}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniMapPreview() {
  const [hovSite, setHovSite] = useState(null);
  // Zoomed viewport tight around the 4 sites
  const minLng = -97, maxLng = -74, minLat = 34, maxLat = 43;
  const W = 320; const H = 170;
  function proj(lat, lng) {
    return { x: ((lng - minLng) / (maxLng - minLng)) * W, y: H - ((lat - minLat) / (maxLat - minLat)) * H };
  }
  // Cropped CONUS outline mapped to the zoomed viewport
  const scaleLng = l => ((l - minLng) / (maxLng - minLng)) * W;
  const scaleLat = l => H - ((l - minLat) / (maxLat - minLat)) * H;
  const sites = SITE_META.map(s => ({ ...s, p: proj(s.lat, s.lng) }));
  const maxC = Math.max(...sites.map(s => s.appliances.length));
  const hov = hovSite ? sites.find(s => s.abbr === hovSite) : null;

  return <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${EV.stone200}`, position: "relative" }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* real US state boundaries — clipped to zoomed viewport */}
      <USMapBackground bounds={{ minLng, maxLng, minLat, maxLat, width: W, height: H }}/>
      {/* grid lines hint */}
      {[-95,-90,-85,-80,-75].map(lng => <line key={lng} x1={scaleLng(lng)} y1={0} x2={scaleLng(lng)} y2={H} stroke={EV.stone200} strokeWidth="0.5" strokeOpacity="0.4"/>)}
      {[36,38,40,42].map(lat => <line key={lat} x1={0} y1={scaleLat(lat)} x2={W} y2={scaleLat(lat)} stroke={EV.stone200} strokeWidth="0.5" strokeOpacity="0.4"/>)}
      {/* site circles */}
      {sites.map(s => {
        const r = 10 + (s.appliances.length / maxC) * 22;
        const isH = hovSite === s.abbr;
        return <g key={s.abbr} style={{ cursor: "pointer" }} onMouseEnter={() => setHovSite(s.abbr)} onMouseLeave={() => setHovSite(null)}>
          <circle cx={s.p.x} cy={s.p.y} r={r} fill={EV.sage} fillOpacity={isH ? 0.38 : 0.2} stroke={EV.sage} strokeWidth={isH ? 2 : 1.2}/>
          {s.fb > 0 && <circle cx={s.p.x} cy={s.p.y} r={r * 0.5} fill={EV.sageDark} fillOpacity={isH ? 0.5 : 0.3} stroke={EV.sageDark} strokeWidth={0.8}/>}
          {s.critN > 0 && <circle cx={s.p.x + r * 0.65} cy={s.p.y - r * 0.65} r={4} fill={EV.danger} stroke="#fff5e3" strokeWidth={1}/>}
          <circle cx={s.p.x} cy={s.p.y} r={2.5} fill="#fff5e3" stroke={EV.sageDark} strokeWidth={1.2}/>
          <text x={s.p.x} y={s.p.y - r - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill={EV.fg}>{s.abbr}</text>
          <text x={s.p.x} y={s.p.y - r + 6} textAnchor="middle" fontSize="7.5" fill={EV.fgSecondary}>{s.appliances.length}</text>
        </g>;
      })}
    </svg>
    {hov && <div style={{ position: "absolute", bottom: 8, left: 8, background: "#fff5e3", border: `1px solid ${EV.stone200}`, borderRadius: 8, padding: "8px 10px", fontSize: 11, color: EV.fg, boxShadow: EV.shadowMd, minWidth: 130, pointerEvents: "none" }}>
      <div style={{ fontWeight: 700, color: EV.orangeDark, marginBottom: 4 }}>{hov.site}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 10 }}>
        <span style={{ color: EV.fgSecondary }}>Arrays</span><span style={{ fontWeight: 700 }}>{hov.appliances.length}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 10 }}>
        <span style={{ color: EV.fgSecondary }}>FA / FB</span><span style={{ fontWeight: 700 }}>{hov.fa} / {hov.fb}</span>
      </div>
      {hov.critN > 0 && <div style={{ fontSize: 10, color: EV.danger, fontWeight: 700, marginTop: 3 }}>{hov.critN} critical</div>}
    </div>}
  </div>;
}

function MiniFleetBars({ onHover, hovName }) {
  const sorted = [...FLEET_DATA].sort((a,b) => b.util - a.util);
  const H = 130; const BAR_W = 4; const GAP = 1;
  const totalW = sorted.length * (BAR_W + GAP);
  return <div style={{ marginTop: 6, flex: 1, minHeight: 130 }}>
    <svg viewBox={`0 0 ${totalW} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block" }}>
      {sorted.map((d, i) => {
        const barH = Math.max(1, (d.util / 100) * H);
        const isH = hovName === d.name;
        return <rect key={d.name}
          x={i * (BAR_W + GAP)} y={H - barH} width={BAR_W} height={barH}
          fill={utilColor(d.util)} opacity={isH ? 1 : 0.78}
          style={{ cursor: "pointer" }}
          onMouseEnter={e => { e.stopPropagation(); onHover && onHover(d); }}
          onMouseLeave={e => { e.stopPropagation(); onHover && onHover(null); }}/>;
      })}
    </svg>
  </div>;
}

function MiniDonut({ size = 80 }) {
  const R = size * 0.38; const CX = size / 2; const CY = size / 2; const SW = size * 0.09;
  const circ = 2 * Math.PI * R;
  const dash = (PROACTIVE_PCT / 100) * circ;
  return <svg width={size} height={size} style={{ flexShrink: 0 }}>
    <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.stone100} strokeWidth={SW}/>
    <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.cinnamon} strokeWidth={SW} strokeDasharray={circ} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`} opacity={0.35}/>
    <circle cx={CX} cy={CY} r={R} fill="none" stroke={EV.sageDark} strokeWidth={SW} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`}/>
    <text x={CX} y={CY + 2} textAnchor="middle" fontSize={size * 0.13} fontWeight="700" fill={EV.sageDark}>{PROACTIVE_PCT}%</text>
    <text x={CX} y={CY + size * 0.17} textAnchor="middle" fontSize={size * 0.09} fill={EV.fgSecondary}>pro</text>
  </svg>;
}

function MiniShield({ size = 72 }) {
  const pct = SECURITY.score / SECURITY.maxScore;
  const color = pct >= 0.7 ? EV.sageDark : pct >= 0.4 ? EV.cinnamon : EV.danger;
  return <div style={{ position: "relative", width: size, height: size * 1.14, flexShrink: 0 }}>
    <svg viewBox="0 0 140 160" width={size} height={size * 1.14}>
      <path d="M70 4 L130 28 L130 90 C130 128 70 156 70 156 C70 156 10 128 10 90 L10 28 Z" fill={EV.bgSurface} stroke={EV.stone200} strokeWidth={2}/>
      <clipPath id="sc2"><path d="M70 4 L130 28 L130 90 C130 128 70 156 70 156 C70 156 10 128 10 90 L10 28 Z"/></clipPath>
      <rect x={0} y={160 - 160 * pct} width={140} height={160 * pct} fill={color} opacity={0.22} clipPath="url(#sc2)"/>
    </svg>
    <div style={{ position: "absolute", top: "36%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
      <div style={{ fontSize: size * 0.25, fontWeight: 800, color, lineHeight: 1 }}>{SECURITY.score}</div>
    </div>
  </div>;
}

function MiniNDUBars({ onHover, hovYear }) {
  const maxT = Math.max(...NDU_BY_YEAR.map(d => d.sw + d.hw));
  const H = 44; const BAR_W = 18; const GAP = 4;
  const totalW = NDU_BY_YEAR.length * (BAR_W + GAP);
  return <div style={{ marginTop: 4 }}>
    <svg viewBox={`0 0 ${totalW} ${H + 12}`} width="100%" style={{ display: "block", overflow: "visible", maxWidth: 180 }}>
      {NDU_BY_YEAR.map((d, i) => {
        const x = i * (BAR_W + GAP);
        const swH = (d.sw / maxT) * H; const hwH = (d.hw / maxT) * H;
        const isH = hovYear === d.year;
        return <g key={d.year} style={{ cursor: "pointer" }}
          onMouseEnter={() => onHover && onHover(d)}
          onMouseLeave={() => onHover && onHover(null)}>
          <rect x={x} y={0} width={BAR_W} height={H} fill={isH ? EV.stone100 : "transparent"} rx={2}/>
          {d.hw > 0 && <rect x={x} y={H - hwH} width={BAR_W} height={hwH} rx={2} fill={EV.cinnamon} opacity={isH ? 1 : 0.8}/>}
          {d.sw > 0 && <rect x={x} y={H - hwH - swH} width={BAR_W} height={swH} rx={2} fill={EV.sage} opacity={isH ? 1 : 0.85}/>}
          {d.sw > 0 && d.hw > 0 && <rect x={x} y={H - hwH - 2} width={BAR_W} height={4} fill={EV.sage} opacity={isH ? 1 : 0.85}/>}
          <text x={x + BAR_W/2} y={H + 10} textAnchor="middle" fontSize="8" fill={isH ? EV.fg : EV.fgSecondary} fontWeight={isH ? "700" : "400"}>{d.year.slice(2)}</text>
        </g>;
      })}
    </svg>
  </div>;
}

// ─── EXEC TILE CARD ───────────────────────────────────────────────────────────
function ExecTile({ tile, onClick }) {
  const [hov, setHov] = useState(false);
  const [surfaceTip, setSurfaceTip] = useState(null);
  const isSide = tile.layout === "side";

  const handleFleetHover = d => setSurfaceTip(d ? { text: `${d.name} · ${d.util}%`, color: utilColor(d.util), name: d.name } : null);
  const handleNduHover  = d => setSurfaceTip(d ? { text: `${d.year}: SW ${d.sw} · HW ${d.hw} · Total ${d.sw+d.hw}`, color: EV.sageDark } : null);
  const handleUptimeHover = c => {
    if (!c) { setSurfaceTip(null); return; }
    const o = c.outages[0];
    const fmt = new Date(c.ds+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    setSurfaceTip({ text: `${fmt} · ${o.appliance_name} · ${o.root_cause}`, color: EV.danger, ds: c.ds });
  };

  return <div
    onClick={onClick}
    onMouseEnter={() => setHov(true)}
    onMouseLeave={() => { setHov(false); setSurfaceTip(null); }}
    style={{
      background: "#fff5e3",
      color: "#2d2a27",
      border: `1.5px solid ${hov ? tile.accent : EV.stone200}`,
      borderRadius: 14,
      padding: "20px 22px",
      cursor: "pointer",
      transition: "border-color 0.15s",
      display: "flex",
      flexDirection: "column",
      minHeight: 220,
    }}>

    {/* header — just label, no "View detail" */}
    <div style={{ fontSize: 11, fontWeight: 600, color: EV.fgSecondary, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>{tile.label}</div>

    {isSide ? (
      <div style={{ display: "flex", gap: 16, flex: 1, alignItems: "center" }}>
        {/* left: headline + kpis */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: tile.accent, lineHeight: 1, marginBottom: 4 }}>{tile.headline}</div>
            <div style={{ fontSize: 11, color: EV.fgSecondary, whiteSpace: "nowrap" }}>{tile.headlineSub}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tile.kpis.map(k => <div key={k.label}>
              <div style={{ fontSize: 11, color: EV.fgSecondary, marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
            </div>)}
          </div>
        </div>
        {/* right: visual — passes hover handlers for interactive tiles */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {tile.id === "ndu"
            ? <MiniNDUBars onHover={handleNduHover} hovYear={surfaceTip?._year}/>
            : tile.visual}
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: tile.accent, lineHeight: 1, marginBottom: 4 }}>{tile.headline}</div>
          <div style={{ fontSize: 11, color: EV.fgSecondary, whiteSpace: "nowrap" }}>{tile.headlineSub}</div>
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
          {tile.kpis.map(k => <div key={k.label}>
            <div style={{ fontSize: 11, color: EV.fgSecondary, marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>)}
        </div>
        {tile.id === "fleet"
          ? <MiniFleetBars onHover={handleFleetHover} hovName={surfaceTip?.name}/>
          : tile.id === "uptime"
          ? <MiniHeatmapStrip onHover={handleUptimeHover} hovKey={surfaceTip?.ds}/>
          : <div style={{ flex: 1 }}>{tile.preview}</div>}
      </div>
    )}

    {/* surface tooltip */}
    {surfaceTip && <div style={{ marginTop: 10, padding: "5px 10px", background: EV.bgSurface, border: `1px solid ${EV.stone200}`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: surfaceTip.color }}>
      {surfaceTip.text}
    </div>}
  </div>;
}

// ─── TILE CONFIGS ─────────────────────────────────────────────────────────────
const TILES = [
  {
    id: "uptime", label: "Uptime", accent: EV.sageDark, layout: "top",
    headline: `${ORG.uptime}%`, headlineSub: "array uptime",
    kpis: [{ label: "Outage events", value: OUTAGES.length, color: EV.cinnamon }, { label: "Total downtime", value: fmtM(OUTAGES.reduce((s,o)=>s+o.minutes,0)), color: EV.danger }],
    preview: <MiniHeatmapStrip />,
    modalTitle: "Daily uptime heatmap", modalSub: "Red = outage day · Past 12 months",
    Detail: UptimeHeatmapDetail,
  },
  {
    id: "topology", label: "Appliance Locations", accent: EV.sage, layout: "top",
    headline: `${SITES.reduce((s,x)=>s+x.appliances.length,0)}`, headlineSub: "total appliances",
    kpis: [{ label: "Sites", value: SITES.length, color: EV.fg }, { label: "Critical", value: SITES.flatMap(s=>s.appliances).filter(a=>a.status==="critical").length, color: EV.danger }],
    preview: <MiniMapPreview />,
    modalTitle: "Appliance topology & locations", modalSub: "127 appliances across 4 data center sites",
    Detail: () => <div><SiteMapTile /><div style={{ marginTop: 24, borderTop: `1px solid ${EV.stone200}`, paddingTop: 20 }}><TopologyDetail /></div></div>,
  },
  {
    id: "fleet", label: "Fleet Utilization", accent: EV.cinnamon, layout: "top",
    headline: `${Math.round(FLEET_DATA.reduce((s,d)=>s+d.util,0)/FLEET_DATA.length*10)/10}%`, headlineSub: "avg utilization",
    kpis: [{ label: "Caution 60–80%", value: FLEET_DATA.filter(d=>d.util>=60&&d.util<80).length, color: EV.cinnamon }, { label: "Critical >80%", value: FLEET_DATA.filter(d=>d.util>=80).length, color: EV.danger }],
    preview: null,
    modalTitle: "Array fleet utilization", modalSub: `${FLEET_DATA.length} appliances · sorted by utilization`,
    Detail: FleetDetail,
  },
  {
    id: "support", label: "Support Health", accent: EV.sageDark, layout: "side",
    headline: `${PROACTIVE_PCT}%`, headlineSub: "proactive cases",
    kpis: [{ label: "Total cases", value: TOTAL_CASES.toLocaleString(), color: EV.fg }, { label: "Open", value: 10, color: EV.orange }],
    visual: <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <MiniDonut size={90}/>
      <div style={{ fontSize: 11, color: EV.fgSecondary, textAlign: "center", lineHeight: 1.6 }}>
        <div><span style={{ fontWeight: 700, color: EV.sageDark }}>1,627</span> proactive</div>
        <div><span style={{ fontWeight: 700, color: EV.cinnamon }}>392</span> reactive</div>
      </div>
    </div>,
    modalTitle: "Support health", modalSub: `${TOTAL_CASES.toLocaleString()} cases · colour = severity`,
    Detail: SupportDetail,
  },
  {
    id: "security", label: "Security Score", accent: EV.cinnamon, layout: "side",
    headline: `${SECURITY.score}`, headlineSub: `out of ${SECURITY.maxScore}`,
    kpis: [
      { label: "Compliance", value: `${SECURITY.categories.compliance.score}/${SECURITY.categories.compliance.max}`, color: EV.cinnamon },
      { label: "Issues found", value: SECURITY.compliance.basic.filter(i=>i.status!=="pass").length + SECURITY.compliance.advanced.filter(i=>i.status!=="pass").length + SECURITY.operational.filter(i=>i.status!=="pass").length, color: EV.danger },
    ],
    visual: <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <MiniShield size={80}/>
      <div>
        {[["C", SECURITY.categories.compliance.score, SECURITY.categories.compliance.max], ["O", SECURITY.categories.operational.score, SECURITY.categories.operational.max]].map(([l,s,m]) => (
          <div key={l} style={{ marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10, color: EV.fgSecondary, width: 10 }}>{l}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({length:m}).map((_,i) => <div key={i} style={{ width: 14, height: 5, borderRadius: 2, background: i < Math.round(s) ? EV.cinnamon : EV.stone200 }}/>)}
            </div>
          </div>
        ))}
      </div>
    </div>,
    modalTitle: "Security score detail", modalSub: "Compliance · Operational · recommendations",
    Detail: SecurityDetail,
  },
  {
    id: "ndu", label: "Non-Disruptive Upgrades", accent: EV.sage, layout: "side",
    headline: NDU_TOTALS.total, headlineSub: "total NDUs since 2019",
    kpis: [{ label: "Software", value: NDU_TOTALS.sw, color: EV.sage }, { label: "Hardware", value: NDU_TOTALS.hw, color: EV.cinnamon }],
    visual: null,
    modalTitle: "Non-disruptive upgrades", modalSub: `${NDU_TOTALS.total} total NDUs · 2019–2026`,
    Detail: NDUDetail,
  },
];

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [open, setOpen] = useState(null);
  const tile = open ? TILES.find(t => t.id === open) : null;

  return (
    <div style={{ position: "relative", background: EV.bg, minHeight: "100vh", fontFamily: "'DM Sans','Inter',system-ui,sans-serif", padding: "28px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: EV.fg, margin: 0 }}>Executive Summary</h1>
          <p style={{ fontSize: 13, color: EV.fgSecondary, margin: "4px 0 0" }}>{ORG.name} · Pure Storage fleet overview</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: EV.bgSurface, borderRadius: EV.radius, padding: "6px 12px", fontSize: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: EV.sage }} />
          <span style={{ color: EV.sageDark, fontWeight: 600 }}>{ORG.uptime}% uptime</span>
        </div>
      </div>

      {/* 3×2 tile grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {TILES.map(t => (
          <ExecTile key={t.id} tile={t} onClick={() => setOpen(t.id)} />
        ))}
      </div>

      {/* modal */}
      {tile && (
        <Modal title={tile.modalTitle} subtitle={tile.modalSub} onClose={() => setOpen(null)}>
          <tile.Detail />
        </Modal>
      )}
    </div>
  );
}
