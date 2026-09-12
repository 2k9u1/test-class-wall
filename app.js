// ===================================================
// 우리 반 담벼락
//
// Firebase Firestore와 연동되어 새로고침해도 메모가 유지됩니다.
// ===================================================

// Firebase SDK 불러오기 (modular 방식 CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCXd2G6ryKom6iC0XPyURkJUwvD2DsoxIo",
  authDomain: "test-class-wallll.firebaseapp.com",
  projectId: "test-class-wallll",
  storageBucket: "test-class-wallll.firebasestorage.app",
  messagingSenderId: "661462990485",
  appId: "1:661462990485:web:a8534ea4043e444d35259c"
};

// Firebase 초기화, Firestore 및 Auth 객체 준비
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 현재 로그인한 사용자 정보 (로그아웃 상태면 null)
let currentUser = null;

// 교사(teacher) UID 목록
// 여기에 등록된 UID는 모든 권한을 가진 'teacher' 역할을 갖습니다.
const TEACHER_UIDS = [
  "eY2ZWJ2TB1dRkxx7G8N6D1QJWnp2", // 교사 UID (현재 로그인 계정)
];

// 사용자의 역할을 반환합니다 ('teacher' 또는 'student')
function getUserRole(user) {
  if (!user) return null;
  return TEACHER_UIDS.includes(user.uid) ? "teacher" : "student";
}



// ===================================================
// 구글 로그인 및 로그아웃
// ===================================================

// 구글 계정으로 로그인합니다.
async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("로그인 오류:", error);
    alert("로그인에 실패했습니다. (팝업 허용 여부 또는 승인된 도메인을 확인해 주세요)");
  }
}

// 로그아웃합니다.
async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 오류:", error);
  }
}

// 사용자 영역(로그인/로그아웃 버튼 및 안내) 화면 그리기
function renderUserArea() {
  const userArea = document.getElementById("userArea");
  if (!userArea) return;
  userArea.innerHTML = "";

  if (currentUser) {
    const role = getUserRole(currentUser);
    const roleBadge = role === "teacher" ? "👨‍🏫 선생님(teacher)" : "👨‍🎓 학생(student)";

    const greeting = document.createElement("span");
    greeting.textContent = `${currentUser.displayName || "사용자"} 님 [${roleBadge}] 환영합니다! `;
    userArea.appendChild(greeting);

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "로그아웃";
    logoutBtn.addEventListener("click", logout);
    userArea.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Google 계정으로 로그인";
    loginBtn.addEventListener("click", login);
    userArea.appendChild(loginBtn);
  }
}


// ===================================================
// 데이터를 다루는 함수 세 개
// Firestore 데이터베이스를 사용하여 읽기, 쓰기, 지우기를 수행합니다.
// ===================================================

// 메모를 읽어 옵니다.
// Firestore의 'memos' 컬렉션에서 작성 시각(createdAt) 순서대로 정렬해 가져옵니다.
async function loadMemos() {
  try {
    const q = query(collection(db, "memos"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const memos = [];
    querySnapshot.forEach(function (docSnap) {
      memos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return memos;
  } catch (error) {
    console.error("메모 읽기 오류:", error);
    return [];
  }
}

// 메모를 새로 씁니다. (5글자 이상만 저장)
// 백엔드 2: 여기에 "누가 썼는지"(uid)와 역할(role)을 함께 저장하게 됩니다.
async function addMemo(text) {
  if (!currentUser) {
    alert("메모를 작성하려면 먼저 Google 로그인을 해 주세요.");
    return;
  }

  if (text.length < 5) {
    alert("메모는 5글자 이상 입력해 주세요.");
    return;
  }

  const role = getUserRole(currentUser);

  try {
    await addDoc(collection(db, "memos"), {
      text: text,
      createdAt: Date.now(),
      uid: currentUser.uid,
      author: currentUser.displayName || (role === "teacher" ? "선생님" : "학생"),
      role: role
    });
  } catch (error) {
    console.error("메모 추가 오류:", error);
    alert("메모 저장에 실패했습니다. Firestore 보안 규칙을 확인해 주세요.");
  }
}

// 메모를 지웁니다.
// 교사는 모든 메모를 지울 수 있고, 학생은 본인 메모만 지울 수 있습니다.
async function deleteMemo(id) {
  try {
    await deleteDoc(doc(db, "memos", id));
  } catch (error) {
    console.error("메모 삭제 오류:", error);
    alert("삭제 권한이 없거나 오류가 발생했습니다.");
  }
}



// ===================================================
// AI 코멘트 관련 함수 (Gemini API)
// Vercel 서버리스 함수(/api/gemini)를 호출합니다.
// 개인정보 보호 규칙: uid, 이메일 등 식별 정보는 일체 보내지 않고 오직 메모 내용(text)만 전송합니다.
// ===================================================

// 서버로 AI 코멘트 생성을 요청합니다.
async function requestAiComment(text) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }) // 오직 메모 텍스트만 전달
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "로컬 개발 환경(Live Server)에서는 /api/gemini 엔드포인트를 직접 실행할 수 없습니다.\nVercel에 배포하거나 Vercel CLI(npx vercel dev)로 실행해 주세요."
        );
      }
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `서버 응답 오류 (${response.status})`);
    }

    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error("AI 코멘트 요청 실패:", error);
    throw error;
  }
}

