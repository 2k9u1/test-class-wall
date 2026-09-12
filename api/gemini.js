// ===================================================
// Gemini에게 물어보는 Vercel 서버리스 함수
// 주소: /api/gemini
//
// Firebase Functions 대신 무료로 쓸 수 있는 Vercel 함수를 사용합니다.
// API 키는 Vercel 환경변수(GEMINI_API_KEY)에 설정합니다.
// 학생 이름이나 식별 정보는 받지 않고 오직 메모 내용(text)만 처리합니다.
// ===================================================

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 지원합니다." });
  }

  // 본문에서 메모 텍스트 추출 (개인 식별 정보 제외)
  const { text } = req.body || {};

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "메모 내용(text)이 필요합니다." });
  }

  // Vercel 환경변수에서 Gemini API 키 읽기
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Vercel 환경변수에 GEMINI_API_KEY가 설정되어 있지 않습니다."
    });
  }

  try {
    // 무료 티어로 제공되는 빠른 gemini-2.5-flash 모델 사용
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `당신은 초·중등학교 교실의 다정하고 따뜻한 선생님입니다.
학생이 교실 담벼락에 작성한 다음 메모를 읽고, 공감과 칭찬, 또는 생각의 확장을 돕는 다정한 피드백 코멘트(1~2문장 내외)를 작성해 주세요.
이름이나 개인정보는 절대 언급하지 말고 자연스러운 교사의 어투(해요체)로 작성해 주세요.

학생의 메모:
"${text.trim()}"`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Gemini API 호출 실패:", errData);
      return res.status(response.status).json({
        error: `Gemini API 호출 오류 (${response.status})`
      });
    }

    const data = await response.json();
    const comment =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "좋은 생각을 나누어 주어 고마워요!";

    return res.status(200).json({ comment });
  } catch (error) {
    console.error("서버 처리 오류:", error);
    return res.status(500).json({ error: "AI 코멘트 생성 중 오류가 발생했습니다." });
  }
}
