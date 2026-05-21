/**
 * Función 10 — Gráfica de tendencia glucémica
 */
 
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useAuth } from '../../context/AuthContext';
import { glucose } from '../../services/api';
 
const { width } = Dimensions.get('window');
const CHART_W   = width - 48;
const MIN_POINT_SPACING = 50; 
 
const C = {
  hypoglycemia: '#F472B6',
  normal:       '#34D399',
  prediabetes:  '#FBBF24',
  high_glucose: '#F87171',
  bg:           '#060D1F',
  surface:      '#0F172A',
  border:       '#1E293B',
  text:         '#E2E8F0',
  muted:        '#64748B',
  subtle:       '#94A3B8',
};
 
const statusColor = (status: string) =>
  (C as Record<string,string>)[status] ?? C.normal;
 
const classifyValue = (v: number, context = 'random') => {
  if (v < 70) return 'hypoglycemia';
  if (context === 'fasting')
    return v <= 99 ? 'normal' : v <= 125 ? 'prediabetes' : 'high_glucose';
  return v <= 139 ? 'normal' : v <= 199 ? 'prediabetes' : 'high_glucose';
};
 
const STATUS_LABEL: Record<string, string> = {
  hypoglycemia: 'Hipoglucemia',
  normal:       'Normal',
  prediabetes:  'Prediabetes',
  high_glucose: 'Glucosa Alta',
};
 
const formatHour = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
 
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};
 
const sameDay = (isoA: string, dayStr: string) =>
  isoA.slice(0, 10) === dayStr;
 

