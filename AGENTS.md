# AI 코딩 도구를 위한 규칙

이 프로젝트를 고칠 때 반드시 지켜 주세요.

## 요금제

Firebase는 **무료 Spark 요금제**만 씁니다.

- **Cloud Functions for Firebase(Firebase Functions)를 쓰지 마세요.** 유료 Blaze 요금제라야 동작합니다.
- 서버가 필요한 일(예: Gemini API 호출)은 **Vercel 서버리스 함수**로 만드세요.
  `api/` 폴더에 파일을 만들면 그 경로가 그대로 주소가 됩니다. (`api/gemini.js` → `/api/gemini`)
- API 키는 코드에 적지 말고 Vercel 환경변수에 넣고 `process.env`로 꺼내 쓰세요.

## 코드 방식

- Firebase SDK는 **v9 이상 modular 방식**을 씁니다. `compat` 버전을 쓰지 마세요.
- `app.js`는 `<script type="module">`로 불러옵니다. 이 방식을 바꾸지 마세요.

## 고칠 때

- **파일 전체를 다시 쓰지 마세요.** 필요한 부분만 고치세요.
- 아래 함수 이름과 역할을 그대로 두세요. 연수 참가자가 이 이름을 기준으로 따라옵니다.
  - `loadMemos()` — 메모를 읽어 옵니다
  - `addMemo(text)` — 메모를 새로 씁니다
  - `deleteMemo(id)` — 메모를 지웁니다
  - `render()` — 화면을 그립니다
- 주석은 한국어로 답니다. 초등·중등 교사가 읽습니다.

## 개인정보

- 학생 이름, 사진, 학교명을 코드나 예시 데이터에 넣지 마세요.
- Gemini에 보낼 때 uid·이메일 같은 식별 정보를 함께 보내지 마세요.
