#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
르메뜨레(L.REMETTRE) 공식 자료실 자동 동기화 엔진
docs/ 하위 폴더의 모든 문서와 자료를 자동으로 스캔하여 data/resources.json을 갱신합니다.
"""

import os
import re
import json
import datetime
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(SCRIPT_DIR, "docs")
OUTPUT_JSON = os.path.join(SCRIPT_DIR, "data", "resources.json")

# 폴더명 매핑 규칙
CATEGORY_MAP = {
    "01_프레젠테이션_강의": {"category": "presentation", "name": "프레젠테이션 & 강의", "badge": "강의/발표"},
    "presentations": {"category": "presentation", "name": "프레젠테이션 & 강의", "badge": "강의/발표"},
    "02_제품_시험성적서": {"category": "certificate", "name": "제품 시험성적서", "badge": "공식인증"},
    "certificates": {"category": "certificate", "name": "제품 시험성적서", "badge": "공식인증"},
    "03_홍보_브로슈어": {"category": "brochure", "name": "홍보 & 브로슈어", "badge": "브랜드홍보"},
    "brochures": {"category": "brochure", "name": "홍보 & 브로슈어", "badge": "브랜드홍보"},
    "04_공식_서식": {"category": "forms", "name": "공식 서식", "badge": "업무양식"},
    "forms": {"category": "forms", "name": "공식 서식", "badge": "업무양식"},
}

def format_size(bytes_size):
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    else:
        return f"{bytes_size / (1024 * 1024):.1f} MB"

def extract_version(text):
    match = re.search(r'(v\d+(\.\d+)?|\d{4}\.\d{2}|\d{6})', text, re.IGNORECASE)
    return match.group(1) if match else "v1.0"

def clean_title(filename):
    base, _ = os.path.splitext(filename)
    # 불필요한 접두/접미 정리
    cleaned = base.replace('_', ' ').replace('-', ' ').strip()
    return cleaned

def scan_docs():
    if not os.path.exists(DOCS_DIR):
        print(f"Docs folder not found: {DOCS_DIR}")
        return []

    # 기존 resources.json 이 있다면 커스텀 메타데이터(설명문, 키포인트, web_deck_url 등) 보존
    existing_meta = {}
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    if 'id' in item:
                        existing_meta[item['id']] = item
        except Exception as e:
            print(f"Warning: Could not read existing json: {e}")

    # 리더십 강의 기본 프리셋
    existing_meta['leadership-masterclass'] = {
        "title": "변화하는 시대, 리더십의 진짜 온도",
        "subtitle": "앞장서서 빨리 갈 것인가, 함께 끝까지 갈 것인가",
        "badge": "NEW MASTERCLASS",
        "web_deck_url": "presentation.html",
        "slide_count": 16,
        "author": "유정환 교수 / L.REMETTRE",
        "description": "르메뜨레 비즈니스 그룹의 코어 에토스(Core Ethos)를 담은 16개 핵심 슬라이드 프레젠테이션입니다. 독선적 속도전에서 벗어나 구성원과 함께 끝까지 완주하는 진짜 리더십의 온도, 스티브 잡스의 실수와 성찰, 크루즈선 시스템, 티업(Tee-Up) 문화, 과학적 원리 기반 신뢰 마케팅을 다룹니다.",
        "key_points": [
            "16:9 와이드스크린 시네마틱 프레젠테이션 완비 (F11 풀스크린 지원)",
            "화이트 에디션 ☀️ / 옵시디언 다크 에디션 🌙 원클릭 실시간 전환",
            "각 슬라이드별 핵심 대조 카드(레드/그린/골드) 및 코어 명언 탑재",
            "웹 브라우저 즉시 재생 + 네이티브 PPTX/PDF 원클릭 다운로드"
        ]
    }

    # REBOOM 프로젝트 프리셋
    existing_meta['presentation-REBOOM프로젝트PPT'] = {
        "title": "REBOOM 프로젝트 공식 프레젠테이션",
        "subtitle": "르메뜨레 REBOOM 혁신 프로젝트 기획 및 실행 전략",
        "badge": "NEW DECK",
        "author": "L.REMETTRE BUSINESS GROUP",
        "description": "르메뜨레의 신규 성장 동력 및 비즈니스 비전을 담은 REBOOM 프로젝트 공식 발표 자료입니다. 브라우저에서 바로 열어 F11 풀스크린으로 발표할 수 있습니다.",
        "key_points": [
            "16:9 와이드스크린 시네마틱 프레젠테이션 지원 (F11 풀스크린)",
            "방향키(←, →) 및 터치 제스처 슬라이드 넘김 완비",
            "화이트/다크 배경 테마 실시간 토글 지원",
            "고화질 공식 PDF 원본 즉시 다운로드 제공"
        ]
    }

    # 헬쯔백 B2B 프리셋
    existing_meta['presentation-주헬쯔백B2B발표PPT'] = {
        "title": "(주)헬쯔백 B2B 파트너십 프레젠테이션",
        "subtitle": "헬쯔백 비즈니스 제안 및 B2B 협업 실행 전략",
        "badge": "B2B DECK",
        "author": "L.REMETTRE BUSINESS GROUP",
        "description": "르메뜨레와 (주)헬쯔백 간의 B2B 파트너십 구축 및 유통 확장을 위한 공식 비즈니스 피치덱입니다. 웹 브라우저에서 실시간으로 발표할 수 있습니다.",
        "key_points": [
            "16:9 와이드스크린 시네마틱 프레젠테이션 지원 (F11)",
            "헬쯔백 B2B 비즈니스 모델 및 유통 로드맵 수록",
            "공식 고화질 PDF 원본 즉시 다운로드 제공"
        ]
    }

    # 오크라 PPT 프리셋
    existing_meta['presentation-오크라PPT'] = {
        "title": "르메뜨레 오크라(Okra) 제품 프레젠테이션",
        "subtitle": "식물성 뮤신 오크라 핵심 원료 및 제품 라인업",
        "badge": "PRODUCT DECK",
        "author": "L.REMETTRE R&D / PRODUCT GROUP",
        "description": "식물성 뮤신이 풍부한 오크라 원료의 핵심 메커니즘과 르메뜨레 프리미엄 제품 라인업을 소개하는 공식 제품 프레젠테이션입니다.",
        "key_points": [
            "16:9 와이드스크린 시네마틱 프레젠테이션 지원 (F11)",
            "오크라 핵심 원료 효능 및 제품 경쟁력 수록",
            "공식 고화질 PDF 원본 즉시 다운로드 제공"
        ]
    }

    resources = []
    groups = {}

    for root, dirs, files in os.walk(DOCS_DIR):
        if root == DOCS_DIR:
            continue
        rel_folder = os.path.relpath(root, DOCS_DIR)
        top_folder = rel_folder.split(os.sep)[0]

        cat_info = CATEGORY_MAP.get(top_folder, {
            "category": "etc",
            "name": top_folder,
            "badge": "일반자료"
        })

        for fname in files:
            # 숨김 파일이나 임시 파일 무시
            if fname.startswith('.') or fname.startswith('~$'):
                continue

            file_path = os.path.join(root, fname)
            rel_file_path = os.path.relpath(file_path, SCRIPT_DIR).replace('\\', '/')
            ext = os.path.splitext(fname)[1].lower()

            if ext not in ['.pptx', '.ppt', '.pdf', '.xlsx', '.xls', '.docx', '.png', '.jpg', '.jpeg', '.mp4']:
                continue

            file_size = os.path.getsize(file_path)
            size_str = format_size(file_size)
            mtime = os.path.getmtime(file_path)
            date_str = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")

            # 그룹 키 생성 (리더십 강의 파일 등 동일 시리즈 묶기)
            stem = os.path.splitext(fname)[0]
            if "leadership" in stem.lower() or "리더십" in stem:
                group_key = "leadership-masterclass"
            else:
                # 일반 파일은 파일명을 기반으로 고유 키
                clean_key = re.sub(r'[^a-zA-Z0-9가-힣]', '', stem)
                group_key = f"{cat_info['category']}-{clean_key}"

            if group_key not in groups:
                groups[group_key] = {
                    "id": group_key,
                    "category": cat_info["category"],
                    "category_name": cat_info["name"],
                    "badge": cat_info["badge"],
                    "date": date_str,
                    "version": extract_version(fname),
                    "files": {},
                    "primary_name": clean_title(fname)
                }

            # 파일 타입별 등록
            if ext in ['.pptx', '.ppt']:
                groups[group_key]["files"]["pptx"] = {
                    "url": rel_file_path,
                    "name": fname,
                    "size": size_str
                }
            elif ext == '.pdf':
                groups[group_key]["files"]["pdf"] = {
                    "url": rel_file_path,
                    "name": fname,
                    "size": size_str
                }
            elif ext in ['.xlsx', '.xls']:
                groups[group_key]["files"]["excel"] = {
                    "url": rel_file_path,
                    "name": fname,
                    "size": size_str
                }
            elif ext in ['.png', '.jpg', '.jpeg']:
                groups[group_key]["files"]["image"] = {
                    "url": rel_file_path,
                    "name": fname,
                    "size": size_str
                }
            elif ext == '.docx':
                groups[group_key]["files"]["word"] = {
                    "url": rel_file_path,
                    "name": fname,
                    "size": size_str
                }

    # 최종 결과 빌드
    for gid, ginfo in groups.items():
        # 기존 메타데이터가 있으면 우선 적용
        preset = existing_meta.get(gid, {})

        title = preset.get("title", ginfo["primary_name"])
        subtitle = preset.get("subtitle", "")
        badge = preset.get("badge", ginfo["badge"])
        desc = preset.get("description", f"{ginfo['category_name']} 공식 자료입니다. 브라우저에서 열람하거나 다운로드하여 프레젠테이션 및 업무에 활용하세요.")
        key_points = preset.get("key_points", [
            f"공식 파일 포맷 지원: {', '.join([k.upper() for k in ginfo['files'].keys()])}",
            f"최신 업데이트 일자: {ginfo['date']}",
            "인터넷 연결 환경에서 원클릭 조회 및 다운로드 가능"
        ])

        item = {
            "id": gid,
            "category": ginfo["category"],
            "category_name": ginfo["category_name"],
            "title": title,
            "subtitle": subtitle,
            "version": ginfo["version"],
            "date": ginfo["date"],
            "badge": badge,
            "tags": [ginfo["category_name"], ginfo["version"]],
            "description": desc,
            "key_points": key_points,
            "downloads": ginfo["files"]
        }

        if "web_deck_url" in preset:
            item["web_deck_url"] = preset["web_deck_url"]
        elif "pdf" in ginfo["files"]:
            encoded_pdf = urllib.parse.quote(ginfo["files"]["pdf"]["url"])
            encoded_title = urllib.parse.quote(title)
            item["web_deck_url"] = f"viewer.html?file={encoded_pdf}&title={encoded_title}"

        if "author" in preset:
            item["author"] = preset["author"]
        if "slide_count" in preset:
            item["slide_count"] = preset["slide_count"]

        resources.append(item)

    # 정렬: 프레젠테이션 우선, 그 다음 최신순
    resources.sort(key=lambda x: (0 if x["category"] == "presentation" else 1, x["date"]), reverse=False)

    # JSON 저장
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(resources, f, ensure_ascii=False, indent=2)

    print(f"Successfully synced {len(resources)} resources to {OUTPUT_JSON}")
    for r in resources:
        print(f" - [{r['category_name']}] {r['title']} ({len(r['downloads'])} files)")

if __name__ == '__main__':
    scan_docs()
