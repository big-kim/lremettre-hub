/**
 * 르메뜨레 디지털 아카이브 허브 (L.REMETTRE Hub Main Controller)
 */

(function () {
  'use strict';

  let resourcesData = [];
  let currentCategory = 'all';
  let searchQuery = '';

  const gridContainer = document.getElementById('resources-grid');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const guideModal = document.getElementById('guide-modal');
  const openGuideBtn = document.getElementById('btn-open-guide');
  const closeGuideBtn = document.getElementById('btn-close-guide');
  const modalCloseCross = document.getElementById('modal-close-cross');

  /**
   * 1. 데이터 로드
   */
  async function loadResources() {
    try {
      const response = await fetch('data/resources.json');
      if (!response.ok) throw new Error('Network response was not ok');
      resourcesData = await response.json();
      renderResources();
    } catch (err) {
      console.warn('Failed to fetch JSON, using fallback data:', err);
      // 로컬 파일시스템(file://) 프로토콜로 직접 열었을 때 CORS 에러 대비 폴백 데이터
      resourcesData = [
        {
          id: "leadership-v11",
          category: "presentation",
          category_name: "프레젠테이션 & 강의",
          title: "변화하는 시대, 리더십의 진짜 온도",
          subtitle: "앞장서서 빨리 갈 것인가, 함께 끝까지 갈 것인가",
          version: "v1.1",
          date: "2026-10-12",
          badge: "NEW MASTERCLASS",
          tags: ["리더십", "마스터클래스", "16슬라이드", "유정환교수"],
          description: "르메뜨레 비즈니스 그룹의 코어 에토스(Core Ethos)를 담은 16개 핵심 슬라이드 프레젠테이션입니다. 독선적 속도전에서 벗어나 구성원과 함께 끝까지 완주하는 진짜 리더십의 온도, 스티브 잡스의 실수와 성찰, 크루즈선 시스템, 티업(Tee-Up) 문화, 과학적 원리 기반 신뢰 마케팅을 다룹니다.",
          key_points: [
            "16:9 와이드스크린 시네마틱 프레젠테이션 완비 (F11 풀스크린 지원)",
            "화이트 에디션 ☀️ / 옵시디언 다크 에디션 🌙 원클릭 실시간 전환",
            "각 슬라이드별 핵심 대조 카드(레드/그린/골드) 및 코어 명언 탑재",
            "웹 브라우저 즉시 재생 + 네이티브 PPTX/PDF 원클릭 다운로드"
          ],
          author: "유정환 교수 / L.REMETTRE",
          slide_count: 16,
          web_deck_url: "presentation.html",
          downloads: {
            pptx: {
              url: "docs/leadership-temperature-v1.1.pptx",
              name: "변화하는시대_리더십의진짜온도_v1.1.pptx",
              size: "3.7 MB"
            },
            pdf: {
              url: "docs/leadership-temperature-v1.0.pdf",
              name: "변화하는시대_리더십의진짜온도_v1.0.pdf",
              size: "1.1 MB"
            }
          }
        }
      ];
      renderResources();
    }
  }

  /**
   * 2. 자료 카드 렌더링
   */
  function renderResources() {
    if (!gridContainer) return;

    const filtered = resourcesData.filter((item) => {
      const matchCategory = currentCategory === 'all' || item.category === currentCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed #E8E2D2;">
          <p style="font-size: 24px; margin-bottom: 8px;">🔍</p>
          <h3 style="font-size: 18px; color: #0F172A; margin-bottom: 6px;">일치하는 자료가 없습니다</h3>
          <p style="font-size: 14px; color: #64748B;">다른 검색어를 입력하시거나 카테고리 필터를 변경해 보세요.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered
      .map((item) => {
        const keypointsHtml = item.key_points
          ? `<ul class="card-keypoints">
              ${item.key_points.map((kp) => `<li>${kp}</li>`).join('')}
            </ul>`
          : '';

        const pptxBtn = item.downloads && item.downloads.pptx
          ? `<a href="${item.downloads.pptx.url}" class="btn-download-pill" download="${item.downloads.pptx.name}" title="파워포인트 원본 다운로드">
              <span>📊</span> PPTX (${item.downloads.pptx.size})
            </a>`
          : '';

        const pdfBtn = item.downloads && item.downloads.pdf
          ? `<a href="${item.downloads.pdf.url}" class="btn-download-pill" download="${item.downloads.pdf.name}" target="_blank" title="PDF 문서 보기/다운로드">
              <span>📄</span> PDF (${item.downloads.pdf.size})
            </a>`
          : '';

        const launchBtn = item.web_deck_url
          ? `<a href="${item.web_deck_url}" class="btn-deck-launch" target="_blank" title="인터넷 브라우저에서 바로 발표하기">
              <span>🚀</span> 라이브 웹 프레젠테이션 시작 (16:9)
            </a>`
          : '';

        return `
          <article class="resource-card" id="card-${item.id}">
            <div>
              <div class="card-top">
                <span class="card-category-badge">${item.category_name}</span>
                <span class="card-version-tag">${item.version} · ${item.date}</span>
              </div>
              <h3 class="card-title">${item.title}</h3>
              ${item.subtitle ? `<div class="card-subtitle">${item.subtitle}</div>` : ''}
              <p class="card-description">${item.description}</p>
              ${keypointsHtml}
            </div>

            <div class="card-footer">
              ${launchBtn}
              <div class="card-download-group">
                ${pptxBtn}
                ${pdfBtn}
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  /**
   * 3. 카테고리 필터 이벤트
   */
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderResources();
    });
  });

  /**
   * 4. 검색창 이벤트
   */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderResources();
    });
  }

  /**
   * 5. 가이드 모달 제어
   */
  function openModal() {
    guideModal.classList.add('open');
  }

  function closeModal() {
    guideModal.classList.remove('open');
  }

  if (openGuideBtn) openGuideBtn.addEventListener('click', openModal);
  if (closeGuideBtn) closeGuideBtn.addEventListener('click', closeModal);
  if (modalCloseCross) modalCloseCross.addEventListener('click', closeModal);
  if (guideModal) {
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) closeModal();
    });
  }

  // 초기 로드
  loadResources();
})();