// 개별 메모에 AI 코멘트 달기 (교사 전용)
async function addAiCommentToMemo(memoId, memoText, btnElement) {
  const role = getUserRole(currentUser);
  if (role !== "teacher") {
    alert("AI 코멘트 작성 권한은 교사에게만 있습니다.");
    return;
  }

  if (btnElement) {
    btnElement.disabled = true;
    btnElement.textContent = "🤖 생성 중...";
  }

  try {
    const comment = await requestAiComment(memoText);
    await updateDoc(doc(db, "memos", memoId), {
      aiComment: comment
    });
    await render();
  } catch (error) {
    alert("AI 코멘트 생성 실패:\n" + error.message);
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.textContent = "🤖 AI 코멘트 달기";
    }
  }
}

// 담벼락의 모든 메모에 AI 코멘트 일괄 달기 (교사 전용)
async function addAiCommentToAllMemos(btnElement) {
  const role = getUserRole(currentUser);
  if (role !== "teacher") {
    alert("교사만 실행할 수 있습니다.");
    return;
  }

  const memos = await loadMemos();
  if (memos.length === 0) {
    alert("담벼락에 등록된 메모가 없습니다.");
    return;
  }

  const targetMemos = memos.filter((m) => !m.aiComment);
  const listToProcess = targetMemos.length > 0 ? targetMemos : memos;

  if (targetMemos.length === 0) {
    if (!confirm("모든 메모에 이미 AI 코멘트가 있습니다. 전체를 다시 생성하시겠습니까?")) {
      return;
    }
  }

  if (btnElement) {
    btnElement.disabled = true;
    btnElement.textContent = `🤖 코멘트 생성 중... (0/${listToProcess.length})`;
  }

  let count = 0;
  for (const memo of listToProcess) {
    try {
      const comment = await requestAiComment(memo.text);
      await updateDoc(doc(db, "memos", memo.id), {
        aiComment: comment
      });
      count++;
      if (btnElement) {
        btnElement.textContent = `🤖 코멘트 생성 중... (${count}/${listToProcess.length})`;
      }
    } catch (e) {
      console.error(`메모(${memo.id}) AI 코멘트 생성 실패:`, e);
    }
  }

  await render();
  alert(`총 ${count}개의 메모에 AI 코멘트 생성을 완료했습니다!`);

  if (btnElement) {
    btnElement.disabled = false;
    btnElement.textContent = "🤖 전체 메모 AI 코멘트 달기";
  }
}

// 교사용 액션 버튼 영역(전체 AI 코멘트 달기 등) 그리기
function renderTeacherActions() {
  const teacherActions = document.getElementById("teacherActions");
  if (!teacherActions) return;
  teacherActions.innerHTML = "";

  const role = getUserRole(currentUser);
  if (role === "teacher") {
    const batchBtn = document.createElement("button");
    batchBtn.className = "teacher-batch-btn";
    batchBtn.textContent = "🤖 전체 메모 AI 코멘트 달기";
    batchBtn.addEventListener("click", function () {
      addAiCommentToAllMemos(batchBtn);
    });
    teacherActions.appendChild(batchBtn);
  }
}


