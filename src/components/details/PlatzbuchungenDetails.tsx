import type { Platzbuchungen, Mitglieder } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface PlatzbuchungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Platzbuchungen;
  /** N:1-Ziel „Mitglieder": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  mitgliederList: Mitglieder[];
  /** Klick auf die Mitglieder-Relation → overlay.push auf dessen Detail. */
  onOpenMitglieder?: (record: Mitglieder) => void;
}

export function PlatzbuchungenDetails({
  record,
  mitgliederList,
  onOpenMitglieder,
}: PlatzbuchungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const mitgliedTarget = mitgliederList.find(r => r.record_id === extractRecordId(record.fields.mitglied));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('platzbuchungen', 'platz')} value={record.fields.platz} format="pill" />
        <RecordField label={fieldLabel('platzbuchungen', 'platzart')} value={record.fields.platzart} format="pill" />
        <RecordField label={fieldLabel('platzbuchungen', 'beginn')} value={record.fields.beginn} format="datetime" />
        <RecordField label={fieldLabel('platzbuchungen', 'ende')} value={record.fields.ende} format="datetime" />
        <RecordField label={fieldLabel('platzbuchungen', 'buchungsart')} value={record.fields.buchungsart} format="pill" />
        <RecordField label={fieldLabel('platzbuchungen', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('platzbuchungen', 'mitglied')}
          name={mitgliedTarget?.fields.vorname ?? '—'}
          meta={[mitgliedTarget?.fields.email, mitgliedTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={mitgliedTarget && onOpenMitglieder ? () => onOpenMitglieder!(mitgliedTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.PLATZBUCHUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('platzbuchungen')} />
    </>
  );
}
