function updateSurveyForm2() {
  var form = FormApp.openById("1zd6vT6CHWI2_arkCo2smRhhzzjgX6QMltcHQ7RiXyNM");
  var items = form.getItems();

  function find(prefix) {
    return items.filter(function (it) {
      return it.getTitle().indexOf(prefix) === 0;
    })[0];
  }

  // Q10: only what blocks people when they first try to use AI.
  find("Q10.")
    .asCheckboxItem()
    .setTitle("Q10. AI를 업무나 개인적인 일에 쓰려고 할 때 막히는 점은 무엇인가요?")
    .setChoiceValues([
      "내가 하는 일 중 AI에게 맡길 만한 일이 뭔지 모르겠다.",
      "원하는 결과를 얻으려면 어떻게 질문해야 할지 모르겠다.",
      "처음 쓰려고 할 때 어디서부터 시작해야 할지 모르겠다.",
      "AI를 쓸 만한 일이 별로 없다고 생각한다.",
      "AI 결과를 신뢰하기 어렵다.",
      "회사 자료나 개인정보를 입력하기 부담스럽다.",
      "회사에서 AI 사용을 지원하지 않는다.",
      "비용이 부담된다.",
      "특별히 막히는 점이 없다."
    ]);

  // Q11: only why people stopped after using AI for a task.
  find("Q11.")
    .asCheckboxItem()
    .setChoiceValues([
      "같은 작업을 할 때마다 요청 내용(프롬프트)을 다시 입력해야 했다.",
      "원하는 결과를 얻기 위해 매번 수정해야 했다.",
      "결과를 확인하고 수정하는 시간이 많이 들었다.",
      "AI를 사용할 필요성을 크게 느끼지 못했다.",
      "특별히 계속 사용하지 않은 경험이 없다.",
      "AI를 실제 업무나 생활에 활용해본 적 없다."
    ]);

  ["Q10.", "Q11."].forEach(function (prefix) {
    var it = find(prefix).asCheckboxItem();
    Logger.log(it.getTitle());
    it.getChoices().forEach(function (c) {
      Logger.log("  - " + c.getValue());
    });
    Logger.log("  기타 옵션: " + it.hasOtherOption());
  });
}
