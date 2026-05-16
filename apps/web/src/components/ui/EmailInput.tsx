"use client";

import { KeyboardEvent, useRef, useState } from "react";
import authStyles from "@/app/auth.module.css";

const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "kakao.com",
  "daum.net",
  "hanmail.net",
  "nate.com",
  "icloud.com",
  "outlook.com",
  "hotmail.com",
];

interface EmailInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** 입력 스타일: 언더라인(회원가입) or 박스 테두리(로그인) */
  variant?: "underline" | "box";
  placeholder?: string;
}

export default function EmailInput({
  id,
  value,
  onChange,
  variant = "underline",
  placeholder,
}: EmailInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleChange(raw: string) {
    onChange(raw);
    const atIdx = raw.indexOf("@");
    if (atIdx === -1) {
      setSuggestions([]);
      return;
    }
    const typed = raw.slice(atIdx + 1).toLowerCase();
    const filtered = typed
      ? EMAIL_DOMAINS.filter((d) => d.startsWith(typed))
      : EMAIL_DOMAINS;
    setSuggestions(filtered);
    setActiveIndex(-1);
  }

  function selectDomain(domain: string) {
    const local = value.split("@")[0];
    onChange(`${local}@${domain}`);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectDomain(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  function handleBlur() {
    setTimeout(() => setSuggestions([]), 150);
  }

  const inputClass =
    variant === "underline" ? authStyles.underlineInput : authStyles.input;

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        id={id}
        type="email"
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoComplete="off"
        required
      />
      {suggestions.length > 0 && (
        <ul className={authStyles.domainDropdown}>
          {suggestions.map((domain, i) => {
            const local = value.split("@")[0];
            return (
              <li
                key={domain}
                className={`${authStyles.domainOption} ${
                  i === activeIndex ? authStyles.domainOptionActive : ""
                }`}
                onMouseDown={() => selectDomain(domain)}
              >
                <span className={authStyles.domainLocal}>{local}</span>
                <span className={authStyles.domainAt}>@</span>
                <span className={authStyles.domainSuffix}>{domain}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
