"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

type ClinicMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  name: string;
};

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}

function isValidCoordinate(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function ClinicMap({ latitude, longitude, name }: ClinicMapProps) {
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "clinic-map-marker",
        html: '<span class="clinic-map-marker-dot"></span>',
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      }),
    [],
  );

  if (!isValidCoordinate(latitude, longitude)) {
    return (
      <div className="clinic-map-empty">
        Localização indisponível para esta clínica.
      </div>
    );
  }

  const position: [number, number] = [latitude as number, longitude as number];

  return (
    <div className="clinic-map-shell">
      <MapContainer
        center={position}
        className="clinic-map"
        key={`${position[0]}-${position[1]}`}
        scrollWheelZoom={false}
        zoom={15}
      >
        <ResizeMap />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker icon={markerIcon} position={position}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
