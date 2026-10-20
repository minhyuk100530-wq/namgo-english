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

  // 지문 3등분(Part 1, Part 2, Part 3) 저장고 데이터베이스
  const passagesDb = {
    // 미래엔 교과서 미술 전시회 지문 3등분
    miraen_art_1: `Welcome to the Dream Art Gallery! I’m Isabel Williams, the docent for the From Shadows to Spotlights exhibit. Today, you’re going to meet three amazing artists who never gave up on their art, despite challenges in their lives. Each artist has a unique painting style and story that has made their work highly valued. Let’s explore each artist’s life and artwork. The first artist we’re going to examine is Bill Traylor. Traylor was born into slavery in the U.S. in 1853 and spent his early life working on a cotton farm in Alabama. Although he became a free man after the American Civil War, he still had to face racial discrimination, working for very low wages on the farm. Later, when he was around 70 years old, Traylor moved to the city of Montgomery, Alabama, where he found a job in a factory. It wasn’t until he was 85 years old and became too ill to work that he turned to drawing to express his life experiences.`,
    
    miraen_art_2: `Now, we’re going to look at some of his paintings, starting with Mean Dog and Man and Large Dog. Traylor had a strong fear of dogs because they had often been used on farms to watch and hunt slaves. His fear of dogs is expressed strongly in these pieces. In contrast, Woman with Purse and Man with Umbrella portrays the free lives of African Americans that he observed on the streets of Montgomery. Using simple shapes and colors, Traylor captured complex moments in American history from slavery to freedom. As a result, he’s now considered an important figure in American folk art. Next, we have Maud Lewis, a renowned artist known for her heart-warming paintings. Born in a small Canadian town in 1903, Lewis suffered from physical weaknesses such as distorted shoulders and fingers. This limited her mobility and caused her to drop out of school. To make a living, she began to paint and sell Christmas cards.`,

    miraen_art_3: `When her parents passed away, Lewis went to live with her aunt in Digby, Nova Scotia, where she met her future husband, Everett Lewis. After marrying, the couple spent the rest of their lives there, and Lewis continued to paint. She often depicted the Digby landscapes in paintings such as Edge of Digby Harbor. Now let’s take a look at the final artist of this exhibition: Anna Ancher, a famous painter from Denmark. When observing her paintings, you may notice a common theme — they all feature female figures. Born in Skagen, Denmark, in 1859, she later moved to Copenhagen to attend a private painting school. After getting married, Ancher persisted in painting, objecting to the social pressure that married women were to solely focus on household duties.`,

    // 모의고사 29번 3등분
    mock_29_1: `Big mammalian herbivore species react to danger from predators or humans in different ways. Some species are nervous, fast, and programmed for instant flight when they perceive a threat. Other species are slower, less nervous, seek protection in herds, stand their ground when threatened, and don't run until necessary.`,
    mock_29_2: `Naturally, the nervous species are difficult to keep in captivity. If put into an enclosure, they are likely to panic and either die of shock or hit themselves repeatedly to death against the fence in their attempts to escape. That's true, for example, of gazelles, which for thousands of years were the most frequently hunted game species in some parts of the Fertile Crescent.`,
    mock_29_3: `There is no mammal species that the first settled peoples of that area had more opportunity to domesticate than gazelles. But no gazelle species has ever been domesticated. Just imagine trying to herd an animal that runs away, blindly hits itself against walls, can leap up to nearly 30 feet, and can run at a speed of 50 miles per hour!`,

    // 모의고사 30번 3등분
    mock_30_1: `For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have.`,
    mock_30_2: `Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so. If you happen upon them in your travels, they will open up their homes and give you their food and hospitality. It's not just because they are nice people; it's because their survival depends on sharing.`,
    mock_30_3: `Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share. Our desire for more, combined with our increased physical disconnection or blindness to reality, starts to create a disconnection from the "common folk."`
  };

  // 드롭다운 HTML 구조를 3등분 선택지로 교체하기 위해 동적으로 옵션 업데이트 기능 반영
  // (index.html의 select 요소를 여기서 동적으로 확장하거나 아래와 같이 처리합니다)
  if (presetPassageSelect && !document.getElementById("opt_miraen_1")) {
    presetPassageSelect.innerHTML = `
      <option value="">-- 학습할 지문 및 파트 선택하기 --</option>
      <optgroup label="미래엔 교과서 (Art Gallery 전시회)">
        <option value="miraen_art_1">미래엔 교과서 파트 1 (Bill Traylor 생애)</option>
        <option value="miraen_art_2">미래엔 교과서 파트 2 (Traylor 그림 & Maud Lewis)</option>
        <option value="miraen_art_3">미래엔 교과서 파트 3 (Anna Ancher와 여성 인물화)</option>
      </optgroup>
      <optgroup label="고1 모의고사 29번 (초식동물과 사육)">
        <option value="mock_29_1">모의고사 29번 파트 1</option>
        <option value="mock_29_2">모의고사 29번 파트 2</option>
        <option value="mock_29_3">모의고사 29번 파트 3</option>
      </optgroup>
      <optgroup label="고1 모의고사 30번 (공유와 생존)">
        <option value="mock_30_1">모의고사 30번 파트 1</option>
        <option value="mock_30_2">모의고사 30번 파트 2</option>
        <option value="mock_30_3">모의고사 30번 파트 3</option>
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
        "question": "[서술형 영작] 다음 한국어 뜻에 맞게 조건에 맞는 문장을 영어로 작성하시오. (뜻: 그녀는 어려움 속에서도 예술을 포기하지 않았다)",
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