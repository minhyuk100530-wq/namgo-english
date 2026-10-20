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

  // 전체 교과서 및 고1 모의고사 전 범위 3등분(Part 1, Part 2, Part 3) 데이터베이스
  const passagesDb = {
    // 미래엔 교과서 미술 전시회 지문 전 범위 3등분
    miraen_art_1: `Welcome to the Dream Art Gallery! This introductory section features docent Isabel Williams welcoming visitors to the From Shadows to Spotlights exhibition, introducing three resilient artists including Bill Traylor who overcame severe historical and racial challenges to express his life through art.`,
    miraen_art_2: `This middle section explores Bill Traylor's specific artwork subjects, detailing his fears and observations of urban life in Montgomery, followed by the introduction of Canadian folk artist Maud Lewis, who triumphed over physical limitations through creative painting.`,
    miraen_art_3: `This final section covers Maud Lewis's iconic cottage life and whimsical style, and introduces the Danish painter Anna Ancher, who defied traditional social pressures by depicting women as active participants in everyday tasks rather than still life objects.`,

    // 모의고사 29번 (초식동물과 사육) 전 범위 3등분
    mock_29_1: `Big mammalian herbivore species react to danger from predators or humans in contrasting ways, dividing into nervous species programmed for instant flight and calmer herd-protectors.`,
    mock_29_2: `Nervous species present extreme difficulties in captivity, frequently panicking, dying of shock, or fatal collisions with enclosures, best exemplified by wild gazelles.`,
    mock_29_3: `Despite abundant historical domestication opportunities in the Fertile Crescent, gazelles have never been successfully domesticated due to their extreme flight responses and physical agility.`,

    // 모의고사 30번 (공유와 생존) 전 범위 3등분
    mock_30_1: `For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have. Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so.`,
    mock_30_2: `If you happen upon them in your travels, they will open up their homes and give you their food and hospitality. It's not just because they are nice people; it's because their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day.`,
    mock_30_3: `Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share. Our desire for more, combined with our increased physical disconnection or blindness to reality, starts to create a disconnection from the "common folk."`,

    // 모의고사 31번 (행복의 기준선과 적응) 전 범위 3등분
    mock_31_1: `Emotional states like happiness or sadness are not merely dictated by individual successive life events, as humans possess psychological resilience against volatile mood swings.`,
    mock_31_2: `Individuals naturally adjust to both positive and negative life changes, returning consistently to a personal default baseline of well-being over time like water seeking its level.`,
    mock_31_3: `This habituation tendency is clearly demonstrated by children reacting intensely to long-desired toys initially, only to quickly adapt and normalize their emotional baseline.`,

    // 모의고사 32번 (수면 부족과 아데노신) 전 범위 3등분
    mock_32_1: `Delaying sleep to maximize daily activities inevitably triggers an overwhelming biological drive for rest governed by chemical compounds accumulating during wakefulness.`,
    mock_32_2: `Adenosine builds up continuously in the blood during waking hours and breaks down during sleep, serving as a molecular tracking mechanism for the body's sleep debt.`,
    mock_32_3: `Because of built-in molecular feedback loops, biological sleep needs cannot be permanently bypassed, meaning chronic sleep deprivation will eventually catch up with an individual.`,

    // 모의고사 36번 (사막 거북과 방광) 전 범위 3등분
    mock_36_1: `The desert tortoise survives Death Valley's extreme heat through complete avoidance strategies, spending over ninety percent of its life underground in hibernation or tunnels.`,
    mock_36_2: `Surfacing primarily after rainfall, the tortoise stocks up on moisture through plants while relying on a sophisticated internal bladder acting as a specialized freshwater holding tank.`,
    mock_36_3: `Because this unique bladder allows reptiles to reabsorb vital moisture for year-long survival, park visitors are strictly warned against disturbing or frightening wild tortoises.`,

    // 모의고사 38번 (비선형 편집 시스템) 전 범위 3등분
    mock_38_1: `Modern computer-based editing systems provide non-linear random access to any video shot or scene, eliminating the physical burden of fast-forwarding or rewinding.`,
    mock_38_2: `Non-linear systems allow seamless insertion or deletion of scenes anywhere in a program while automatically recalculating total runtime and generating special effects.`,
    mock_38_3: `Comparing production tools, linear editing resembles rigid typewriter composition requiring complete retyping for errors, whereas non-linear editing functions like flexible word processors.`,

    // 모의고사 39번 (도덕적 책임과 의도) 전 범위 3등분
    mock_39_1: `Moral goodness requires more than merely attempting to prevent harm; it involves maintaining a consistent pattern of performing virtuous actions significantly more often than others.`,
    mock_39_2: `Evaluating a person's moral standing requires examining their underlying intentions and motives rather than relying on accidental outcomes or unintentional mishap preventions.`,
    mock_39_3: `While good intentions matter philosophically, actual real-world consequences and results remain strictly necessary elements before someone can be fully regarded as morally good.`
  };

  if (presetPassageSelect && !document.getElementById("opt_miraen_1")) {
    presetPassageSelect.innerHTML = `
      <option value="">-- 전체 내신 범위 지문 및 파트 선택하기 --</option>
      <optgroup label="미래엔 교과서 (Art Gallery 전시회)">
        <option value="miraen_art_1">교과서 전시회 파트 1 (Bill Traylor 도입)</option>
        <option value="miraen_art_2">교과서 전시회 파트 2 (Traylor 그림 & Maud Lewis)</option>
        <option value="miraen_art_3">교과서 전시회 파트 3 (Anna Ancher와 여성 인물화)</option>
      </optgroup>
      <optgroup label="고1 모의고사 29번 (초식동물과 사육)">
        <option value="mock_29_1">모의고사 29번 파트 1</option>
        <option value="mock_29_2">모의고사 29번 파트 2</option>
        <option value="mock_29_3">모의고사 29번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 30번 (공유와 생존)">
        <option value="mock_30_1">모의고사 30번 파트 1 (시작 부분)</option>
        <option value="mock_30_2">모의고사 30번 파트 2 (유목민 부족)</option>
        <option value="mock_30_3">모의고사 30번 파트 3 (현대 사회 완결)</option>
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
        "question": "[서술형 영작] 다음 한국어 뜻에 맞게 조건에 맞는 문장을 영어로 작성하시오. (뜻: 생존은 공유에 달려 있다)",
        "options": [],
        "answerText": "Survival depends on sharing.",
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
      <div class="passage-box" style="max-height: 140px; overflow-y: auto; font-size: 0.85rem; margin-bottom: 12px; padding: 12px; line-height: 1.5;">
        <strong>📖 선택한 지문 파트 원문:</strong><br>${currentPassage}
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

  restartBtn.addEventListener("click", () => {
    stepResult.style.display = "none";
    stepInput.style.display = "block";
    stepApi.style.display = "block";
    presetPassageSelect.value = "";
    passageInput.value = "";
  });
});