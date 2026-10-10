function updateSurveyForm() {
  var form = FormApp.openById("1zd6vT6CHWI2_arkCo2smRhhzzjgX6QMltcHQ7RiXyNM");
  var go = FormApp.PageNavigationType.CONTINUE;
  var items = form.getItems();

  function find(prefix) {
    return items.filter(function (it) {
      return it.getTitle().indexOf(prefix) === 0;
    })[0];
  }

  function findPageBreak(title) {
    return items
      .filter(function (it) {
        return it.getType() === FormApp.ItemType.PAGE_BREAK && it.getTitle() === title;
      })[0]
      .asPageBreakItem();
  }

  // Shift Q7~Q19 to Q8~Q20 to make room for the new Q7.
  items.forEach(function (it) {
    var t = it.getTitle();
    var m = t.match(/^Q(\d+)\. /);
    if (m && Number(m[1]) >= 7) {
      it.setTitle(t.replace(/^Q\d+\. /, "Q" + (Number(m[1]) + 1) + ". "));
    }
  });

  // 1. New Q7: how the material for the repeated task is prepared.
  var q6 = find("Q6.");
  var q7 = form
    .addMultipleChoiceItem()
    .setTitle("Q7. 그 일을 할 때 필요한 내용은 보통 어떻게 준비하나요?")
    .setChoiceValues([
      "평소에 메모해둔 걸 모은다",
      "그때 기억을 떠올려서 쓴다",
      "메일, 메신저, 캘린더 등을 다시 찾아본다",
      "필요한 자료가 이미 한곳에 정리되어 있다"
    ])
    .showOtherOption(true)
    .setRequired(true);
  form.moveItem(q7.getIndex(), q6.getIndex() + 1);
  items = form.getItems();

  // 4. Put Q9 in its own section so people who never used AI can skip it.
  var q9 = find("Q9.");
  var pbUse = form.addPageBreakItem().setTitle("AI를 활용해본 일");
  form.moveItem(pbUse.getIndex(), q9.getIndex());
  items = form.getItems();

  var pbHard = findPageBreak("AI 활용의 어려움");
  var q8 = find("Q8.").asMultipleChoiceItem();
  q8.setChoices([
    q8.createChoice("거의 매일", go),
    q8.createChoice("주 1회 이상", go),
    q8.createChoice("한 달에 몇 번", go),
    q8.createChoice("써봤지만 일에는 거의 사용하지 않음", go),
    q8.createChoice("써본 적 없음", pbHard)
  ]);

  // 5. Q10 wording that daily AI users can also answer.
  var q10 = find("Q10.");
  q10.setTitle("Q10. AI를 쓸 때 어렵거나, 잘 쓰지 않게 되는 이유는 무엇인가요?");

  // 3. "Other" option for how people re-request the same task.
  find("Q13.").asMultipleChoiceItem().showOtherOption(true);

  // 2. Service description that also states what the user has to do.
  findPageBreak("서비스 아이디어에 대한 반응").setHelpText(
    "다음과 같은 서비스를 생각하고 있습니다. 몇 가지 질문에 답하면 내가 반복적으로 하는 일 중 AI에게 맡길 수 있는 일을 찾아주고, 평소에 관련 내용을 짧게 메모해두면 정해진 주기에 맞춰 AI가 결과물을 만들어두는 서비스입니다."
  );

  form.getItems().forEach(function (it) {
    Logger.log(it.getIndex() + " [" + it.getType() + "] " + it.getTitle());
  });
}
