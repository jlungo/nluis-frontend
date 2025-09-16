import React from "react";

const legendItems = [
  { color: "rgb(255,243,80)", label: "Settlements / Residential" },
  { color: "rgb(0,214,180)", label: "Agriculture / Cultivated land" },
  { color: "rgb(227,215,80)", label: "Grazing land / Pasture" },
  { color: "rgb(114,137,68)", label: "Grassland / Savanna" },
  { color: "rgb(0,117,37)", label: "Forest" },
  { color: "rgb(109,168,67)", label: "Mangrove forest" },
  { color: "rgb(144,238,144)", label: "Protected / Conservation areas" },
  { color: "rgb(151,219,242)", label: "Water bodies" },
  { color: "rgb(76,115,180)", label: "Fish ponds / Aquaculture" },
  { color: "rgb(161,218,242)", label: "Wetlands" },
  { color: "rgb(169,169,169)", label: "Rocky / Bare land" },
  { color: "rgb(250,200,200)", label: "Plantations / Large farms" },
  { color: "rgb(215,160,250)", label: "Industrial" },
  { color: "rgb(77,77,77)", label: "Roads / Infrastructure" },
  { color: "rgb(254,224,139)", label: "Open / Unused land" },
];

const LegendPanel: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`bg-white border-l border-gray-200 shadow-lg p-4 h-full w-64 flex flex-col gap-2 ${className || ""}`}
    style={{ position: "relative" }}
  >
    <div className="font-bold mb-2 text-xs">Land Use Types (Legend)</div>
    <div className="flex flex-col gap-2">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <span
            style={{
              background: item.color,
              width: 16,
              height: 16,
              borderRadius: 3,
              border: "1px solid #ccc",
              display: "inline-block",
            }}
          ></span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LegendPanel;
