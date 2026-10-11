"use client";

import { cn } from '@/lib/util';
import {
  OUTPUT_FORMATS,
  OUTPUT_FORMAT_IDS,
  QUALITY_PRESETS,
  FormatSetting,
  QualityPreset,
  TransformationSettings,
  supportsProgressive,
} from '@/lib/transformations';

interface TransformationControlsProps {
  className?: string;
  settings: TransformationSettings;
  onChange: (settings: TransformationSettings) => void;
  disabled?: boolean;
}

const FORMAT_OPTIONS: Array<{ id: FormatSetting; label: string; }> = [
  { id: 'original', label: 'Original' },
  ...OUTPUT_FORMAT_IDS.map(id => ({ id, label: OUTPUT_FORMATS[id].label })),
];

const TransformationControls = ({ className, settings, onChange, disabled = false }: TransformationControlsProps) => {
  // When keeping the original format, progressive only applies to images that
  // were uploaded as JPG or PNG, so we leave it available and explain why

  const canBeProgressive = settings.format === 'original' || supportsProgressive(settings.format);

  function update(changes: Partial<TransformationSettings>) {
    onChange({ ...settings, ...changes });
  }

  return (
    <fieldset className={cn('grid gap-5', className)} disabled={disabled}>
      <legend className="sr-only">Output settings</legend>

      <div>
        <p id="format-label" className="text-sm font-bold mb-2">Format</p>
        <div role="radiogroup" aria-labelledby="format-label" className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map(({ id, label }) => {
            const isActive = settings.format === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => update({ format: id })}
                className={cn(
                  'text-xs font-bold uppercase rounded border-2 px-3 py-1.5',
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-950 border-zinc-300 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:border-blue-400',
                  disabled && 'opacity-60 cursor-not-allowed'
                )}
              >
                { label }
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="grid gap-2">
          <span className="text-sm font-bold">Quality</span>
          <select
            className="text-sm rounded border-2 border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5"
            value={settings.quality}
            onChange={(event) => update({ quality: event.currentTarget.value as QualityPreset })}
          >
            {Object.entries(QUALITY_PRESETS).map(([value, label]) => (
              <option key={value} value={value}>{ label }</option>
            ))}
          </select>
        </label>

        <label className={cn('flex items-center gap-2 text-sm py-2', !canBeProgressive && 'opacity-50')}>
          <input
            type="checkbox"
            checked={settings.progressive && canBeProgressive}
            disabled={!canBeProgressive}
            onChange={(event) => update({ progressive: event.currentTarget.checked })}
          />
          <span>
            <span className="font-bold">Progressive</span>
            <span className="block text-xs text-zinc-600 dark:text-zinc-400">
              { canBeProgressive ? 'Applies to JPG and PNG' : 'Not available for this format' }
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}

export default TransformationControls;
