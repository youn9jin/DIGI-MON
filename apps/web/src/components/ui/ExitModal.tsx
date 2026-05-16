import styles from "./ExitModal.module.css";

interface ExitModalProps {
  onLeave: () => void;
  onClose: () => void;
}

export default function ExitModal({ onLeave, onClose }: ExitModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="exit-modal-msg">
      <div className={styles.modal} data-node-id="182:2938">
        <p className={styles.message} id="exit-modal-msg" data-node-id="182:2939">
          지금까지 응답하신 정보는 자동으로 저장됩니다.{"\n"}
          현재 페이지에서 나가시겠습니까?
        </p>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.quitButton}`}
            onClick={onLeave}
            data-node-id="182:2940"
          >
            나가기
          </button>
          <button
            className={`${styles.button} ${styles.closeButton}`}
            onClick={onClose}
            data-node-id="182:2942"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
