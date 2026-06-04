"use client";

import styles from "./ClassicMarketTemplate.module.css";

interface GoogleMapEmbedProps {
  address: string;
  label: string;
}

export default function GoogleMapEmbed({ address, label }: GoogleMapEmbedProps) {
  const query = address.trim();

  if (!query) {
    return <div className={styles.mapFallback}>주소 정보가 들어오면 지도가 표시됩니다.</div>;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
        apiKey,
      )}&q=${encodeURIComponent(query)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className={styles.osmMap}>
      <iframe
        title={`${label} 위치 지도`}
        src={src}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
        rel="noreferrer"
        target="_blank"
      >
        Google 지도에서 크게 보기
      </a>
    </div>
  );
}