export default function ChartScreen() {
  const router              = useRouter();
  const { user, isLoading } = useAuth();
 
  const [readings, setReadings]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<'hourly' | 'daily'>('hourly');
  const [dayRange, setDayRange]       = useState<7|14|30>(7);
  const [selectedDay, setSelectedDay] = useState<string>(''); // formato YYYY-MM-DD
  const [showReadingsList, setShowReadingsList] = useState(false);
 
  useEffect(() => {
    if (!isLoading && !user) router.replace('/(auth)/login');
  }, [isLoading, user]);
 
  useEffect(() => {
    if (user) {
      glucose.history()
        .then(d => {
          const list: any[] = d?.results || d || [];
          setReadings(list);
          if (list.length > 0) {
            // Inicializar con el día más reciente
            setSelectedDay(list[0].reading_date.slice(0, 10));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);
 
  if (isLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.normal} />
      </View>
    );
  }
 
  const dayReadings = readings
    .filter(r => sameDay(r.reading_date, selectedDay))
    .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
 
  
  const uniqueDays = [...new Set(readings.map(r => r.reading_date.slice(0, 10)))]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 14);
 
  const lineChartWidth = Math.max(
    CHART_W - 32,
    dayReadings.length * MIN_POINT_SPACING
  );
 
  const lineData = dayReadings.map(r => ({
    value:           r.glucose_value,
    label:           formatHour(r.reading_date),
    dataPointColor:  statusColor(r.status ?? classifyValue(r.glucose_value, r.context)),
    dataPointRadius: 5,
    labelTextStyle:  { color: C.muted, fontSize: 9 },
  }));
 
  const sliced  = readings.slice(0, dayRange).reverse();
  const barData = sliced.map(r => {
    const st  = r.status ?? classifyValue(r.glucose_value, r.context);
    const col = statusColor(st);
    return {
      value:             r.glucose_value,
      label:             `${new Date(r.reading_date).getDate()}/${new Date(r.reading_date).getMonth()+1}`,
      frontColor:        col,
      gradientColor:     col + '88',
      labelTextStyle:    { color: C.muted, fontSize: 9 },
      topLabelComponent: () => (
        <Text style={{ color: col, fontSize: 8, fontWeight: '700' }}>
          {r.glucose_value}
        </Text>
      ),
    };
  });
 
  const values   = sliced.map(r => r.glucose_value);
  const avg      = values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
  const inRange  = values.filter(v => v>=70 && v<=139).length;
  const pct      = values.length ? Math.round((inRange/values.length)*100) : 0;
  const maxVal   = Math.max(...values, 250);
 
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tendencia glucémica</Text>
        <View style={{ width: 22 }} />
      </View>
 
      
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'hourly' && styles.tabActive]}
          onPress={() => setTab('hourly')}
        >
          <Ionicons name="time-outline" size={15} color={tab === 'hourly' ? C.normal : C.muted} />
          <Text style={[styles.tabText, tab === 'hourly' && styles.tabTextActive]}>Vista diaria</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'daily' && styles.tabActive]}
          onPress={() => setTab('daily')}
        >
          <Ionicons name="bar-chart-outline" size={15} color={tab === 'daily' ? C.normal : C.muted} />
          <Text style={[styles.tabText, tab === 'daily' && styles.tabTextActive]}>Tendencia</Text>
        </TouchableOpacity>
      </View>
 
      {/*  VISTA POR HORAS  */}
      {tab === 'hourly' && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={14} color={C.subtle} />
            <Text style={styles.sectionLabel}>Selecciona el día</Text>
          </View>
 
          {/* Selector de días */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
              {uniqueDays.map(day => {
                const isSelected = selectedDay === day;
                const count = readings.filter(r => r.reading_date.slice(0,10) === day).length;
                const d = new Date(day + 'T12:00:00'); // mediodía para evitar offset
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayPill, isSelected && styles.dayPillActive]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayPillDay, isSelected && { color: C.normal }]}>
                      {d.getDate()}/{d.getMonth()+1}
                    </Text>
                    <Text style={[styles.dayPillCount, isSelected && { color: C.normal + 'CC' }]}>
                      {count} lect.
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
 
          {dayReadings.length < 2 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="time-outline" size={44} color="#334155" />
              <Text style={styles.emptyTitle}>
                {dayReadings.length === 0
                  ? 'Sin lecturas para este día'
                  : 'Se necesitan al menos 2 lecturas para mostrar la línea'}
              </Text>
              <Text style={styles.emptyHint}>Registra más lecturas a lo largo del día</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/reading')}>
                <Text style={styles.emptyBtnText}>Registrar lectura</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              
              <View style={styles.daySummaryRow}>
                {(() => {
                  const dv    = dayReadings.map(r => r.glucose_value);
                  const dAvg  = Math.round(dv.reduce((a,b)=>a+b,0)/dv.length);
                  const dMax  = Math.max(...dv);
                  const dMin  = Math.min(...dv);
                  const dPct  = Math.round((dv.filter(v=>v>=70&&v<=139).length/dv.length)*100);
                  return [
                    { val: dAvg,    lbl: 'Promedio', color: C.subtle },
                    { val: dMax,    lbl: 'Máximo',   color: C.high_glucose },
                    { val: dMin,    lbl: 'Mínimo',   color: C.normal },
                    { val: `${dPct}%`, lbl: 'En rango', color: C.normal },
                  ].map(s => (
                    <View key={s.lbl} style={styles.dayStat}>
                      <Text style={[styles.dayStatVal, { color: s.color }]}>{s.val}</Text>
                      <Text style={styles.dayStatLbl}>{s.lbl}</Text>
                    </View>
                  ));
                })()}
              </View>
 
              
              <View style={styles.chartCard}>
                <Text style={styles.chartCardTitle}>
                  Evolución del {formatDate(selectedDay + 'T12:00:00')} por hora
                </Text>
 
                
                <View style={styles.zoneLabels}>
                  <Text style={[styles.zoneLabel, { color: C.high_glucose }]}>Alto ≥140</Text>
                  <Text style={[styles.zoneLabel, { color: C.normal }]}>Normal 70–139</Text>
                  <Text style={[styles.zoneLabel, { color: C.hypoglycemia }]}>Bajo &lt;70</Text>
                </View>
 
                
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  <LineChart
                    data={lineData}
                    width={lineChartWidth}
                    height={200}
                    curved
                    isAnimated
                    animationDuration={800}
                    color={C.normal}
                    thickness={2.5}
                    dataPointsColor={C.normal}
                    dataPointsRadius={5}
                    startFillColor={C.normal + '40'}
                    endFillColor={C.normal + '05'}
                    startOpacity={0.4}
                    endOpacity={0.05}
                    areaChart
                    yAxisColor="#1E293B"
                    xAxisColor="#1E293B"
                    yAxisTextStyle={{ color: C.muted, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: C.muted, fontSize: 9 }}
                    rulesColor="#1E293B"
                    rulesType="solid"
                    yAxisLabelSuffix=" mg"
                    maxValue={
                      Math.max(...dayReadings.map(r => r.glucose_value), 200) + 30
                    }
                    noOfSections={5}
                    backgroundColor="transparent"
                    referenceLine1Config={{
                      color: C.normal + '90',
                      dashWidth: 4,
                      dashGap: 4,
                      thickness: 1.5,
                    }}
                    referenceLine1Position={139}
                    referenceLine2Config={{
                      color: C.hypoglycemia + '90',
                      dashWidth: 4,
                      dashGap: 4,
                      thickness: 1.5,
                    }}
                    referenceLine2Position={70}
                    pointerConfig={{
                      pointerStripHeight: 160,
                      pointerStripColor: C.subtle + '60',
                      pointerStripWidth: 1.5,
                      pointerColor: C.normal,
                      radius: 6,
                      pointerLabelWidth: 96,
                      pointerLabelHeight: 52,
                      activatePointersOnLongPress: false,
                      autoAdjustPointerLabelPosition: true,
                      pointerLabelComponent: (items: any[]) => {
                        const item = items[0];
                        const st   = classifyValue(item.value);
                        return (
                          <View style={styles.tooltip}>
                            <Text style={[styles.tooltipVal, { color: statusColor(st) }]}>
                              {item.value} mg/dL
                            </Text>
                            <Text style={styles.tooltipLabel}>{STATUS_LABEL[st]}</Text>
                          </View>
                        );
                      },
                    }}
                  />
                </ScrollView>
 
                {/* Indicador de scroll si hay muchos puntos */}
                {dayReadings.length > 6 && (
                  <View style={styles.scrollHint}>
                    <Ionicons name="swap-horizontal-outline" size={12} color={C.muted} />
                    <Text style={styles.scrollHintText}>Desliza para ver todos los puntos</Text>
                  </View>
                )}
              </View>
 
              {/* Lista de lecturas del día */}
              <TouchableOpacity
                style={styles.toggleReadingsButton}
                onPress={() => setShowReadingsList(!showReadingsList)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="list-outline" size={18} color={C.subtle} />
                  <Text style={styles.toggleReadingsText}>
                    {showReadingsList ? "Ocultar" : "Mostrar"} lecturas del día ({dayReadings.length})
                  </Text>
                </View>
                <Ionicons
                  name={showReadingsList ? "chevron-up-outline" : "chevron-down-outline"}
                  size={18}
                  color={C.normal}
                />
              </TouchableOpacity>
 
              {showReadingsList && (
                <View style={styles.readingsListContainer}>
                  {dayReadings.map((r, i) => {
                    const st  = r.status ?? classifyValue(r.glucose_value, r.context);
                    const col = statusColor(st);
                    return (
                      <View key={i} style={styles.readingRow}>
                        <View style={[styles.readingDot, { backgroundColor: col }]} />
                        <Text style={styles.readingHour}>{formatHour(r.reading_date)}</Text>
                        <Text style={[styles.readingVal, { color: col }]}>
                          {r.glucose_value} mg/dL
                        </Text>
                        <View style={[styles.readingBadge, { backgroundColor: col + '20' }]}>
                          <Text style={[styles.readingBadgeText, { color: col }]}>
                            {STATUS_LABEL[st]}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </>
      )}
 
      {/* VISTA POR DÍAS */}
      {tab === 'daily' && (
        <>
          <View style={styles.rangePills}>
            {([7, 14, 30] as const).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rangePill, dayRange === r && styles.rangePillActive]}
                onPress={() => setDayRange(r)}
              >
                <Text style={[styles.rangePillText, dayRange === r && styles.rangePillTextActive]}>
                  {r} días
                </Text>
              </TouchableOpacity>
            ))}
          </View>
 
          {readings.length < 2 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="bar-chart-outline" size={44} color="#334155" />
              <Text style={styles.emptyTitle}>Necesitas al menos 2 lecturas para la gráfica</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/reading')}>
                <Text style={styles.emptyBtnText}>Registrar lectura</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={[styles.statVal, { color: avg>=70&&avg<=139 ? C.normal : C.prediabetes }]}>
                    {avg}
                  </Text>
                  <Text style={styles.statLbl}>Promedio{'\n'}mg/dL</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statVal, { color: pct>=70 ? C.normal : C.prediabetes }]}>
                    {pct}%
                  </Text>
                  <Text style={styles.statLbl}>En rango{'\n'}normal</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statVal}>{values.length}</Text>
                  <Text style={styles.statLbl}>Lecturas{'\n'}analizadas</Text>
                </View>
              </View>
 
              <View style={styles.chartCard}>
                <Text style={styles.chartCardTitle}>Lecturas — últimos {dayRange} días</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={barData}
                    width={Math.max(CHART_W - 32, barData.length * 44)}
                    height={200}
                    barWidth={28}
                    spacing={14}
                    roundedTop
                    isAnimated
                    animationDuration={700}
                    yAxisColor="#1E293B"
                    xAxisColor="#1E293B"
                    yAxisTextStyle={{ color: C.muted, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: C.muted, fontSize: 9 }}
                    rulesColor="#1E293B"
                    maxValue={maxVal + 30}
                    noOfSections={5}
                    backgroundColor="transparent"
                    yAxisLabelSuffix=" mg"
                    referenceLine1Config={{
                      color: C.normal + '80',
                      dashWidth: 4,
                      dashGap: 4,
                      thickness: 1.5,
                    }}
                    referenceLine1Position={139}
                    referenceLine2Config={{
                      color: C.hypoglycemia + '80',
                      dashWidth: 4,
                      dashGap: 4,
                      thickness: 1.5,
                    }}
                    referenceLine2Position={70}
                  />
                </ScrollView>
                {barData.length > 7 && (
                  <View style={styles.scrollHint}>
                    <Ionicons name="swap-horizontal-outline" size={12} color={C.muted} />
                    <Text style={styles.scrollHintText}>Desliza para ver todas las lecturas</Text>
                  </View>
                )}
              </View>
 
              <View style={styles.legend}>
                {[
                  { color: C.normal,       label: 'Normal: 70–139 mg/dL' },
                  { color: C.prediabetes,  label: 'Prediabetes / Elevado' },
                  { color: C.high_glucose, label: 'Glucosa alta ≥200 mg/dL' },
                  { color: C.hypoglycemia, label: 'Hipoglucemia <70 mg/dL' },
                ].map(l => (
                  <View key={l.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <Text style={styles.legendText}>{l.label}</Text>
                  </View>
                ))}
                <View style={styles.legendRow}>
                  <View style={[styles.legendLine, { borderColor: C.normal }]} />
                  <Text style={styles.legendText}>Límite superior normal (139 mg/dL)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendLine, { borderColor: C.hypoglycemia }]} />
                  <Text style={styles.legendText}>Límite inferior normal (70 mg/dL)</Text>
                </View>
              </View>
            </>
          )}
        </>
      )}
 
      <Text style={styles.disclaimer}>
        Valores de referencia basados en estándares ADA 2024. Esta herramienta es de orientación general.
      </Text>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: C.bg },
  center:              { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  scroll:              { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 48 },
 
  header:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle:         { color: 'white', fontSize: 18, fontWeight: '700' },
 
  tabRow:              { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, padding: 4, marginBottom: 22, borderWidth: 1, borderColor: C.border },
  tab:                 { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  tabActive:           { backgroundColor: '#34D39920', borderWidth: 1, borderColor: '#34D39960' },
  tabText:             { color: C.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive:       { color: C.normal },
 
  sectionHeader:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionLabel:        { color: C.subtle, fontSize: 13, fontWeight: '600' },
 
  dayPill:             { backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  dayPillActive:       { backgroundColor: '#34D39915', borderColor: '#34D39960' },
  dayPillDay:          { color: C.subtle, fontSize: 14, fontWeight: '700' },
  dayPillCount:        { color: C.muted, fontSize: 11, marginTop: 2 },
 
  daySummaryRow:       { flexDirection: 'row', gap: 8, marginBottom: 18 },
  dayStat:             { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  dayStatVal:          { fontSize: 18, fontWeight: '900' },
  dayStatLbl:          { color: C.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
 
  chartCard:           { backgroundColor: C.surface, borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  chartCardTitle:      { color: C.subtle, fontSize: 12, fontWeight: '600', marginBottom: 10 },
 
  zoneLabels:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  zoneLabel:           { fontSize: 10, fontWeight: '700' },
 
  tooltip:             { backgroundColor: C.surface, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  tooltipVal:          { fontSize: 13, fontWeight: '800' },
  tooltipLabel:        { color: C.muted, fontSize: 10, marginTop: 2 },
 
  scrollHint:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 },
  scrollHintText:      { color: C.muted, fontSize: 11 },
 
  readingRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 13, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: C.border },
  readingDot:          { width: 10, height: 10, borderRadius: 5 },
  readingHour:         { color: C.subtle, fontSize: 13, fontWeight: '700', width: 46 },
  readingVal:          { fontSize: 15, fontWeight: '800', flex: 1 },
  readingBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  readingBadgeText:    { fontSize: 11, fontWeight: '700' },
 
  rangePills:          { flexDirection: 'row', gap: 10, marginBottom: 18 },
  rangePill:           { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  rangePillActive:     { backgroundColor: '#34D39920', borderColor: C.normal },
  rangePillText:       { color: C.muted, fontWeight: '600', fontSize: 13 },
  rangePillTextActive: { color: C.normal },
 
  statsRow:            { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard:            { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statVal:             { color: 'white', fontSize: 20, fontWeight: '900' },
  statLbl:             { color: C.muted, fontSize: 10, textAlign: 'center', marginTop: 3 },
 
  legend:              { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: C.border },
  legendRow:           { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot:           { width: 10, height: 10, borderRadius: 5 },
  legendLine:          { width: 20, height: 0, borderTopWidth: 2, borderStyle: 'dashed' },
  legendText:          { color: C.subtle, fontSize: 12 },
 
  emptyBox:            { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle:          { color: C.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  emptyHint:           { color: '#334155', fontSize: 13, textAlign: 'center' },
  emptyBtn:            { backgroundColor: C.normal, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 4 },
  emptyBtnText:        { color: 'white', fontWeight: '700' },
 
  disclaimer:          { color: '#334155', fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 17 },

  toggleReadingsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderWidth: 1,
                        borderColor: C.border, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8, marginTop: 4,},
  toggleReadingsText:   { color: C.text, fontSize: 14, fontWeight: '600', },
  readingsListContainer: { marginTop: 4, },
});
