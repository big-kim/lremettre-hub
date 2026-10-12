/**
 * 르메뜨레 디지털 아카이브 허브 (L.REMETTRE Hub Main Controller)
 * 딥블랙 + 딥오렌지 + 골드 럭셔리 디자인 시스템
 */

(function () {
  'use strict';

  let resourcesData = [];
  let currentCategory = 'all';
  let searchQuery = '';

  const gridContainer = document.getElementById('resources-grid');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');

  /**
   * 1. 데이터 로드 (캐시 방지 파라미터 적용)
   */
  async function loadResources() {
    try {
      const response = await fetch(`data/resources.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      resourcesData = await response.json();
      renderResources();
    } catch (err) {
      console.warn('Failed to fetch JSON, falling back:', err);
    }
  }

  /**
   * 2. 파일 타입별 아이콘 및 레이블 헬퍼
   */
  function getDownloadBtnHtml(type, fileInfo) {
    let icon = '💾';
    let label = type.toUpperCase();

    if (type === 'pptx' || type === 'ppt') {
      icon = '📊';
      label = '파워포인트 (PPTX)';
    } else if (type === 'pdf') {
      icon = '📄';
      label = 'PDF 문서';
    } else if (type === 'excel' || type === 'xlsx' || type === 'xls') {
      icon = '📑';
      label = '엑셀 (Excel)';
    } else if (type === 'word' || type === 'docx') {
      icon = '📝';
      label = '워드 (Word)';
    } else if (type === 'image' || type === 'png' || type === 'jpg') {
      icon = '🖼️';
      label = '고화질 이미지';
    }

    return `
      <a href="${fileInfo.url}" class="btn-download-pill" download="${fileInfo.name}" target="_blank" title="${fileInfo.name} 다운로드">
        <span>${icon}</span> ${label} (${fileInfo.size})
      </a>
    `;
  }

  /**
   * 3. 자료 카드 렌더링
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
        <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: rgba(19, 23, 34, 0.7); border-radius: 20px; border: 1.5px dashed rgba(255, 255, 255, 0.1);">
          <p style="font-size: 32px; margin-bottom: 10px;">🔍</p>
          <h3 style="font-size: 19px; color: #FFFFFF; margin-bottom: 6px;">일치하는 공식 자료가 없습니다</h3>
          <p style="font-size: 14px; color: #94A3B8;">다른 검색어를 입력하시거나 카테고리 필터를 변경해 보세요.</p>
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

        // 다운로드 버튼 동적 생성
        let downloadBtnsHtml = '';
        if (item.downloads) {
          const btns = Object.entries(item.downloads).map(([type, fileInfo]) => {
            return getDownloadBtnHtml(type, fileInfo);
          });
          downloadBtnsHtml = `<div class="card-download-group">${btns.join('')}</div>`;
        }

        // 웹 프레젠테이션 URL 자동 fallback (전용 덱이 없어도 PDF가 있으면 viewer.html 연결)
        const webDeckUrl = item.web_deck_url || (item.downloads && item.downloads.pdf ? `viewer.html?file=${encodeURIComponent(item.downloads.pdf.url)}&title=${encodeURIComponent(item.title)}` : null);

        const launchBtn = webDeckUrl
          ? `<a href="${webDeckUrl}" class="btn-deck-launch" target="_blank" title="인터넷 브라우저에서 바로 발표하기">
              <span>🚀</span> 라이브 웹 프레젠테이션 시작 (16:9 와이드)
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
              ${downloadBtnsHtml}
            </div>
          </article>
        `;
      })
      .join('');
  }

  /**
   * 4. 카테고리 필터 이벤트
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
   * 5. 검색창 이벤트
   */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderResources();
    });
  }

  // 초기 로드
  loadResources();
})();
