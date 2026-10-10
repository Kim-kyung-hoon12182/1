function createSurveyForm() {
  var form = FormApp.create("일상과 업무에서 반복되는 일, 어떻게 처리하고 있나요?");
  form.setDescription(
    "업무와 일상에서 반복적으로 하는 일과 생성형 AI 활용 경험에 대해 알아보기 위한 설문입니다. 약 5분 정도 소요되며, 응답 내용은 서비스 기획을 위한 리서치 목적으로만 활용됩니다."
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setProgressBar(true);
  form.setConfirmationMessage("응답해주셔서 감사합니다!");
  try {
    form.setRequireLogin(false);
  } catch (e) {}

  var sharedTasks = [
    "문서/글 작성",
    "자료 조사 및 요약",
    "회의/메모 정리",
    "데이터/엑셀 정리",
    "이메일/메시지 작성",
    "일정/계획 관리",
    "콘텐츠/블로그 작성",
    "공부/학습",
    "개인 기록/생활 관리(가계부 등)"
  ];

  // SECTION 1. 기본 정보
  form
    .addMultipleChoiceItem()
    .setTitle("Q1. 현재 본인의 상황을 알려주세요.")
    .setChoiceValues(["현재 직장인", "과거에 직장 경험이 있음", "학생", "직장 경험이 없음"])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle("Q2. 현재 또는 과거 직장 경험이 있다면 주로 어떤 직무였나요?")
    .setChoiceValues([
      "개발/IT",
      "기획/PM",
      "디자인",
      "마케팅/영업",
      "인사/총무/경영지원",
      "재무/회계",
      "연구/분석",
      "생산/제조",
      "교육",
      "서비스/고객응대",
      "해당 없음"
    ])
    .showOtherOption(true)
    .setRequired(false);

  // SECTION 2. 반복적으로 하는 일
  form.addPageBreakItem().setTitle("반복적으로 하는 일");
  var q3 = form
    .addMultipleChoiceItem()
    .setTitle("Q3. 최근 1개월 동안 비슷한 방식으로 반복해서 처리한 일이 있었나요?")
    .setRequired(true);

  // SECTION 2-2. 반복하는 일 자세히
  form.addPageBreakItem().setTitle("반복하는 일 자세히");
  form
    .addCheckboxItem()
    .setTitle("Q4. 최근 반복해서 처리한 일은 무엇인가요?")
    .setHelpText("해당하는 것을 모두 골라주세요.")
    .setChoiceValues(sharedTasks)
    .showOtherOption(true)
    .setRequired(true);

  form
    .addTextItem()
    .setTitle("Q5. 위에서 선택한 일 중 가장 반복적이고 번거롭다고 느끼는 일은 무엇인가요?")
    .setHelpText("구체적인 작업 이름을 적어주세요. 예: 매주 업무보고 작성, 매달 지출 정리, 매주 회의 내용 정리")
    .setRequired(true);

  form
    .addScaleItem()
    .setTitle("Q6. 그 일을 직접 처리하는 것이 얼마나 번거롭다고 느끼나요?")
    .setBounds(1, 5)
    .setLabels("전혀 번거롭지 않다", "매우 번거롭다")
    .setRequired(true);

  // SECTION 3. 생성형 AI 활용 경험
  var pbAi = form.addPageBreakItem().setTitle("생성형 AI 활용 경험");
  form
    .addMultipleChoiceItem()
    .setTitle("Q7. ChatGPT, Gemini, Claude 등의 생성형 AI를 업무나 개인적인 일을 처리하는 데 얼마나 활용하나요?")
    .setHelpText("재미로 질문해본 것이 아니라, 실제 일을 처리하는 데 쓴 경험을 기준으로 답해주세요.")
    .setChoiceValues([
      "거의 매일",
      "주 1회 이상",
      "한 달에 몇 번",
      "써봤지만 일에는 거의 사용하지 않음",
      "써본 적 없음"
    ])
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle("Q8. 생성형 AI를 실제로 어떤 일에 활용해봤나요?")
    .setHelpText("해당하는 것을 모두 골라주세요.")
    .setChoiceValues(sharedTasks.concat(["코딩", "번역", "실제 업무나 생활에 활용해본 적 없음"]))
    .showOtherOption(true)
    .setRequired(true);

  // SECTION 4. AI 활용의 어려움
  form.addPageBreakItem().setTitle("AI 활용의 어려움");
  form
    .addCheckboxItem()
    .setTitle("Q9. 생성형 AI를 업무나 개인적인 일에 적극적으로 활용하지 않는 이유는 무엇인가요?")
    .setHelpText("최대 3개까지 골라주세요.")
    .setChoiceValues([
      "내가 하는 일 중 AI를 어디에 활용할 수 있는지 모르겠다.",
      "AI에게 어떤 일을 맡겨야 할지 모르겠다.",
      "원하는 결과를 얻기 위해 어떻게 질문해야 할지 어렵다.",
      "처음 사용하려고 할 때 어디서부터 시작해야 할지 모르겠다.",
      "AI를 활용할 만한 일이 별로 없다고 생각한다.",
      "원하는 결과를 얻기 위해 여러 번 수정해야 한다.",
      "결과를 확인하고 수정하는 과정이 번거롭다.",
      "매번 비슷한 내용을 다시 입력하는 것이 번거롭다.",
      "AI 결과를 신뢰하기 어렵다.",
      "회사 자료나 개인정보를 입력하기 부담스럽다.",
      "회사에서 AI 사용을 지원하지 않는다.",
      "비용이 부담된다.",
      "특별히 어려움을 느끼지 않는다."
    ])
    .showOtherOption(true)
    .setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(3).build())
    .setRequired(true);

  // SECTION 5. AI를 계속 사용하지 않게 된 이유
  form.addPageBreakItem().setTitle("AI를 계속 사용하지 않게 된 이유");
  form
    .addCheckboxItem()
    .setTitle("Q10. AI를 사용해본 뒤에도 특정 작업에 계속 활용하지 않게 된 경험이 있다면, 그 이유는 무엇인가요?")
    .setHelpText("최대 3개까지 골라주세요.")
    .setChoiceValues([
      "같은 작업을 할 때마다 요청 내용(프롬프트)을 다시 입력해야 했다.",
      "원하는 결과를 얻기 위해 매번 수정해야 했다.",
      "결과를 확인하고 수정하는 시간이 많이 들었다.",
      "AI를 활용할 수 있는 다른 방법을 몰랐다.",
      "자동으로 반복 실행하는 방법을 몰랐다.",
      "설정 방법을 찾아보는 것이 번거로웠다.",
      "AI를 사용할 필요성을 크게 느끼지 못했다.",
      "특별히 계속 사용하지 않은 경험이 없다.",
      "AI를 실제 업무나 생활에 활용해본 적 없다."
    ])
    .showOtherOption(true)
    .setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(3).build())
    .setRequired(true);

  // SECTION 6. 반복적인 AI 사용
  form.addPageBreakItem().setTitle("반복적인 AI 사용");
  var q11 = form
    .addMultipleChoiceItem()
    .setTitle("Q11. 같은 작업을 AI에게 여러 번 요청해본 적이 있나요?")
    .setRequired(true);

  // SECTION 6-2. 반복 요청 방식
  form.addPageBreakItem().setTitle("같은 작업을 다시 시킬 때");
  form
    .addMultipleChoiceItem()
    .setTitle("Q12. 같은 작업을 AI에게 다시 시킬 때 주로 어떻게 했나요?")
    .setChoiceValues([
      "매번 새로 썼다",
      "예전에 작성한 내용을 찾아 복사했다",
      "같은 대화방에 이어서 했다",
      "따로 저장해둔 내용을 사용했다",
      "GPTs나 프로젝트 기능에 저장했다",
      "자동으로 실행되도록 설정했다"
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Q13. 어떤 작업이었나요?")
    .setHelpText("예: 매주 회의 내용을 정리하거나, 매달 보고서 초안을 작성하는 등 실제 사례를 적어주세요.")
    .setRequired(false);

  // SECTION 7. AI 자동화
  var pbAuto = form.addPageBreakItem().setTitle("AI 자동화");
  var q14 = form
    .addMultipleChoiceItem()
    .setTitle("Q14. 반복적으로 하는 일을 AI가 정해진 시간에 자동으로 처리하도록 설정해본 적이 있나요?")
    .setRequired(true);

  // SECTION 7-2. 자동화하지 않은 이유
  form.addPageBreakItem().setTitle("자동화하지 않은 이유");
  form
    .addCheckboxItem()
    .setTitle("Q15. 자동으로 실행하도록 설정하지 않은 가장 큰 이유는 무엇인가요?")
    .setHelpText("최대 2개까지 골라주세요.")
    .setChoiceValues([
      "그런 기능이 있는지 몰랐다.",
      "어떻게 설정하는지 모르겠다.",
      "설정 방법을 찾아보는 것이 귀찮다.",
      "설정 과정이 복잡해 보인다.",
      "굳이 자동화할 만큼 필요성을 느끼지 못했다.",
      "결과가 제대로 나올지 걱정된다.",
      "개인정보/회사정보가 걱정된다."
    ])
    .showOtherOption(true)
    .setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(2).build())
    .setRequired(true);

  // SECTION 8. 자유 응답
  var pbFree = form.addPageBreakItem().setTitle("자유 응답");
  form
    .addParagraphTextItem()
    .setTitle("Q16. 최근에 \"이건 매번 내가 직접 하지 말고 누가 알아서 해줬으면 좋겠다\"고 생각했던 일이 있다면 자유롭게 적어주세요.")
    .setRequired(false);

  // SECTION 9. 서비스 아이디어에 대한 반응
  form
    .addPageBreakItem()
    .setTitle("서비스 아이디어에 대한 반응")
    .setHelpText(
      "다음과 같은 서비스를 생각하고 있습니다.\n\n몇 가지 질문에 답하면 내가 반복적으로 하는 업무나 생활 루틴을 찾아주고, 그중 AI에게 맡길 수 있는 일을 선택하면 원하는 주기에 맞춰 AI가 결과물을 만들어주는 서비스입니다."
    );
  form
    .addScaleItem()
    .setTitle("Q17. 이런 서비스가 있다면 얼마나 유용할 것 같나요?")
    .setBounds(1, 5)
    .setLabels("전혀 유용하지 않을 것 같다", "매우 유용할 것 같다")
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle("Q18. 이 서비스에서 가장 필요하다고 생각하는 기능은 무엇인가요?")
    .setChoiceValues([
      "내가 AI에게 맡길 수 있는 반복 업무/루틴을 찾아주는 기능",
      "AI에게 맡길 작업을 쉽게 등록하는 기능",
      "정해진 시간에 자동으로 실행하는 기능",
      "등록한 작업을 쉽게 수정/관리하는 기능",
      "개인 생활의 반복 루틴도 관리하는 기능",
      "잘 모르겠다"
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Q19. 실제로 이 서비스를 사용한다면 가장 먼저 AI에게 맡기고 싶은 일은 무엇인가요?")
    .setRequired(false);

  // Branching: choices with navigation must be set after the target sections exist.
  var go = FormApp.PageNavigationType.CONTINUE;
  q3.setChoices([
    q3.createChoice("거의 매일 있었다", go),
    q3.createChoice("일주일에 여러 번 있었다", go),
    q3.createChoice("일주일에 한 번 정도 있었다", go),
    q3.createChoice("한 달에 몇 번 있었다", go),
    q3.createChoice("거의 없었다", pbAi),
    q3.createChoice("잘 모르겠다", go)
  ]);

  q11.setChoices([
    q11.createChoice("있다", go),
    q11.createChoice("없다", pbAuto),
    q11.createChoice("기억나지 않는다", pbAuto),
    q11.createChoice("AI를 실제 업무나 생활에 활용해본 적 없다", pbAuto)
  ]);

  q14.setChoices([
    q14.createChoice("있다", pbFree),
    q14.createChoice("없다", go),
    q14.createChoice("그런 기능이 있는지 몰랐다", go)
  ]);

  Logger.log("편집 링크: " + form.getEditUrl());
  Logger.log("응답 링크: " + form.getPublishedUrl());
}
