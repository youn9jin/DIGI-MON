"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ClassicMarketTemplate.module.css";

interface Coordinates {
  lat: number;
  lon: number;
}

interface OpenStreetMapEmbedProps {
  address: string;
  label: string;
}

const CACHE_PREFIX = "digimon_osm_geocode:";

function buildEmbedUrl({ lat, lon }: Coordinates): string {
  const latDelta = 0.006;
  const lonDelta = 0.012;
  const bbox = [
    lon - lonDelta,
    lat - latDelta,
    lon + lonDelta,
    lat + latDelta,
  ].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
}

export default function OpenStreetMapEmbed({
  address,
  label,
}: OpenStreetMapEmbedProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const query = address.trim();

  useEffect(() => {
    if (!query) {
      setCoordinates(null);
      setStatus("idle");
      return;
    }

    const cacheKey = `${CACHE_PREFIX}${query}`;
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCoordinates(JSON.parse(cached) as Coordinates);
        setStatus("idle");
        return;
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }

    const controller = new AbortController();

    async function geocodeAddress() {
      setStatus("loading");

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          limit: "1",
          "accept-language": "ko",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Failed to geocode address");

        const results = (await response.json()) as Array<{
          lat: string;
          lon: string;
        }>;
        const first = results[0];
        if (!first) throw new Error("No geocoding result");

        const nextCoordinates = {
          lat: Number(first.lat),
          lon: Number(first.lon),
        };

        if (!Number.isFinite(nextCoordinates.lat) || !Number.isFinite(nextCoordinates.lon)) {
          throw new Error("Invalid geocoding result");
        }

        window.localStorage.setItem(cacheKey, JSON.stringify(nextCoordinates));
        setCoordinates(nextCoordinates);
        setStatus("idle");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      }
    }

    geocodeAddress();

    return () => controller.abort();
  }, [query]);

  const embedUrl = useMemo(
    () => (coordinates ? buildEmbedUrl(coordinates) : ""),
    [coordinates],
  );

  if (!query) {
    return <div className={styles.mapFallback}>주소 정보가 들어오면 지도가 표시됩니다.</div>;
  }

  if (status === "loading") {
    return <div className={styles.mapFallback}>지도를 불러오는 중입니다.</div>;
  }

  if (!coordinates || status === "error") {
    return (
      <div className={styles.mapFallback}>
        <p>{address}</p>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`}
          rel="noreferrer"
          target="_blank"
        >
          OpenStreetMap에서 위치 보기
        </a>
      </div>
    );
  }

  return (
    <div className={styles.osmMap}>
      <iframe
        title={`${label} 위치 지도`}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=16/${coordinates.lat}/${coordinates.lon}`}
        rel="noreferrer"
        target="_blank"
      >
        OpenStreetMap에서 크게 보기
      </a>
    </div>
  );
}
