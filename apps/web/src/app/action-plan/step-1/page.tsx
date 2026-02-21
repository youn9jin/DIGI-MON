"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ActionPlanStep1Page() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    // ✅ 로그인 필수
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) router.replace("/login");
            else setReady(true);
        });
        return () => unsub();
    }, [router]);

    if (!ready) return null;

    return (
        <main className="w-full bg-[#FAFAFA]">
            {/* 헤더는 action-plan layout(AuthHeader)에서 렌더링 */}

            {/* ✅ 버튼 fixed가 컨텐츠를 가리지 않도록 아래 패딩 넉넉히 */}
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[83px] pt-[120px] pb-[200px]">
                {/* 좌측 타이틀 */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-[48px] leading-[1.1] font-semibold text-black">
                        1단계
                    </h1>
                    <h2 className="text-[36px] leading-[1.25] font-semibold text-black">
                        지도 서비스 열기
                    </h2>
                </div>

                <p className="mt-8 text-[#666666] text-[16px] leading-[25px]">
                    헷갈리는 부분이 있다면 언제든지 ‘도움 요청하기&apos;를 눌러주세요.
                </p>

                {/* ✅ STEP 1 */}
                <section className="mt-12">
                    <div className="flex flex-col items-center text-center gap-3">
                        <NumberBadge n={1} />

                        <p className="text-[#292929] text-[18px] font-medium leading-[1.45] whitespace-pre-line">
                            {`https://www.google.com/maps (구글 지도 링크)\n위 링크를 눌러 아래 화면이 나오는지 확인하세요`}
                        </p>

                        <Link
                            href="https://www.google.com/maps"
                            target="_blank"
                            className="text-[14px] text-[#2E2E2E] underline underline-offset-4 hover:opacity-80"
                        >
                            링크 열기
                        </Link>
                    </div>

                    {/* ✅ 이미지 (버튼은 이제 이미지랑 무관하게 fixed) */}
                    <div className="mt-10 mx-auto w-full max-w-[920px]">
                        <Image
                            src="/images/step1-map-1.svg"
                            alt="구글 지도 화면"
                            width={920}
                            height={520}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </section>

                {/* ✅ STEP 2 */}
                <section className="mt-20">
                    <div className="flex flex-col items-center text-center gap-3">
                        <NumberBadge n={2} />
                        <p className="text-[#292929] text-[18px] font-medium leading-[1.45] whitespace-pre-line">
                            {`좌측 상단 가로줄 세 개 아이콘을 눌러요\n(아래 사진 참고)`}
                        </p>
                    </div>

                    <div className="mt-10 mx-auto w-full max-w-[920px] relative">
                        <Image
                            src="/images/step1-map-1.svg"
                            alt="구글 지도 화면 (메뉴 버튼)"
                            width={920}
                            height={520}
                            className="w-full h-auto object-contain"
                            priority
                        />
                        {/* 빨간 박스 */}
                        <div className="absolute left-0 top-0 w-[43px] h-[40px] border border-red-500" />
                    </div>
                </section>

                {/* ✅ STEP 3 */}
                <section className="mt-20">
                    <div className="flex flex-col items-center text-center gap-3">
                        <NumberBadge n={3} />
                        <p className="text-[#292929] text-[18px] font-medium leading-[1.45] whitespace-pre-line">
                            {`사장님 화면이 아래 화면과 동일한지 확인해주세요.\n동일하다면 화면 좌측 중앙에 ‘비즈니스 추가'를 눌러주세요.`}
                        </p>
                    </div>

                    <div className="mt-10 mx-auto w-full max-w-[920px] relative">
                        <Image
                            src="/images/step1-map-2.svg"
                            alt="구글 지도 화면 2"
                            width={920}
                            height={520}
                            className="w-full h-auto object-contain"
                            priority
                        />
                        {/* 빨간 박스 */}
                        <div className="absolute left-0 top-[56%] w-[191px] h-[20px] border border-red-500" />
                    </div>
                </section>
            </div>

            {/* ✅ ✅ 버튼 2개: 뷰포트 기준 오른쪽 아래 고정 */}
            <div className="fixed right-6 bottom-6 lg:right-[45px] lg:bottom-[35px] z-50">
                <div className="flex items-center gap-6">
                    {/* 완료 버튼 (큰 버튼) */}
                    <button
                        type="button"
                        className="h-[74px] w-[344px] rounded-[20px] text-[#2E2E2E] text-[18px] font-medium shadow-[0px_2px_10px_rgba(0,0,0,0.10)] hover:opacity-90 transition"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(176,201,101,0.88) 37.355%, rgba(245,245,245,0.88) 138.23%)",
                        }}
                        onClick={() => {
                            // TODO: 완료 처리(예: step-2로 이동하거나 action-plan로 복귀)
                            router.push("/action-plan");
                        }}
                    >
                        지도 서비스 열기를 완료했어요
                    </button>

                    {/* 도움 요청하기 (작은 버튼) */}
                    <Link
                        href="/help"
                        className="h-[74px] w-[193px] rounded-[50px] bg-[#E0F0AF] text-[#585858] text-[18px] font-semibold shadow-[0px_2px_2px_rgba(0,0,0,0.25)] flex items-center justify-center hover:opacity-90 transition"
                    >
                        도움 요청하기
                    </Link>
                </div>
            </div>
        </main>
    );
}

/** ✅ 원형 아이콘 SVG + 숫자 오버레이 */
function NumberBadge({ n }: { n: number }) {
    return (
        <div className="relative w-[67px] h-[67px]">
            <Image
                src="/images/step-circle.svg"
                alt="step circle"
                fill
                className="object-contain"
                priority
            />
            <div className="absolute inset-0 flex items-center justify-center text-[36px] font-medium text-black">
                {n}
            </div>
        </div>
    );
}