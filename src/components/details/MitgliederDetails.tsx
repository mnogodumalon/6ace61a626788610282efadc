import type { Mitglieder, Trainingsgruppen, Platzbuchungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface MitgliederDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Mitglieder;
  /** N:1-Ziel „Trainingsgruppen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  trainingsgruppenList: Trainingsgruppen[];
  /** Klick auf die Trainingsgruppen-Relation → overlay.push auf dessen Detail. */
  onOpenTrainingsgruppen?: (record: Trainingsgruppen) => void;
  /** 1:N „Platzbuchungen" (mitglied): VOLLE Liste — der Block filtert auf diesen Record. */
  platzbuchungenList: Platzbuchungen[];
  /** Zeilen-Klick → overlay.push auf das Platzbuchungen-Detail (nie der Edit-Dialog). */
  onOpenPlatzbuchungen: (record: Platzbuchungen) => void;
  /** Kontextuelles „+": öffnet den Platzbuchungen-Dialog mit diesem Record vorgesetzt. */
  onAddPlatzbuchungen?: () => void;
}

export function MitgliederDetails({
  record,
  trainingsgruppenList,
  onOpenTrainingsgruppen,
  platzbuchungenList,
  onOpenPlatzbuchungen,
  onAddPlatzbuchungen,
}: MitgliederDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const trainingsgruppeTarget = trainingsgruppenList.find(r => r.record_id === extractRecordId(record.fields.trainingsgruppe));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('mitglieder', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('mitglieder', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('mitglieder', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('mitglieder', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('mitglieder', 'geburtsdatum')} value={record.fields.geburtsdatum} format="date" />
        <RecordField label={fieldLabel('mitglieder', 'mitglied_seit')} value={record.fields.mitglied_seit} format="date" />
        <RecordField label={fieldLabel('mitglieder', 'beitragsart')} value={record.fields.beitragsart} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('mitglieder', 'trainingsgruppe')}
          name={trainingsgruppeTarget?.fields.gruppenname ?? '—'}
          meta={[trainingsgruppeTarget?.fields.beginn, trainingsgruppeTarget?.fields.ende].filter(Boolean).join(' · ') || undefined}
          onClick={trainingsgruppeTarget && onOpenTrainingsgruppen ? () => onOpenTrainingsgruppen!(trainingsgruppeTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('platzbuchungen')}
        items={platzbuchungenList.filter(r => extractRecordId(r.fields.mitglied) === record.record_id)}
        map={r => ({ name: appLabel('platzbuchungen'), meta: r.fields.beginn })}
        onOpen={onOpenPlatzbuchungen}
        onAdd={onAddPlatzbuchungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.MITGLIEDER} recordId={record.record_id} readOnly={!perms.canWrite('mitglieder')} />
    </>
  );
}
