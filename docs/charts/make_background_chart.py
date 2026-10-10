from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

FONT_PATH = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
font_manager.fontManager.addfont(FONT_PATH)
plt.rcParams["font.family"] = font_manager.FontProperties(fname=FONT_PATH).get_name()
plt.rcParams["axes.unicode_minus"] = False

SURVEY = "설문 (32명)"
PUBLIC = "공개 조사"
COLORS = {SURVEY: "#E07A3F", PUBLIC: "#4A6FA5"}

SECTIONS = [
    ("1-1. AI는 이미 반복 업무에 쓰인다", [
        ("업무에 AI 활용", 94.9, "인크루트 877명", PUBLIC),
        ("같은 작업을 AI에 여러 번 요청", 93.8, "설문 30/32명", SURVEY),
    ]),
    ("1-2. 확인·수정에 시간이 든다", [
        ("AI 결과물을 검증·재편집", 97.5, "노션 조사", PUBLIC),
        ("자주·항상 확인 (주 평균 2시간)", 56.0, "TeamViewer 4,200명", PUBLIC),
        ("가장 지치는 순간: 검증에 시간이 더 걸릴 때", 31.6, "블라인드 5,284명", PUBLIC),
        ("AI를 덜 쓰게 된 이유: 확인·수정 시간", 50.0, "설문 16/32명", SURVEY),
    ]),
    ("1-3. 고쳐야 하면 시간 이득이 사라진다", [
        ("AI 결과가 수정 없이 맞음", 37.0, "Connext 1,000명", PUBLIC),
        ("고칠 때 직접 하는 만큼 또는 더 걸림", 57.0, "Connext 1,000명", PUBLIC),
    ]),
    ("1-4. 믿기 어렵고, 언제 믿을지 모른다", [
        ("가장 큰 어려움: 결과 신뢰성 부족", 42.4, "인크루트 877명", PUBLIC),
        ("언제 믿고 확인할지 항상 알지는 못함", 51.0, "TeamViewer 4,200명", PUBLIC),
        ("막히는 점: 결과를 신뢰하기 어려움", 46.9, "설문 15/32명", SURVEY),
    ]),
    ("1-5. 저장 기능이 있어도 안 쓴다", [
        ("다시 시킬 때 저장 없이 이어 쓰거나 새로 씀", 63.3, "설문 19/30명", SURVEY),
    ]),
    ("1-6. 개입할 수 있을 때 맡긴다", [
        ("개입할 수 있다면 AI 자율 실행 수용", 70.0, "TeamViewer 4,200명", PUBLIC),
        ("실행 전에 승인하고 싶음", 47.0, "Delight AI 1,001명", PUBLIC),
    ]),
]


def main() -> None:
    rows = []
    for title, items in SECTIONS:
        rows.append(("header", title))
        rows.extend(("bar", item) for item in items)

    fig_height = 0.42 * len(rows) + 1.6
    fig, ax = plt.subplots(figsize=(11, fig_height), dpi=200)

    y_positions = list(range(len(rows)))[::-1]
    for y, (kind, payload) in zip(y_positions, rows):
        if kind == "header":
            ax.text(-0.55, y, payload, fontsize=11.5, fontweight="bold",
                    va="center", ha="left", color="#222", transform=ax.get_yaxis_transform())
            continue
        label, value, source, group = payload
        ax.barh(y, value, height=0.62, color=COLORS[group])
        ax.text(-1, y, f"  {label}", fontsize=10, va="center", ha="right", color="#333")
        ax.text(value + 1, y, f"{value:g}%  · {source}", fontsize=9, va="center", color="#555")

    ax.set_xlim(0, 125)
    ax.set_ylim(-0.8, len(rows) - 0.3)
    ax.set_yticks([])
    ax.set_xticks([0, 25, 50, 75, 100])
    ax.set_xticklabels(["0%", "25%", "50%", "75%", "100%"], fontsize=9, color="#777")
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color("#bbb")
    ax.grid(axis="x", color="#eee", linewidth=0.8)
    ax.set_axisbelow(True)

    handles = [plt.Rectangle((0, 0), 1, 1, color=c) for c in COLORS.values()]
    ax.legend(handles, COLORS.keys(), loc="lower right", frameon=False, fontsize=9.5)

    fig.suptitle("배경: 반복 업무를 AI에 맡길 때 생기는 문제", fontsize=14, fontweight="bold",
                 x=0.02, ha="left")
    fig.text(0.02, 0.01, "조사마다 질문과 대상이 달라 막대끼리 직접 비교하지 않습니다. 출처는 요구사항 정의서 근거 항목에 있습니다.",
             fontsize=8.5, color="#888", ha="left")

    plt.subplots_adjust(left=0.36, right=0.98, top=0.94, bottom=0.06)
    out = Path(__file__).with_name("background-stats.png")
    fig.savefig(out, bbox_inches="tight")
    print(out)


if __name__ == "__main__":
    main()
