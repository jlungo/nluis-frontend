import React from 'react';
import { getRegionStats } from '../data/mockRegionStats';

interface FeatureSummaryPanelProps {
  selectedFeature: string | null;
  selectedType: string | null;
}

export const FeatureSummaryPanel: React.FC<FeatureSummaryPanelProps> = ({
  selectedFeature,
  selectedType,
}) => {
  if (!selectedFeature || !selectedType) {
    return (
      <div className="p-3 text-center">
        <p className="text-gray-500">Click a region to view statistics</p>
      </div>
    );
  }

  const stats = getRegionStats(selectedFeature);

  return (
    <div className="bg-white px-3 py-2 w-full text-sm">
      <h2 className="text-lg font-bold mb-2">{selectedFeature}</h2>
      
      {/* Population */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-700">Population</h3>
        <p className="text-lg font-bold text-blue-600">
          {stats.population.toLocaleString()}
        </p>
      </div>

      {/* Land Use */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-700">Land Use (hectares)</h3>
        <div className="grid grid-cols-2 gap-x-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Agricultural</span>
            <span className="font-medium">{stats.landUse.agricultural.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Residential</span>
            <span className="font-medium">{stats.landUse.residential.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Commercial</span>
            <span className="font-medium">{stats.landUse.commercial.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Protected</span>
            <span className="font-medium">{stats.landUse.protected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Land Rights */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-700">Land Rights (CCROs)</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-gray-600 text-xs">Total</div>
            <div className="font-medium">{stats.landRights.totalCCROs.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">Active</div>
            <div className="font-medium text-green-600">{stats.landRights.activeCCROs.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">Pending</div>
            <div className="font-medium text-yellow-600">{stats.landRights.pendingCCROs.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Land Conflicts */}
      <div>
        <h3 className="font-semibold text-gray-700">Land Conflicts</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-gray-600 text-xs">Total</div>
            <div className="font-medium">{stats.landConflicts.total.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">Resolved</div>
            <div className="font-medium text-green-600">{stats.landConflicts.resolved.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600 text-xs">Pending</div>
            <div className="font-medium text-orange-600">{stats.landConflicts.pending.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
