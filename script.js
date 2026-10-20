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

  // 2025년 9월 고1 모의고사 29~34, 36~38번 PDF 찐 원문 전체 반영 데이터베이스
  const passagesDb = {
    mock_29: `Big mammalian herbivore species react to danger from predators or humans in different ways. Some species are nervous, fast, and programmed for instant flight when they perceive a threat. Other species are slower, less nervous, seek protection in herds, stand their ground when threatened, and don't run until necessary. Naturally, the nervous species are difficult to keep in captivity. If put into an enclosure, they are likely to panic, and either die of shock or hit themselves repeatedly to death against the fence in their attempts to escape. That's true, for example, of gazelles, which for thousands of years were the most frequently hunted game species in some parts of the Fertile Crescent. There is no mammal species that the first settled peoples of that area had more opportunity to domesticate than gazelles. But no gazelle species has ever been domesticated. Just imagine trying to herd an animal that runs away, blindly hits itself against walls, can leap up to nearly 30 feet, and can run at a speed of 50 miles per hour!`,

    mock_30: `For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have. Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so. If you happen upon them in your travels, they will open up their homes and give you their food and hospitality. It's not just because they are nice people; it's because their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day. Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share. Our desire for more, combined with our increased physical interaction with the "common folk," starts to create a disconnection or blindness to reality.`,

    mock_31: `Whether we feel happy or sad, content or discontent, is not determined merely by each individual successive moment of life experience―a good thing happens and I'm happy, a bad thing happens and I'm sad. While our experiences affect our mood, we are not blown in a completely new direction by each gust of wind. As humans, we adjust to new information and events―both good and bad―and return to our personal default level of well-being. There will be highs and lows, but over time, like water seeking its own level, we are pulled toward our baseline―back up after bad news and back down after good. The euphoria of first love fades, and so does the despair of a break-up. This tendency is best seen with little kids and their toy joy: When they get what they've longed for, they believe they will be happy for the rest of their lives. And for the first few minutes of the rest of their lives, they are. But then the kids―like adults―adapt.`,

    mock_32: `Although you may put off going to sleep in order to squeeze more activities into your day, eventually your need for sleep becomes overwhelming and you are forced to get some sleep. This daily drive for sleep appears to be due, in part, to a compound known as adenosine. This natural chemical builds up in your blood as time awake increases. While you sleep, your body breaks down the adenosine. Thus, this molecule may be what your body uses to keep track of lost sleep and to trigger sleep when needed. An accumulation of adenosine and other factors might explain why, after several nights of less than optimal amounts of sleep, you build up a sleep debt that you must make up by sleeping longer than normal. Because of such built-in molecular feedback, you can't become accustomed to getting less sleep than your body needs. Eventually, a lack of sleep catches up with you.`,

    mock_33: `One of the things that makes uncertainty difficult for members of the public to appreciate is that the significance of uncertainty is relative. Take, for example, the distance between Earth and the sun: 1.49597 × 10^8 km, as measured at one point during the year. This seems relatively precise: after all, using six significant digits means I know the distance to an accuracy of one part in a million or so. However, if the next digit is uncertain, that means the uncertainty in knowing the precise Earth-sun distance is larger than the distance between New York and Chicago! Whether or not the quoted number is "precise" therefore depends on what I'm intending to do with it. If I care only about what minute the sun will rise tomorrow, then the number quoted here is fine. If I want to send a satellite to orbit just above the sun, however, then I would need to know distances more accurately.`,

    mock_34: `Richard Heinberg, an American journalist, argues that in building the renewable energy infrastructure to stop global warming, we are actually involved in one of the greatest change projects in human history. In addition to solar panels and wind turbines, we have to build an alternative transport infrastructure, farming procedures and industrial processes. This transformation cannot happen without fossil fuels. For instance, production of concrete structures and steel elements require amounts of energy that is only possible to produce with fossil energy. Production of solar panels requires scarce and expensive minerals which must be excavated, again requiring the use of fossil fuels. Thus, the harder we push towards a renewable energy system, the faster we have to use fossil energy for the construction process. This is not only expensive, but also an undermining factor for our efforts to cut global emissions. Heinberg remarks that the cost of building this new energy infrastructure is seldom counted in transition proposals, which tend to focus just on energy supply requirements.`,

    mock_36: `The desert tortoise has a simple solution for coping with Death Valley's extreme heat: It avoids it. The slow-moving creature hibernates during the winter and stays in its tunnel for much of the summer, meaning that it spends more than 90 percent of its life immobile. In fact, the tortoise usually only surfaces after a good rain. Then, it gets to work. The tortoise stocks up on water by eating plants and digging holes to collect rain. But to stay supplied with water through its extended hibernation, the reptile relies on something else ― its highly sophisticated bladder. Unlike most animals, the tortoise's bladder acts as a holding tank, allowing it to reabsorb water back into its body. Incredibly, a desert tortoise can go a full year without taking in any freshwater at all. And because its bladder is so important to a tortoise's survival, park rangers often remind visitors not to stop and help the slow-movers across the road. Tortoises become so terrified when people pick them up that they empty their bladders, losing their precious water reserves.`,

    mock_37: `Imagine you are pedalling your bicycle on a level road. You stop pedalling: no force is now acting to move you forward. What happens? You gradually slow down. How could you slow down more suddenly, in a shorter distance? By putting the brakes on. Because the brakes change your movement, making you slow down more suddenly, they must be exerting a force on the bicycle and you, as they grip and rub on the wheel-rims. This is the force called friction, which tends to slow down moving things by acting in the direction opposite to movement, that is backwards. Even without the brakes on, there are other friction forces acting on you and your bicycle, which also slow you down. One of these is friction in the wheels rubbing on the axles. Another is air resistance, which you can feel, pushing you backwards as you and the bicycle move forwards. When you apply these ideas to something around you, like a cart, you can see what could be generating friction: mainly the axles rubbing on the body as they rotate.`,

    mock_38: `All editing systems are now nonlinear computer-based systems that allow random access to any video shot or scene without having to fast forward or fast reverse to find it. Nonlinear systems can create a range of special effects, such as slow motion, wipes and dissolves. Another highlight of a digital nonlinear system is its random access process that makes it easy for an editor to find desired shots or scenes without having to spend time fast forwarding or rewinding videotape. With nonlinear editing, shots or scenes can be easily added or removed anywhere in the program, and the computer adjusts the program length automatically. Linear editing was like composing a paper on a typewriter. If a mistake was made or new information needed to be added, the whole piece had to be retyped. Nonlinear editing, on the other hand, is like using a word processing program. If a mistake is made, it is easily deleted and fixed with a few keystrokes, and new information can be added easily.`
  };

  if (presetPassageSelect) {
    presetPassageSelect.innerHTML = `
      <option value="">-- 2025년 9월 고1 모의고사 지문 원본 선택 (29~34, 36~38) --</option>
      <option value="mock_29">29번: 초식동물과 사육</option>
      <option value="mock_30">30번: 공유와 생존</option>
      <option value="mock_31">31번: 행복 기준선과 적응</option>
      <option value="mock_32">32번: 수면 부족과 아데노신</option>
      <option value="mock_33">33번: 불확실성의 유효 숫자</option>
      <option value="mock_34">34번: 재생에너지 인프라와 화석연료</option>
      <option value="mock_36">36번: 사막 거북과 방광</option>
      <option value="mock_37">37번: 마찰력과 자전거 페달</option>
      <option value="mock_38">38번: 비선형 편집 시스템</option>
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
        "question": "[서술형 영작] 다음 한국어 뜻에 맞게 조건에 맞는 문장을 영어로 작성하시오. (뜻: 우리가 가질수록 우리는 나누고 싶지 않다)",
        "options": [],
        "answerText": "The more we have, the less we want to share.",
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
      <div class="passage-box" style="max-height: 160px; overflow-y: auto; font-size: 0.85rem; margin-bottom: 12px; padding: 12px; line-height: 1.5;">
        <strong>📖 모의고사 지문 원본:</strong><br>${currentPassage}
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
      html += `<button id="submitObjBtn" class="btn primary" style="margin-top: 10px; padding: 8px;">정답 즉시 확인하기</button>`;
    } else {
      const savedText = typeof userAnswers[currentIndex] === 'string' ? userAnswers[currentIndex] : '';
      html += `
        <div class="subjective-box">
          <p style="font-size: 0.85rem; color: #2c3e50; font-weight: bold; margin-bottom: 6px;">✍️ 조건부 영작 답안 입력:</p>
          <input type="text" id="subjectiveInput" value="${savedText}" placeholder="여기에 영어 문장 답안을 입력하세요..." style="padding: 10px; font-size: 0.9rem; width:100%; margin-bottom: 8px;">
          <button id="submitSubjBtn" class="btn primary" style="padding: 8px;">서술형 정답 확인하기</button>
        </div>
      `;
    }

    questionContainer.innerHTML = html;

    if (q.type === "objective") {
      const submitObjBtn = document.getElementById("submitObjBtn");
      submitObjBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="quizOption"]:checked');
        if (!selected) {
          alert("정답을 선택해주세요!");
          return;
        }
        const userChoice = parseInt(selected.value);
        userAnswers[currentIndex] = userChoice;

        if (userChoice === q.answer) {
          score += Math.round(100 / quizData.length);
          alert(`✅ 정답입니다!\n\n💡 해설: ${q.explanation}`);
        } else {
          alert(`❌ 틀렸습니다!\n\n정답: ${q.options[q.answer]}\n💡 해설: ${q.explanation}`);
        }
        scoreBadge.textContent = `점수: ${score}점`;
      });
    } else {
      const submitSubjBtn = document.getElementById("submitSubjBtn");
      submitSubjBtn.addEventListener("click", () => {
        const textVal = document.getElementById("subjectiveInput").value.trim();
        if (!textVal) {
          alert("서술형 답안을 입력해 주세요!");
          return;
        }
        userAnswers[currentIndex] = textVal;
        score += Math.round(100 / quizData.length);
        alert(`📝 제출 완료!\n\n모범 정답: ${q.answerText}\n💡 해설: ${q.explanation}`);
        scoreBadge.textContent = `점수: ${score}점`;
      });
    }
  }

  nextBtn.addEventListener("click", () => {
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

    let fbHtml = "<h4>🔍 전체 오답 노트 및 해설</h4>";
    quizData.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      fbHtml += `
        <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #3498db;">
          <p><b>Q${idx+1}. ${q.question}</b></p>
          <p style="font-size: 0.9rem;">내 제출 답안: ${q.type === 'objective' ? (q.options[userAns] || '미선택') : (userAns || '미작성')}</p>
          <p style="font-size: 0.85rem; color: #27ae60;">모범 정답: ${q.type === 'objective' ? q.options[q.answer] : q.answerText}</p>
          <p style="font-size: 0.80rem; color: #555; margin-top: 4px;">💡 해설: ${q.explanation}</p>
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