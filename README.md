# 🌿 르메뜨레(L.REMETTRE) 공식 프레젠테이션 & 디지털 아카이브 허브

본 프로젝트는 **기존 사내 대외비 자료(매출, 정산, 고객 정보 등)와 엄격히 분리**하여, 외부 세미나·강의·미팅 현장에서 인터넷만 연결되면 **F11 전체화면으로 즉시 프레젠테이션을 진행하고 공식 자료를 안전하게 공유/다운로드**할 수 있도록 구축된 **비용 0원(Zero-Cost) GitHub Pages 배포용 웹 프로젝트**입니다.

---

## 📂 폴더 구조 및 구성

```
c:\Users\kty50\OneDrive\lremettre-hub\
│
├── 📄 index.html                  ★ [메인 포털] 르메뜨레 공식 자료실 & 아카이브 대시보드
├── 📄 presentation.html           ★ [라이브 덱] 16:9 와이드스크린 시네마틱 프레젠테이션 플레이어
│
├── 📂 css/
│   ├── style.css                  (메인 자료실 시그니처 웜 크림/아이보리 에디토리얼 테마)
│   └── presentation.css           (슬라이드 전용 1920×1080 반응형 스케일러 및 화이트/다크 듀얼 테마)
│
├── 📂 js/
│   ├── main.js                    (자료실 검색, 카테고리 필터링, 모달 상호작용)
│   ├── presentation.js            (방향키/터치 스와이프, F11 전체화면, 목차 드로어, 듀얼 테마)
│   └── slides-data.js             (16개 슬라이드 전체 구조 및 텍스트 데이터베이스)
│
├── 📂 data/
│   └── resources.json             ★ [자료 등록부] 수시로 업데이트되는 자료 목록 메타데이터
│
├── 📂 docs/                       ★ [공개 배포 파일] PPTX, PDF 등 다운로드용 실물 파일
│   ├── leadership-temperature-v1.1.pptx
│   └── leadership-temperature-v1.0.pdf
│
└── 📂 .github/workflows/
    └── deploy.yml                 ★ GitHub Pages 자동 무료 배포 파이프라인
```

---

## 🚀 빠른 시작 (로컬에서 바로 열어보기)

### 방법 1. 브라우저에서 더블 클릭 실행
- `c:\Users\kty50\OneDrive\lremettre-hub\index.html` 파일을 더블 클릭하면 즉시 브라우저에서 열립니다.
- 메인 화면에서 **[🚀 라이브 웹 프레젠테이션 시작]**을 누르면 세미나 슬라이드로 진입합니다.

### 방법 2. 로컬 웹 서버로 실행 (권장)
```bash
# lremettre-hub 디렉토리에서 실행
python -m http.server 8000
```
브라우저에서 `http://localhost:8000`으로 접속하시면 실제 깃허브 배포 환경과 100% 동일하게 확인하실 수 있습니다.

---

## 🖥️ 라이브 프레젠테이션 조작 가이드 (`presentation.html`)

| 기능 | 조작 방법 | 설명 |
| :--- | :--- | :--- |
| **슬라이드 넘김** | `→`, `↓`, `Space`, `Enter`, `PageDown` | 다음 슬라이드로 부드럽게 이동 |
| **이전 슬라이드** | `←`, `↑`, `Backspace`, `PageUp` | 이전 슬라이드로 이동 |
| **첫/끝 슬라이드** | `Home` / `End` | 표지 또는 엔딩 슬라이드로 즉각 점프 |
| **전체화면 발표** | `F` 키 또는 화면 우측 상단 **[⛶ 전체화면]** | 빔프로젝터/모니터 16:9 꽉 찬 화면 전환 |
| **테마 전환** | `T` 키 또는 화면 우측 상단 **[🌙/☀️ 테마]** | 화이트 에디션 ☀️ ↔ 옵시디언 다크 에디션 🌙 즉시 전환 |
| **전체 목차 드로어** | `G` 또는 `M` 키, 상단 **[📑 슬라이드 목차]** | 16개 슬라이드 썸네일 그리드에서 원하는 장으로 즉시 점프 |
| **모바일/태블릿** | 화면 좌우 스와이프 (Touch Swipe) | 아이패드, 갤럭시탭 등에서 터치 제스처로 넘김 |

---

## 📝 수시 업데이트 방법 (새 문서/강의 자료 추가 3단계)

새로운 PPT나 PDF 자료가 완성되었을 때 1분 만에 웹사이트에 반영하는 방법입니다.

### 1단계: 공개용 파일 넣기
새로운 파일(예: `새세미나_v1.0.pptx`, `브로슈어.pdf` 등)을 `docs/` 폴더에 복사합니다:
```
c:\Users\kty50\OneDrive\lremettre-hub\docs\
```

### 2단계: `data/resources.json`에 한 줄 추가
`data/resources.json` 파일의 배열(`[ ... ]`) 안에 새 자료 정보를 추가합니다:
```json
{
  "id": "new-seminar-2026",
  "category": "presentation",
  "category_name": "프레젠테이션 & 강의",
  "title": "2026 르메뜨레 웰니스 비즈니스 세미나",
  "subtitle": "세미나 핵심 부제",
  "version": "v1.0",
  "date": "2026-10-15",
  "badge": "NEW",
  "tags": ["세미나", "웰니스", "피치덱"],
  "description": "세미나에 대한 간략한 설명...",
  "downloads": {
    "pptx": {
      "url": "docs/새세미나_v1.0.pptx",
      "name": "새세미나_v1.0.pptx",
      "size": "5.2 MB"
    }
  }
}
```

---

## 🌐 GitHub Pages에 무료 배포하는 방법 (평생 유지비 $0)

1. [GitHub](https://github.com/)에 로그인 후, 새 리포지토리(New Repository)를 생성합니다.
   - Repository name: `lremettre-hub` (Public 권장)
2. `lremettre-hub` 폴더에서 Git 초기화 및 첫 커밋을 푸시합니다:
   ```bash
   cd c:\Users\kty50\OneDrive\lremettre-hub
   git init
   git add .
   git commit -m "feat: 르메뜨레 공식 아카이브 허브 및 리더십 마스터클래스 16슬라이드 런칭"
   git branch -M main
   git remote add origin https://github.com/[깃허브_아이디]/lremettre-hub.git
   git push -u origin main
   ```
3. GitHub 저장소의 **Settings** → **Pages** 메뉴로 이동합니다.
   - **Build and deployment** > **Source** 항목을 **`GitHub Actions`**로 선택합니다.
4. 약 1분 후 배포가 완료되면 전 세계 어디서든 접속 가능한 무료 공식 주소가 생성됩니다:
   - `https://[깃허브_아이디].github.io/lremettre-hub/`
