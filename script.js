// script.js 전체 코드 (Gemini API 연동 및 폴백 엔진 포함)
import { GoogleGenAI } from "@google/genai";

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyStatus = document.getElementById("apiKeyStatus");
  const passageInput = document.getElementById("passageInput");
  const quizTypeSelect = document.getElementById("quizTypeSelect");
  const generateBtn = document.getElementById("generateBtn");

  const stepApi = document.getElementById("step-api");
  const stepInput = document.getElementById("step-input");
  const stepLoading = document.getElementById("step-loading");
  const stepQuiz = document.getElementById("step-quiz");
  const stepResult = document.getElementById("step-result");

  const questionContainer = document.getElementById("questionContainer");
  const quizProgress = document.getElementById("quizProgress");
  const scoreBadge = document.getElementById("scoreBadge");
  const nextBtn = document.getElementById("nextBtn");
  const scoreSummary = document.getElementById("scoreSummary");
  const feedbackContainer = document.getElementById("feedbackContainer");
  const restartBtn = document.getElementById("restartBtn");

  let currentApiKey = localStorage.getItem("gemini_api_key") || "";
  if (currentApiKey) {
    apiKeyInput.value = currentApiKey;
    apiKeyStatus.textContent = "저장된 API 키가 있습니다.";
    apiKeyStatus.style.color = "green";
  }

  saveApiKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      alert("API 키를 입력해주세요.");
      return;
    }
    localStorage.setItem("gemini_api_key", key);
    currentApiKey = key;
    apiKeyStatus.textContent = "API 키가 성공적으로 저장되었습니다!";
    apiKeyStatus.style.color = "green";
  });

  let quizData = [];
  let currentIndex = 0;
  let userAnswers = [];
  let score = 0;

  generateBtn.addEventListener("click", async () => {
    const passage = passageInput.value.trim();
    if (!passage) {
      alert("공부할 지문을 입력해주세요.");
      return;
    }

    stepInput.style.display = "none";
    stepApi.style.display = "none";
    stepLoading.style.display = "block";

    try {
      quizData = await fetchQuizFromGemini(passage, quizTypeSelect.value, currentApiKey);
    } catch (err) {
      console.warn("AI 호출 실패 또는 API 키 오류, 오프라인 폴백 문제 풀을 사용합니다.", err);
      quizData = getFallbackQuiz(quizTypeSelect.value);
    }

    stepLoading.style.display = "none";
    stepQuiz.style.display = "block";
    currentIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    score = 0;
    renderQuestion();
  });

  async function fetchQuizFromGemini(passage, type, apiKey) {
    if (!apiKey) throw new Error("No API key");
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `다음 고등학교 영어 지문을 바탕으로 내신 대비 4지선다형 문제 5개를 JSON 배열 형식으로 만들어줘. 
    유형: ${type}
    지문: ${passage}
    
    반드시 아래 JSON 구조로만 응답해줘 (마크다운 백틱 없이):
    [
      {
        "question": "문제 내용",
        "options": ["① 보기1", "② 보기2", "③ 보기3", "④ 보기4"],
        "answer": 0,
        "explanation": "정답 해설"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text.trim();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  }

  function getFallbackQuiz(type) {
    return [
      {
        question: "다음 빈칸에 들어갈 가장 알맞은 어휘는?",
        options: ["① significant", "② trivial", "③ accidental", "④ harmful"],
        answer: 0,
        explanation: "지문의 맥락상 '상당한, 중대한' 이라는 뜻의 significant가 가장 적절합니다."
      },
      {
        question: "밑줄 친 부분 중 어법상 틀린 것을 고르시오.",
        options: ["① Environmental shampoo can", "② significantly impact", "③ wildlife habitats, which", "④ causing serious damage"],
        answer: 3,
        explanation: "which절 안에서 동사가 필요하므로 causing은 caused로 고쳐야 합니다."
      }
    ];
  }

  function renderQuestion() {
    const q = quizData[currentIndex];
    quizProgress.textContent = `문제 ${currentIndex + 1} / ${quizData.length}`;
    scoreBadge.textContent = `점수: ${score}점`;

    let html = `<p style="margin-bottom: 15px; font-weight: bold;">Q. ${q.question}</p>`;
    q.options.forEach((opt, idx) => {
      const isChecked = userAnswers[currentIndex] === idx ? "checked" : "";
      html += `
        <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; cursor: pointer;">
          <input type="radio" name="quizOption" value="${idx}" ${isChecked} style="margin-right: 8px;">
          ${opt}
        </label>`;
    });
    questionContainer.innerHTML = html;
  }

  nextBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="quizOption"]:checked');
    if (!selected) {
      alert("정답을 선택해주세요!");
      return;
    }

    userAnswers[currentIndex] = parseInt(selected.value);
    if (userAnswers[currentIndex] === quizData[currentIndex].answer) {
      score += 20;
    }

    currentIndex++;
    if (currentIndex < quizData.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    stepQuiz.style.display = "none";
    stepResult.style.display = "block";
    scoreSummary.innerHTML = `<h3>총점: ${score}점 / 100점 만점</h3>`;

    let fbHtml = "<h4>🔍 오답 노트 및 해설</h4>";
    quizData.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = userAns === q.answer;
      fbHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background: ${isCorrect ? '#e8f8f5' : '#fdedec'}; border-radius: 6px;">
          <p><b>Q${idx+1}. ${q.question}</b></p>
          <p>내 답: ${q.options[userAns]} / 정답: ${q.options[q.answer]}</p>
          <p style="font-size: 0.85rem; color: #555; margin-top: 5px;">💡 해설: ${q.explanation}</p>
        </div>`;
    });
    feedbackContainer.innerHTML = fbHtml;
  }

  restartBtn.addEventListener("click", () => {
    stepResult.style.display = "none";
    stepInput.style.display = "block";
    stepApi.style.display = "block";
    passageInput.value = "";
  });
});