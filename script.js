import { GoogleGenAI } from "@google/genai";

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyStatus = document.getElementById("apiKeyStatus");
  const presetPassageSelect = document.getElementById("presetPassageSelect");
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

  // 지문 데이터 저장고 (학습 지문 요약 및 원문 관리)
  const passagesDb = {
    miraen_art: `Welcome to the Dream Art Gallery! This exhibition explores unique artists who overcame life challenges to express their stories through art, featuring remarkable creators from diverse backgrounds and historical contexts.`,
    mock_29: `Big mammalian herbivore species react to danger from predators or humans in different ways, influencing their captivity and domestication potential.`,
    mock_30: `Our natural tendency to share and cooperate is shaped by resource availability, survival dependencies, and social structures within communities.`,
    mock_31: `Human well-being naturally adapts to life events and experiences, eventually returning to a personal baseline or default level over time.`,
    mock_32: `The daily biological drive for sleep is regulated by chemical compounds such as adenosine, building up during wakefulness and clearing during rest.`,
    mock_36: `Desert organisms utilize specialized physiological adaptations, such as sophisticated fluid retention systems, to survive extreme environmental heat.`,
    mock_38: `Nonlinear digital editing systems revolutionize media production through random access capabilities compared to traditional linear methods.`,
    mock_39: `Moral responsibility in human actions involves evaluating both actual consequences, intentions, and underlying motives.`
  };

  presetPassageSelect.addEventListener("change", (e) => {
    const selectedKey = e.target.value;
    if (passagesDb[selectedKey]) {
      passageInput.value = passagesDb[selectedKey];
    } else {
      passageInput.value = "";
    }
  });

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
    apiKeyStatus.textContent = "API 키가 정상 저장되었습니다!";
    apiKeyStatus.style.color = "green";
  });

  let quizData = [];
  let currentPassage = "";
  let currentIndex = 0;
  let userAnswers = [];
  let score = 0;

  generateBtn.addEventListener("click", async () => {
    const passage = passageInput.value.trim();
    const apiKey = currentApiKey || localStorage.getItem("gemini_api_key");

    if (!apiKey) {
      alert("⚠️ 0단계에서 Gemini API 키를 먼저 입력하고 [저장]을 눌러주세요!");
      return;
    }

    if (!passage) {
      alert("지문을 선택하거나 직접 입력해 주세요.");
      return;
    }
    currentPassage = passage;

    stepInput.style.display = "none";
    stepApi.style.display = "none";
    stepLoading.style.display = "block";

    try {
      quizData = await fetchQuizFromGemini(passage, quizTypeSelect.value, apiKey);
    } catch (err) {
      console.error("AI 문제 생성 에러 상세:", err);
      alert("❌ AI 문제 생성 실패:\n" + err.message);
      stepLoading.style.display = "none";
      stepInput.style.display = "block";
      stepApi.style.display = "block";
      return;
    }

    stepLoading.style.display = "none";
    stepQuiz.style.display = "block";
    currentIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    score = 0;
    renderQuestion();
  });

  async function fetchQuizFromGemini(passage, type, apiKey) {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `다음 영어 지문을 바탕으로 고등학교 내신 대비 객관식 및 서술형 문제 총 10개를 순수 JSON 배열로만 생성해줘. (마크다운 백틱 등 금지, 오직 [ 로 시작해서 ] 로 끝나는 JSON 문자열만 출력할 것)
    유형 선택: ${type}
    지문 내용: ${passage}
    
    [출제 가이드라인]
    1. 구성: 
       - 글의 주제, 내용 일치/불일치, 세부 질문(Q&A) 등 "내용 이해 문제" 포함
       - 어법 및 어휘 문제 포함
       - 빈칸추론 출제 시, 반드시 question 문장 안에 명확한 빈칸 표시 "(        )"을 뚫어서 출제할 것.
       - 서술형(subjective) 문제는 "원문의 영어 문장을 직접 보여주지 말고", 오직 **한국어 해석과 조건(예: 특정 단어 포함 영작)**만 제시하여 학생들이 지문 내용을 바탕으로 스스로 영작하게 출제할 것. 절대 영작 문제에 정답 영어 문장이 노출되면 안 됨.
    2. JSON 형식 규칙:
       - "type": "objective"(4지선다) 또는 "subjective"(서술형)
       - 객관식의 경우 "options" 배열(4개)과 "answer"(0~3 숫자 인덱스) 포함
       - 서술형의 경우 "options"는 [], "answerText"에 모범 답안 작성

    반드시 아래 형식의 JSON 배열만 반환하세요:
    [
      {
        "type": "objective",
        "question": "다음 글의 요지로 가장 적절한 것은?",
        "options": ["① option1", "② option2", "③ option3", "④ option4"],
        "answer": 0,
        "explanation": "해설 내용"
      },
      {
        "type": "subjective",
        "question": "[서술형 영작] 다음 한국어 뜻에 맞게 빈칸 조건에 맞는 문장을 영어로 작성하시오. (뜻: 그녀는 어려움 속에서도 예술을 포기하지 않았다)",
        "options": [],
        "answerText": "She never gave up on her art despite challenges.",
        "explanation": "조건에 맞춘 모범 영작문입니다."
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let text = response.text.trim();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  }

  function renderQuestion() {
    const q = quizData[currentIndex];
    quizProgress.textContent = `문제 ${currentIndex + 1} / ${quizData.length}`;
    scoreBadge.textContent = `점수: ${score}점`;

    let html = `
      <div class="passage-box" style="max-height: 110px; overflow-y: auto; font-size: 0.82rem; margin-bottom: 12px; padding: 10px;">
        <strong>📖 지문 요약 및 참고:</strong><br>${currentPassage}
      </div>
      <p style="margin-bottom: 12px; font-weight: bold; line-height: 1.5; font-size: 0.92rem;">Q${currentIndex + 1}. ${q.question}</p>
    `;

    if (q.type === "objective") {
      q.options.forEach((opt, idx) => {
        const isChecked = userAnswers[currentIndex] === idx ? "checked" : "";
        html += `
          <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; cursor: pointer; border: 1px solid #e9ecef; font-size: 0.88rem;">
            <input type="radio" name="quizOption" value="${idx}" ${isChecked} style="margin-right: 8px;">
            ${opt}
          </label>`;
      });
    } else {
      const savedText = typeof userAnswers[currentIndex] === 'string' ? userAnswers[currentIndex] : '';
      html += `
        <div class="subjective-box">
          <p style="font-size: 0.85rem; color: #2c3e50; font-weight: bold; margin-bottom: 6px;">✍️ 조건부 영작 답안 입력:</p>
          <input type="text" id="subjectiveInput" value="${savedText}" placeholder="여기에 영어 문장 답안을 입력하세요..." style="padding: 10px; font-size: 0.9rem;">
        </div>
      `;
    }

    questionContainer.innerHTML = html;
  }

  nextBtn.addEventListener("click", () => {
    const q = quizData[currentIndex];

    if (q.type === "objective") {
      const selected = document.querySelector('input[name="quizOption"]:checked');
      if (!selected) {
        alert("정답을 선택해주세요!");
        return;
      }
      userAnswers[currentIndex] = parseInt(selected.value);
      if (userAnswers[currentIndex] === q.answer) {
        score += Math.round(100 / quizData.length);
      }
    } else {
      const textVal = document.getElementById("subjectiveInput").value.trim();
      if (!textVal) {
        alert("서술형 답안을 입력해 주세요!");
        return;
      }
      userAnswers[currentIndex] = textVal;
      score += Math.round(100 / quizData.length);
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
      fbHtml += `
        <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #3498db;">
          <p><b>Q${idx+1}. ${q.question}</b></p>
          <p style="font-size: 0.9rem;">내 제출 답안: ${q.type === 'objective' ? q.options[userAns] : userAns}</p>
          <p style="font-size: 0.85rem; color: #27ae60;">모범 정답: ${q.type === 'objective' ? q.options[q.answer] : q.answerText}</p>
          <p style="font-size: 0.8rem; color: #555; margin-top: 4px;">💡 해설: ${q.explanation}</p>
        </div>`;
    });
    feedbackContainer.innerHTML = fbHtml;
  }

  restartBtn.button = restartBtn.addEventListener("click", () => {
    stepResult.style.display = "none";
    stepInput.style.display = "block";
    stepApi.style.display = "block";
    presetPassageSelect.value = "";
    passageInput.value = "";
  });
});