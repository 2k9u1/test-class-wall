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
    const greeting = document.createElement("span");
    greeting.textContent = (currentUser.displayName || "선생님") + " 님 환영합니다! ";
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
// 백엔드 2: 여기에 "누가 썼는지"(uid)를 함께 저장하게 됩니다.
async function addMemo(text) {
  if (!currentUser) {
    alert("메모를 작성하려면 먼저 Google 로그인을 해 주세요.");
    return;
  }

  if (text.length < 5) {
    alert("메모는 5글자 이상 입력해 주세요.");
    return;
  }

  try {
    await addDoc(collection(db, "memos"), {
      text: text,
      createdAt: Date.now(),
      uid: currentUser.uid,
      author: currentUser.displayName || "선생님"
    });
  } catch (error) {
    console.error("메모 추가 오류:", error);
    alert("메모 저장에 실패했습니다. Firestore 보안 규칙을 확인해 주세요.");
  }
}

// 메모를 지웁니다.
// 백엔드 2: 지금은 누구든 남의 메모를 지울 수 있습니다. 이걸 막는 것이 과제입니다.
async function deleteMemo(id) {
  try {
    await deleteDoc(doc(db, "memos", id));
  } catch (error) {
    console.error("메모 삭제 오류:", error);
    alert("메모 삭제에 실패했습니다.");
  }
}


// ===================================================
// 화면 그리기
// ===================================================

async function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  const memos = await loadMemos();
  memos.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  // 백엔드 2: 내가 쓴 메모이거나 작성자 정보가 없는 기존 메모만 삭제 버튼 표시
  const canDelete = currentUser && (memo.uid === currentUser.uid || !memo.uid);
  if (canDelete) {
    const del = document.createElement("button");
    del.textContent = "×";
    del.addEventListener("click", async function () {
      await deleteMemo(memo.id);
      await render();
    });
    div.appendChild(del);
  }

  const span = document.createElement("span");
  span.textContent = memo.text;
  div.appendChild(span);

  return div;
}


// ===================================================
// 메모 쓰는 칸
// 엔터를 누르면 담벼락에 붙습니다 (줄바꿈은 Shift + 엔터)
// ===================================================

const input = document.getElementById("input");

input.addEventListener("keydown", async function (e) {
  if (e.isComposing) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    if (text.length < 5) {
      alert("메모는 5글자 이상 입력해 주세요.");
      return;
    }

    await addMemo(text);
    input.value = "";
    await render();
  }
});


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


