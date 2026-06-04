"use client";

import styles from "./DeleteAccountModal.module.css";

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteAccountModal({ onConfirm, onClose }: DeleteAccountModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-account-msg">
      <div className={styles.modal}>
        <p className={styles.message} id="delete-account-msg">
          회원 탈퇴를 진행하면 계정 정보를 다시 복구할 수 없습니다.{"\n"}
          정말 회원 탈퇴를 하시겠습니까?
        </p>
        <div className={styles.buttons}>
          <button className={`${styles.button} ${styles.confirmButton}`} type="button" onClick={onConfirm}>
            예
          </button>
          <button className={`${styles.button} ${styles.cancelButton}`} type="button" onClick={onClose}>
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}
