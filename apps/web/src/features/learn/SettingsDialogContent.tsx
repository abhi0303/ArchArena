import { getComponent } from '@arch-arena/shared';
import { getSettingGuide } from './content/settings';
import { SettingCard } from './SettingCard';
import { CONNECTION_FIELDS, getSettingField, type SettingField } from './settingsCatalog';

/** Loaded on demand inside the playground's “Explain settings” dialog. */
export default function SettingsDialogContent({ componentType, values }: { componentType?: string; values: Record<string, unknown> }) {
  const def = componentType ? getComponent(componentType) : undefined;
  const fields = def ? def.properties.map((k) => getSettingField(k)).filter((f): f is SettingField => !!f) : CONNECTION_FIELDS;
  const basic = fields.filter((f) => !f.advanced);
  const advanced = fields.filter((f) => f.advanced);
  const card = (f: SettingField) => <SettingCard key={f.key} field={f} guide={getSettingGuide(f.key, f.scope)} current={values[f.key]} showCurrent compact />;

  if (!fields.length) return <p className="text-sm text-slate-500">This component has no settings besides its name.</p>;
  return (
    <div className="space-y-6" data-testid="settings-dialog-content">
      <div className="space-y-4">{basic.map(card)}</div>
      {advanced.length > 0 && (
        <section aria-labelledby="dialog-advanced-title">
          <h3 id="dialog-advanced-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Advanced settings
          </h3>
          <div className="space-y-4">{advanced.map(card)}</div>
        </section>
      )}
    </div>
  );
}
