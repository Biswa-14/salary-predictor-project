import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line
} from "recharts"
import GradientMenu from "./components/ui/gradient-menu"
import RadialOrbitalTimeline from "./components/ui/radial-orbital-timeline"
import "./App.css"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const DEFAULT_FORM = {
  experience_level: "",
  employment_type:  "",
  job_title:        "",
  remote_ratio:     100,
  company_location: "",
  company_size:     "",
  work_year:        2026,
}

const CURRENCIES = {
  USD: { symbol:"$",   label:"US Dollar",         flag:"🇺🇸" },
  INR: { symbol:"₹",   label:"Indian Rupee",       flag:"🇮🇳" },
  EUR: { symbol:"€",   label:"Euro",               flag:"🇪🇺" },
  GBP: { symbol:"£",   label:"British Pound",      flag:"🇬🇧" },
  AUD: { symbol:"A$",  label:"Australian Dollar",  flag:"🇦🇺" },
  JPY: { symbol:"¥",   label:"Japanese Yen",       flag:"🇯🇵" },
  CAD: { symbol:"C$",  label:"Canadian Dollar",    flag:"🇨🇦" },
  SGD: { symbol:"S$",  label:"Singapore Dollar",   flag:"🇸🇬" },
  BRL: { symbol:"R$",  label:"Brazilian Real",     flag:"🇧🇷" },
  MXN: { symbol:"MX$", label:"Mexican Peso",       flag:"🇲🇽" },
  PLN: { symbol:"zł",  label:"Polish Zloty",       flag:"🇵🇱" },
  AED: { symbol:"د.إ", label:"UAE Dirham",         flag:"🇦🇪" },
}

const COUNTRY_FACTORS = {
  US: { col:1.00, tax:0.76, competition:0.82, gdp:1.00, label:"United States", avgWage:65000, visa:"Work authorization required for non-citizens through employer sponsorship", culture:"High output, strong equity culture, competitive environment", techScene:"World-leading — SF, NYC, Seattle, Austin hubs", happiness:88 },
  GB: { col:0.82, tax:0.69, competition:0.78, gdp:0.75, label:"United Kingdom", avgWage:48000, visa:"Skilled Worker visa available for qualified professionals", culture:"Work-life balance improving, collaborative environment", techScene:"London fintech and startup scene, strong VC ecosystem", happiness:78 },
  CA: { col:0.88, tax:0.71, competition:0.80, gdp:0.82, label:"Canada", avgWage:52000, visa:"Points-based immigration system with foreigner-friendly pathways", culture:"Inclusive, collaborative, good benefits and work-life balance", techScene:"Toronto, Vancouver, Montreal growing fast", happiness:82 },
  AU: { col:0.85, tax:0.70, competition:0.76, gdp:0.83, label:"Australia", avgWage:55000, visa:"Skilled visa pathways available for tech professionals", culture:"Strong work-life balance, relaxed professional culture", techScene:"Sydney and Melbourne growing; stable mid-size market", happiness:80 },
  DE: { col:0.75, tax:0.63, competition:0.74, gdp:0.76, label:"Germany", avgWage:44000, visa:"Skilled professional visa available across the EU", culture:"Structured, strong workers rights, 30 days leave standard", techScene:"Berlin startup scene, strong automotive and industrial tech", happiness:76 },
  FR: { col:0.72, tax:0.61, competition:0.72, gdp:0.70, label:"France", avgWage:40000, visa:"Talent pathway for skilled professionals available", culture:"35-hour work week enforced, strong union protections", techScene:"Paris growing rapidly, Europe's largest startup campus", happiness:72 },
  NL: { col:0.78, tax:0.64, competition:0.75, gdp:0.78, label:"Netherlands", avgWage:46000, visa:"Highly skilled migrant pathway, fast processing", culture:"Direct communication style, flat hierarchies, good balance", techScene:"Amsterdam and Eindhoven — strong semiconductor and tech ecosystem", happiness:84 },
  SG: { col:0.73, tax:0.85, competition:0.74, gdp:0.87, label:"Singapore", avgWage:45000, visa:"Employment pass available, structured but accessible", culture:"High performance, multicultural, efficient", techScene:"Southeast Asia tech hub, MNCs pay globally competitive rates", happiness:79 },
  IN: { col:0.38, tax:0.73, competition:0.52, gdp:0.08, label:"India", avgWage:5000, visa:"Work authorization required for foreign nationals", culture:"Fast-growing startup ecosystem, hierarchical but evolving", techScene:"Bengaluru, Hyderabad, Pune — massive and rapidly growing", happiness:62 },
  BR: { col:0.42, tax:0.56, competition:0.55, gdp:0.15, label:"Brazil", avgWage:8000, visa:"Skilled professional work permits available", culture:"Relationship-driven, warm, improving startup culture", techScene:"São Paulo fintech boom, growing remote work culture", happiness:65 },
  MX: { col:0.44, tax:0.71, competition:0.55, gdp:0.17, label:"Mexico", avgWage:9000, visa:"Work permits accessible for skilled roles", culture:"Family-oriented, improving startup ecosystem", techScene:"Mexico City nearshore boom driven by regional proximity", happiness:66 },
  PK: { col:0.35, tax:0.81, competition:0.38, gdp:0.05, label:"Pakistan", avgWage:3000, visa:"Work authorization required", culture:"Growing remote work adoption, entrepreneurial spirit", techScene:"Karachi and Lahore — primarily services and outsourcing", happiness:48 },
  PH: { col:0.36, tax:0.76, competition:0.40, gdp:0.07, label:"Philippines", avgWage:4000, visa:"Work permit required for foreign nationals", culture:"English-speaking, service-oriented, collaborative", techScene:"Manila — outsourcing and remote work dominant", happiness:58 },
  NG: { col:0.30, tax:0.77, competition:0.35, gdp:0.04, label:"Nigeria", avgWage:2500, visa:"Work authorization required", culture:"Entrepreneurial, resilient, fast-growing tech awareness", techScene:"Lagos fintech — Africa's fastest growing tech hub", happiness:50 },
  ES: { col:0.58, tax:0.62, competition:0.65, gdp:0.58, label:"Spain", avgWage:32000, visa:"Skilled professional and digital nomad visa options available", culture:"Strong work-life balance, warm professional culture", techScene:"Barcelona and Madrid growing startup ecosystems", happiness:74 },
  IT: { col:0.65, tax:0.60, competition:0.66, gdp:0.62, label:"Italy", avgWage:34000, visa:"Skilled worker visa available within EU framework", culture:"Creative, quality-focused, hierarchical structures", techScene:"Milan and Rome — smaller but improving tech scene", happiness:70 },
  PT: { col:0.55, tax:0.66, competition:0.60, gdp:0.52, label:"Portugal", avgWage:24000, visa:"Highly accessible for skilled and remote professionals", culture:"Relaxed, warm, excellent quality of life for cost", techScene:"Lisbon and Porto — rising as a European remote and startup hub", happiness:76 },
  PL: { col:0.45, tax:0.71, competition:0.55, gdp:0.40, label:"Poland", avgWage:20000, visa:"EU citizens unrestricted, work permit for others", culture:"Hard-working, pragmatic, growing mid-market", techScene:"Warsaw and Krakow — major European outsourcing hub", happiness:68 },
  AE: { col:0.85, tax:1.00, competition:0.72, gdp:0.88, label:"UAE", avgWage:50000, visa:"Employment visa sponsored by employer", culture:"Tax-free, multicultural, fast-paced professional environment", techScene:"Dubai and Abu Dhabi — MNC regional headquarters hub", happiness:81 },
  JP: { col:0.70, tax:0.66, competition:0.70, gdp:0.68, label:"Japan", avgWage:38000, visa:"Merit-based skilled professional visa", culture:"Hierarchical, loyal, work culture improving post-2023", techScene:"Tokyo — actively addressing tech talent shortages", happiness:71 },
  CN: { col:0.45, tax:0.76, competition:0.55, gdp:0.28, label:"China", avgWage:18000, visa:"Work permit required, complex process for foreign nationals", culture:"High-output culture, improving work-life discourse", techScene:"Beijing, Shanghai, Shenzhen — massive domestic ecosystem", happiness:60 },
  KR: { col:0.60, tax:0.68, competition:0.63, gdp:0.58, label:"South Korea", avgWage:35000, visa:"Skilled professional work visa available", culture:"Hierarchical, improving work-life balance post-2022", techScene:"Seoul — Samsung, LG, Kakao and growing startup scene", happiness:67 },
}

