from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import FancyBboxPatch

FONT_PATH = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
font_manager.fontManager.addfont(FONT_PATH)
plt.rcParams["font.family"] = font_manager.FontProperties(fname=FONT_PATH).get_name()

OK = "#3B8B5A"
WARN = "#D0662F"
GRAY = "#888888"

WEEKS = [
    {
        "title": "1주차",
        "action": "규칙 만들기 + 첫 실행",
        "lines": [("팀장님께 이번 주 업무를…", "짚은 곳 ①", GRAY),
                  ("매출 1억 2천 달성", "재료에 없음: 1억 2천", WARN),
                  ("다음 주 일정은…", "짚은 곳 ①", GRAY)],
        "user": "주황 줄만 확인하고 고침",
        "ask": "다음에도 숫자는 메모에 있는\n것만 쓸까요?  [확인]",
        "record": "고침",
    },
    {
        "title": "2주차",
        "action": "메모만 바꿔서 실행",
        "lines": [("팀장님께 이번 주 업무를…", "짚은 곳 ①", GRAY),
                  ("A 프로젝트 마무리", "짚은 곳 ①", GRAY),
                  ("회의가 많았습니다", "근거 확인 필요", WARN)],
        "user": "한 군데만 고침",
        "ask": "",
        "record": "고침",
    },
    {
        "title": "3주차",
        "action": "메모만 바꿔서 실행",
        "lines": [("팀장님께 이번 주 업무를…", "짚은 곳 ①", GRAY),
                  ("B 기능 배포 완료", "짚은 곳 ①", GRAY),
                  ("다음 주 일정은…", "짚은 곳 ①", GRAY)],
        "user": "고칠 게 없음 → [복사하고 끝내기]",
        "ask": "",
        "record": "안 고침",
    },
    {
        "title": "4주차",
        "action": "메모만 바꿔서 실행",
        "lines": [("팀장님께 이번 주 업무를…", "짚은 곳 ①", GRAY),
                  ("C 고객 미팅 2건", "짚은 곳 ①", GRAY),
                  ("다음 주 일정은…", "짚은 곳 ①", GRAY)],
        "user": "고칠 게 없음 → [복사하고 끝내기]",
        "ask": "",
        "record": "안 고침",
    },
    {
        "title": "5주차",
        "action": "메모만 바꿔서 실행",
        "lines": [("팀장님께 이번 주 업무를…", "짚은 곳 ①", GRAY),
                  ("D 리포트 제출", "짚은 곳 ①", GRAY),
                  ("다음 주 일정은…", "짚은 곳 ①", GRAY)],
        "user": "고칠 게 없음 → [복사하고 끝내기]",
        "ask": "3번 연속 안 고치고 썼어요.\n검토를 줄여볼까요?\n[확인 생략 켜기] [지시문 복사]",
        "record": "안 고침",
    },
]


def box(ax, x, y, w, h, fc, ec="#cccccc", lw=1.0, r=0.012):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={r}",
                                fc=fc, ec=ec, lw=lw))


def main() -> None:
    fig, ax = plt.subplots(figsize=(17, 6.6), dpi=200)
    ax.set_xlim(0, 1)
    ax.set_ylim(0.14, 0.9)
    ax.axis("off")

    fig.text(0.02, 0.975, "주간보고를 5주 동안 쓰면 이렇게 됩니다", fontsize=17, fontweight="bold")
    fig.text(0.02, 0.935, "확인할 곳을 주황으로 표시 → 표시된 곳만 확인하고 고침 → 고친 건 다음부터 규칙에 들어감 → 안 고친 기록이 쌓이면 맡겨볼 만한 때 제안",
             fontsize=10.5, color="#555")

    col_w = 0.184
    gap = (1 - 5 * col_w) / 6
    records = []
    for i, wk in enumerate(WEEKS):
        x = gap + i * (col_w + gap)
        last = i == len(WEEKS) - 1

        ax.text(x, 0.86, wk["title"], fontsize=14, fontweight="bold")
        ax.text(x, 0.825, wk["action"], fontsize=9.5, color="#555")

        box(ax, x, 0.43, col_w, 0.37, "#ffffff", ec="#999999", lw=1.2)
        ax.text(x + 0.01, 0.775, "AI가 쓴 주간보고", fontsize=9, color=GRAY)
        for j, (text, label, color) in enumerate(wk["lines"]):
            ly = 0.715 - j * 0.085
            box(ax, x + 0.008, ly - 0.03, col_w - 0.016, 0.065,
                "#FFF3EC" if color == WARN else "#FAFAFA", ec=color, lw=1.0)
            ax.text(x + 0.016, ly + 0.012, text, fontsize=9, color="#222")
            ax.text(x + 0.016, ly - 0.016, f"● {label}", fontsize=8.2, color=color, fontweight="bold")

        ax.text(x + 0.01, 0.455, wk["user"], fontsize=9, color="#222", fontweight="bold")

        if wk["ask"]:
            fc = "#E8F1FB" if not last else "#FFF7D6"
            ec = "#4A6FA5" if not last else "#C9A227"
            box(ax, x, 0.29, col_w, 0.115, fc, ec=ec, lw=1.4)
            ax.text(x + 0.01, 0.348, wk["ask"], fontsize=8.6, color="#222", va="center", linespacing=1.5)

        records.append(wk["record"])
        ax.text(x, 0.225, "이 일의 기록", fontsize=8.5, color=GRAY)
        for k, rec in enumerate(records):
            cx = x + k * 0.036
            color = "#9AA0A6" if rec == "안 고침" else WARN
            box(ax, cx, 0.165, 0.033, 0.045, color, ec=color, r=0.008)
            ax.text(cx + 0.0165, 0.1875, rec, fontsize=6.6, color="white", ha="center", va="center", fontweight="bold")

        if not last:
            ax.annotate("", xy=(x + col_w + gap * 0.85, 0.615), xytext=(x + col_w + gap * 0.15, 0.615),
                        arrowprops=dict(arrowstyle="->", color="#aaaaaa", lw=1.5))

    fig.text(0.02, 0.035, "주황 = 확인할 곳 / 회색 = AI가 짚은 재료 위치(확인했다는 뜻은 아님).   1주차에 고친 내용(숫자는 메모에 있는 것만)이 규칙으로 저장돼서 2주차부터 같은 실수가 줄어듭니다.",
             fontsize=10, color="#555")
    fig.text(0.02, 0.0, "예시 문장과 회차는 설명용입니다. 맡기기 제안 기준(3번 연속)은 검증 전 임시 값입니다.",
             fontsize=9, color="#999")

    out = Path(__file__).with_name("five-week-flow.png")
    fig.savefig(out, bbox_inches="tight")
    print(out)


if __name__ == "__main__":
    main()
