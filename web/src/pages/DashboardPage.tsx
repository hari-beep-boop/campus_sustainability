import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDateFilter } from '../context/DateFilterContext';
import PageHeader from '../components/ui/PageHeader';
import DeviceOverviewCard from '../components/ui/DeviceOverviewCard';
import StatTile from '../components/ui/StatTile';
import Card from '../components/ui/Card';
import SemiGauge from '../components/ui/SemiGauge';
import WeekStrip, { DayItem } from '../components/ui/WeekStrip';
import ScheduleGrid, { ScheduleEvent } from '../components/ui/ScheduleGrid';
import SpotlightCard, { SpotlightBuilding } from '../components/ui/SpotlightCard';
import ListRow from '../components/ui/ListRow';
import {
  Calendar as CalendarIcon,
  Sparkles,
  BarChart3,
  TrendingUp,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isStaff, isAdmin } = useAuth();

  // 1. Energy Budget Gauge state
  const [budgetMetric, setBudgetMetric] = useState<'electricity' | 'water' | 'air' | 'cost' | 'emissions'>('electricity');

  const budgetMetricsData = {
    electricity: {
      percent: 26,
      label: 'remaining',
      subtext: '3,712 / 5,000 kWh used',
      insight: 'On track to finish the day 4% under daily allocation limit.',
    },
    water: {
      percent: 39,
      label: 'remaining',
      subtext: '18,420 / 30,000 L used',
      insight: 'Flow rate steady; nocturnal drawdown within nominal boundary.',
    },
    air: {
      percent: 71,
      label: 'under limit',
      subtext: 'Occupied hours < 1,000 ppm',
      insight: 'Classroom mechanical ventilation maintaining optimal IAQ.',
    },
    cost: {
      percent: 26,
      label: 'budget left',
      subtext: '₹29,696 / ₹40,000 spent',
      insight: 'Peak tariff shaving active between 14:00 - 16:00.',
    },
    emissions: {
      percent: 26,
      label: 'carbon quota',
      subtext: '2,636 / 3,550 kg CO2e',
      insight: 'Grid emission factor calculated at standard 0.71 kg/kWh.',
    },
  };

  const currentBudget = budgetMetricsData[budgetMetric];

  // 2. Schedule week strip state & Date Filter sync
  const { selectedDate, setSelectedDate } = useDateFilter();
  const weekDays: DayItem[] = [
    { dayName: 'Sun', date: 25, fullDate: '2026-10-25' },
    { dayName: 'Mon', date: 26, fullDate: '2026-10-26' },
    { dayName: 'Tue', date: 27, fullDate: '2026-10-27' },
    { dayName: 'Wed', date: 28, fullDate: '2026-10-28' },
    { dayName: 'Thu', date: 29, fullDate: '2026-10-29' },
    { dayName: 'Fri', date: 30, fullDate: '2026-10-30' },
    { dayName: 'Sat', date: 31, fullDate: '2026-10-31' },
  ];
  const [scheduleCategory, setScheduleCategory] = useState('all');

  // Operations schedule data categorized by date:
  // Present day is 28 Oct 2026. Future days (29, 30, 31) have NO operations data shown!
  const scheduleEventsByDate: Record<string, ScheduleEvent[]> = {
    '2026-10-28': [
      { id: '1', time: '07:00 AM', hour: 7, title: 'AHU filter replacement', subtitle: 'Du Bois Library • Ramesh Kulkarni', category: 'maintenance' },
      { id: '2', time: '07:30 AM', hour: 7, title: 'CO2 zero-point calibration', subtitle: 'LIB-02 • Ananya Rao', category: 'calibration' },
      { id: '3', time: '08:00 AM', hour: 8, title: 'Morning HVAC ramp-up', subtitle: 'Integrated Learning Center • 310 kW', category: 'peak' },
      { id: '4', time: '09:00 AM', hour: 9, title: 'Energy walk-through audit', subtitle: 'Lederle Research Tower • Vikram Joshi', category: 'audit' },
      { id: '5', time: '10:00 AM', hour: 10, title: 'Flow sensor K-factor check', subtitle: 'SCI-01 • Ananya Rao', category: 'water' },
      { id: '6', time: '11:00 AM', hour: 11, title: 'CO2 above 1,000 ppm (25m)', subtitle: 'Lederle • Lab 3B', category: 'alert' },
      { id: '7', time: '01:00 PM', hour: 13, title: 'Lunch-hour chiller load', subtitle: 'Du Bois Library • 380 kW', category: 'peak' },
      { id: '8', time: '02:00 PM', hour: 14, title: 'Peak load alert (412 kW)', subtitle: 'Campus Wide • 92% of contract', category: 'alert' },
      { id: '9', time: '03:30 PM', hour: 15, title: 'Replace faulty flush valve', subtitle: 'Franklin Hall • Suresh Patil', category: 'maintenance' },
      { id: '10', time: '05:00 PM', hour: 17, title: 'Ventilation boost for exams', subtitle: 'Integrated Learning Center', category: 'air' },
    ],
    '2026-10-27': [
      { id: 'y1', time: '07:00 AM', hour: 7, title: 'Chilled water pump inspection', subtitle: 'Chiller Plant #2 • Vikram Joshi', category: 'maintenance' },
      { id: 'y2', time: '08:30 AM', hour: 8, title: 'Water sub-meter calibration', subtitle: 'Central Mall • Ananya Rao', category: 'calibration' },
      { id: 'y3', time: '11:00 AM', hour: 11, title: 'Solar inverter thermal scan', subtitle: 'Du Bois Rooftop • Audit team', category: 'audit' },
      { id: 'y4', time: '02:00 PM', hour: 14, title: 'Routine pipe pressure test', subtitle: 'Franklin Hostel • Suresh Patil', category: 'water' },
      { id: 'y5', time: '04:30 PM', hour: 16, title: 'Air filter post-cleaning check', subtitle: 'Lederle Lab 2A', category: 'air' },
    ],
    '2026-10-26': [
      { id: 'p1', time: '08:00 AM', hour: 8, title: 'Weekly generator load test', subtitle: 'Substation Alpha • Ramesh Kulkarni', category: 'maintenance' },
      { id: 'p2', time: '10:00 AM', hour: 10, title: 'Classroom sensor mesh check', subtitle: 'ILC 101-108', category: 'calibration' },
      { id: 'p3', time: '03:00 PM', hour: 15, title: 'Reservoir level telemetry test', subtitle: 'North Reservoir', category: 'water' },
    ],
    '2026-10-25': [
      { id: 's1', time: '09:00 AM', hour: 9, title: 'Weekend baseline energy read', subtitle: 'Campus Wide • Energy Office', category: 'audit' },
      { id: 's2', time: '01:00 PM', hour: 13, title: 'Chiller cycling routine', subtitle: 'Central Plant', category: 'maintenance' },
    ],
  };

  // For next days / future dates (date > '2026-10-28'), strictly return [] (no next day data shown)
  const activeScheduleEvents = selectedDate > '2026-10-28' ? [] : (scheduleEventsByDate[selectedDate] || []);

  // 3. Buildings & Spotlight State
  const buildingsList: SpotlightBuilding[] = [
    { id: 'BLD-03', code: 'BLD-03', name: 'W.E.B. Du Bois Library', type: 'Library', location: 'North Quad', status: 'warning', todayKwh: 1284, todayL: 5210, avgCo2: 842 },
    { id: 'BLD-01', code: 'BLD-01', name: 'Integrated Learning Center', type: 'Academic', location: 'Central Mall', status: 'normal', todayKwh: 742, todayL: 3960, avgCo2: 768 },
    { id: 'BLD-02', code: 'BLD-02', name: 'Lederle Research Tower', type: 'Laboratory', location: 'East Campus', status: 'critical', todayKwh: 1105, todayL: 4880, avgCo2: 1120 },
    { id: 'BLD-04', code: 'BLD-04', name: 'Science Center', type: 'Research', location: 'Science Quad', status: 'normal', todayKwh: 412, todayL: 2950, avgCo2: 705 },
    { id: 'BLD-05', code: 'BLD-05', name: 'Franklin Hall (Hostel)', type: 'Residential', location: 'South Gate', status: 'normal', todayKwh: 169, todayL: 1420, avgCo2: 640 },
  ];
  const [selectedBuildingId, setSelectedBuildingId] = useState('BLD-03');
  const activeSpotlight = buildingsList.find((b) => b.id === selectedBuildingId) || buildingsList[0];

  // 4. Usage Trends state
  const [trendMetric, setTrendMetric] = useState<'energy' | 'water' | 'co2'>('energy');
  const trendData = [
    { date: '10/15', energy: 3450, water: 16200, co2: 710, forecast: 3400, upper: 3800, lower: 3000 },
    { date: '10/16', energy: 3620, water: 17100, co2: 740, forecast: 3550, upper: 3980, lower: 3120 },
    { date: '10/17', energy: 3780, water: 18400, co2: 760, forecast: 3700, upper: 4150, lower: 3250 },
    { date: '10/18', energy: 3820, water: 18900, co2: 790, forecast: 3750, upper: 4200, lower: 3300 },
    { date: '10/19', energy: 3910, water: 19400, co2: 820, forecast: 3850, upper: 4320, lower: 3380 },
    { date: '10/20', energy: 3100, water: 14500, co2: 680, forecast: 3150, upper: 3550, lower: 2750 },
    { date: '10/21', energy: 2950, water: 13900, co2: 650, forecast: 3000, upper: 3380, lower: 2620 },
    { date: '10/22', energy: 3580, water: 17800, co2: 750, forecast: 3520, upper: 3950, lower: 3090 },
    { date: '10/23', energy: 3690, water: 18100, co2: 780, forecast: 3650, upper: 4090, lower: 3210 },
    { date: '10/24', energy: 3740, water: 18350, co2: 810, forecast: 3700, upper: 4150, lower: 3250 },
    { date: '10/25', energy: 3810, water: 18900, co2: 830, forecast: 3780, upper: 4240, lower: 3320 },
    { date: '10/26', energy: 3680, water: 18200, co2: 790, forecast: 3650, upper: 4090, lower: 3210 },
    { date: '10/27', energy: 3712, water: 18420, co2: 842, forecast: 3710, upper: 4160, lower: 3260 },
    { date: '10/28', energy: 3712, water: 18420, co2: 842, forecast: 3712, upper: 4160, lower: 3260 },
  ];

  // 5. Building Comparison Toggle
  const [bldViewMode, setBldViewMode] = useState<'total' | 'perM2'>('total');
  const bldComparisonData = buildingsList.map((b) => ({
    name: b.code,
    fullName: b.name,
    kwh: bldViewMode === 'total' ? b.todayKwh : Number((b.todayKwh / (b.id === 'BLD-03' ? 23 : 10)).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Row with Live Pill & Actions */}
      <PageHeader
        title="Campus Operations"
        breadcrumb="Operations / Campus Operations"
        openAlertsCount={2}
        onAddDevice={isAdmin ? () => navigate('/devices') : undefined}
      />

      {/* ========================================================================= */}
      {/* ROW 1 & 2: Main Grid (12 Columns)                                         */}
      {/* Col 1-5: Device Overview | Col 6-9: 2x2 StatTiles | Col 10-12: Spotlight  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1 to 5: Device & Room Overview */}
        <div className="lg:col-span-5 flex flex-col">
          <DeviceOverviewCard
            onNavigate={() => navigate('/live')}
            className="h-full"
          />
        </div>

        {/* Col 6 to 9: 2x2 Stat Tiles Grid */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Energy Today */}
          <StatTile
            title="Energy Today"
            subtitle="3,712 / 5,000 kWh"
            value="74"
            unit="%"
            label="of daily limit"
            percent={74}
            tone="energy"
            onNavigate={() => navigate('/analytics')}
          />

          {/* Tile 2: Air Quality */}
          <StatTile
            title="Air Quality"
            subtitle="Indoor ppm (400-2000)"
            value="842"
            unit=""
            label="ppm avg"
            percent={45}
            tone="air"
            onNavigate={() => navigate('/live')}
          />

          {/* Tile 3: Water Today */}
          <StatTile
            title="Water Today"
            subtitle="18,420 / 30,000 L"
            value="61"
            unit="%"
            label="of daily limit"
            percent={61}
            tone="water"
            onNavigate={() => navigate('/analytics')}
          />

          {/* Tile 4: Peak Grid Load */}
          <StatTile
            title="Peak Grid Load"
            subtitle="412 / 450 kW at 14:05"
            value=">90"
            unit="%"
            label="contract demand"
            percent={92}
            tone="danger"
            onNavigate={() => navigate('/alerts')}
          />
        </div>

        {/* Col 10 to 12: Building Spotlight + Monitored Buildings Rail */}
        <div className="lg:col-span-3 lg:row-span-2 flex flex-col space-y-4">
          {/* Spotlight Card */}
          <SpotlightCard building={activeSpotlight} />

          {/* Monitored Buildings List */}
          <Card
            title="Monitored Buildings"
            action={<ChevronDown className="w-4 h-4 text-muted cursor-pointer" />}
            className="flex-1"
          >
            <div className="space-y-2 mt-1">
              {buildingsList.map((b) => (
                <ListRow
                  key={b.id}
                  id={b.id}
                  name={b.name}
                  subtext={`${b.todayKwh.toLocaleString()} kWh • ${b.avgCo2} ppm`}
                  status={b.status}
                  isSelected={b.id === selectedBuildingId}
                  onClick={() => setSelectedBuildingId(b.id)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: Energy Budget Semicircle Gauge (3 cols) & Schedule (6 cols)        */}
        {/* ========================================================================= */}

        {/* Col 1 to 3: Energy Budget Arc Gauge */}
        <div className="lg:col-span-4 flex flex-col">
          <Card
            title="Equipments &amp; Budget"
            onNavigate={() => navigate('/analytics')}
            className="h-full flex flex-col justify-between"
          >
            {/* Horizontal Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px] font-semibold">
              {(
                [
                  { id: 'electricity', label: 'Electricity' },
                  { id: 'water', label: 'Water' },
                  { id: 'air', label: 'CO₂ Air' },
                  { id: 'cost', label: 'Cost ₹' },
                  { id: 'emissions', label: 'Emissions' },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setBudgetMetric(chip.id)}
                  className={`px-3 py-1 rounded-pill whitespace-nowrap transition-all ${
                    budgetMetric === chip.id
                      ? 'bg-white dark:bg-[#1A2C27] text-ink border border-card-border shadow-xs font-bold'
                      : 'bg-[#EBF3F0] dark:bg-[#182C26] text-muted hover:text-ink'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Semicircle Gauge Component */}
            <div className="my-2 py-1">
              <SemiGauge
                value={currentBudget.percent}
                label={currentBudget.label}
                subtext={currentBudget.subtext}
                keyInsight={currentBudget.insight}
              />
            </div>
          </Card>
        </div>

        {/* Col 4 to 9: Operations Schedule (6 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card
            title="Operations Schedule"
            icon={<CalendarIcon className="w-4 h-4" />}
            action={
              <div className="px-2.5 py-0.5 rounded-pill bg-[#E6F1ED] dark:bg-[#1C322B] text-[11px] font-bold text-ink">
                October 2026
              </div>
            }
            className="h-full flex flex-col justify-between"
          >
            {/* Sun - Sat Week Strip */}
            <WeekStrip
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none text-[10px] font-bold uppercase tracking-wider">
              {['All', 'Maintenance', 'Calibration', 'Peak', 'Audit', 'Water', 'Air', 'Alert'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setScheduleCategory(cat.toLowerCase())}
                    className={`px-2.5 py-1 rounded-pill whitespace-nowrap transition-all ${
                      scheduleCategory === cat.toLowerCase()
                        ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-xs'
                        : 'bg-[#EAF3F0] dark:bg-[#182B25] text-muted hover:text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Hour Rows & Events Grid */}
            <div className="mt-2 max-h-64 overflow-y-auto pr-1">
              <ScheduleGrid
                events={activeScheduleEvents}
                selectedDate={selectedDate}
                selectedCategory={scheduleCategory}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: Trends & Forecast (6 cols), Comparison (3 cols), Alerts & AI (3 cols)*/}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Usage Trends + Forecast (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <Card
            title="Usage Trends &amp; Forecast (14d Actual + 7d Model)"
            icon={<TrendingUp className="w-4 h-4" />}
            action={
              <div className="flex items-center space-x-1 p-0.5 rounded-pill bg-[#E6F1ED] dark:bg-[#1C322B] text-[11px] font-bold">
                {(['energy', 'water', 'co2'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTrendMetric(m)}
                    className={`px-2.5 py-0.5 rounded-pill uppercase transition-all ${
                      trendMetric === m
                        ? 'bg-white dark:bg-[#25453B] text-ink shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
            onNavigate={() => navigate('/analytics')}
            className="h-full flex flex-col justify-between"
          >
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderRadius: '16px',
                      border: '1px solid var(--card-border)',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#DDF0EA"
                    fillOpacity={0.6}
                    name="±12% Upper Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                    name="±12% Lower Band"
                  />
                  <Line
                    type="monotone"
                    dataKey={trendMetric}
                    stroke="#0E6B5A"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#0E6B5A' }}
                    name="Actual Daily"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#C2702A"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                    name="EWMA Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-card-border mt-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-primary rounded-full inline-block" /> Actual Solid
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-[#C2702A] border-dashed border-b inline-block" /> Forecast
                </span>
              </div>
              <span>Seasonal Naive + EWMA v1.0</span>
            </div>
          </Card>
        </div>

        {/* Building Comparison Bar Chart (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col">
          <Card
            title="Building Intensity"
            icon={<BarChart3 className="w-4 h-4" />}
            action={
              <button
                type="button"
                onClick={() => setBldViewMode(bldViewMode === 'total' ? 'perM2' : 'total')}
                className="px-2.5 py-0.5 rounded-pill bg-[#E6F1ED] dark:bg-[#1C322B] text-[10px] font-bold text-ink uppercase flex items-center space-x-1"
              >
                <Sliders className="w-3 h-3" />
                <span>{bldViewMode === 'total' ? 'Total' : 'per m²'}</span>
              </button>
            }
            className="h-full flex flex-col justify-between"
          >
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bldComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderRadius: '16px',
                      border: '1px solid var(--card-border)',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="kwh" fill="#0E6B5A" radius={[6, 6, 0, 0]} name="Today kWh" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-muted pt-2 border-t border-card-border mt-2 text-center">
              Top Consumer: <strong>W.E.B. Du Bois Library (1,284 kWh)</strong>
            </div>
          </Card>
        </div>

        {/* Alerts & AI Insights Card (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* AI Sparkle Card */}
          <div className="bg-gradient-to-br from-[#FDF0F3] to-[#FCE6EB] dark:from-[#2B151A] dark:to-[#1F1014] border border-[#F5CCD6] dark:border-[#52232D] rounded-card p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#FCE2E8] dark:bg-[#3D1A22] text-[#D9465F] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-[#8A1F33] dark:text-[#FFA6B7] uppercase tracking-wider">
                  Gemini AI Insight
                </span>
              </div>
              <span className="text-[10px] text-muted">2h ago</span>
            </div>

            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Night base load at Lederle is 46% of daytime average. Setting HVAC setback 23:00–05:00 could save ~2,900 kWh/mo.
            </p>

            {isStaff && (
              <button
                type="button"
                onClick={() => navigate('/ai-planner')}
                className="mt-3 w-full py-1.5 px-3 rounded-pill bg-[#D9465F] hover:bg-[#C0354E] text-white text-xs font-bold transition-all shadow-pill flex items-center justify-center space-x-1.5"
              >
                <span>Open AI Planner</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>

          {/* Active Incidents Mini Card */}
          <Card
            title="Active Incidents"
            onNavigate={isStaff ? () => navigate('/alerts') : undefined}
            className="flex-1"
          >
            <div className="space-y-2">
              <div className="p-2 rounded-tile bg-white dark:bg-[#1A2C27] border border-card-border flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ink text-[11px]">Lederle Lab 3B CO₂ 1,240 ppm</div>
                  <div className="text-[10px] text-muted">Ventilation boost needed</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-800">
                  Critical
                </span>
              </div>

              <div className="p-2 rounded-tile bg-white dark:bg-[#1A2C27] border border-card-border flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-ink text-[11px]">Franklin Hall night flow</div>
                  <div className="text-[10px] text-muted">0.6 L/min continuous draw</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800">
                  Warning
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