const ROLE_DATA = {
  "Data Scientist":             { demand:82, competition:76, hype:88, trend:"↑",  demandLabel:"High",      yoy:6,  jobPostings:145000, base:135000 },
  "Machine Learning Engineer":  { demand:94, competition:63, hype:96, trend:"↑↑", demandLabel:"Very High", yoy:18, jobPostings:98000,  base:185000 },
  "Data Engineer":              { demand:88, competition:70, hype:85, trend:"↑",  demandLabel:"High",      yoy:14, jobPostings:132000, base:145000 },
  "ML Engineer":                { demand:93, competition:62, hype:95, trend:"↑↑", demandLabel:"Very High", yoy:16, jobPostings:95000,  base:142000 },
  "Data Analyst":               { demand:75, competition:86, hype:70, trend:"→",  demandLabel:"Stable",    yoy:3,  jobPostings:210000, base:90000  },
  "Research Scientist":         { demand:72, competition:53, hype:78, trend:"→",  demandLabel:"Stable",    yoy:5,  jobPostings:42000,  base:153000 },
  "Software Engineer":          { demand:86, competition:90, hype:80, trend:"↑",  demandLabel:"High",      yoy:8,  jobPostings:380000, base:128000 },
  "AI Scientist":               { demand:96, competition:50, hype:99, trend:"↑↑", demandLabel:"Very High", yoy:22, jobPostings:38000,  base:178000 },
  "Analytics Engineer":         { demand:80, competition:68, hype:82, trend:"↑",  demandLabel:"High",      yoy:11, jobPostings:62000,  base:128000 },
  "Data Manager":               { demand:65, competition:74, hype:55, trend:"↓",  demandLabel:"Declining", yoy:-2, jobPostings:28000,  base:120000 },
  "BI Developer":               { demand:60, competition:78, hype:52, trend:"↓",  demandLabel:"Declining", yoy:-5, jobPostings:45000,  base:105000 },
  "Data Architect":             { demand:78, competition:58, hype:75, trend:"↑",  demandLabel:"High",      yoy:9,  jobPostings:35000,  base:152000 },
  "Principal Data Scientist":   { demand:84, competition:56, hype:86, trend:"↑",  demandLabel:"High",      yoy:10, jobPostings:22000,  base:172000 },
  "Head of Data":               { demand:70, competition:60, hype:68, trend:"→",  demandLabel:"Stable",    yoy:4,  jobPostings:18000,  base:165000 },
  "NLP Engineer":               { demand:90, competition:58, hype:92, trend:"↑↑", demandLabel:"Very High", yoy:20, jobPostings:31000,  base:165000 },
  "Computer Vision Engineer":   { demand:88, competition:56, hype:90, trend:"↑↑", demandLabel:"Very High", yoy:17, jobPostings:28000,  base:162000 },
}
const getRoleData = t => ROLE_DATA[t] ?? { demand:70, competition:68, hype:65, trend:"→", demandLabel:"Stable", yoy:4, jobPostings:50000, base:120000 }

const EXP_MULT    = { EN:0.58, MI:0.80, SE:1.00, EX:1.30 }
const SIZE_MULT   = { S:0.80, M:1.00, L:1.18 }
const EMP_MULT    = { FT:1.00, CT:1.10, PT:0.58, FL:0.88 }
const REMOTE_MULT = { 0:1.00, 50:0.97, 100:0.93 }
const INFLATION   = { 2020:0.87, 2021:0.91, 2022:0.95, 2023:1.00, 2024:1.05, 2025:1.103, 2026:1.158 }

const countryNameFormatter =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null

function getCountryLabel(code) {
  if (COUNTRY_FACTORS[code]?.label) return COUNTRY_FACTORS[code].label
  if (!code || !countryNameFormatter) return code

  try {
    return countryNameFormatter.of(code) ?? code
  } catch {
    return code
  }
}

const COUNTRY_PROFILE_PRESETS = {
  neutral: {
    col: 0.56, tax: 0.72, competition: 0.58, gdp: 0.36, avgWage: 18000,
    visa: "Work authorization requirements depend on employer sponsorship and local immigration rules.",
    culture: "Work expectations vary across employers, with compensation concentrated in the strongest business hubs.",
    techScene: "Tech hiring is typically centered in the capital city and a few major regional hubs.",
    happiness: 64,
  },
  highIncomeEurope: {
    col: 0.80, tax: 0.64, competition: 0.72, gdp: 0.82, avgWage: 52000,
    visa: "Skilled worker and highly qualified talent pathways are commonly available with employer sponsorship.",
    culture: "Professional environments are structured, benefits are stronger, and work-life balance is generally better than the global average.",
    techScene: "Well-developed tech ecosystems with strong enterprise, fintech and startup hiring in major cities.",
    happiness: 81,
  },
  easternEurope: {
    col: 0.54, tax: 0.70, competition: 0.58, gdp: 0.42, avgWage: 22000,
    visa: "Work authorization is usually employer-led for non-citizens, with simpler paths for experienced specialists.",
    culture: "Teams tend to be pragmatic, technical and delivery-focused, with compensation improving fastest in capital-city markets.",
    techScene: "Tech demand is strongest in outsourcing, product engineering and regional startup hubs.",
    happiness: 69,
  },
  balkans: {
    col: 0.47, tax: 0.72, competition: 0.50, gdp: 0.24, avgWage: 14000,
    visa: "Employer-sponsored work permits are generally required for foreign professionals.",
    culture: "Smaller markets are relationship-driven and cost-sensitive, but highly skilled engineers can still stand out quickly.",
    techScene: "Most opportunities are concentrated in the capital and outsourcing-heavy urban centers.",
    happiness: 63,
  },
  latam: {
    col: 0.48, tax: 0.68, competition: 0.56, gdp: 0.18, avgWage: 12000,
    visa: "Professional work permits are usually accessible with employer sponsorship or a specialist contract.",
    culture: "Business culture is relationship-oriented, with growing remote-first teams and stronger hiring in regional capitals.",
    techScene: "Startup, fintech and nearshore delivery markets are the main engines of tech salary growth.",
    happiness: 66,
  },
  mena: {
    col: 0.46, tax: 0.79, competition: 0.50, gdp: 0.17, avgWage: 13000,
    visa: "Work visas are typically employer-sponsored and rules can change based on sector and nationality.",
    culture: "Professional environments range from highly structured corporates to emerging startup scenes with fast-moving hiring.",
    techScene: "Hiring tends to cluster in capital cities, government-backed tech programs and large enterprise employers.",
    happiness: 60,
  },
  africa: {
    col: 0.33, tax: 0.77, competition: 0.40, gdp: 0.06, avgWage: 5000,
    visa: "Work authorization is generally required and often tied directly to the sponsoring employer.",
    culture: "Teams are often resourceful and entrepreneurial, with strong upside in the fastest-growing local markets.",
    techScene: "Fintech, services and cross-border digital businesses drive most of the strongest tech demand.",
    happiness: 54,
  },
  asiaEmerging: {
    col: 0.43, tax: 0.77, competition: 0.53, gdp: 0.16, avgWage: 11000,
    visa: "Employer sponsorship is commonly required, though specialist talent can still find accessible pathways.",
    culture: "Work culture is often ambitious and output-focused, with the best salaries concentrated in major metro areas.",
    techScene: "Fast-growing digital economies, outsourcing hubs and startup ecosystems are expanding demand for technical talent.",
    happiness: 61,
  },
  asiaDeveloped: {
    col: 0.74, tax: 0.74, competition: 0.72, gdp: 0.80, avgWage: 48000,
    visa: "High-skill visa routes are usually available but remain selective and employer-linked.",
    culture: "Employers tend to expect high performance, with compensation strongest in global city markets and top multinationals.",
    techScene: "Mature innovation ecosystems support strong hiring across enterprise software, finance and platform companies.",
    happiness: 77,
  },
  islands: {
    col: 0.62, tax: 0.73, competition: 0.48, gdp: 0.25, avgWage: 16000,
    visa: "Work permits are usually tied to employer sponsorship, with smaller labor markets limiting foreign openings.",
    culture: "Professional environments are smaller and more relationship-driven, often with a premium on versatile generalists.",
    techScene: "Tech roles are limited compared with larger economies and are usually concentrated in tourism, finance or outsourced services.",
    happiness: 68,
  },
}

