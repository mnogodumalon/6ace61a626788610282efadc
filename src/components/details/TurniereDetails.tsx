import type { Turniere, Turnieranmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface TurniereDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Turniere;
  /** 1:N „Turnieranmeldungen" (turnier): VOLLE Liste — der Block filtert auf diesen Record. */
  turnieranmeldungenList: Turnieranmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Turnieranmeldungen-Detail (nie der Edit-Dialog). */
  onOpenTurnieranmeldungen: (record: Turnieranmeldungen) => void;
  /** Kontextuelles „+": öffnet den Turnieranmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddTurnieranmeldungen?: () => void;
}

export function TurniereDetails({
  record,
  turnieranmeldungenList,
  onOpenTurnieranmeldungen,
  onAddTurnieranmeldungen,
}: TurniereDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('turniere', 'turniername')} value={record.fields.turniername} format="text" />
        <RecordField label={fieldLabel('turniere', 'turnierbeginn')} value={record.fields.turnierbeginn} format="date" />
        <RecordField label={fieldLabel('turniere', 'turnierende')} value={record.fields.turnierende} format="date" />
        <RecordField label={fieldLabel('turniere', 'meldeschluss')} value={record.fields.meldeschluss} format="date" />
        <RecordField label={fieldLabel('turniere', 'wettbewerb')} value={Array.isArray(record.fields.wettbewerb) ? record.fields.wettbewerb.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('turniere', 'altersklasse')} value={record.fields.altersklasse} format="text" />
        <RecordField label={fieldLabel('turniere', 'austragungsort')} value={record.fields.austragungsort} format="text" />
        <RecordField label={fieldLabel('turniere', 'startgeld')} value={record.fields.startgeld} format="text" />
        <RecordField label={fieldLabel('turniere', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('turnieranmeldungen')}
        items={turnieranmeldungenList.filter(r => extractRecordId(r.fields.turnier) === record.record_id)}
        map={r => ({ name: r.fields.verein ?? appLabel('turnieranmeldungen'), meta: r.fields.teilnehmer_geburtsdatum })}
        onOpen={onOpenTurnieranmeldungen}
        onAdd={onAddTurnieranmeldungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TURNIERE} recordId={record.record_id} readOnly={!perms.canWrite('turniere')} />
    </>
  );
}
