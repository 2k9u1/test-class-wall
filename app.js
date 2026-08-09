// ===================================================
// 성장형 교사개발자 과정 보드 - 시작점
//
// 지금은 데이터가 아래 배열에만 들어 있습니다.
// 브라우저를 새로고침하면 전부 사라집니다.
// ===================================================


// --- 컬럼(차시) ---
const columns = [
  { id: "c1", title: "9/4 원격 · 첫 좌표 찍기" },
  { id: "c2", title: "9/12 오전 · PRD + 프론트엔드" },
  { id: "c3", title: "9/12 오전 · 깃허브 익히기" },
  { id: "c4", title: "9/12 13:10 · 백엔드 1" },
  { id: "c5", title: "9/12 14:10 · 백엔드 2" },
  { id: "c6", title: "9/13 · 해커톤" },
  { id: "c7", title: "9/13 · 배포 전 검토" }
];


// --- 카드(학습 내용) ---
let cards = [
  { id: 1,  columnId: "c1", text: "교사개발자 과정의 목적과 최종 산출물" },
  { id: 2,  columnId: "c1", text: "앱스크립트·AI 캔버스와 IDE 개발의 차이" },
  { id: 3,  columnId: "c1", text: "CLI, IDE, 프로젝트 폴더의 개념" },
  { id: 4,  columnId: "c1", text: "Antigravity 설치와 AI 계정 연결" },
  { id: 5,  columnId: "c1", text: "GitHub · Firebase 회원가입" },
  { id: 6,  columnId: "c1", text: "환경변수와 API 키 관리의 필요성" },

  { id: 7,  columnId: "c2", text: "학교 수업·업무에서 해결할 문제 찾기" },
  { id: 8,  columnId: "c2", text: "주요 사용자와 핵심 목표 정하기" },
  { id: 9,  columnId: "c2", text: "핵심 기능, 화면 구성, 저장할 데이터 설계" },
  { id: 10, columnId: "c2", text: "MVP 범위로 줄이기" },
  { id: 11, columnId: "c2", text: "PRD를 단계별 프롬프트로 바꾸기" },
  { id: 12, columnId: "c2", text: "프론트엔드 프로토타입 만들기" },

  { id: 13, columnId: "c3", text: "Fork, Clone, Commit, Push 구분" },
  { id: 14, columnId: "c3", text: "프로젝트를 내 컴퓨터로 복제해 실행" },
  { id: 15, columnId: "c3", text: "수정하고 Commit으로 기록하기" },
  { id: 16, columnId: "c3", text: "GitHub에 Push 하기" },
  { id: 17, columnId: "c3", text: "잘못 고친 내용 되돌리기" },
  { id: 18, columnId: "c3", text: "README, .gitignore, .env의 역할" },

  { id: 19, columnId: "c4", text: "프론트엔드와 백엔드의 역할 구분" },
  { id: 20, columnId: "c4", text: "Firebase 프로젝트 만들고 웹앱 등록" },
  { id: 21, columnId: "c4", text: "이 보드를 Firestore에 연결하기" },
  { id: 22, columnId: "c4", text: "새로고침 후에도 카드가 남는지 확인" },
  { id: 23, columnId: "c4", text: "컬렉션 · 문서 · 필드 개념" },
  { id: 24, columnId: "c4", text: "Firestore Rules 맛보기" },

  { id: 25, columnId: "c5", text: "Google 계정으로 로그인 붙이기" },
  { id: 26, columnId: "c5", text: "로그인한 사람의 uid·이메일 확인" },
  { id: 27, columnId: "c5", text: "카드에 작성자 기록하기" },
  { id: 28, columnId: "c5", text: "내 카드만 수정·삭제할 수 있게" },
  { id: 29, columnId: "c5", text: "버튼 숨기기 ≠ 권한 제한, Rules로 진짜 막기" },
  { id: 30, columnId: "c5", text: "관리자(강사)와 일반 사용자 나누기" },
  { id: 31, columnId: "c5", text: "Gemini API를 서버에서 호출하기" },
  { id: 32, columnId: "c5", text: "API 키를 프론트엔드에 노출하지 않기" },

  { id: 33, columnId: "c6", text: "무엇을, 그리고 왜?" },
  { id: 34, columnId: "c6", text: "어떤 데이터를 담을 것인가" },
  { id: 35, columnId: "c6", text: "1차 결과물 자기 점검 · 동료 피드백" },
  { id: 36, columnId: "c6", text: "MVP 범위 안에서 2차 구현" },
  { id: 37, columnId: "c6", text: "공유 카드 작성 (이름·소개·링크·태그)" },
  { id: 38, columnId: "c6", text: "모둠 발표와 상호 평가" },

  { id: 39, columnId: "c7", text: "소스코드에 개인정보·API 키가 남아 있는지" },
  { id: 40, columnId: "c7", text: "학생 입력 욕설·부적절 표현 필터" },
  { id: 41, columnId: "c7", text: "부적절한 입력 시 안내와 재입력 유도" },
  { id: 42, columnId: "c7", text: "학생 활동 모니터링 방안" },
  { id: 43, columnId: "c7", text: "생성형 AI 활용 동의 게이트" },
  { id: 44, columnId: "c7", text: "이용약관 · 개인정보처리방침" },
  { id: 45, columnId: "c7", text: "학운위 심의 체크리스트" }
];

let nextId = 46;  // 새 카드에 붙일 번호


// ===================================================
// 데이터를 다루는 함수
// 백엔드 1 시간에 이 부분이 Firestore로 바뀝니다.
// ===================================================

function addCard(columnId, text) {
  cards.push({ id: nextId, columnId: columnId, text: text });
  nextId = nextId + 1;
}

function deleteCard(id) {
  cards = cards.filter(function (card) {
    return card.id !== id;
  });
}


// ===================================================
// 화면 그리기
// ===================================================

// 카드를 쓰던 컬럼. 화면을 다시 그린 뒤 입력칸에 커서를 돌려놓는 데 씁니다.
let focusColumnId = null;

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  columns.forEach(function (column) {
    // 컬럼 상자
    const div = document.createElement("div");
    div.className = "column";

    // 컬럼 제목
    const title = document.createElement("h2");
    title.textContent = column.title;
    div.appendChild(title);

    // 이 컬럼에 속한 카드들
    cards.filter(function (card) {
      return card.columnId === column.id;
    }).forEach(function (card) {
      div.appendChild(makeCard(card));
    });

    // 카드 추가 칸
    const form = makeForm(column.id);
    div.appendChild(form);

    board.appendChild(div);

    // 방금 카드를 쓴 컬럼이면 커서를 다시 놓아 줍니다
    if (column.id === focusColumnId) {
      form.focus();
    }
  });
}

// 카드 하나 만들기
function makeCard(card) {
  const div = document.createElement("div");
  div.className = "card";

  const del = document.createElement("button");
  del.textContent = "×";
  del.onclick = function () {
    deleteCard(card.id);
    render();
  };
  div.appendChild(del);

  const span = document.createElement("span");
  span.textContent = card.text;
  div.appendChild(span);

  return div;
}

// 카드 추가 입력칸 만들기
function makeForm(columnId) {
  const box = document.createElement("textarea");
  box.rows = 2;
  box.placeholder = "카드 내용을 쓰고 엔터";

  // 엔터를 누르면 카드가 추가됩니다 (줄바꿈은 Shift + 엔터)
  box.onkeydown = function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = box.value.trim();
      if (text === "") return;
      addCard(columnId, text);
      focusColumnId = columnId;
      render();
    }
  };

  return box;
}


// 첫 화면 그리기
render();