// ===================================================
// 화면 그리기
// ===================================================

async function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  renderTeacherActions();

  const memos = await loadMemos();
  memos.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  const role = getUserRole(currentUser);

  // 상단: 삭제 버튼과 메모 본문
  const contentDiv = document.createElement("div");
  contentDiv.className = "memo-content";

  // 교사(teacher): 모든 메모를 삭제할 수 있는 모든 권한 보유
  // 학생(student): 다른 사람 것은 건들지 못하며, 본인이 작성한 메모만 삭제 가능
  const canDelete = currentUser && (role === "teacher" || memo.uid === currentUser.uid || !memo.uid);
  if (canDelete) {
    const del = document.createElement("button");
    del.className = "del-btn";
    del.textContent = "×";
    del.title = role === "teacher" ? "교사 권한으로 삭제" : "삭제";
    del.addEventListener("click", async function () {
      await deleteMemo(memo.id);
      await render();
    });
    contentDiv.appendChild(del);
  }

  const span = document.createElement("span");
  span.textContent = memo.text;
  contentDiv.appendChild(span);
  div.appendChild(contentDiv);

  // AI 코멘트가 있는 경우 말풍선으로 표시
  if (memo.aiComment) {
    const commentBox = document.createElement("div");
    commentBox.className = "ai-comment";

    const commentHeader = document.createElement("div");
    commentHeader.className = "ai-comment-header";
    commentHeader.textContent = "🤖 AI 선생님 피드백";
    commentBox.appendChild(commentHeader);

    const commentBody = document.createElement("div");
    commentBody.textContent = memo.aiComment;
    commentBox.appendChild(commentBody);

    div.appendChild(commentBox);
  }

  // 교사(teacher)에게만 각 메모별 AI 코멘트 생성 버튼 노출
  if (role === "teacher") {
    const aiBtn = document.createElement("button");
    aiBtn.className = "ai-btn";
    aiBtn.textContent = memo.aiComment ? "🤖 AI 코멘트 다시 달기" : "🤖 AI 코멘트 달기";
    aiBtn.addEventListener("click", function () {
      addAiCommentToMemo(memo.id, memo.text, aiBtn);
    });
    div.appendChild(aiBtn);
  }

  return div;
}


// ===================================================
// 메모 쓰는 칸 및 등록 처리
// 엔터를 누르거나 [메모 올리기] 버튼을 누르면 담벼락에 붙습니다.
// (줄바꿈은 Shift + 엔터)
// ===================================================

const input = document.getElementById("input");
const submitBtn = document.getElementById("submitBtn");
let isSubmitting = false;

// 메모 등록 공통 처리 함수
async function submitMemo() {
  if (isSubmitting) return;

  const text = input.value.trim();
  if (text === "") return;

  if (!currentUser) {
    alert("메모를 작성하려면 먼저 상단의 Google 로그인을 해 주세요.");
    return;
  }

  if (text.length < 5) {
    alert("메모는 5글자 이상 입력해 주세요.");
    return;
  }

  isSubmitting = true;
  try {
    await addMemo(text);
    input.value = "";
    await render();
  } catch (error) {
    console.error("등록 처리 중 오류:", error);
  } finally {
    isSubmitting = false;
  }
}

// 엔터 키 누름 이벤트 (한글 조합 및 영문 모두 정상 동작)
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitMemo();
  }
});

// [메모 올리기] 버튼 클릭 이벤트
if (submitBtn) {
  submitBtn.addEventListener("click", submitMemo);
}


// 로그인 상태 변경 감시 (로그인 또는 로그아웃 시 화면 자동 갱신)
onAuthStateChanged(auth, function (user) {
  currentUser = user;
  renderUserArea();
  render();
});

// 첫 화면 그리기
renderUserArea();
render();
input.focus();



