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

  // 저작권 보호 및 완벽한 학습을 위해 핵심 구조화된 전 범위 지문 저장고
  const passagesDb = {
    miraen_art_1: `미래엔 공통영어2 Art Gallery 전시회 파트 1: 도슨트 Isabel Williams가 세 명의 예술가(Bill Traylor 등)의 삶과 시련, 극복 과정을 소개하는 도입부 내용.`,
    miraen_art_2: `미래엔 공통영어2 Art Gallery 전시회 파트 2: Bill Traylor의 몽고메리 거리 관찰과 두려움 극복, 그리고 독창적인 화풍을 지닌 Maud Lewis의 삶과 작품 세계 전개.`,
    miraen_art_3: `미래엔 공통영어2 Art Gallery 전시회 파트 3: Maud Lewis의 동화 같은 풍경화와 덴마크 화가 Anna Ancher가 전통적 여성 역할에 저항하며 일상을 생동감 있게 표현한 내용 완결.`,

    mock_29_1: `고1 모의고사 29번 파트 1: 포식자나 인간의 위협에 반응하는 대형 포유류 초식동물의 신경질적인 도주 성향과 무리 보호 성향의 대비.`,
    mock_29_2: `고1 모의고사 29번 파트 2: 신경질적인 초식동물이 사육 환경(울타리 등)에서 겪는 공황 상태와 가젤의 역사적 사냥 기록 분석.`,
    mock_29_3: `고1 모의고사 29번 파트 3: 풍부한 기회에도 불구하고 가젤이 엄청난 속도와 도약력 때문에 가축화되지 못한 이유 완결.`,

    mock_30_1: `고1 모의고사 30번 파트 1: 자원이 부족하고 위험하던 시대의 공유와 협력 본능이 자원이 풍부하고 안전한 현대 사회에서 복잡해지는 양상 시작.`,
    mock_30_2: `고1 모의고사 30번 파트 2: 소유물이 적어도 생존을 위해 여행자에게 환대와 집을 개방하는 특정 유목민 부족의 상호 생존 시스템.`,
    mock_30_3: `고1 모의고사 30번 파트 3: 가질수록 울타리와 보안을 높이며 공유를 기피하는 현대인의 물리적·현실적 단절 현상 완결.`,

    mock_31_1: `고1 모의고사 31번 파트 1: 순간의 사건에 의해 행복과 슬픔이 완전히 좌우되지 않는 인간의 정서적 회복 탄력성.`,
    mock_31_2: `고1 모의고사 31번 파트 2: 좋고 나쁜 사건들에 적응하며 물이 수평을 찾듯 개인의 기본 행복 기준선(baseline)으로 회귀하는 경향.`,
    mock_31_3: `고1 모의고사 31번 파트 3: 오랫동안 갈망하던 장난감을 얻은 어린아이들이 금방 적응하여 평온을 찾는 사례 완결.`,

    mock_32_1: `고1 모의고사 32번 파트 1: 수면을 미루며 활동을 늘리려 할 때 결국 압도적인 수면 욕구가 발생하는 생물학적 메커니즘.`,
    mock_32_2: `고1 모의고사 32번 파트 2: 깨어 있는 동안 혈액에 축적되고 수면 중에 분해되는 화학 물질 아데노신(adenosine)의 역할.`,
    mock_32_3: `고1 모의고사 32번 파트 3: 분자적 피드백 루프로 인해 수면 부족을 영구적으로 우회할 수 없으며 결국 누적된 빚을 갚아야 한다는 결론.`,

    mock_36_1: `고1 모의고사 36번 파트 1: 죽음의 계곡(Death Valley)의 극한 열기를 피하기 위해 일생의 90퍼센트 이상을 지하 굴에서 보내는 사막 거북의 생존 전략.`,
    mock_36_2: `고1 모의고사 36번 파트 2: 비가 온 뒤 지상으로 나와 수분을 비축하고 정교한 방광을 거대 저수조처럼 활용하는 신체 구조.`,
    mock_36_3: `고1 모의고사 36번 파트 3: 방광을 통해 수분을 재흡수하는 거북의 특성 때문에 행인들이 함부로 만져서 수분을 잃게 만들면 안 되는 이유 완결.`,

    mock_38_1: `고1 모의고사 38번 파트 1: 비디오 테이프를 감고 풀 필요 없이 임의 접근이 가능한 현대 컴퓨터 기반 비선형 편집 시스템의 도입.`,
    mock_38_2: `고1 모의고사 38번 파트 2: 프로그램 전체 길이 자동 조절 및 다양한 특수 효과(슬로모션 등)를 자유롭게 삽입·삭제하는 편집의 장점.`,
    mock_38_3: `고1 모의고사 38번 파트 3: 수정 시 전체를 다시 타자기 치듯 다시 작업해야 했던 선형 편집과 워드프로세서 같은 비선형 편집의 비유적 비교 완결.`,

    mock_39_1: `고1 모의고사 39번 파트 1: 단순한 피해 방지 시도를 넘어 도덕적으로 나쁜 행동을 적게 하고 좋은 행동을 더 자주 수행해야 하는 도덕적 우수성.`,
    mock_39_2: `고1 모의고사 39번 파트 2: 우연한 결과나 실수에 의한 피해 방지가 아니라 의도와 동기가 도덕적 판단에 핵심적으로 작용하는 이유.`,
    mock_39_3: `고1 모의고사 39번 파트 3: 의도가 선하다는 점 외에도 도덕적으로 인정받기 위해서는 실제 결과물(consequences) 역시 중요하다는 철학적 관점 완결.`
  };

  if (presetPassageSelect && !document.getElementById("opt_miraen_1")) {
    presetPassageSelect.innerHTML = `
      <option value="">-- 전체 내신 범위 지문 및 파트 선택하기 --</option>
      <optgroup label="미래엔 교과서 (Art Gallery 전시회)">
        <option value="miraen_art_1">교과서 전시회 파트 1 (도입 및 Traylor 생애)</option>
        <option value="miraen_art_2">교과서 전시회 파트 2 (Traylor 화풍 & Lewis 소개)</option>
        <option value="miraen_art_3">교과서 전시회 파트 3 (Ancher 여성 인물화 완결)</option>
      </optgroup>
      <optgroup label="고1 모의고사 29번 (초식동물과 사육)">
        <option value="mock_29_1">모의고사 29번 파트 1</option>
        <option value="mock_29_2">모의고사 29번 파트 2</option>
        <option value="mock_29_3">모의고사 29번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 30번 (공유와 생존)">
        <option value="mock_30_1">모의고사 30번 파트 1 (자원과 공유)</option>
        <option value="mock_30_2">모의고사 30번 파트 2 (유목민 부족)</option>
        <option value="mock_30_3">모의고사 30번 파트 3 (현대 단절 완결)</option>
      </optgroup>
      <optgroup label="고1 모의고사 31번 (행복 기준선과 적응)">
        <option value="mock_31_1">모의고사 31번 파트 1</option>
        <option value="mock_31_2">모의고사 31번 파트 2</option>
        <option value="mock_31_3">모의고사 31번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 32번 (수면 부족과 아데노신)">
        <option value="mock_32_1">모의고사 32번 파트 1</option>
        <option value="mock_32_2">모의고사 32번 파트 2</option>
        <option value="mock_32_3">모의고사 32번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 36번 (사막 거북과 방광)">
        <option value="mock_36_1">모의고사 36번 파트 1</option>
        <option value="mock_36_2">모의고사 36번 파트 2</option>
        <option value="mock_36_3">모의고사 36번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 38번 (비선형 편집 시스템)">
        <option value="mock_38_1">모의고사 38번 파트 1</option>
        <option value="mock_38_2">모의고사 38번 파트 2</option>
        <option value="mock_38_3">모의고사 38번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 39번 (도덕적 책임과 의도)">
        <option value="mock_39_1">모의고사 39번 파트 1</option>
        <option value="mock_39_2">모의고사 39번 파트 2</option>
        <option value="mock_39_3">모의고사 39번 파트 3</option>
      </optgroup>
    `;
  }

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
    
    const prompt = `다음 학습 지문 내용을 바탕으로 고등학교 내신 대비 객관식 및 서술형 문제 총 10개를 순수 JSON 배열로만 생성해줘. (마크다운 백틱 등 금지, 오직 [ 로 시작해서 ] 로 끝나는 JSON 문자열만 출력할 것)
    유형 선택: ${type}
    지문 내용: ${passage}
    
    [출제 가이드라인]
    1. 구성: 
       - 글의 주제, 내용 이해, 세부 질문(Q&A) 등 내용 문제 포함
       - 어법 및 어휘 문제 포함
       - 서술형(subjective) 문제는 영어 원문을 보여주지 않고 한국어 의미와 조건(특정 어휘 영작 등)만 제시할 것.
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
      <div class="passage-box" style="max-height: 120px; overflow-y: auto; font-size: 0.85rem; margin-bottom: 12px; padding: 12px; line-height: 1.5;">
        <strong>📖 선택한 지문 참고:</strong><br>${currentPassage}
      </div>
      <p style="margin-bottom: 12px; font-weight: bold; line-height: 1.5; font-size: 0.92rem;">Q${currentIndex + 1}. ${q.question}</p>
    `;

    if (q.type === "objective") {
      q.options.forEach((opt, idx) => {
        html += `
          <label class="opt-label" data-idx="${idx}" style="display: block; padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; cursor: pointer; border: 1px solid #e9ecef; font-size: 0.88rem;">
            <input type="radio" name="quizOption" value="${idx}" style="margin-right: 8px;">
            ${opt}
          </label>`;
      });
    } else {
      html += `
        <div class="subjective-box">
          <p style="font-size: 0.85rem; color: #2c3e50; font-weight: bold; margin-bottom: 6px;">✍️ 조건부 영작 답안 입력:</p>
          <input type="text" id="subjectiveInput" placeholder="여기에 영어 문장 답안을 입력하세요..." style="padding: 10px; font-size: 0.9rem; width: 100%; border: 1px solid #ddd; border-radius: 6px;">
        </div>
      `;
    }

    // [즉시 채점 영역 컨테이너 추가]
    html += `
      <div id="instantFeedback" style="margin-top: 15px; display: none;"></div>
      <button id="submitAnswerBtn" class="btn primary" style="margin-top: 12px;">정답 확인 및 다음 문제</button>
    `;

    questionContainer.innerHTML = html;

    // 즉시 채점 버튼 이벤트 연결
    document.getElementById("submitAnswerBtn").addEventListener("click", () => {
      handleInstantCheck(q);
    });
  }

  function handleInstantCheck(q) {
    const feedbackDiv = document.getElementById("instantFeedback");
    const submitBtn = document.getElementById("submitAnswerBtn");
    
    let isCorrect = false;
    let userAnsText = "";

    if (q.type === "objective") {
      const selected = document.querySelector('input[name="quizOption"]:checked');
      if (!selected) {
        alert("정답을 선택해주세요!");
        return;
      }
      const selectedIdx = parseInt(selected.value);
      userAnswers[currentIndex] = selectedIdx;
      userAnsText = q.options[selectedIdx];
      if (selectedIdx === q.answer) {
        isCorrect = true;
        score += Math.round(100 / quizData.length);
      }
    } else {
      const textVal = document.getElementById("subjectiveInput").value.trim();
      if (!textVal) {
        alert("서술형 답안을 입력해 주세요!");
        return;
      }
      userAnswers[currentIndex] = textVal;
      userAnsText = textVal;
      // 서술형은 제출 시 정답 처리 후 모범 답안 비교 안내
      isCorrect = true; 
      score += Math.round(100 / quizData.length);
    }

    // 즉시 채점 결과 화면 표시
    feedbackDiv.style.display = "block";
    if (q.type === "objective") {
      feedbackDiv.innerHTML = `
        <div style="padding: 12px; border-radius: 8px; background: ${isCorrect ? '#e8f8f5' : '#f8d7da'}; border: 1px solid ${isCorrect ? '#27ae60' : '#e74c3c'};">
          <p style="font-weight: bold; color: ${isCorrect ? '#27ae60' : '#c0392b'}; margin-bottom: 4px;">
            ${isCorrect ? '🎉 정답입니다!' : '❌ 틀렸습니다!'}
          </p>
          <p style="font-size: 0.88rem;">모범 정답: <b>${q.options[q.answer]}</b></p>
          <p style="font-size: 0.85rem; color: #555; margin-top: 4px;">💡 해설: ${q.explanation}</p>
        </div>
      `;
    } else {
      feedbackDiv.innerHTML = `
        <div style="padding: 12px; border-radius: 8px; background: #e8f8f5; border: 1px solid #27ae60;">
          <p style="font-weight: bold; color: #27ae60; margin-bottom: 4px;">✍️ 서술형 답안 제출 완료!</p>
          <p style="font-size: 0.88rem;">모범 정답: <b>${q.answerText}</b></p>
          <p style="font-size: 0.85rem; color: #555; margin-top: 4px;">💡 해설: ${q.explanation}</p>
        </div>
      `;
    }

    submitBtn.textContent = "다음 문제로 이동";
    submitBtn.onclick = () => {
      currentIndex++;
      if (currentIndex < quizData.length) {
        renderQuestion();
      } else {
        showResult();
      }
    };
  }

  function showResult() {
    stepQuiz.style.display = "none";
    stepResult.style.display = "block";
    scoreSummary.innerHTML = `<h3>총점: ${score}점 / 100점 만점</h3>`;

    let fbHtml = "<h4>🔍 최종 학습 결과 요약</h4>";
    quizData.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      fbHtml += `
        <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #3498db;">
          <p><b>Q${idx+1}. ${q.question}</b></p>
          <p style="font-size: 0.9rem;">내 제출: ${q.type === 'objective' ? q.options[userAns] : userAns}</p>
          <p style="font-size: 0.85rem; color: #27ae60;">정답: ${q.type === 'objective' ? q.options[q.answer] : q.answerText}</p>
        </div>`;
    });
    feedbackContainer.innerHTML = fbHtml;
  }

  restartBtn.addEventListener("click", () => {
    stepResult.style.display = "none";
    stepInput.style.display = "block";
    stepApi.style.display = "block";
    presetPassageSelect.value = "";
    passageInput.value = "";
  });
});