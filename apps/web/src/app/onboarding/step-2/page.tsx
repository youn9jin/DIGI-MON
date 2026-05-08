"use client";

import Image from "next/image";
import Script from "next/script";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import styles from "../onboarding.module.css";

const TOTAL_STEPS = 10;
const ACTIVE_STEP = 1;

type DaumPostcodeData = {
  address: string;
  roadAddress: string;
  zonecode: string;
};

type DaumPostcodeOptions = {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: () => void;
};

type DaumPostcodeOpenOptions = {
  popupTitle?: string;
  popupKey?: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => {
        open: (options?: DaumPostcodeOpenOptions) => void;
      };
    };
  }
}

function StepIndicator() {
  return (
    <div className={styles.stepIndicator} aria-label="2 / 10" data-node-id="148:2008">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <Image
          key={index}
          src={
            index === ACTIVE_STEP
              ? "/images/onboarding/step-active.svg"
              : "/images/onboarding/step-inactive.svg"
          }
          alt=""
          width={index === ACTIVE_STEP ? 25 : 22}
          height={index === ACTIVE_STEP ? 25 : 22}
          className={index === ACTIVE_STEP ? styles.stepActive : styles.stepInactive}
        />
      ))}
    </div>
  );
}

export default function OnboardingStepTwoPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [zonecode, setZonecode] = useState("");
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  function openAddressSearch() {
    if (!window.daum?.Postcode || isPostcodeOpen) {
      return;
    }

    setIsPostcodeOpen(true);

    new window.daum.Postcode({
      oncomplete(data) {
        setAddress(data.roadAddress || data.address);
        setZonecode(data.zonecode);
        setIsPostcodeOpen(false);
      },
      onclose() {
        setIsPostcodeOpen(false);
      },
    }).open({
      popupTitle: "주소 검색",
      popupKey: "digimon-onboarding-address",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!address.trim()) {
      openAddressSearch();
      return;
    }

    if (!detailAddress.trim()) {
      return;
    }

    router.push("/onboarding/step-3");
  }

  return (
    <main className={styles.viewport}>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <div className={styles.canvas} data-node-id="148:1991">
        <Header />

        <div className={styles.illustration} data-node-id="148:2005">
          <Image
            src="/images/onboarding/market-illustration.png"
            alt=""
            width={1550}
            height={1550}
            priority
            className={styles.illustrationImage}
          />
        </div>

        <form
          className={styles.card}
          aria-labelledby="onboarding-question"
          data-node-id="148:2006"
          onSubmit={handleSubmit}
        >
          <div className={styles.questionText} data-node-id="148:2007">
            <p>질문 2.</p>
            <label id="onboarding-question" htmlFor="market-address">
              시장의 위치 및 주소를 입력해주세요.
            </label>
          </div>

          <div className={styles.addressFields}>
            <input
              id="market-address"
              name="marketAddress"
              type="text"
              autoComplete="street-address"
              className={`${styles.addressField} ${styles.addressSearchInput}`}
              aria-label="시장의 위치 및 주소"
              data-node-id="148:1711"
              placeholder="도로명 주소를 검색해주세요."
              readOnly
              required
              value={address}
              onClick={openAddressSearch}
            />
            <input
              id="market-detail-address"
              name="marketDetailAddress"
              type="text"
              autoComplete="address-line2"
              className={styles.addressField}
              aria-label="상세주소"
              placeholder="상세주소를 입력해주세요."
              required
              value={detailAddress}
              onChange={(event) => setDetailAddress(event.target.value)}
            />
          </div>
          <input type="hidden" name="zonecode" value={zonecode} />

          <button
            type="submit"
            className={`${styles.nextButton} ${styles.addressNextButton}`}
            data-node-id="148:1713"
          >
            다음
          </button>
        </form>

        <StepIndicator />
      </div>
    </main>
  );
}
