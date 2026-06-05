"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Header from "@/components/layout/Header";
import DeleteAccountModal from "@/components/ui/DeleteAccountModal";
import { deleteMe, getMe, updateAssociation, type MeResponse } from "@/lib/api/me";
import { auth } from "@/lib/firebase";
import styles from "../mypage.module.css";

type AssociationForm = {
  name: string;
  email: string;
  phone: string;
  fax: string;
  position: string;
};

function createInitialForm(user: User | null, me: MeResponse | null): AssociationForm {
  const extendedMe = me as
    | (MeResponse & {
        fax?: string;
        managerTitle?: string;
        title?: string;
      })
    | null;

  return {
    name: me?.name ?? user?.displayName ?? "",
    email: me?.email ?? user?.email ?? "",
    phone: me?.phone ?? "",
    fax: extendedMe?.fax ?? "",
    position: extendedMe?.managerTitle ?? extendedMe?.title ?? "",
  };
}

export default function AssociationEditPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [form, setForm] = useState<AssociationForm>(() => createInitialForm(null, null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [scale, setScale] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(1, (window.innerWidth - 24) / 1920));
    }

    updateScale();
    window.addEventListener("resize", updateScale);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      try {
        const nextMe = await getMe(currentUser);
        setMe(nextMe);
        setForm(createInitialForm(currentUser, nextMe));
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", updateScale);
    };
  }, [router]);

  const websiteHref = me?.marketId ? `/markets/${me.marketId}` : "/templates";
  const canvasStyle = {
    "--mypage-edit-scale": scale,
    "--mypage-edit-height": "1440px",
  } as CSSProperties;

  function updateField<K extends keyof AssociationForm>(key: K, value: AssociationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveMessage("");
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleDeleteAccountConfirm() {
    setSaveMessage("");

    try {
      await deleteMe();
      setIsDeleteModalOpen(false);
      await signOut(auth).catch(() => undefined);
      router.replace("/login");
    } catch (error) {
      setIsDeleteModalOpen(false);
      setSaveMessage(error instanceof Error ? error.message : "회원 탈퇴에 실패했습니다.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");

    const phone = form.phone.trim();
    if (phone && !/^[0-9+\-() ]{5,20}$/.test(phone)) {
      setSaveMessage("전화번호는 숫자, +, -, (, ), 공백으로 구성된 5~20자여야 합니다.");
      return;
    }
    const fax = form.fax.trim();
    if (fax && !/^[0-9+\-() ]{5,20}$/.test(fax)) {
      setSaveMessage("팩스 번호는 숫자, +, -, (, ), 공백으로 구성된 5~20자여야 합니다.");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateAssociation({
        managerName: form.name.trim() || null,
        email: form.email.trim() || null,
        phone: phone || null,
        fax: fax || null,
        managerTitle: form.position.trim() || null,
      });
      setForm((current) => ({
        ...current,
        name: updated.managerName ?? current.name,
        email: updated.email ?? current.email,
        phone: updated.phone ?? current.phone,
        fax: updated.fax ?? current.fax,
        position: updated.managerTitle ?? current.position,
      }));
      setMe((current) =>
        current
          ? {
              ...current,
              name: updated.managerName ?? current.name,
              email: updated.email ?? current.email,
              phone: updated.phone ?? current.phone,
            }
          : current,
      );
      setSaveMessage("상인회 담당자 정보를 수정했어요.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "상인회 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Header variant="builder" />
        <div className={styles.loading}>불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header variant="builder" />

      <div className={styles.editFigmaViewport} style={canvasStyle}>
        <form className={styles.editFigmaCanvas} onSubmit={handleSubmit}>
          <h1 className={styles.editFigmaPageTitle}>마이페이지</h1>

          <aside className={styles.figmaSidebar} aria-label="마이페이지 메뉴">
            <Link className={styles.figmaSideButton} href="/mypage">
              전체 보기
            </Link>
            <Link className={`${styles.figmaSideButton} ${styles.figmaSideActive}`} href="/mypage">
              내 정보
            </Link>
            <Link className={styles.figmaSideButton} href={websiteHref}>
              웹사이트 확인
            </Link>
            <button
              className={`${styles.figmaSideButton} ${styles.figmaLogout}`}
              type="button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
            <button
              className={`${styles.figmaSideButton} ${styles.figmaWithdraw}`}
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              회원 탈퇴
            </button>
          </aside>

          <h2 className={styles.editFigmaTitle}>상인회 정보 수정하기</h2>
          <p className={styles.editFigmaDescription}>
            온보딩과 로그인 과정에서 입력한 상인회 정보를 수정할 수 있어요
          </p>
          <div className={styles.associationFigmaPanel} aria-hidden="true" />

          <label className={styles.editFigmaLabel} style={{ left: 508, top: 390 }}>
            1. 담당자(상인회) 이름
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 433 }}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="(기존 상인회 이름)"
          />

          <div className={styles.editFigmaLabel} style={{ left: 508, top: 572 }}>
            2. 담당자(상인회) 연락처
          </div>
          <label className={styles.editFigmaSubLabel} style={{ left: 511, top: 639 }}>
            이메일 주소
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 658 }}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="(기존 이메일 주소)"
          />
          <label className={styles.editFigmaSubLabel} style={{ left: 511, top: 777 }}>
            유선 전화번호 (선택)
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 798 }}
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(기존 전화번호, 입력하지 않았다면 빈 칸)"
          />
          <label className={styles.editFigmaSubLabel} style={{ left: 511, top: 917 }}>
            팩스 번호 (선택)
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 505, top: 938 }}
            value={form.fax}
            onChange={(event) => updateField("fax", event.target.value)}
            placeholder="(기존 팩스 번호, 입력하지 않았다면 빈 칸)"
          />

          <label className={styles.editFigmaLabel} style={{ left: 511, top: 1057 }}>
            3. 담당자 직책(선택)
          </label>
          <input
            className={styles.editFigmaInput}
            style={{ left: 508, top: 1105 }}
            value={form.position}
            onChange={(event) => updateField("position", event.target.value)}
            placeholder="(기존 직책, 입력하지 않았다면 빈 칸)"
          />

          {saveMessage && <p className={styles.associationFigmaSaveMessage}>{saveMessage}</p>}
          <button className={styles.associationFigmaSaveButton} type="submit" disabled={isSaving}>
            {isSaving ? "저장 중" : "저장하기"}
          </button>
        </form>
      </div>
      {isDeleteModalOpen && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccountConfirm}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </main>
  );
}
