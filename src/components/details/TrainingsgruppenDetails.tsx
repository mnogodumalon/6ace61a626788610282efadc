import type { Trainingsgruppen, Trainer, Mitglieder } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface TrainingsgruppenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Trainingsgruppen;
  /** N:1-Ziel „Trainer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  trainerList: Trainer[];
  /** Klick auf die Trainer-Relation → overlay.push auf dessen Detail. */
  onOpenTrainer?: (record: Trainer) => void;
  /** 1:N „Mitglieder" (trainingsgruppe): VOLLE Liste — der Block filtert auf diesen Record. */
  mitgliederList: Mitglieder[];
  /** Zeilen-Klick → overlay.push auf das Mitglieder-Detail (nie der Edit-Dialog). */
  onOpenMitglieder: (record: Mitglieder) => void;
  /** Kontextuelles „+": öffnet den Mitglieder-Dialog mit diesem Record vorgesetzt. */
  onAddMitglieder?: () => void;
}

export function TrainingsgruppenDetails({
  record,
  trainerList,
  onOpenTrainer,
  mitgliederList,
  onOpenMitglieder,
  onAddMitglieder,
}: TrainingsgruppenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const trainerTarget = trainerList.find(r => r.record_id === extractRecordId(record.fields.trainer));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('trainingsgruppen', 'max_teilnehmer')} value={record.fields.max_teilnehmer} format="text" />
        <RecordField label={fieldLabel('trainingsgruppen', 'gruppenname')} value={record.fields.gruppenname} format="text" />
        <RecordField label={fieldLabel('trainingsgruppen', 'wochentag')} value={record.fields.wochentag} format="pill" />
        <RecordField label={fieldLabel('trainingsgruppen', 'beginn')} value={record.fields.beginn} format="text" />
        <RecordField label={fieldLabel('trainingsgruppen', 'ende')} value={record.fields.ende} format="text" />
        <RecordField label={fieldLabel('trainingsgruppen', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('trainingsgruppen', 'trainer')}
          name={trainerTarget?.fields.vorname ?? '—'}
          meta={[trainerTarget?.fields.email, trainerTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={trainerTarget && onOpenTrainer ? () => onOpenTrainer!(trainerTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('mitglieder')}
        items={mitgliederList.filter(r => extractRecordId(r.fields.trainingsgruppe) === record.record_id)}
        map={r => ({ name: r.fields.vorname ?? appLabel('mitglieder'), meta: r.fields.geburtsdatum })}
        onOpen={onOpenMitglieder}
        onAdd={onAddMitglieder}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TRAININGSGRUPPEN} recordId={record.record_id} readOnly={!perms.canWrite('trainingsgruppen')} />
    </>
  );
}
