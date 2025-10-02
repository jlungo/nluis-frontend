import { Label } from "../ui/label";
import { Asterisk } from "lucide-react";
import { useRef } from "react";
import MapGL, { NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

type FormSubdivisionProps = {
  label: string;
  name: string;
  required?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
};

const FormSubdivision: React.FC<FormSubdivisionProps> = ({ 
  label, 
  name,
  required,
}) => {
  // Ref for the map instance
  const mapRef = useRef<MapRef | null>(null);

  // Default viewport centered on Tanzania
  const initialViewport = {
    longitude: 35.7516,
    latitude: -6.3690,
    zoom: 5.8
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={name}>
          {label} {required && <Asterisk className="inline h-3 w-3 text-destructive" />}
        </Label>
      </div>

      <div className="h-[500px] border rounded-md overflow-hidden">
        <div className="w-full h-full relative">
          <MapGL
            ref={mapRef}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            initialViewState={initialViewport}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            style={{ width: '100%', height: '100%' }}
            minZoom={5.5}
            maxZoom={20}
            maxBounds={[
              [29.3269, -11.7457], // Southwest coordinates of Tanzania
              [40.4484, -0.9862]   // Northeast coordinates of Tanzania
            ]}
          >
            <NavigationControl position="top-right" />
          </MapGL>
        </div>
      </div>
    </div>
  );
};

export default FormSubdivision;