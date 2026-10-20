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

  // 지문 저장고 사전 데이터
  const passagesDb = {
    miraen_art: `Welcome to the Dream Art Gallery! I’m Isabel Williams, the docent for the From Shadows to Spotlights exhibit. Today, you’re going to meet three amazing artists who never gave up on their art, despite challenges in their lives. Each artist has a unique painting style and story that has made their work highly valued. Let’s explore each artist’s life and artwork.

The first artist we’re going to examine is Bill Traylor. Traylor was born into slavery in the U.S. in 1853 and spent his early life working on a cotton farm in Alabama. Although he became a free man after the American Civil War, he still had to face racial discrimination, working for very low wages on the farm. Later, when he was around 70 years old, Traylor moved to the city of Montgomery, Alabama, where he found a job in a factory. It wasn’t until he was 85 years old and became too ill to work that he turned to drawing to express his life experiences. Now, we’re going to look at some of his paintings, starting with Mean Dog and Man and Large Dog. Traylor had a strong fear of dogs because they had often been used on farms to watch and hunt slaves. His fear of dogs is expressed strongly in these pieces. In contrast, Woman with Purse and Man with Umbrella portrays the free lives of African Americans that he observed on the streets of Montgomery. Using simple shapes and colors, Traylor captured complex moments in American history from slavery to freedom. As a result, he’s now considered an important figure in American folk art.

Next, we have Maud Lewis, a renowned artist known for her heart-warming paintings. Born in a small Canadian town in 1903, Lewis suffered from physical weaknesses such as distorted shoulders and fingers. This limited her mobility and caused her to drop out of school. To make a living, she began to paint and sell Christmas cards. When her parents passed away, Lewis went to live with her aunt in Digby, Nova Scotia, where she met her future husband, Everett Lewis. After marrying, the couple spent the rest of their lives there, and Lewis continued to paint. She often depicted the Digby landscapes in paintings such as Edge of Digby Harbor. Her artwork used a mixture of bright and vivid oil paints and simple forms, generating an original, innovative style. Although her physical limitations confined her to a small cottage, her talent and imagination were both limitless. In Red Sleigh, red maple leaves appear on a special winter landscape, and Pair of Oxen shows decorated cows standing in a flower field. With these features, Lewis’ paintings create a magical quality, like that of a fairy tale. As her paintings gradually gained popularity, her story inspired many people and was later made into books and movies. Maud Lewis expressed her love for the world through her paintings and became an iconic figure in Canadian folk art.

Now let’s take a look at the final artist of this exhibition: Anna Ancher, a famous painter from Denmark. When observing her paintings, you may notice a common theme — they all feature female figures. Born in Skagen, Denmark, in 1859, she later moved to Copenhagen to attend a private painting school. After that, she even studied abroad in Paris, which was unusual for women at the time. Thanks to her mother’s encouragement, she was able to take advantage of these opportunities. Even after getting married, Ancher persisted in painting, objecting to the social pressure that married women were to solely focus on household duties. Ancher differed from other artists of that era, who depicted women as still life subjects. In contrast, she showcased them as active participants in everyday tasks, as seen in her works The Maid in the Kitchen and Sewing Fisherman’s Wife. She also skillfully explored light and color, contributing to the rich Impressionist movement in Denmark. In her painting the sunlight on the blue wall is stunningly portrayed. Her paintings continue to amaze us to this day. Thank you for joining this guided tour, and I hope my explanations have aided you in appreciating these paintings. Please take some time to further explore the exhibition.`,
    
    mock_29: `Big mammalian herbivore species react to danger from predators or humans in different ways. Some species are nervous, fast, and programmed for instant flight when they perceive a threat. Other species are slower, less nervous, seek protection in herds, stand their ground when threatened, and don't run until necessary. Naturally, the nervous species are difficult to keep in captivity. If put into an enclosure, they are likely to panic and either die of shock or hit themselves repeatedly to death against the fence in their attempts to escape. That's true, for example, of gazelles, which for thousands of years were the most frequently hunted game species in some parts of the Fertile Crescent. There is no mammal species that the first settled peoples of that area had more opportunity to domesticate than gazelles. But no gazelle species has ever been domesticated. Just imagine trying to herd an animal that runs away, blindly hits itself against walls, can leap up to nearly 30 feet, and can run at a speed of 50 miles per hour!`,

    mock_30: `For a species born in a time when resources were limited and dangers were great, our natural tendency to share and cooperate is complicated when resources are plenty and outside dangers are few. When we have less, we tend to be more open to sharing what we have. Certain nomadic tribes don't have much, yet they are happy to share because it is in their interest to do so. If you happen upon them in your travels, they will open up their homes and give you their food and hospitality. It's not just because they are nice people; it's because their survival depends on sharing, for they know that they may be the travelers in need of food and shelter another day. Ironically, the more we have, the bigger our fences, the more sophisticated our security to keep people away and the less we want to share. Our desire for more, combined with our increased physical disconnection or blindness to reality, starts to create a disconnection from the "common folk."`,

    mock_31: `Whether we feel happy or sad, content or discontent, is not determined merely by each individual successive moment of life experience—a good thing happens and I'm happy, a bad thing happens and I'm sad. While our experiences affect our well-being, we are not blown in a completely new direction by each gust of wind. As humans, we adjust to new information and events—both good and bad—and return to our personal default level of well-being. There will be highs and lows, but over time, like water seeking its own level, we are pulled toward our baseline—back up after bad news and back down after good. The euphoria of first love fades, and so does the despair of a break-up. This tendency is best seen with little kids and their toys: When they get what they've longed for, they believe they will be happy for the rest of their lives. And for the first few minutes of the rest of their lives, they are. But then the kids—like adults—adapt.`,

    mock_32: `Although you may put off going to sleep in order to squeeze more activities into your day, eventually your need for sleep becomes overwhelming and you are forced to get some sleep. This daily drive for sleep appears to be due, in part, to a compound known as adenosine. This natural chemical builds up in your blood as time awake increases. While you sleep, your body breaks down the adenosine. Thus, this molecule may be what your body uses to keep track of and to trigger sleep when needed. An accumulation of adenosine and other factors might explain why, after several nights of less than optimal amounts of sleep, you build up a sleep debt that you must make up by sleeping longer than normal. Because of such built-in molecular feedback, you can't become accustomed to getting less sleep than your body needs. Eventually, a lack of sleep catches up with you.`,

    mock_36: `The desert tortoise has a simple solution for coping with Death Valley's extreme heat: It avoids it. The slow-moving creature hibernates during the winter and stays in its tunnel for much of the summer, meaning that it spends more than 90 percent of its life underground. In fact, the tortoise usually only surfaces after a good rain. Then, it gets to work. The tortoise stocks up on water by eating plants and digging holes to collect rain. But to stay supplied with water through its extended hibernation, the reptile relies on something else: its highly sophisticated bladder. Unlike most animals, the tortoise's bladder acts as a holding tank, allowing it to reabsorb water back into its body. Incredibly, a desert tortoise can go a full year without taking in any freshwater at all. And because its bladder is so important to a tortoise's survival, park rangers often remind visitors not to stop and help the slow-movers across the road. Tortoises become so terrified when people pick them up that they empty their bladders, losing their precious water reserves.`,

    mock_38: `All editing systems are now nonlinear computer-based systems that allow random access to any video shot or scene without having to fast forward or fast reverse to find it. Nonlinear systems can create a range of special effects, such as slow motion, wipes and dissolves. Another highlight of a digital nonlinear system is its random access process that makes it easy for an editor to find desired shots or scenes without having to spend time fast forwarding or rewinding videotape. With nonlinear editing, shots or scenes can be easily added or removed anywhere in the program, and the computer adjusts the program length automatically. Linear editing was like composing a paper on a typewriter. If a mistake was made or new information needed to be added, the whole piece had to be retyped. Nonlinear editing, on the other hand, is like using a word processing program. If a mistake is made, it is easily deleted and fixed with a few keystrokes, and new information can be added easily.`,

    mock_39: `A person who always tries to prevent harm, but never does, is not generally thought of as morally good. A morally good person is one who does morally bad actions significantly less often than most and does morally good ones significantly more often than most. In judging a person, not only her actions but also her intentions and motives are relevant. A morally good person must intend to do morally good actions and intend to avoid morally bad ones. A person who unintentionally prevents harm to others and does not harm them because things do not turn out as she intends is not morally good. Although this kind of situation generally occurs only in slapstick movies, it is worth mentioning to avoid the false impression that it is the actual consequences of a person's actions that count toward her being judged morally good or bad. But actual consequences are important. Of such a person, it may be said that she means well; but, contrary to Kant, some results are necessary before she is regarded as morally good.`
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
       - 서술형 문제는 "조건부 영작" 또는 "핵심 내용 한국어/영어 서술" 형태로 출제할 것.
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

    // 최신 올바른 모델 이름 (gemini-3.8-flash) 적용 완료
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
    presetPassageSelect.value = "";
    passageInput.value = "";
  });
});