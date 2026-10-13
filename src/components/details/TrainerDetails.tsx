import type { Trainer, Trainingsgruppen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface TrainerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Trainer;
  /** 1:N „Trainingsgruppen" (trainer): VOLLE Liste — der Block filtert auf diesen Record. */
  trainingsgruppenList: Trainingsgruppen[];
  /** Zeilen-Klick → overlay.push auf das Trainingsgruppen-Detail (nie der Edit-Dialog). */
  onOpenTrainingsgruppen: (record: Trainingsgruppen) => void;
  /** Kontextuelles „+": öffnet den Trainingsgruppen-Dialog mit diesem Record vorgesetzt. */
  onAddTrainingsgruppen?: () => void;
}

export function TrainerDetails({
  record,
  trainingsgruppenList,
  onOpenTrainingsgruppen,
  onAddTrainingsgruppen,
}: TrainerDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('trainer', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('trainer', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('trainer', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('trainer', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('trainer', 'trainerlizenz')} value={record.fields.trainerlizenz} format="text" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('trainingsgruppen')}
        items={trainingsgruppenList.filter(r => extractRecordId(r.fields.trainer) === record.record_id)}
        map={r => ({ name: r.fields.gruppenname ?? appLabel('trainingsgruppen'), meta: undefined })}
        onOpen={onOpenTrainingsgruppen}
        onAdd={onAddTrainingsgruppen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.TRAINER} recordId={record.record_id} readOnly={!perms.canWrite('trainer')} />
    </>
  );
}
