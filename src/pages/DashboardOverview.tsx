import { useMemo } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconTrophy, IconUsers, IconCalendarEvent } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { ResourceTimeline, type ResourceEvent, type ResourceGroup } from '@/components/widgets/ResourceTimeline';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';
import type { Mitglieder } from '@/types/app';
import { LOOKUP_OPTIONS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen } from '@/lib/polish';
import { tx, appLabel, dateFnsLocale } from '@/i18n';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { turniere, turnieranmeldungen, platzbuchungen, mitglieder } = data;
  const crud = useEntityCrud(data);
  const enrichedTrainingsgruppen = crud.enriched.trainingsgruppen;
  const enrichedTurnieranmeldungen = crud.enriched.turnieranmeldungen;
  const enrichedPlatzbuchungen = crud.enriched.platzbuchungen;

  const clock = useClock();
  const todayKey = format(clock, 'yyyy-MM-dd');
  const weekAgoKey = format(new Date(clock.getTime() - 7 * 86400000), 'yyyy-MM-dd');

  // Turniere: noch offen für Meldungen, nach Meldeschluss sortiert
  const anmeldungenProTurnier = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of turnieranmeldungen) {
      const id = extractRecordId(a.fields.turnier);
      if (id) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  }, [turnieranmeldungen]);

  const offeneTurniere = useMemo(
    () => turniere
      .filter(t => (t.fields.meldeschluss ?? t.fields.turnierbeginn ?? '').slice(0, 10) >= todayKey)
      .sort((a, b) => (a.fields.meldeschluss ?? a.fields.turnierbeginn ?? '').localeCompare(b.fields.meldeschluss ?? b.fields.turnierbeginn ?? '')),
    [turniere, todayKey],
  );

  const dringend = offeneTurniere.filter(t => {
    const ms = t.fields.meldeschluss;
    if (!ms) return false;
    const d = differenceInCalendarDays(parseISO(ms.slice(0, 10)), clock);
    return d >= 0 && d <= 7;
  });

  const neueAnmeldungen = useMemo(
    () => [...enrichedTurnieranmeldungen].sort((a, b) => (b.createdat ?? '').localeCompare(a.createdat ?? '')),
    [enrichedTurnieranmeldungen],
  );
  const anmeldungenWoche = neueAnmeldungen.filter(a => a.createdat.slice(0, 10) >= weekAgoKey).length;

  const buchungenHeute = enrichedPlatzbuchungen.filter(b => (b.fields.beginn ?? '').slice(0, 10) === todayKey);
  const kommendeBuchungen = enrichedPlatzbuchungen
    .filter(b => (b.fields.beginn ?? '').slice(0, 10) > todayKey)
    .sort((a, b) => (a.fields.beginn ?? '').localeCompare(b.fields.beginn ?? ''));

  // Trainingsgruppen pro Wochentag
  const wochentage = LOOKUP_OPTIONS['trainingsgruppen']?.wochentag ?? [];
  const gruppenSortiert = [...enrichedTrainingsgruppen].sort((a, b) => {
    const ia = wochentage.findIndex(w => w.key === lookupKey(a.fields.wochentag));
    const ib = wochentage.findIndex(w => w.key === lookupKey(b.fields.wochentag));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || (a.fields.beginn ?? '').localeCompare(b.fields.beginn ?? '');
  });
  const heuteIdx = (clock.getDay() + 6) % 7;
  const gruppenHeute = gruppenSortiert.filter(g => wochentage.findIndex(w => w.key === lookupKey(g.fields.wochentag)) === heuteIdx);

  // Mitglieder-Chart
  const mitgliederRows = useMemo<ChartRow<Mitglieder>[]>(
    () => mitglieder.map(m => ({ id: `mitglied:${m.record_id}`, data: m })),
    [mitglieder],
  );

  // Belegung je Platz
  const groups: ResourceGroup[] = (LOOKUP_OPTIONS['platzbuchungen']?.platz ?? []).map(o => ({ key: o.key, label: o.label }));
  const events: ResourceEvent[] = enrichedPlatzbuchungen
    .filter(b => !!b.fields.beginn && !!lookupKey(b.fields.platz))
    .map(b => ({
      id: `platzbuchung:${b.record_id}`,
      start: b.fields.beginn!.slice(0, 16),
      end: b.fields.ende?.slice(0, 16),
      title: b.mitgliedName || tx('Buchung'),
      subtitle: b.fields.platzart?.label,
      tone: lookupKey(b.fields.platzart) === 'halle' ? 'primary' : 'success',
      group: lookupKey(b.fields.platz) ?? '',
    }));

  const kontext = (() => {
    const teile: string[] = [];
    if (dringend.length > 0) teile.push(tx`Meldeschluss bei ${namen(dringend.map(t => t.fields.turniername ?? ''))} rückt näher.`);
    else if (offeneTurniere.length > 0) teile.push(tx`Nächstes Turnier: ${offeneTurniere[0].fields.turniername ?? ''}.`);
    if (buchungenHeute.length > 0) teile.push(tx`Heute spielen ${namen(buchungenHeute.map(b => b.mitgliedName))}.`);
    if (gruppenHeute.length > 0) teile.push(tx`Training heute: ${namen(gruppenHeute.map(g => g.fields.gruppenname ?? ''))}.`);
    return teile.length > 0 ? teile.join(' ') : tx('Heute ist auf der Anlage noch nichts geplant.');
  })();

  const zeit = (b: { fields: { beginn?: string; ende?: string } }) =>
    `${(b.fields.beginn ?? '').slice(11, 16)}${b.fields.ende ? '–' + b.fields.ende.slice(11, 16) : ''}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{kontext}</p>
        </div>
        {crud.turniere.canWrite && (
          <Button onClick={() => crud.turniere.openCreate({})} className="w-full sm:w-auto">
            <IconPlus size={16} className="shrink-0" />
            {tx('Neues Turnier')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={dringend.length > 0 ? (
          <HeroBanner
            icon={<IconAlertTriangle size={18} />}
            action={{
              label: tx('Anmeldung erfassen'),
              onClick: () => crud.turnieranmeldungen.openCreate({ turnier: dringend[0].record_id }),
            }}
          >
            <b>{namen(dringend.map(t => t.fields.turniername ?? ''))}</b>{' '}
            {tx`— Meldeschluss am ${formatDate(dringend[0].fields.meldeschluss)}, bisher ${anmeldungenProTurnier.get(dringend[0].record_id) ?? 0} Anmeldungen.`}
          </HeroBanner>
        ) : undefined}
        kpis={
          <StatStrip>
            <StatStripItem title={tx('Turniere offen')} value={offeneTurniere.length} icon={<IconTrophy size={16} />} />
            <StatStripItem title={tx('Anmeldungen (7 Tage)')} value={anmeldungenWoche} icon={<IconUsers size={16} />} />
            <StatStripItem title={tx('Buchungen heute')} value={buchungenHeute.length} icon={<IconCalendarEvent size={16} />} />
          </StatStrip>
        }
        primary={
          <ResourceTimeline
            axis="time"
            events={events}
            groups={groups}
            locale={dateFnsLocale()}
            onEventClick={ev => {
              const rec = platzbuchungen.find(b => b.record_id === ev.id.split(':')[1]);
              if (rec) crud.platzbuchungen.openDetail(rec);
            }}
            onEmptyClick={(date, group) => {
              if (!crud.platzbuchungen.canWrite) return;
              crud.platzbuchungen.openCreate({
                platz: group,
                beginn: format(date, "yyyy-MM-dd'T'HH:mm"),
              });
            }}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Anstehende Turniere')}
              icon={<IconTrophy size={16} />}
              items={offeneTurniere.map(t => ({
                id: t.record_id,
                title: t.fields.turniername ?? appLabel('turniere'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {tx`Meldeschluss ${formatDate(t.fields.meldeschluss)}`} · {tx`${anmeldungenProTurnier.get(t.record_id) ?? 0} Anmeldungen`}
                  </span>
                ),
                action: crud.turnieranmeldungen.canWrite
                  ? { label: tx('+ Anmeldung'), onClick: () => crud.turnieranmeldungen.openCreate({ turnier: t.record_id }) }
                  : undefined,
              }))}
              onItemClick={id => {
                const rec = turniere.find(t => t.record_id === id);
                if (rec) crud.turniere.openDetail(rec);
              }}
              empty={{ text: tx('Keine offenen Turniere.'), action: crud.turniere.canWrite ? { label: tx('Turnier anlegen'), onClick: () => crud.turniere.openCreate({}) } : undefined }}
            />
            <WorkList
              title={tx('Neue Turnieranmeldungen')}
              icon={<IconUsers size={16} />}
              items={neueAnmeldungen.map(a => ({
                id: a.record_id,
                title: `${a.fields.teilnehmer_vorname ?? ''} ${a.fields.teilnehmer_nachname ?? ''}`.trim() || appLabel('turnieranmeldungen'),
                secondLine: <span className="text-muted-foreground">{a.turnierName}{a.fields.wettbewerb_wunsch ? ` · ${a.fields.wettbewerb_wunsch}` : ''}</span>,
              }))}
              onItemClick={id => {
                const rec = turnieranmeldungen.find(a => a.record_id === id);
                if (rec) crud.turnieranmeldungen.openDetail(rec);
              }}
              empty={{ text: tx('Noch keine Anmeldungen eingegangen.') }}
            />
            <WorkList
              title={tx('Trainingsgruppen pro Wochentag')}
              icon={<IconCalendarEvent size={16} />}
              max={7}
              items={gruppenSortiert.map(g => ({
                id: g.record_id,
                title: g.fields.gruppenname ?? appLabel('trainingsgruppen'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {g.fields.wochentag?.label} {g.fields.beginn}{g.fields.ende ? `–${g.fields.ende}` : ''} · {g.trainerName}
                  </span>
                ),
              }))}
              onItemClick={id => {
                const rec = data.trainingsgruppen.find(g => g.record_id === id);
                if (rec) crud.trainingsgruppen.openDetail(rec);
              }}
              empty={{ text: tx('Noch keine Trainingsgruppen angelegt.') }}
            />
            <WorkList
              title={tx('Kommende Platzbuchungen')}
              icon={<IconCalendarEvent size={16} />}
              items={kommendeBuchungen.map(b => ({
                id: b.record_id,
                title: b.mitgliedName || appLabel('platzbuchungen'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {formatDate(b.fields.beginn)} {zeit(b)} · {b.fields.platz?.label}{b.fields.platzart ? ` (${b.fields.platzart.label})` : ''}
                  </span>
                ),
              }))}
              onItemClick={id => {
                const rec = platzbuchungen.find(b => b.record_id === id);
                if (rec) crud.platzbuchungen.openDetail(rec);
              }}
              empty={{ text: tx('Keine kommenden Buchungen.') }}
            />
            <ChartWidget<Mitglieder>
              title={tx('Mitglieder nach Beitragsart')}
              rows={mitgliederRows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.beitragsart, label: tx('Beitragsart'), mark: 'donut' }}
              interaction={{
                mode: 'drill',
                onSegmentClick: seg => {
                  const id = seg.rowIds[0]?.split(':')[1];
                  const rec = mitglieder.find(m => m.record_id === id);
                  if (rec) crud.mitglieder.openDetail(rec);
                },
              }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
