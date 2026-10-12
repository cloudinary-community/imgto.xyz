import { getCldImageUrl } from 'next-cloudinary';

/**
 * Output formats
 */

export const OUTPUT_FORMATS = {
  avif: { label: 'AVIF', progressive: false },
  webp: { label: 'WebP', progressive: false },
  jpg: { label: 'JPG', progressive: true },
  png: { label: 'PNG', progressive: true },
  jxl: { label: 'JXL', progressive: false },
} as const;

export type OutputFormat = keyof typeof OUTPUT_FORMATS;

export const OUTPUT_FORMAT_IDS = Object.keys(OUTPUT_FORMATS) as Array<OutputFormat>;

// "original" keeps whatever format the image was uploaded in

export type FormatSetting = 'original' | OutputFormat;

/**
 * Quality presets
 * @via https://cloudinary.com/documentation/image_optimization#automatic_quality_selection_q_auto
 */

export const QUALITY_PRESETS = {
  'auto:best': 'Best',
  'auto:good': 'Good',
  'auto:eco': 'Eco',
  'auto:low': 'Smallest',
} as const;

export type QualityPreset = keyof typeof QUALITY_PRESETS;

/**
 * Transformation settings
 */

export interface TransformationSettings {
  format: FormatSetting;
  quality: QualityPreset;
  progressive: boolean;
}

export const DEFAULT_TRANSFORMATION_SETTINGS: TransformationSettings = {
  format: 'original',
  quality: 'auto:low',
  progressive: false,
};

export function isOutputFormat(format: unknown): format is OutputFormat {
  return typeof format === 'string' && format in OUTPUT_FORMATS;
}

/**
 * supportsProgressive
 * @description Progressive (interlaced) rendering only applies to JPG and PNG
 */

export function supportsProgressive(format?: string) {
  return isOutputFormat(format) && OUTPUT_FORMATS[format].progressive;
}

/**
 * resolveFormat
 * @description Returns the concrete file format that will be delivered
 */

export function resolveFormat(format: FormatSetting, originalFormat: string) {
  return format === 'original' ? originalFormat : format;
}

/**
 * getTransformedUrl
 */

interface GetTransformedUrlOptions extends TransformationSettings {
  publicId: string;
  originalFormat: string;
}

export function getTransformedUrl({ publicId, originalFormat, format, quality, progressive }: GetTransformedUrlOptions) {
  const deliveredFormat = resolveFormat(format, originalFormat);

  return getCldImageUrl({
    src: publicId,
    format: format === 'original' ? 'default' : format,
    quality,
    flags: progressive && supportsProgressive(deliveredFormat) ? ['progressive'] : undefined,
  });
}
