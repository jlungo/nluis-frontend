import { useState } from 'react';
import { Layers, Download, Eye, EyeOff, ChevronDown } from 'lucide-react';
import type { MapLayerType } from '@/types/zoning';

interface LayerControlProps {
  layers: MapLayerType[];
  onToggleLayer: (layerId: string) => void;
  onExportLayer: (layerId: string) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  onToggleLayer,
  onExportLayer,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="absolute top-4 right-4 z-10 w-full max-w-sm p-4 rounded-lg shadow-lg bg-white dark:bg-gray-900">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between mb-3 text-left cursor-pointer"
        aria-label="Toggle layer panel"
      >
        <h2 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 text-sm">
          <Layers size={18} />
          Layers ({layers.length})
        </h2>
        <ChevronDown
          size={18}
          className={`text-gray-500 dark:text-gray-300 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'
            }`}
        />
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {layers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No layers loaded
            </p>
          ) : (
            layers.map((layer) => {
              const featureCount = layer.data?.features?.length ?? 0;

              return (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Layer Color & Info */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded border-2 flex-shrink-0"
                      style={{
                        backgroundColor: layer.color || '#088',
                        opacity: layer.opacity ?? 0.6,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">
                          {layer.name}
                        </span>
                        {layer.isBase && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (Base)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {featureCount} feature{featureCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleLayer(layer.id)}
                      className={`p-1 rounded transition-colors ${layer.visible
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-800'
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                      aria-label={
                        layer.visible ? 'Hide Layer' : 'Show Layer'
                      }
                    >
                      {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                      onClick={() => onExportLayer(layer.id)}
                      className="p-1 rounded text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                      title="Export Layer"
                      aria-label="Export Layer"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </aside>
  );
};
