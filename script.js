import { GoogleGenAI } from "@google/genai";

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyStatus = document.getElementById("apiKeyStatus");
  const passageInput = document.getElementById("passageInput");
  const passagePhotoInput = document.getElementById("passagePhotoInput");
  const ocrStatus = document.getElementById("ocrStatus");
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  const cropExtractBtn = document.getElementById("cropExtractBtn");
  const cropCancelBtn = document.getElementById("cropCancelBtn");
  
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

  let cropper = null;

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

  // 사진 선택 시 Cropper 초기화
  passagePhotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      cropImage.src = event.target.result;
      cropModal.style.display = "block";

      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(cropImage, {
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: true
      });
    };
    reader.readAsDataURL(file);
  });

  cropCancelBtn.addEventListener("click", () => {
    cropModal.style.display = "none";
    if (cropper) cropper.destroy();
  });

  // 자른 영역 Gemini AI Vision으로 정밀 OCR 처리
  cropExtractBtn.addEventListener("click", async () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({ maxWidth: 1024, maxHeight: 1024 });
    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

    cropModal.style.display = "none";
    ocrStatus.textContent = "🤖 Gemini AI가 지문만 정확하게 분석 및 인식을 진행하고 있습니다...";
    ocrStatus.style.color = "#3498db";

    try {
      const extractedText = await extractTextWithGeminiVision(base64Image, currentApiKey);
      passageInput.value = extractedText;
      ocrStatus.textContent = "✅ 지문 정밀 인식 완료! (오류 및 옆 문제 자동 제거됨)";
      ocrStatus.style.color = "green";
    } catch (err) {
      console.error(err);
      ocrStatus.textContent = "❌ AI 인식 실패 (API 키 확인 필요). 지문을 직접 복사/입력해 주세요.";
      ocrStatus.style.color = "red";
    }
  });

  async function extractTextWithGeminiVision(base64Image, apiKey) {
    if (!apiKey) throw new Error("No API key");
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = "이 사진에서 영어 시험지 지문 텍스트만 완벽하게 추출해줘. 문제 번호(예: 37번, 39번 등)나 주변에 걸쳐진 다른 문제, 한글 설명은 모두 제외하고 오직 영어 본문 지문 내용만 자연스럽게 연결된 완성된 텍스트로 복원해서 출력해줘.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        prompt
      ]
    });

    return response.text.trim();
  }

  let quizData = [];
  let currentPassage = "";
  let currentIndex = 0;
  let userAnswers = [];
  let score = 0;

  generateBtn.addEventListener("click", async () => {
    const passage = passageInput.value.trim();
    if (!passage) {
      alert("지문을 입력하거나 사진 자르기로 추가해 주세요.");
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
    
    const prompt = `다음 고등학교 영어 지문을 바탕으로 내신 대비 객관식 및 서술형 문제 총 10개를 JSON 배열로 생성해줘.
    유형 선택: ${type}
    지문 내용: ${passage}
    
    [출제 가이드라인]
    1. 구성: 
       - 글의 주제, 내용 일치/불일치, 세부 질문(Q&A) 등 "내용 이해 문제" 포함
       - 어법 및 어휘 문제 포함
       - 빈칸추론 출제 시, 반드시 question 문장 안에 명확한 빈칸 표시 "(        )"을 뚫어서 출제할 것.
       - 서술형 문제는 "조건부 영작" 또는 "핵심 내용 한국어/영어 서술" 형태로 출제할 것.
    2. JSON 형식 규칙:
       - "type": "objective"(4지선다) 또는 "subjective"(서술형)
       - 객관식의 경우 "options" 배열(4개)과 "answer"(0~3 숫자 인덱스) 포함
       - 서술형의 경우 "options"는 [], "answerText"에 모범 답안 작성

    응답 JSON 구조 예시 (백틱 없이 pure JSON):
    [
      {
        "type": "objective",
        "question": "다음 글의 요지로 가장 적절한 것은?",
        "options": ["① option1", "② option2", "③ option3", "④ option4"],
        "answer": 0,
        "explanation": "해설 내용"
      },
      {
        "type": "objective",
        "question": "다음 지문의 빈칸 (        )에 들어갈 가장 적절한 단어는?",
        "options": ["① significant", "② trivial", "③ accidental", "④ harmful"],
        "answer": 0,
        "explanation": "맥락상 significant가 들어갑니다."
      },
      {
        "type": "subjective",
        "question": "[서술형] 주어진 보기 단어(impact / environment)를 활용해 빈칸 조건에 맞는 문장으로 완결하시오.",
        "options": [],
        "answerText": "It can significantly impact the environment.",
        "explanation": "조건에 맞춘 모범 영작문입니다."
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
        question: "다음 글의 핵심 내용과 일치하지 않는 것은?",
        options: ["① 지문은 환경 보호를 강조한다.", "② 샴푸 사용이 생태계에 영향을 줄 수 있다.", "③ 자연 파괴는 인간과 무관하다.", "④ 친환경 제품 사용이 권장된다."],
        answer: 2,
        explanation: "지문에서는 자연 파괴와 인간의 활동이 밀접함을 밝히고 있습니다."
      },
      {
        type: "objective",
        question: "다음 지문의 빈칸 (        )에 들어갈 가장 알맞은 어휘는?",
        options: ["① significant", "② trivial", "③ accidental", "④ harmful"],
        answer: 0,
        explanation: "지문의 맥락상 '중대한'이라는 의미의 significant가 알맞습니다."
      },
      {
        type: "subjective",
        question: "[서술형] 지문의 내용을 바탕으로 '친환경 샴푸가 생태계에 미치는 영향'에 대해 15자 이내로 서술하시오.",
        options: [],
        answerText: "야생 생물 서식지 파괴를 줄이고 생태계를 보호함",
        explanation: "지문의 주제를 올바르게 정리해야 합니다."
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
        question: "[서술형 영작] (impact / wildlife / habitat) 단어를 모두 사용하여 조건에 맞게 영어로 작성하시오.",
        options: [],
        answerText: "It can significantly impact wildlife habitats.",
        explanation: "조동사 뒤 동사원형 및 부사 배치가 포인트입니다."
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
      <p style="margin-bottom: 12px; font-weight: bold; line-height: 1.5;">Q${currentIndex + 1}. ${q.question}</p>
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
      const savedText = typeof userAnswers[currentIndex] === 'string' ? userAnswers[currentIndex] : '';
      html += `
        <div class="subjective-box">
          <p style="font-size: 0.85rem; color: #2c3e50; font-weight: bold; margin-bottom: 6px;">✍️ 서술형 답안 작성 (직접 입력):</p>
          <input type="text" id="subjectiveInput" value="${savedText}" placeholder="여기에 정답(영작 문장 또는 한국어 답안)을 입력하세요...">
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

  restartBtn.addEventListener("click", () => {
    stepResult.style.display = "none";
    stepInput.style.display = "block";
    stepApi.style.display = "block";
    passageInput.value = "";
  });
});