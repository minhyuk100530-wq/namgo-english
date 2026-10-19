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
    if (!passage) {
      alert("지문을 입력해 주세요.");
      return;
    }
    currentPassage = passage;

    stepInput.style.display = "none";
    stepApi.style.display = "none";
    stepLoading.style.display = "block";

    try {
      quizData = await fetchQuizFromGemini(passage, quizTypeSelect.value, currentApiKey);
    } catch (err) {
      console.warn("AI 호출 실패/키 미입력: 오프라인 10문제 풀을 사용합니다.", err);
      quizData = getFallbackQuizPool();
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
    
    const prompt = `다음 고등학교 영어 지문을 바탕으로 내신 대비 객관식 및 서술형 문제 총 10개를 JSON 배열로 만들어줘.
    유형: ${type}
    지문: ${passage}
    
    [응답 규칙]
    - "type": "objective"(4지선다) 또는 "subjective"(서술형 영작)
    - 객관식의 경우 "options" 배열과 "answer"(0~3 인덱스) 포함
    - 서술형의 경우 "options"는 빈 배열, "answerText"에 모범 답안 기술
    
    응답 JSON 형식:
    [
      {
        "type": "objective",
        "question": "다음 빈칸에 알맞은 말은?",
        "options": ["① option1", "② option2", "③ option3", "④ option4"],
        "answer": 0,
        "explanation": "해설 내용"
      },
      {
        "type": "subjective",
        "question": "[서술형] 주어진 조건을 바탕으로 한 문장으로 영작하시오.",
        "options": [],
        "answerText": "Environmental shampoo impacts wildlife habitats.",
        "explanation": "조건에 맞춘 모범 답안입니다."
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

  function getFallbackQuizPool() {
    return [
      {
        type: "objective",
        question: "다음 빈칸에 들어갈 가장 알맞은 어휘는?",
        options: ["① significant", "② trivial", "③ accidental", "④ harmful"],
        answer: 0,
        explanation: "지문의 맥락상 '중대한'이라는 의미의 significant가 알맞습니다."
      },
      {
        type: "subjective",
        question: "[서술형] 밑줄 친 주장이 의미하는 바를 조건(한글 20자 이내)에 맞춰 쓰시오.",
        options: [],
        answerText: "친환경 제품 사용을 통한 생태계 보호",
        explanation: "지문의 주제문 요약과 일치해야 합니다."
      },
      {
        type: "objective",
        question: "밑줄 친 부분 중 어법상 틀린 것을 고르시오.",
        options: ["① Environmental shampoo can", "② significantly impact", "③ wildlife habitats, which", "④ causing serious damage"],
        answer: 3,
        explanation: "which절의 본동사가 필요하므로 causing은 causes로 수정되어야 합니다."
      },
      {
        type: "subjective",
        question: "[서술형 영작] (impact / wildlife / habitat) 단어를 활용하여 조건에 맞게 영작하시오.",
        options: [],
        answerText: "It can significantly impact wildlife habitats.",
        explanation: "조동사 뒤 동사원형 배치 및 부사 위치가 핵심입니다."
      },
      {
        type: "objective",
        question: "윗글의 주제로 가장 적절한 것은?",
        options: ["① Importance of eco-shampoo", "② History of hair wash", "③ Animal testing", "④ Ocean pollution"],
        answer: 0,
        explanation: "전체 글의 핵심 소재인 친환경 샴푸의 중요성이 주제입니다."
      }
    ];
  }

  function renderQuestion() {
    const q = quizData[currentIndex];
    quizProgress.textContent = `문제 ${currentIndex + 1} / ${quizData.length}`;
    scoreBadge.textContent = `점수: ${score}점`;

    let html = `
      <div class="passage-box">
        <strong>📖 참고 지문:</strong><br>${currentPassage}
      </div>
      <p style="margin-bottom: 12px; font-weight: bold;">Q${currentIndex + 1}. ${q.question}</p>
    `;

    if (q.type === "objective") {
      q.options.forEach((opt, idx) => {
        const isChecked = userAnswers[currentIndex] === idx ? "checked" : "";
        html += `
          <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; cursor: pointer; border: 1px solid #e9ecef;">
            <input type="radio" name="quizOption" value="${idx}" ${isChecked} style="margin-right: 8px;">
            ${opt}
          </label>`;
      });
    } else {
      // 서술형: 텍스트 입력 및 카메라/사진 촬영 업로드 기능 지원
      const savedText = typeof userAnswers[currentIndex] === 'string' ? userAnswers[currentIndex] : '';
      html += `
        <div style="margin-bottom: 12px;">
          <input type="text" id="subjectiveInput" value="${savedText}" placeholder="답안을 직접 입력하거나 아래에서 손글씨 사진을 첨부하세요.">
        </div>
        <div class="photo-upload-box">
          <p style="font-size: 0.85rem; color: #555; margin-bottom: 8px;">📷 손글씨 답안 촬영 / 사진 첨부</p>
          <input type="file" id="photoInput" accept="image/*" capture="environment">
          <div id="imagePreviewContainer"></div>
        </div>
      `;
    }

    questionContainer.innerHTML = html;

    if (q.type === "subjective") {
      const photoInput = document.getElementById("photoInput");
      photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imgContainer = document.getElementById("imagePreviewContainer");
            imgContainer.innerHTML = `<img src="${event.target.result}" class="preview-img"><p style="font-size:0.75rem; color:green;">사진 첨부 완료!</p>`;
            userAnswers[currentIndex] = "[사진 답안 첨부됨]";
          };
          reader.readAsDataURL(file);
        }
      });
    }
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
      if (!textVal && !userAnswers[currentIndex]) {
        alert("답안을 입력하거나 손글씨 사진을 촬영해 주세요!");
        return;
      }
      if (textVal) userAnswers[currentIndex] = textVal;
      score += Math.round(100 / quizData.length); // 서술형 제출 시 기본 점수 부여
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
          <p style="font-size: 0.9rem;">제출 답안: ${q.type === 'objective' ? q.options[userAns] : userAns}</p>
          <p style="font-size: 0.85rem; color: #27ae60;">모범 답안: ${q.type === 'objective' ? q.options[q.answer] : q.answerText}</p>
          <p style="font-size: 0.8rem; color: #555; margin-top: 4px;">💡 해설: ${q.explanation}</p>
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