const COUNTRY_PROFILE_BY_CODE = {
  AL: "balkans",
  AM: "easternEurope",
  AR: "latam",
  AS: "islands",
  AT: "highIncomeEurope",
  BA: "balkans",
  BE: "highIncomeEurope",
  BS: "islands",
  CF: "africa",
  CH: "highIncomeEurope",
  CL: "latam",
  CO: "latam",
  CR: "latam",
  CZ: "easternEurope",
  DK: "highIncomeEurope",
  DZ: "mena",
  EE: "easternEurope",
  EG: "mena",
  FI: "highIncomeEurope",
  GH: "africa",
  GR: "easternEurope",
  HK: "asiaDeveloped",
  HN: "latam",
  HR: "easternEurope",
  HU: "easternEurope",
  ID: "asiaEmerging",
  IE: "highIncomeEurope",
  IL: "highIncomeEurope",
  IQ: "mena",
  IR: "mena",
  KE: "africa",
  LT: "easternEurope",
  LU: "highIncomeEurope",
  LV: "easternEurope",
  MA: "mena",
  MD: "easternEurope",
  MT: "highIncomeEurope",
  MY: "asiaEmerging",
  NZ: "highIncomeEurope",
  PR: "islands",
  RO: "easternEurope",
  RU: "easternEurope",
  SE: "highIncomeEurope",
  SI: "easternEurope",
  SK: "easternEurope",
  TH: "asiaEmerging",
  TR: "mena",
  UA: "easternEurope",
  VN: "asiaEmerging",
}

function getCountryProfile(code) {
  if (COUNTRY_FACTORS[code]) return COUNTRY_FACTORS[code]

  const presetKey = COUNTRY_PROFILE_BY_CODE[code] ?? "neutral"
  const preset = COUNTRY_PROFILE_PRESETS[presetKey]

  return {
    ...preset,
    label: getCountryLabel(code),
  }
}

function BrandLockup({ variant = "nav", className = "" }) {
  return (
    <div className={`brand-lockup brand-lockup-${variant} ${className}`.trim()}>
      <img className="brand-mark" src="/paylens-webpage-logo.png" alt="PayLens logo" />
      <span className="brand-wordmark">PayLens</span>
    </div>
  )
}

function serializeShareState(form, uiState) {
  const params = new URLSearchParams()
  Object.entries(form).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) params.set(key, String(value))
  })
  params.set("currency", uiState.currency)
  params.set("period", uiState.period)
  params.set("apply_col", String(uiState.applyCol))
  return params
}

function buildShareUrl(form, uiState) {
  if (typeof window === "undefined") return ""
  const url = new URL(window.location.href)
  url.search = serializeShareState(form, uiState).toString()
  return url.toString()
}

function getSalaryStory(form, roleInfo, countryCtx, adjusted, applyCol) {
  if (!adjusted || !form.job_title || !form.company_location) return []
  const experienceStory = {
    EX: "Executive-level experience is pushing this estimate near the top of the market.",
    SE: "Senior experience adds a strong premium and keeps you in the most valuable hiring band.",
    MI: "Mid-level experience is solid, but this is also the most crowded bracket in hiring.",
    EN: "Entry-level experience lowers the baseline, so title and location matter even more here.",
  }[form.experience_level]

  const remoteStory = {
    0: "On-site work is preserving the strongest location-based compensation.",
    50: "Hybrid work trims pay slightly compared with fully on-site roles.",
    100: "Fully remote work applies a small discount in this model versus local office pay.",
  }[form.remote_ratio]

  return [
    `${roleInfo.demandLabel} demand for ${form.job_title} is supporting a stronger market baseline.`,
    `${getCountryLabel(form.company_location)} contributes a ${Math.round(countryCtx.col * 100)}% cost-of-living factor and an estimated ${Math.round((1 - countryCtx.tax) * 100)}% tax drag.`,
    experienceStory,
    remoteStory,
    applyCol
      ? `COL mode is on, so the displayed salary is localized for ${countryCtx.label}.`
      : "COL mode is off, so the displayed salary stays as a nominal US-equivalent estimate.",
  ].filter(Boolean)
}

function computeSalary(rawUSD, form) {
  const country    = getCountryProfile(form.company_location)
  const roleInfo   = getRoleData(form.job_title)
  const expMult    = EXP_MULT[form.experience_level]  ?? 1.0
  const sizeMult   = SIZE_MULT[form.company_size]     ?? 1.0
  const empMult    = EMP_MULT[form.employment_type]   ?? 1.0
  const remoteMult = REMOTE_MULT[form.remote_ratio]   ?? 1.0
  const infMult    = INFLATION[form.work_year]        ?? 1.0
  const rawCountry = country.col * 0.60 + country.gdp * 0.40
  const countryMult = 0.45 + rawCountry * 0.55
  const demandMult = 0.90 + (roleInfo.demand / 100) * 0.20
  const compMult   = 0.94 + (1.0 - roleInfo.competition / 100) * 0.12
  const gross = rawUSD * expMult * sizeMult * empMult * remoteMult * countryMult * demandMult * compMult * infMult
  const grossNoCOL = rawUSD * expMult * sizeMult * empMult * remoteMult * demandMult * compMult * infMult
  return {
    gross:      Math.round(gross),
    net:        Math.round(gross * country.tax),
    grossNoCOL: Math.round(grossNoCOL),
    netNoCOL:   Math.round(grossNoCOL * country.tax),
  }
}

function getApplicationContext(location, jobTitle, experienceLevel) {
  const c = getCountryProfile(location)
  const r = getRoleData(jobTitle)
  const rawScore = (r.demand * 0.45) + ((100 - r.competition) * 0.25) + (c.happiness * 0.30)
  const score    = Math.min(99, Math.max(20, Math.round(rawScore)))
  const hiringChance = r.demand >= 90 ? "Very High" : r.demand >= 75 ? "High" : r.demand >= 60 ? "Moderate" : "Competitive"
  const sentiment    = score >= 80 ? "You'd thrive here" : score >= 65 ? "Good opportunity" : score >= 50 ? "Manageable" : "Challenging market"
  const expNote = {
    EX: "Executive-level candidates are rare — employers will compete for you.",
    SE: "Senior candidates are in high demand globally. Strong position to negotiate.",
    MI: "Mid-level is the most competitive bracket — differentiate with portfolio.",
    EN: "Entry-level is tough everywhere. Focus on internships, projects and networking.",
  }[experienceLevel] ?? ""
  return { score, hiringChance, sentiment, expNote,
    visa:c.visa, culture:c.culture, techScene:c.techScene,
    competition:r.competition, demandLabel:r.demandLabel, label:c.label }
}

