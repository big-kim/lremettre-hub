/**
 * 르메뜨레 디지털 아카이브 허브 (L.REMETTRE Hub Main Controller)
 * 콘셉트 1: 시네마틱 라이브 스테이지 (Apple Keynote & Vercel Style)
 * 딥 블랙 + 딥 오렌지 + 골드 럭셔리 하이엔드 테마
 */

(function () {
  'use strict';

  let resourcesData = [];
  let currentCategory = 'all';
  let searchQuery = '';

  const gridContainer = document.getElementById('resources-grid');
  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // 히어로 라이브 스테이지 요소
  const stageCanvas = document.getElementById('stage-canvas');
  const stagePrevBtn = document.getElementById('stage-prev-btn');
  const stageNextBtn = document.getElementById('stage-next-btn');
  const stageCurrentIdx = document.getElementById('stage-current-idx');
  const stageTotalIdx = document.getElementById('stage-total-idx');
  const stageProgressFill = document.getElementById('stage-progress-fill');
  const tabDeckLeadership = document.getElementById('tab-deck-leadership');
  const tabDeckReboom = document.getElementById('tab-deck-reboom');
  const btnTopLaunch = document.getElementById('btn-top-launch');
  const heroMainCta = document.getElementById('hero-main-cta');

  let currentDeck = 'leadership'; // 'leadership' | 'reboom'
  let currentSlideIdx = 0;
  const leadershipSlides = window.LEADERSHIP_SLIDES || [];

  const REBOOM_PDF_URL = 'docs/01_%ED%94%84%EB%A0%88%EC%A0%A0%ED%85%8C%EC%9D%B4%EC%85%98_%EA%B0%95%EC%9D%98/250720_%EB%A5%B4%EB%A9%94%EB%94%A8%EB%A5%B4_REBOOM_%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_%ED%94%84%EB%A0%88%EC%A0%A0%ED%85%8C%EC%9D%B4%EC%85%98.pdf';
  const REBOOM_VIEWER_URL = `viewer.html?file=${encodeURIComponent(REBOOM_PDF_URL)}&title=${encodeURIComponent('르메뜨레 REBOOM 프로젝트 프레젠테이션')}`;

  /**
   * ==========================================================================
   * 1. 히어로 라이브 스테이지 (THE CINEMATIC LIVE STAGE)
   * ==========================================================================
   */

  function renderLeadershipSlide(index) {
    if (!stageCanvas || !leadershipSlides.length) return;

    const slide = leadershipSlides[index];
    if (!slide) return;

    if (slide.type === 'cover') {
      stageCanvas.innerHTML = `
        <div class="stage-slide-view active slide-cover-layout">
          <img src="assets/logo/lremettre_emblem.png" alt="L.REMETTRE" class="cover-brand-symbol">
          <div class="cover-super-pill">
            <span>✨</span> ${slide.tag || 'L.REMETTRE LEADERSHIP MASTERCLASS'}
          </div>
          <h3 class="cover-title">
            ${(slide.title || '').replace(/\n/g, '<br>')}
          </h3>
          <p class="cover-subtitle">
            ${slide.subtitle || ''}
          </p>
          ${slide.quote ? `
            <div class="cover-quote-box">
              <span>“</span> ${slide.quote} <span>”</span>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Split / Content layout
      const cardLeft = slide.card_left || {};
      const cardRight = slide.card_right || {};

      stageCanvas.innerHTML = `
        <div class="stage-slide-view active">
          <div>
            <div class="slide-top-meta">
              <span class="slide-tag-pill">${slide.tag || 'LEADERSHIP INSIGHT'}</span>
              <span style="font-size: 11.5px; font-weight: 700; color: var(--gold-bright); letter-spacing: 1px;">
                PART ${slide.index} OF ${leadershipSlides.length}
              </span>
            </div>
            <h3 class="slide-headline">${(slide.title || '').replace(/\n/g, ' ')}</h3>
            <p class="slide-lead-copy">${slide.subtitle || ''}</p>
          </div>

          <div class="slide-cards-split">
            <div class="slide-mini-card ${cardLeft.badge_color || 'danger'}">
              <div>
                <div class="card-badge-mini text-${cardLeft.badge_color || 'danger'}">
                  ${cardLeft.badge || 'POINT A'}
                </div>
                <div class="card-quote-mini">${cardLeft.quote || ''}</div>
                <div class="card-body-mini">${cardLeft.body || ''}</div>
              </div>
              ${cardLeft.result ? `
                <div class="card-result-pill-mini">
                  ${cardLeft.result}
                </div>
              ` : ''}
            </div>

            <div class="slide-mini-card ${cardRight.badge_color || 'success'}">
              <div>
                <div class="card-badge-mini text-${cardRight.badge_color || 'success'}">
                  ${cardRight.badge || 'POINT B'}
                </div>
                <div class="card-quote-mini">${cardRight.quote || ''}</div>
                <div class="card-body-mini">${cardRight.body || ''}</div>
              </div>
              ${cardRight.result ? `
                <div class="card-result-pill-mini pill-gold">
                  ${cardRight.result}
                </div>
              ` : ''}
            </div>
          </div>

          ${slide.quote ? `
            <div class="slide-ethos-footer">
              <strong>CORE ETHOS</strong>
              <span>“${slide.quote}”</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    // UI 인디케이터 업데이트
    if (stageCurrentIdx) stageCurrentIdx.textContent = String(index + 1).padStart(2, '0');
    if (stageTotalIdx) stageTotalIdx.textContent = String(leadershipSlides.length).padStart(2, '0');
    if (stageProgressFill) {
      const pct = ((index + 1) / leadershipSlides.length) * 100;
      stageProgressFill.style.width = `${pct}%`;
    }
  }

  function renderReboomSlide() {
    if (!stageCanvas) return;

    stageCanvas.innerHTML = `
      <div class="stage-slide-view active stage-reboom-view">
        <div class="reboom-grid">
          <div class="reboom-preview-card">
            <span class="reboom-meta-badge">OFFICIAL PRESENTATION DECK</span>
            <h3 class="reboom-card-title">르메뜨레 REBOOM 프로젝트</h3>
            <p class="reboom-card-desc">
              새로운 시대, 웰니스 비즈니스의 완벽한 재도약과 차세대 성장 엔진을 담은 공식 프레젠테이션 피치덱입니다. 총 19장의 고화질 슬라이드를 브라우저에서 바로 시네마틱 와이드로 발표할 수 있습니다.
            </p>
            <ul class="reboom-features-list">
              <li><span>✓</span> 비전 & 비즈니스 철학 패러다임</li>
              <li><span>✓</span> 차세대 보상 구조 및 파트너십 로드맵</li>
              <li><span>✓</span> 프리미엄 프로덕트 라인업 및 임상 성과</li>
            </ul>
          </div>

          <div class="reboom-action-box">
            <h4>💡 실시간 프레젠테이션</h4>
            <p>PDF 설치 없이 F11 전체화면으로 즉시 발표</p>
            <a href="${REBOOM_VIEWER_URL}" target="_blank" class="btn-primary-glow" style="padding: 12px 28px; font-size: 14.5px;">
              <span>🚀</span> REBOOM 발표 시작
            </a>
            <a href="${REBOOM_PDF_URL}" download class="btn-download-pill" style="margin-top: 4px;">
              <span>💾</span> 원본 PDF 다운로드 (13.7 MB)
            </a>
          </div>
        </div>

        <div class="slide-ethos-footer">
          <strong>PROJECT BRIEF</strong>
          <span>“도약하는 르메뜨레의 비전과 비즈니스 로드맵을 완벽하게 전달하는 공식 무대”</span>
        </div>
      </div>
    `;

    if (stageCurrentIdx) stageCurrentIdx.textContent = '01';
    if (stageTotalIdx) stageTotalIdx.textContent = '19';
    if (stageProgressFill) stageProgressFill.style.width = '100%';
  }

  function updateDeckState(deck) {
    currentDeck = deck;
    if (deck === 'leadership') {
      if (tabDeckLeadership) tabDeckLeadership.classList.add('active');
      if (tabDeckReboom) tabDeckReboom.classList.remove('active');
      if (btnTopLaunch) {
        btnTopLaunch.href = 'presentation.html';
        btnTopLaunch.innerHTML = '<span>⛶</span> 전체화면 발표 ↗';
      }
      if (heroMainCta) {
        heroMainCta.href = 'presentation.html';
        heroMainCta.innerHTML = '<span>🚀</span> 프레젠테이션 시작';
      }
      if (stagePrevBtn) stagePrevBtn.style.visibility = 'visible';
      if (stageNextBtn) stageNextBtn.style.visibility = 'visible';
      renderLeadershipSlide(currentSlideIdx);
    } else {
      if (tabDeckLeadership) tabDeckLeadership.classList.remove('active');
      if (tabDeckReboom) tabDeckReboom.classList.add('active');
      if (btnTopLaunch) {
        btnTopLaunch.href = REBOOM_VIEWER_URL;
        btnTopLaunch.innerHTML = '<span>⛶</span> REBOOM 발표 ↗';
      }
      if (heroMainCta) {
        heroMainCta.href = REBOOM_VIEWER_URL;
        heroMainCta.innerHTML = '<span>🚀</span> REBOOM 발표 시작';
      }
      if (stagePrevBtn) stagePrevBtn.style.visibility = 'hidden';
      if (stageNextBtn) stageNextBtn.style.visibility = 'hidden';
      renderReboomSlide();
    }
  }

  function initHeroLiveStage() {
    if (!stageCanvas) return;

    // 탭 이벤트
    if (tabDeckLeadership) {
      tabDeckLeadership.addEventListener('click', () => updateDeckState('leadership'));
    }
    if (tabDeckReboom) {
      tabDeckReboom.addEventListener('click', () => updateDeckState('reboom'));
    }

    // 슬라이드 이전/다음
    if (stagePrevBtn) {
      stagePrevBtn.addEventListener('click', () => {
        if (currentDeck !== 'leadership' || !leadershipSlides.length) return;
        currentSlideIdx = (currentSlideIdx - 1 + leadershipSlides.length) % leadershipSlides.length;
        renderLeadershipSlide(currentSlideIdx);
      });
    }

    if (stageNextBtn) {
      stageNextBtn.addEventListener('click', () => {
        if (currentDeck !== 'leadership' || !leadershipSlides.length) return;
        currentSlideIdx = (currentSlideIdx + 1) % leadershipSlides.length;
        renderLeadershipSlide(currentSlideIdx);
      });
    }

    // 키보드 이벤트 (방향키로 슬라이드 넘기기)
    window.addEventListener('keydown', (e) => {
      // 텍스트 인풋 포커스 중에는 제외
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      if (currentDeck === 'leadership' && leadershipSlides.length) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          currentSlideIdx = (currentSlideIdx + 1) % leadershipSlides.length;
          renderLeadershipSlide(currentSlideIdx);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          currentSlideIdx = (currentSlideIdx - 1 + leadershipSlides.length) % leadershipSlides.length;
          renderLeadershipSlide(currentSlideIdx);
        }
      }
    });

    // 초기 렌더링
    updateDeckState('leadership');
  }

  /**
   * ==========================================================================
   * 2. 자료실 카탈로그 (RESOURCE ARCHIVE CATALOG)
   * ==========================================================================
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

  function getDownloadBtnHtml(type, fileInfo) {
    let icon = '💾';
    let label = type.toUpperCase();

    if (type === 'pptx' || type === 'ppt') {
      icon = '📊';
      label = 'PPTX';
    } else if (type === 'pdf') {
      icon = '📄';
      label = 'PDF';
    } else if (type === 'excel' || type === 'xlsx' || type === 'xls') {
      icon = '📑';
      label = 'Excel';
    } else if (type === 'word' || type === 'docx') {
      icon = '📝';
      label = 'Word';
    } else if (type === 'image' || type === 'png' || type === 'jpg') {
      icon = '🖼️';
      label = 'Image';
    }

    return `
      <a href="${fileInfo.url}" class="btn-download-pill" download="${fileInfo.name}" target="_blank" title="${fileInfo.name} 다운로드">
        <span>${icon}</span> <span>${label}</span> <span class="file-size">${fileInfo.size}</span>
      </a>
    `;
  }

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
        <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: rgba(14, 18, 28, 0.7); border-radius: 20px; border: 1.5px dashed rgba(255, 255, 255, 0.1);">
          <p style="font-size: 32px; margin-bottom: 10px;">🔍</p>
          <h3 style="font-size: 19px; color: #FFFFFF; margin-bottom: 6px;">일치하는 공식 자료가 없습니다</h3>
          <p style="font-size: 14px; color: #94A3B8;">다른 검색어를 입력하시거나 카테고리 필터를 변경해 보세요.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered
      .map((item) => {
        let downloadBtnsHtml = '';
        if (item.downloads) {
          const btns = Object.entries(item.downloads).map(([type, fileInfo]) => {
            return getDownloadBtnHtml(type, fileInfo);
          });
          downloadBtnsHtml = `<div class="card-download-group">${btns.join('')}</div>`;
        }

        let webDeckUrl = item.web_deck_url;
        if (!webDeckUrl && item.downloads) {
          if (item.downloads.pdf) {
            webDeckUrl = `viewer.html?file=${encodeURIComponent(item.downloads.pdf.url)}&title=${encodeURIComponent(item.title)}`;
          } else if (item.downloads.pptx) {
            const rawUrl = window.location.origin + window.location.pathname.replace('index.html', '') + item.downloads.pptx.url;
            webDeckUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(rawUrl)}`;
          }
        }

        const launchBtn = webDeckUrl
          ? `<a href="${webDeckUrl}" class="btn-deck-launch" target="_blank" title="인터넷 브라우저에서 바로 발표하기">
              <span>🚀</span> 프레젠테이션 시작
            </a>`
          : (item.downloads && (item.downloads.pptx || item.downloads.pdf)
              ? `<a href="${(item.downloads.pptx || item.downloads.pdf).url}" class="btn-deck-launch" target="_blank" title="프레젠테이션 열기">
                  <span>🚀</span> 프레젠테이션 시작
                </a>`
              : '');

        // 16:9 썸네일 그래픽 설정
        const badgeText = item.badge || item.category_name;
        const pageCountBadge = item.slide_count ? `${item.slide_count}P` : (item.version || 'v1.0');

        return `
          <article class="resource-card" id="card-${item.id}">
            <!-- 16:9 Thumbnail Stage Header -->
            <div class="card-thumb-container">
              <div class="card-thumb-aspect">
                <div class="card-thumb-bg">
                  <img src="assets/logo/lremettre_emblem.png" alt="L.ReMeTTRE" class="thumb-watermark">
                  <div class="thumb-center-badge">
                    <span class="thumb-glow-icon">${item.category === 'presentation' ? '📽️' : '📑'}</span>
                    <span class="thumb-deck-type">16:9 WIDESCREEN</span>
                  </div>
                </div>

                <div class="card-thumb-top-meta">
                  <span class="card-category-badge">${badgeText}</span>
                  <span class="card-version-tag">${pageCountBadge}</span>
                </div>

                ${webDeckUrl ? `
                  <a href="${webDeckUrl}" class="card-thumb-hover-link" target="_blank" title="클릭 시 프레젠테이션 바로보기">
                    <div class="hover-play-circle">
                      <span>▶</span>
                    </div>
                    <span class="hover-play-label">프레젠테이션 시작</span>
                  </a>
                ` : ''}
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="card-body-compact">
              <h3 class="card-title" title="${item.title}">${item.title}</h3>
              ${item.subtitle ? `<div class="card-subtitle" title="${item.subtitle}">${item.subtitle}</div>` : ''}
              <p class="card-description">${item.description}</p>
            </div>

            <!-- Card Footer: Actions -->
            <div class="card-footer-compact">
              ${launchBtn}
              ${downloadBtnsHtml}
            </div>
          </article>
        `;
      })
      .join('');
  }

  // 필터 탭 이벤트
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderResources();
    });
  });

  // 검색 인풋 이벤트
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderResources();
    });
  }

  // 초기화 실행
  initHeroLiveStage();
  loadResources();
})();
