import { onAuthStateChanged, type User } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

const imageUploadTimeoutMs = 15000;

async function getAuthenticatedUser(): Promise<User> {
  const currentUser = auth.currentUser;
  if (currentUser) return currentUser;

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (changedUser) => {
      unsubscribe();
      resolve(changedUser);
    });
  });

  if (!user) {
    throw new Error("이미지 업로드를 위해 로그인이 필요합니다.");
  }

  return user;
}

function getSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Firebase Storage 이미지 업로드 시간이 초과되었습니다."));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

export async function uploadMarketPageImage(
  file: File,
  slot: "hero" | "logo" | "intro",
): Promise<string> {
  const user = await getAuthenticatedUser();
  const safeName = getSafeFileName(file.name);
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const path = `market-page/${user.uid}/${slot}/${Date.now()}-${uniqueId}-${safeName}`;
  const imageRef = ref(storage, path);

  await withTimeout(
    uploadBytes(imageRef, file, {
      contentType: file.type || "image/png",
      customMetadata: {
        originalName: file.name,
        slot,
      },
    }),
    imageUploadTimeoutMs,
  );

  return withTimeout(getDownloadURL(imageRef), imageUploadTimeoutMs);
}
