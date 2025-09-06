import { X, MapPin, Info } from 'lucide-react';
import type { GeoJSONFeatureType } from '@/types/zoning';

interface FeatureInfoPanelProps {
  feature: GeoJSONFeatureType | null;
  onClose: () => void;
}

export const FeatureInfoPanel: React.FC<FeatureInfoPanelProps> = ({
  feature,
  onClose,
}) => {
  if (!feature) return null;

  const { geometry, id, properties = {} } = feature;

  const formatValue = (value: unknown): string => {
    if (value == null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatKey = (key: string): string =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');

  const hasProperties = Object.keys(properties).length > 0;

  return (
    <section className="absolute top-4 left-4 z-10 w-full max-w-sm max-h-96 p-4 overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between border-b pb-2 mb-3 border-gray-200 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <Info size={18} />
          Feature Information
        </h2>
        <button
          type='button'
          aria-labelledby='close'
          onClick={onClose}
          className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close feature panel"
        >
          <X size={16} />
        </button>
      </header>

      <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
        {/* Geometry Type */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <MapPin size={14} className="text-blue-600" />
          <span className="font-medium">Type:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {geometry?.type}
          </span>
        </div>

        {/* Feature ID */}
        {id && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">ID:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">{id}</span>
          </div>
        )}

        {/* Properties */}
        {hasProperties ? (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Properties:
            </h3>
            {Object.entries(properties).map(([key, value]) => (
              <div key={key} className="text-sm">
                <div className="space-x-1.5">
                  <span className="font-bold text-xs uppercase text-gray-600 dark:text-gray-400">
                    {formatKey(key)}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 break-words">
                    {formatValue(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
            No additional properties available
          </p>
        )}
      </div>
    </section>
  );
};
