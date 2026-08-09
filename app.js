// ===================================================
// 우리 반 담벼락 - 시작점
//
// 메모를 쓰면 올린 순서대로 담벼락에 붙습니다.
// 지금은 데이터가 아래 배열에만 들어 있어서,
// 브라우저를 새로고침하면 전부 사라집니다.
// ===================================================


// --- 메모 목록 (앞에 있는 것이 먼저 올린 메모) ---
let memos = [
  { id: 1, text: "오늘 과학 시간에 한 실험이 재미있었다" },
  { id: 2, text: "궁금한 점 - 물은 왜 100도에서 끓나요?" },
  { id: 3, text: "모둠 친구들이 도와줘서 고마웠다" }
];

let nextId = 4;  // 새 메모에 붙일 번호


// ===================================================
// 데이터를 다루는 함수
// 백엔드 1 시간에 이 부분이 Firestore로 바뀝니다.
// ===================================================

function addMemo(text) {
  memos.push({ id: nextId, text: text });
  nextId = nextId + 1;
}

function deleteMemo(id) {
  memos = memos.filter(function (memo) {
    return memo.id !== id;
  });
}


// ===================================================
// 화면 그리기
// ===================================================

function render() {
  const wall = document.getElementById("wall");
  wall.innerHTML = "";

  memos.forEach(function (memo) {
    wall.appendChild(makeMemo(memo));
  });
}

// 메모 한 장 만들기
function makeMemo(memo) {
  const div = document.createElement("div");
  div.className = "memo";

  const del = document.createElement("button");
  del.textContent = "×";
  del.onclick = function () {
    deleteMemo(memo.id);
    render();
  };
  div.appendChild(del);

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

input.onkeydown = function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    addMemo(text);
    input.value = "";
    render();
  }
};


// 첫 화면 그리기
render();
input.focus();