function getRegionalContext(location, gross, net, role, workYear) {
  const c      = getCountryProfile(location)
  const ratio  = (gross / c.avgWage).toFixed(1)
  const taxPct = Math.round((1 - c.tax) * 100)
  const yr     = workYear ?? 2026

  const map = {
    US: `In the US (${yr}), this gross salary of $${gross.toLocaleString()} sits above the national median of ~$65k. After federal and state taxes (~${taxPct}%), estimated take-home is ~$${net.toLocaleString()}. Tech hubs like San Francisco and New York command 20–35% premiums over this estimate. Remote roles typically pay 5–10% less. Work authorization is required for non-citizens through employer sponsorship.`,
    IN: `In India (${yr}), the adjusted salary of $${gross.toLocaleString()} (~₹${Math.round(gross*84).toLocaleString()}) is approximately ${ratio}× the national tech average wage. Bengaluru, Hyderabad and Pune dominate tech hiring. Multinational companies typically pay 40–60% more than domestic firms. After tax (~${taxPct}%), estimated take-home is ~$${net.toLocaleString()}. The tech market is large and competitive, but demand for ML and AI roles continues to outpace supply significantly.`,
    GB: `In the UK (${yr}), this adjusted gross of £${Math.round(gross*0.79).toLocaleString()} is strong for a ${role} role. After income tax and National Insurance (~${taxPct}%), take-home is ~£${Math.round(net*0.79).toLocaleString()}. London commands 25–35% above the national average. The Skilled Worker visa is accessible for qualified candidates. UK firms actively recruit internationally for tech talent.`,
    DE: `In Germany (${yr}), the gross of €${Math.round(gross*0.92).toLocaleString()} takes home ~€${Math.round(net*0.92).toLocaleString()} after tax and social contributions (~${taxPct}%). German companies offer strong job security, works councils and a minimum of 30 days leave. Berlin leads in startups; Munich and Hamburg in established tech. Skilled worker visa routes are available for qualified professionals.`,
    CA: `In Canada (${yr}), this salary of C$${Math.round(gross*1.36).toLocaleString()} is competitive. After provincial and federal tax (~${taxPct}%), take-home is ~C$${Math.round(net*1.36).toLocaleString()}. Canada's immigration system is among the most foreigner-friendly globally. Toronto and Vancouver lead in tech compensation; Montreal has a strong AI research ecosystem.`,
    AU: `In Australia (${yr}), tech salaries have risen sharply since 2022. Gross of A$${Math.round(gross*1.53).toLocaleString()} takes home ~A$${Math.round(net*1.53).toLocaleString()} after ~${taxPct}% tax. Mandatory superannuation contributes an additional 11% on top of salary — not reflected here but significant. Sydney and Melbourne lead compensation; remote culture is spreading opportunities nationwide.`,
    SG: `Singapore (${yr}) has one of the lowest effective tax rates globally (~${taxPct}%). Your gross of S$${Math.round(gross*1.35).toLocaleString()} is close to your take-home. Singapore is Southeast Asia's tech headquarters — MNCs pay globally competitive rates. The Employment Pass is structured but accessible for qualified candidates. Cost of living has risen since 2022 but remains manageable on tech salaries.`,
    AE: `The UAE (${yr}) charges zero income tax — your gross of AED ${Math.round(gross*3.67).toLocaleString()} is your full take-home. Dubai and Abu Dhabi are rapidly expanding their tech infrastructure. MNC regional headquarters, a growing startup scene and government-backed tech initiatives make this an attractive destination. Visas are employer-sponsored.`,
    JP: `In Japan (${yr}), tech salaries have historically trailed Western markets but are rising. Gross of ¥${Math.round(gross*150).toLocaleString()} takes home ~¥${Math.round(net*150).toLocaleString()} after ~${taxPct}% tax. Japan is actively addressing tech talent shortages through immigration reform. Work culture is evolving, though long hours remain common in established firms.`,
    NL: `The Netherlands (${yr}) is one of Europe's most tech-friendly markets. Gross of €${Math.round(gross*0.91).toLocaleString()} takes home ~€${Math.round(net*0.91).toLocaleString()} after ~${taxPct}% tax. Expat relocation packages often include additional tax benefits. The Highly Skilled Migrant permit processes quickly. Amsterdam and Eindhoven lead in opportunities across semiconductor, software and MNC sectors.`,
    BR: `In Brazil (${yr}), the adjusted salary of $${gross.toLocaleString()} represents ${ratio}× the local tech average wage. After tax (~${taxPct}%), take-home is ~$${net.toLocaleString()}. São Paulo dominates tech and fintech hiring. Remote work has expanded opportunity access significantly in recent years.`,
    ES: `In Spain (${yr}), the adjusted gross of €${Math.round(gross*0.92).toLocaleString()} takes home ~€${Math.round(net*0.92).toLocaleString()} after ~${taxPct}% tax. Barcelona and Madrid have growing startup ecosystems. Spain offers digital nomad visa options and strong work-life balance culture. This salary is ${ratio}× the local tech average.`,
    PT: `In Portugal (${yr}), this salary of €${Math.round(gross*0.92).toLocaleString()} is ${ratio}× the local average wage — strong purchasing power for the cost of living. After ~${taxPct}% tax, take-home is ~€${Math.round(net*0.92).toLocaleString()}. Lisbon and Porto are rising fast as European remote and startup hubs with accessible visa pathways.`,
  }

  return map[location] ?? `In ${c.label} (${yr}), this adjusted salary represents ${ratio}× the local average wage. After estimated tax (~${taxPct}%), take-home is approximately $${net.toLocaleString()}. ${c.culture}.`
}

const TREND_BASE = {
  "Data Scientist":             [112000,120000,130000,135000,142000,149000,156000],
  "Machine Learning Engineer":  [140000,152000,165000,175000,184000,193000,203000],
  "Data Engineer":              [110000,118000,128000,135000,142000,149000,156000],
  "ML Engineer":                [138000,149000,160000,170000,179000,188000,197000],
  "Data Analyst":               [75000, 80000, 86000, 90000, 94500, 99000,104000],
  "Software Engineer":          [105000,113000,122000,128000,134000,141000,148000],
  "Research Scientist":         [128000,136000,146000,153000,160000,168000,177000],
  "AI Scientist":               [145000,158000,170000,178000,187000,196000,206000],
  "NLP Engineer":               [132000,144000,156000,165000,173000,182000,191000],
  "Computer Vision Engineer":   [130000,141000,153000,162000,170000,179000,188000],
}
const YEARS = [2020,2021,2022,2023,2024,2025,2026]
const buildTrendData = t => {
  const vals = TREND_BASE[t] ?? TREND_BASE["Data Scientist"]
  return YEARS.map((y,i) => ({ year:y, salary:vals[i] }))
}

const SALARY_FACTORS = [
  { title:"Cost of Living",   icon:"🏙️", color:"#10b981", body:"Cities like SF and Zurich pay more because rent, food and services cost more. Employers adjust salaries to keep purchasing power competitive." },
  { title:"Supply & Demand",  icon:"📊", color:"#06b6d4", body:"If ML Engineers are rare but every company needs one, salaries spike. When thousands of graduates flood a market, wages compress." },
  { title:"Tax Burden",       icon:"🧾", color:"#f59e0b", body:"A $200k gross in Germany takes home ~62% after tax. The UAE takes 0%. Your real compensation is what stays in your pocket." },
  { title:"GDP per Capita",   icon:"🌍", color:"#8b5cf6", body:"Countries with higher economic output pay more for the same work. A senior engineer in the US earns 4–8× more than in India — same skills, different economy." },
  { title:"Competition",      icon:"⚔️", color:"#e24b4a", body:"200 people applying for one role means lower salary power. Niche skills like AI safety or CUDA optimization face near-zero competition." },
  { title:"Company Size",     icon:"🏢", color:"#10b981", body:"FAANG-scale companies pay 15–25% more than mid-market for equivalent roles. Startups often compensate with equity instead of cash." },
  { title:"Remote Ratio",     icon:"🏠", color:"#06b6d4", body:"Fully remote roles typically pay 7–10% less than on-site, as companies apply geo-adjusted compensation. Hybrid roles sit in between." },
  { title:"Experience Level", icon:"🎓", color:"#f59e0b", body:"Senior engineers earn ~1.7× entry-level salaries. Executive roles add another 30%. The jump from entry to mid is steeper than mid to senior." },
  { title:"Role Demand",      icon:"🔥", color:"#e24b4a", body:"AI Scientist and ML Engineer roles are growing 18–22% YoY. BI Developer and Data Manager roles are contracting. Demand directly moves salaries." },
  { title:"Inflation & Year", icon:"📈", color:"#8b5cf6", body:"Tech salaries have grown ~5% annually since 2023. A 2026 estimate is 15.8% above a 2023 benchmark for the same role — compounding matters." },
]

const IconFX   = p => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
const IconML   = p => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconCOL  = p => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IconInfl = p => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconViz  = p => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>

const TIMELINE_DATA = [
  { id:1, title:"FX Rates",   date:"Live",    content:"Real-time USD conversions — 12 currencies with purchasing power context per region.",                  category:"Finance", icon:IconFX,   relatedIds:[2,3], status:"completed",   energy:100 },
  { id:2, title:"RF Model",   date:"v2",      content:"Random Forest on 2,500+ DS salary records. Multi-factor adjusted — experience, taxes, competition.",   category:"ML",      icon:IconML,   relatedIds:[1,5], status:"completed",   energy:92  },
  { id:3, title:"COL+Tax",    date:"PPP",     content:"Country COL, GDP per capita, effective tax rate and talent competition all factor into the result.",    category:"Finance", icon:IconCOL,  relatedIds:[1,4], status:"completed",   energy:80  },
  { id:4, title:"Inflation",  date:"2020–26", content:"Year-specific multipliers across the full 2020–2026 range including post-2023 tech salary projections.", category:"Finance", icon:IconInfl, relatedIds:[3,5], status:"completed",   energy:75  },
  { id:5, title:"Hype Meter", date:"Trends",  content:"Role demand scored against job posting growth, LinkedIn trends and BLS projections.",                   category:"UX",      icon:IconViz,  relatedIds:[2,4], status:"in-progress", energy:65  },
]

function MeshBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext("2d"); let W,H,id,t=0; const R=20,C=11
    const resize = () => { W=c.width=c.offsetWidth; H=c.height=c.offsetHeight }
    resize(); window.addEventListener("resize",resize)
    const pt = (col,row) => ({ x:(col/R+0.022*Math.sin(row*0.8+t*0.6+col*0.4))*W, y:(row/C+0.015*Math.cos(col*0.9+t*0.45+row*0.3))*H })
    const draw = () => {
      ctx.clearRect(0,0,W,H); t+=0.013
      for(let r=0;r<=C;r++) for(let cc=0;cc<=R;cc++){
        const p=pt(cc,r), a=0.032+0.022*Math.sin(t*1.2+cc*0.35+r*0.5)
        if(cc<R){const p2=pt(cc+1,r);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=`rgba(16,185,129,${a})`;ctx.lineWidth=0.9;ctx.stroke()}
        if(r<C){const p2=pt(cc,r+1);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=`rgba(6,182,212,${a*0.65})`;ctx.lineWidth=0.9;ctx.stroke()}
        const da=0.07+0.05*Math.sin(t*1.8+cc+r)
        if(da>0.09){ctx.beginPath();ctx.arc(p.x,p.y,1.3,0,Math.PI*2);ctx.fillStyle=`rgba(16,185,129,${da})`;ctx.fill()}
      }
      id=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize",resize) }
  },[])
  return <canvas ref={ref} className="mesh-canvas"/>
}

function ParticleCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const c=ref.current, ctx=c.getContext("2d")
    let W=c.width=c.offsetWidth, H=c.height=c.offsetHeight
    const syms=["$","₹","€","£","¥","%","R$","S$"]
    const ps=Array.from({length:28},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-0.5)*0.4, vy:-0.3-Math.random()*0.4,
      size:10+Math.random()*14, alpha:0.06+Math.random()*0.12,
      sym:syms[Math.floor(Math.random()*syms.length)]
    }))
    let raf
    const draw=()=>{
      ctx.clearRect(0,0,W,H)
      ps.forEach(p=>{
        ctx.globalAlpha=p.alpha; ctx.fillStyle="#10b981"
        ctx.font=`bold ${p.size}px system-ui`; ctx.fillText(p.sym,p.x,p.y)
        p.x+=p.vx; p.y+=p.vy
        if(p.y<-20){p.y=H+10;p.x=Math.random()*W}
        if(p.x<-20)p.x=W+10; if(p.x>W+20)p.x=-10
      })
      ctx.globalAlpha=1; raf=requestAnimationFrame(draw)
    }
    draw()
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}
    window.addEventListener("resize",resize)
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize)}
  },[])
  return <canvas ref={ref} className="particle-canvas"/>
}

function ScrollProgress() {
  const [pct,setPct]=useState(0)
  useEffect(()=>{
    const fn=()=>{const el=document.documentElement;const t=el.scrollHeight-el.clientHeight;setPct(t>0?(el.scrollTop/t)*100:0)}
    window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn)
  },[])
  return <div className="scroll-progress" style={{width:`${pct}%`}}/>
}

function useScrollReveal(){
  useEffect(()=>{
    const els=document.querySelectorAll(".reveal")
    const obs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)x.target.classList.add("revealed")})},{threshold:0.10})
    els.forEach(el=>obs.observe(el));return()=>obs.disconnect()
  })
}

function useCountUp(target,dur=1200){
  const [val,setVal]=useState(0)
  useEffect(()=>{
    if(!target)return;let s=null
    const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);setVal(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step)
  },[target,dur])
  return val
}
function AnimatedNumber({value,prefix=""}){const d=useCountUp(value);return <>{prefix}{d.toLocaleString()}</>}

function HypeMeter({roleData}){
  const score=roleData.hype
  const color=score>=85?"#10b981":score>=65?"#f59e0b":"#e24b4a"
  const label=score>=85?"Very Hot":score>=70?"In Demand":score>=50?"Stable":"Cooling"
  const circ=2*Math.PI*36, dash=(score/100)*circ
  return(
    <div className="hype-meter">
      <div className="hype-ring">
        <svg viewBox="0 0 88 88" width="80" height="80">
          <circle cx="44" cy="44" r="36" fill="none" stroke="var(--dark4)" strokeWidth="6"/>
          <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 44 44)" style={{transition:"stroke-dasharray 1s"}}/>
        </svg>
        <div className="hype-score" style={{color}}>{score}</div>
      </div>
      <div className="hype-info">
        <div className="hype-label" style={{color}}>{label}</div>
        <div className="hype-sub">{roleData.jobPostings.toLocaleString()} active postings</div>
        <div className="hype-yoy" style={{color:roleData.yoy>=0?"#10b981":"#e24b4a"}}>
          {roleData.yoy>=0?"+":""}{roleData.yoy}% YoY growth
        </div>
      </div>
    </div>
  )
}

function HappinessMeter({ctx}){
  const {score,sentiment,hiringChance,expNote,visa,culture,techScene,competition,demandLabel,label}=ctx
  const color=score>=80?"#10b981":score>=65?"#f59e0b":score>=50?"#f97316":"#e24b4a"
  const emoji=score>=80?"😄":score>=65?"🙂":score>=50?"😐":"😟"
  const circ=2*Math.PI*48, dash=(score/100)*circ
  return(
    <div className="happiness-card glass">
      <div className="happiness-header">
        <div className="happiness-ring">
          <svg viewBox="0 0 112 112" width="100" height="100">
            <circle cx="56" cy="56" r="48" fill="none" stroke="var(--dark4)" strokeWidth="7"/>
            <circle cx="56" cy="56" r="48" fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 56 56)" style={{transition:"stroke-dasharray 1.2s ease"}}/>
          </svg>
          <div className="happiness-score-wrap">
            <span className="happiness-emoji">{emoji}</span>
            <span className="happiness-score" style={{color}}>{score}</span>
          </div>
        </div>
        <div className="happiness-summary">
          <h3>{sentiment}</h3>
          <p>Applying for <strong>{demandLabel}</strong> demand roles in <strong>{label}</strong></p>
          <div className="happiness-pills">
            <span className="hpill" style={{color,borderColor:color+"44",background:color+"11"}}>{hiringChance} hiring chance</span>
            <span className="hpill" style={{color:"#94a3b8",borderColor:"#33415544",background:"#33415511"}}>{competition}% competition index</span>
          </div>
        </div>
      </div>
      <p className="happiness-expnote">{expNote}</p>
      <div className="happiness-grid">
        <div className="hg-item"><span className="hg-label">Visa pathway</span><span className="hg-val">{visa}</span></div>
        <div className="hg-item"><span className="hg-label">Work culture</span><span className="hg-val">{culture}</span></div>
        <div className="hg-item"><span className="hg-label">Tech scene</span><span className="hg-val">{techScene}</span></div>
      </div>
    </div>
  )
}

function FeedbackForm(){
  const [status,setStatus]=useState("idle")
  const [fd,setFd]=useState({name:"",email:"",message:"",rating:"5"})
  const handleChange=e=>setFd(f=>({...f,[e.target.name]:e.target.value}))
  const handleSubmit=async e=>{
    e.preventDefault();setStatus("sending")
    try{
      const r=await fetch("https://formspree.io/f/mbdpdqkl",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fd)})
      setStatus(r.ok?"sent":"error")
    }catch{setStatus("error")}
  }
  if(status==="sent")return(<div className="feedback-success"><div className="feedback-success-icon">✓</div><h3>Thanks!</h3><p>Biswaranjan will read this.</p></div>)
  return(
    <form className="feedback-form" onSubmit={handleSubmit}>
      <div className="fb-row">
        <label className="fb-field"><span>Name</span><input name="name" autoComplete="name" value={fd.name} onChange={handleChange} placeholder="Your name" required/></label>
        <label className="fb-field"><span>Email</span><input name="email" type="email" autoComplete="email" value={fd.email} onChange={handleChange} placeholder="you@example.com" required/></label>
      </div>
      <label className="fb-field"><span>Rating</span>
        <div className="star-row">{[1,2,3,4,5].map(n=><button key={n} type="button" className={`star ${Number(fd.rating)>=n?"star-on":""}`} onClick={()=>setFd(f=>({...f,rating:String(n)}))}> ★</button>)}</div>
      </label>
      <label className="fb-field"><span>Message</span><textarea name="message" value={fd.message} onChange={handleChange} placeholder="Suggestions, bugs, ideas…" rows={3} required/></label>
      <button type="submit" className="fb-submit" disabled={status==="sending"}>
        {status==="sending"?<><span className="spinner sm"/>Sending…</>:"Send Feedback →"}
      </button>
      {status==="error"&&<p className="error-msg">Failed. Try again.</p>}
    </form>
  )
}

