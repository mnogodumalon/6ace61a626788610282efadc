import type { Turnieranmeldungen, Turniere } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface TurnieranmeldungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Turnieranmeldungen;
  /** N:1-Ziel „Turniere": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  turniereList: Turniere[];
  /** Klick auf die Turniere-Relation → overlay.push auf dessen Detail. */
  onOpenTurniere?: (record: Turniere) => void;
}

export function TurnieranmeldungenDetails({
  record,
  turniereList,
  onOpenTurniere,
}: TurnieranmeldungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const turnierTarget = turniereList.find(r => r.record_id === extractRecordId(record.fields.turnier));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('turnieranmeldungen', 'einwilligung')} value={record.fields.einwilligung} format="bool" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'teilnehmer_geburtsdatum')} value={record.fields.teilnehmer_geburtsdatum} format="date" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'vereinsmitglied')} value={record.fields.vereinsmitglied} format="bool" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'verein')} value={record.fields.verein} format="text" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'wettbewerb_wunsch')} value={record.fields.wettbewerb_wunsch} format="text" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'anmerkung')} value={record.fields.anmerkung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'teilnehmer_vorname')} value={record.fields.teilnehmer_vorname} format="text" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'teilnehmer_nachname')} value={record.fields.teilnehmer_nachname} format="text" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'teilnehmer_email')} value={record.fields.teilnehmer_email} format="email" />
        <RecordField label={fieldLabel('turnieranmeldungen', 'telefon')} value={record.fields.telefon} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('turnieranmeldungen', 'turnier')}
          name={turnierTarget?.fields.turniername ?? '—'}
          meta={[turnierTarget?.fields.altersklasse, turnierTarget?.fields.austragungsort].filter(Boolean).join(' · ') || undefined}
          onClick={turnierTarget && onOpenTurniere ? () => onOpenTurniere!(turnierTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.TURNIERANMELDUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('turnieranmeldungen')} />
    </>
  );
}
