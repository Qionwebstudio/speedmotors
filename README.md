# 스피드모터스 인천 남동로점 웹사이트

GitHub Pages용 정적 웹사이트입니다. (빌드 과정 없음)

## 폴더 구조
```
index.html      ← 메인 페이지
css/style.css   ← 디자인
js/main.js      ← 매물 데이터·화면 전환·매입 신청
images/         ← 사진 (images/README.md 참고)
favicon.svg     ← 탭 아이콘
404.html        ← 잘못된 주소 → 홈으로 이동
.nojekyll       ← GitHub의 Jekyll 처리 끄기 (지우지 마세요)
```

## GitHub Pages 올리는 법
1. GitHub에서 새 저장소(Repository) 만들기 — Public
2. **Add file → Upload files** 에서 이 폴더 안의 **내용물 전체**를 끌어다 놓기
   (폴더째가 아니라, `index.html`이 저장소 맨 위에 오도록)
3. **Settings → Pages → Branch: `main` / `/(root)` → Save**
4. 1~2분 후 `https://아이디.github.io/저장소이름/` 에서 확인

## 자주 고칠 곳
- 전화번호: `js/main.js` 맨 위 `CONFIG.phone` + `index.html` 상단·하단 (총 3곳)
- 히어로 디자인 A/B: `js/main.js` 맨 위 `CONFIG.heroVariant`
- 매물 목록: `js/main.js` 의 `STOCK`
- 상호·주소·사업자번호: `index.html` 아래쪽 `<footer>`