export default function App() {
  const [options,     setOptions]     = useState(null)
  const [form,        setForm]        = useState(DEFAULT_FORM)
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [bootError,   setBootError]   = useState(null)
  const [currency,    setCurrency]    = useState("USD")
  const [fxRates,     setFxRates]     = useState({})
  const [history,     setHistory]     = useState([])
  const [copied,      setCopied]      = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [period,      setPeriod]      = useState("year")
  const [applyCol,    setApplyCol]    = useState(true)
  const resultRef = useRef(null)
  useScrollReveal()

  // ── Fetch options and FX — no auto-fill ──────────────────────────────────
  useEffect(()=>{
    axios.get(`${API}/options`).then(res=>{
      setOptions(res.data)
      setBootError(null)
      }).catch(()=>{
      setBootError("Unable to load PayLens right now. Please check your connection and try again.")
    })
    axios.get("https://api.exchangerate-api.com/v4/latest/USD")
      .then(r=>setFxRates(r.data.rates)).catch(()=>{})
  },[])

  useEffect(()=>{
    if(!options || typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const nextForm = {...DEFAULT_FORM}

    const sharedJob = params.get("job_title")
    nextForm.job_title = sharedJob && options.job_titles.includes(sharedJob) ? sharedJob : ""

    const sharedExp = params.get("experience_level")
    nextForm.experience_level = sharedExp && options.experience_level?.[sharedExp] ? sharedExp : ""

    const sharedEmp = params.get("employment_type")
    nextForm.employment_type = sharedEmp && options.employment_type?.[sharedEmp] ? sharedEmp : ""

    const sharedLocation = params.get("company_location")
    nextForm.company_location = sharedLocation && options.locations.includes(sharedLocation) ? sharedLocation : ""

    const sharedSize = params.get("company_size")
    nextForm.company_size = ["S","M","L"].includes(sharedSize) ? sharedSize : ""

    const sharedRemote = Number(params.get("remote_ratio"))
    nextForm.remote_ratio = [0,50,100].includes(sharedRemote) ? sharedRemote : DEFAULT_FORM.remote_ratio

    const sharedYear = Number(params.get("work_year"))
    nextForm.work_year = options.work_year.includes(sharedYear) ? sharedYear : DEFAULT_FORM.work_year

    setForm(nextForm)

    const sharedCurrency = params.get("currency")
    if (sharedCurrency && CURRENCIES[sharedCurrency]) setCurrency(sharedCurrency)

    const sharedPeriod = params.get("period")
    if (["year","month","week","day"].includes(sharedPeriod)) setPeriod(sharedPeriod)

    const sharedApplyCol = params.get("apply_col")
    if (sharedApplyCol === "true" || sharedApplyCol === "false") setApplyCol(sharedApplyCol === "true")
  },[options])

  useEffect(()=>{
    if(typeof window === "undefined") return
    const nextSearch = serializeShareState(form, {currency, period, applyCol}).toString()
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`
    window.history.replaceState(null, "", nextUrl)
  },[form, currency, period, applyCol])

  useEffect(()=>{
    const fn=()=>setNavScrolled(window.scrollY>60)
    window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn)
  },[])

  const handleChange=e=>{
    const v=["remote_ratio","work_year"].includes(e.target.name)?Number(e.target.value):e.target.value
    setForm(f=>({...f,[e.target.name]:v}))
  }

  const handleSubmit=async()=>{
    if(!form.job_title)        {setError("Please choose a Job Title.");        return}
    if(!options.job_titles.includes(form.job_title)) {setError("Choose a job title from the suggestions so we can match it correctly."); return}
    if(!form.experience_level) {setError("Please select an Experience Level."); return}
    if(!form.employment_type)  {setError("Please select an Employment Type.");  return}
    if(!form.company_location) {setError("Please select a Company Location.");  return}
    if(!form.company_size)     {setError("Please select a Company Size.");      return}
    setLoading(true);setError(null);setResult(null)
    try{
      const res=await axios.post(`${API}/predict`,form)
      setResult(res.data)
      setHistory(h=>[{
        ...form,
        ...res.data,
        ts:new Date().toLocaleTimeString(),
        locationLabel:getCountryLabel(form.company_location),
      },...h].slice(0,5))
      setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),150)
    }catch{
      setError("Unable to predict right now. Please check your connection and try again.")
    }
    finally{setLoading(false)}
  }

  const adjusted = result ? computeSalary(result.predicted_salary_usd, form) : null

  const toDisplay=useCallback((usd)=>{
    const rate=fxRates[currency]??(currency==="INR"?(result?.usd_to_inr_rate??84):1)
    const country=getCountryProfile(form.company_location)
    const colFactor=applyCol?country.col:1.0
    return Math.round(usd*colFactor*rate)
  },[fxRates,currency,result,applyCol,form.company_location])

  const periodDiv={year:1,month:12,week:52,day:260}
  const sym=CURRENCIES[currency]?.symbol??"$"
  const fmt=v=>`${sym}${Math.round(v).toLocaleString()}`

  const baseGross=adjusted?(applyCol?adjusted.gross:adjusted.grossNoCOL):0
  const baseNet=adjusted?(applyCol?adjusted.net:adjusted.netNoCOL):0

  const predicted=adjusted?Math.round(toDisplay(applyCol?adjusted.gross:adjusted.grossNoCOL)/(periodDiv[period]??1)):0
  const net=adjusted?Math.round(toDisplay(applyCol?adjusted.net:adjusted.netNoCOL)/(periodDiv[period]??1)):0
  const low=adjusted?Math.round(predicted*0.82):0
  const high=adjusted?Math.round(predicted*1.18):0

  const chartData=adjusted?[
    {label:"Low",       value:low},
    {label:"Gross",     value:predicted},
    {label:"Take-home", value:net},
    {label:"High",      value:high},
  ]:[]

  // Guard: use empty defaults when no role selected yet
  const roleInfo   = form.job_title
    ? getRoleData(form.job_title)
    : {demand:70,competition:68,hype:65,trend:"→",demandLabel:"Stable",yoy:4,jobPostings:50000,base:120000}

  const countryCtx = getCountryProfile(form.company_location)
  const trendData  = buildTrendData(form.job_title||"Data Scientist")
  const regional   = result&&adjusted?getRegionalContext(form.company_location,baseGross,baseNet,form.job_title,form.work_year):null
  const appCtx     = result?getApplicationContext(form.company_location,form.job_title,form.experience_level):null

  const infMult=INFLATION[form.work_year]??1.0
  const topRoles=[
    {title:"AI Scientist",             base:178000,yoy:22},
    {title:"Machine Learning Engineer",base:185000,yoy:18},
    {title:"NLP Engineer",             base:165000,yoy:20},
    {title:"Computer Vision Engineer", base:162000,yoy:17},
    {title:"Principal Data Scientist", base:172000,yoy:10},
    {title:"Data Architect",           base:152000,yoy:9},
    {title:"Data Engineer",            base:145000,yoy:14},
    {title:"ML Engineer",              base:142000,yoy:16},
    {title:"Data Scientist",           base:135000,yoy:6},
    {title:"Analytics Engineer",       base:128000,yoy:11},
  ].map(r=>({...r,avg:Math.round(r.base*infMult)}))

  const radarData=result?[
    {factor:"Experience",   value:form.experience_level==="EX"?95:form.experience_level==="SE"?75:form.experience_level==="MI"?50:28},
    {factor:"Location",     value:Math.round((countryCtx.col??0.5)*100)},
    {factor:"Remote",       value:form.remote_ratio},
    {factor:"Company size", value:form.company_size==="L"?85:form.company_size==="M"?60:38},
    {factor:"Demand",       value:roleInfo.demand},
  ]:[]
  const salaryStory = result ? getSalaryStory(form, roleInfo, countryCtx, adjusted, applyCol) : []

  const handleCopy=()=>{
    const shareUrl = buildShareUrl(form, {currency, period, applyCol})
    const shareText = `PayLens prediction: ${sym}${predicted.toLocaleString()}/${period} — ${form.job_title}, ${getCountryLabel(form.company_location)}`
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`.trim())
    setCopied(true);setTimeout(()=>setCopied(false),2000)
  }

  if(bootError) return <div className="splash"><div className="empty-icon">!</div><p>{bootError}</p></div>
  if(!options) return <div className="splash"><div className="spinner lg"/><p>Loading PayLens…</p></div>

  return(
    <div className="app" id="home">
      <ScrollProgress/>

        {/* ── NAV ── */}
        <nav className={`nav ${navScrolled?"nav-scrolled":""}`}>
          <div className="nav-logo">
            <BrandLockup variant="nav" />
          </div>
        <div className="nav-gm-wrap"><GradientMenu/></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#factors">Factors</a>
          <a href="#predictor">Predict</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <MeshBackground/><ParticleCanvas/>
        <div className="hero-content">
          <div className="badge-row">
            <span className="badge">Random Forest ML</span>
            <span className="badge">Live FX Rates</span>
            <span className="badge">10-Factor Adjusted</span>
          </div>
          <h1>Know Your<br/><span className="gradient-text">Market Worth</span></h1>
          <p>Predict tech salaries across 23 countries — adjusted for taxes, competition, cost of living, demand, inflation and more.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={()=>document.getElementById("predictor")?.scrollIntoView({behavior:"smooth"})}>Predict My Salary</button>
            <button className="btn-ghost"   onClick={()=>document.getElementById("features")?.scrollIntoView({behavior:"smooth"})}>Explore Features ↓</button>
          </div>
        </div>
        <div className="hero-stats">
          {[["2,500+","Salary records"],["50+","Job titles"],["23","Countries"],["10","Adjustment factors"]].map(
            ([n,l])=><div key={l} className="hstat"><strong>{n}</strong><small>{l}</small></div>)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <h2 className="section-title reveal">What makes this different</h2>
        <p className="section-sub reveal">Click any node to explore. Related nodes pulse when active.</p>
        <div className="orbital-wrapper reveal"><RadialOrbitalTimeline timelineData={TIMELINE_DATA}/></div>
        <div className="bento reveal">
          {[
            {title:"10-factor salary adjustment",body:"Experience, company size, taxes, COL, GDP, talent competition, role demand, remote ratio, employment type and inflation.",wide:true},
            {title:"Regional context & happiness",body:"Country-specific insight: visa difficulty, work culture, tech scene, hiring chances and a happiness meter."},
            {title:"Hype meter",                  body:"Role demand scored against job posting volume, LinkedIn trends and BLS projections."},
            {title:"12 currencies + PPP",          body:"Switch between USD, INR, EUR, GBP, AUD, JPY, CAD, SGD, BRL, MXN, PLN, AED with live rates."},
            {title:"COL toggle",                   body:"Switch between nominal salary and purchasing-power adjusted salary with one button.",wide:true},
          ].map((f,i)=>(
            <div key={i} className={`bento-card ${f.wide?"wide":""}`}>
              <h3>{f.title}</h3><p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SALARY FACTORS ── */}
      <section className="factors-section" id="factors">
        <div className="section-inner">
          <h2 className="section-title reveal">What affects your paycheck</h2>
          <p className="section-sub reveal">10 real-world forces that determine what you actually earn — and why the same role pays 5× differently across countries.</p>
          <div className="factors-grid">
            {SALARY_FACTORS.map((f,i)=>(
              <div key={i} className="factor-card glass reveal">
                <div className="factor-icon" style={{background:f.color+"18",borderColor:f.color+"33"}}>
                  <span style={{fontSize:"1.3rem"}}>{f.icon}</span>
                </div>
                <div className="factor-body">
                  <h3 style={{color:f.color}}>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP ROLES ── */}
      <section className="top-roles-section" id="top-roles">
        <div className="section-inner">
          <h2 className="section-title reveal">Top paying roles in {form.work_year}</h2>
          <p className="section-sub reveal">US senior level · gross salary · inflation-adjusted to {form.work_year}</p>
          <div className="top-roles-grid reveal">
            {topRoles.map((role,i)=>{
              const rd=getRoleData(role.title)
              const dc=rd.demand>=85?"#10b981":rd.demand>=65?"#f59e0b":"#e24b4a"
              return(
                <div key={i} className={`role-card glass ${i<3?"role-card-top":""}`}>
                  <div className="role-rank">#{i+1}</div>
                  <div className="role-info">
                    <div className="role-title">{role.title}</div>
                    <span className="demand-badge" style={{color:dc,borderColor:dc+"44",background:dc+"11"}}>{rd.trend} {rd.demandLabel}</span>
                  </div>
                  <div className="role-salary-col">
                    <div className="role-avg">${role.avg.toLocaleString()}</div>
                    <div className="role-yoy" style={{color:role.yoy>=0?"#10b981":"#e24b4a"}}>{role.yoy>=0?"+":""}{role.yoy}% YoY</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PREDICTOR ── */}
      <section className="predictor" id="predictor">
        <h2 className="section-title reveal">Salary Predictor</h2>
        <div className="predictor-grid">

          {/* FORM */}
          <div className="glass form-panel reveal">
            <h3>Your Profile</h3>

            {/* Hype meter — only shows meaningful data once role is selected */}
            <div className="hype-wrap">
              <HypeMeter roleData={roleInfo}/>
            </div>

            <div className="field-grid">
              <label className="field span2">
                <span>Job Title</span>
                <input
                  type="text"
                  name="job_title"
                  list="job-title-options"
                  value={form.job_title}
                  onChange={handleChange}
                  placeholder="Search and select a job title…"
                />
                <datalist id="job-title-options">
                  {options.job_titles.map(t=><option key={t} value={t} />)}
                </datalist>
                <small className="field-help">Start typing to filter roles like Data Scientist, MLE, or NLP Engineer.</small>
              </label>

              <label className="field">
                <span>Experience Level</span>
                <select name="experience_level" value={form.experience_level} onChange={handleChange}>
                  <option value="" disabled>Select level…</option>
                  {Object.entries(options.experience_level).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Employment Type</span>
                <select name="employment_type" value={form.employment_type} onChange={handleChange}>
                  <option value="" disabled>Select type…</option>
                  {Object.entries(options.employment_type).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Company Location</span>
                <select name="company_location" value={form.company_location} onChange={handleChange}>
                  <option value="" disabled>Select location…</option>
                  {options.locations.map(l=><option key={l} value={l}>{getCountryLabel(l)}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Company Size</span>
                <select name="company_size" value={form.company_size} onChange={handleChange}>
                  <option value="" disabled>Select size…</option>
                  <option value="S">Small (startup)</option>
                  <option value="M">Medium</option>
                  <option value="L">Large (FAANG-scale)</option>
                </select>
              </label>

              <label className="field">
                <span>Remote Ratio</span>
                <select name="remote_ratio" value={form.remote_ratio} onChange={handleChange}>
                  <option value={0}>On-site (0%)</option>
                  <option value={50}>Hybrid (50%)</option>
                  <option value={100}>Fully Remote (100%)</option>
                </select>
              </label>

              <label className="field">
                <span>Work Year</span>
                <select name="work_year" value={form.work_year} onChange={handleChange}>
                  {options.work_year.map(y=><option key={y}>{y}</option>)}
                </select>
              </label>
            </div>

            {/* Trend chart */}
            <div className="trend-box">
              <p className="trend-title">
                {form.job_title?`Salary trend — ${form.job_title}`:"Select a role to see salary trend"}
              </p>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={trendData} margin={{top:4,right:4,left:0,bottom:0}}>
                  <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip formatter={v=>[`$${v.toLocaleString()}`,"US avg"]} contentStyle={{background:"#1e293b",border:"none",borderRadius:8,color:"#f1f5f9",fontSize:11}}/>
                  <Line type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={2}
                    dot={p=>p.payload.year>2023
                      ?<circle key={p.key} cx={p.cx} cy={p.cy} r={3} fill="#06b6d4" stroke="none"/>
                      :<circle key={p.key} cx={p.cx} cy={p.cy} r={2} fill="#10b981" stroke="none"/>}/>
                </LineChart>
              </ResponsiveContainer>
              <p className="trend-note">Green = historical · <span style={{color:"#06b6d4"}}>Blue</span> = projected</p>
            </div>

            <button className="predict-btn" onClick={handleSubmit} disabled={loading}>
              {loading?<><span className="spinner sm"/>Predicting…</>:"Predict My Salary →"}
            </button>
            {error&&<p className="error-msg">{error}</p>}
          </div>

          {/* RESULT */}
          <div className="result-col" ref={resultRef}>
            {!result&&!loading&&(
              <div className="empty-state glass">
                <div className="empty-icon">$</div>
                <p>Fill in your profile and hit Predict</p>
                <small>10 factors · live FX · regional context</small>
              </div>
            )}
            {loading&&(
              <div className="empty-state glass">
                <div className="spinner lg"/><p>Running 10-factor model…</p>
              </div>
            )}
            {result&&adjusted&&(
              <div className="glass result-card animate-in">

                {/* COL toggle */}
                <div className="col-toggle-bar">
                  <span className="col-toggle-label">
                    {applyCol?`COL-adjusted for ${countryCtx.label}`:"Nominal US-equivalent salary"}
                  </span>
                  <button className={`col-toggle-btn ${applyCol?"col-on":"col-off"}`}
                    onClick={()=>setApplyCol(a=>!a)}>
                    {applyCol?"COL ON":"COL OFF"}
                  </button>
                </div>

                {/* Currency pills */}
                <div className="currency-row">
                  {Object.entries(CURRENCIES).map(([k,c])=>(
                    <button key={k} className={`cur-pill ${currency===k?"active":""}`}
                      onClick={()=>setCurrency(k)} title={c.label}>{c.flag} {k}</button>
                  ))}
                </div>

                {/* Period pills */}
                <div className="period-row">
                  {["year","month","week","day"].map(p=>(
                    <button key={p} className={`period-pill ${period===p?"active":""}`}
                      onClick={()=>setPeriod(p)}>Per {p}</button>
                  ))}
                </div>

                {/* Main salary */}
                <div className="salary-hero">
                  <div className="salary-amount"><AnimatedNumber value={predicted} prefix={sym}/></div>
                  <div className="salary-period">gross · per {period}</div>
                  <div className="take-home-row">
                    <span className="take-home-label">Take-home (est.):</span>
                    <span className="take-home-val">{sym}{net.toLocaleString()}</span>
                  </div>
                </div>

                {/* Range bar */}
                <div className="range-section">
                  <div className="range-labels">
                    <span>{fmt(low)}</span>
                    <span className="range-mid">typical range</span>
                    <span>{fmt(high)}</span>
                  </div>
                  <div className="range-track"><div className="range-fill"/><div className="range-dot"/></div>
                </div>

                {/* Bar chart */}
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={chartData} margin={{top:8,right:4,left:4,bottom:0}}>
                    <XAxis dataKey="label" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip formatter={v=>[`${sym}${v.toLocaleString()}`,"Salary"]}
                      contentStyle={{background:"#1e293b",border:"none",borderRadius:8,color:"#f1f5f9",fontSize:11}}/>
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      <Cell fill="#334155"/><Cell fill="#10b981"/><Cell fill="#06b6d4"/><Cell fill="#334155"/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Regional context */}
                {regional&&(
                  <div className="regional-box">
                    <p className="regional-title">{countryCtx.label} — salary context</p>
                    <p className="regional-text">{regional}</p>
                    <div className="regional-stats">
                      <div className="rs-item"><span className="rs-val">{Math.round((1-countryCtx.tax)*100)}%</span><span className="rs-label">Effective tax</span></div>
                      <div className="rs-item"><span className="rs-val">{(baseGross/countryCtx.avgWage).toFixed(1)}×</span><span className="rs-label">vs local avg</span></div>
                      <div className="rs-item"><span className="rs-val">{Math.round(countryCtx.col*100)}%</span><span className="rs-label">of US COL</span></div>
                      <div className="rs-item"><span className="rs-val">{Math.round(countryCtx.gdp*100)}%</span><span className="rs-label">of US GDP/cap</span></div>
                    </div>
                  </div>
                )}

                {salaryStory.length>0&&(
                  <div className="insight-box">
                    <p className="insight-title">Why this number looks like this</p>
                    <div className="insight-list">
                      {salaryStory.map((item, index)=>(
                        <p key={index} className="insight-item">{item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Radar */}
                <div className="radar-section">
                  <p className="radar-title">Factor influence</p>
                  <ResponsiveContainer width="100%" height={175}>
                    <RadarChart data={radarData} margin={{top:0,right:20,left:20,bottom:0}}>
                      <PolarGrid stroke="#334155"/>
                      <PolarAngleAxis dataKey="factor" tick={{fill:"#94a3b8",fontSize:10}}/>
                      <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="result-footer">
                  <span className="fx-note">1 USD = {sym}{(fxRates[currency]??1).toFixed(2)} · live</span>
                  <button className="share-btn" onClick={handleCopy}>{copied?"Copied link!":"Copy share link"}</button>
                </div>
              </div>
            )}

            {/* Happiness meter */}
            {appCtx&&<HappinessMeter ctx={appCtx}/>}
          </div>
        </div>
      </section>

      {/* ── HISTORY ── */}
      {history.length>0&&(
        <section className="history-section" id="history">
          <h2 className="section-title reveal">Recent predictions</h2>
          <div className="history-grid">
            {history.map((h,i)=>(
              <div key={i} className="glass history-card reveal">
                <div className="hc-title">{h.job_title}</div>
                <div className="hc-salary">${Math.round(h.predicted_salary_usd).toLocaleString()}</div>
                <div className="hc-meta">{h.experience_level} · {h.locationLabel ?? getCountryLabel(h.company_location)} · {h.ts}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      <section className="about-section" id="about">
        <div className="section-inner">
            <div className="about-grid">
              <div className="about-left reveal">
                <BrandLockup variant="about" className="about-brand" />
                <h2>Biswaranjan Nayak</h2>
                <p className="about-bio">Built PayLens as a full-stack ML project — from raw dataset exploration and model training in Python, to a FastAPI backend with live FX integration, to this React frontend with a 10-factor adjustment engine. The goal: honest, context-aware salary estimates grounded in real economics — not glazed benchmarks.</p>
              <div className="about-links">
                <a href="https://www.linkedin.com/in/biswaranjan-nayak-063809299/" target="_blank" rel="noreferrer" className="about-link linkedin">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn — Biswaranjan Nayak
                </a>
                <a href="https://github.com/Biswa-14" target="_blank" rel="noreferrer" className="about-link github">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub — Biswa-14
                </a>
                <a href="mailto:biswanyk14@outlook.com" className="about-link email">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  biswanyk14@outlook.com
                </a>
              </div>
            </div>
            <div className="about-right reveal">
              <div className="tech-stack-card glass">
                <h3>Tech stack</h3>
                <div className="tech-list">
                  {[
                    {name:"Python",       role:"Data processing + ML training"},
                    {name:"scikit-learn", role:"Random Forest regressor"},
                    {name:"FastAPI",      role:"REST API + live FX"},
                    {name:"React",        role:"Frontend SPA"},
                    {name:"Recharts",     role:"Charts + radar + line"},
                    {name:"Formspree",    role:"Feedback form"},
                  ].map(t=>(
                    <div key={t.name} className="tech-item">
                      <span className="tech-name">{t.name}</span>
                      <span className="tech-role">{t.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="feedback-card glass">
                <h3>Leave feedback</h3>
                <p>Suggestions, bugs, ideas — I read every message.</p>
                <FeedbackForm/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer">
        <div className="footer-inner">
          <div className="nav-logo">
            <BrandLockup variant="footer" />
          </div>
          <div className="footer-stack">
            <span>FastAPI</span><span>scikit-learn</span><span>React</span>
            <span>Recharts</span><span>DS Salaries</span><span>exchangerate-api.com</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
