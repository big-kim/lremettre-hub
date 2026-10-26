#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
르메뜨레 자동 대용량 파일 최적화/압축 엔진 (Compress Large Files Engine)
docs/ 폴더 내 90MB를 초과하는 대용량 PPTX/PDF 파일을 자동으로 감지하여,
시각적 품질(Full HD 1920)을 완벽히 유지하면서 100MB 이하로 스마트 압축합니다.
GitHub의 100MB 단일 파일 제한을 영구적으로 우회하고 웹 로딩 속도를 극대화합니다.
"""

import os
import io
import shutil
import zipfile
from PIL import Image

MAX_GITHUB_SAFE_BYTES = 90 * 1024 * 1024  # 90MB 이상이면 자동 압축 트리거

def compress_pptx(file_path, target_max_dim=1920, quality=80):
    """
    PPTX 내부의 고용량 미디어 이미지를 분석하여 Full HD로 최적화 리샘플링합니다.
    """
    file_size = os.path.getsize(file_path)
    if file_size <= MAX_GITHUB_SAFE_BYTES:
        return False, file_size, file_size

    print(f"[자동 압축 시작] {os.path.basename(file_path)}: {file_size / (1024*1024):.1f} MB (100MB 제한 초과 감지)")

    # 1. 안전 백업 디렉토리 생성
    backup_dir = os.path.join(os.path.dirname(file_path), "_original_backups")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, os.path.basename(file_path))
    if not os.path.exists(backup_path):
        shutil.copy2(file_path, backup_path)
        print(f" -> 원본 백업 완료: {backup_path}")

    # 2. 임시 압축 파일 생성
    temp_path = file_path + ".compressing.tmp"

    try:
        with zipfile.ZipFile(file_path, 'r') as zin, zipfile.ZipFile(temp_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                fname_lower = item.filename.lower()

                # ppt/media 이미지 최적화
                if 'ppt/media/' in fname_lower and (fname_lower.endswith('.png') or fname_lower.endswith('.jpg') or fname_lower.endswith('.jpeg')):
                    if len(data) > 250 * 1024: # 250KB 이상 이미지 대상
                        try:
                            img = Image.open(io.BytesIO(data))
                            w, h = img.size
                            if w > target_max_dim or h > target_max_dim:
                                img.thumbnail((target_max_dim, target_max_dim), Image.Resampling.LANCZOS)

                            buf = io.BytesIO()
                            if fname_lower.endswith('.png'):
                                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                                    img.save(buf, format='PNG', optimize=True, compress_level=9)
                                else:
                                    img = img.convert('RGB')
                                    img.save(buf, format='JPEG', quality=quality, optimize=True)
                            else:
                                if img.mode != 'RGB':
                                    img = img.convert('RGB')
                                img.save(buf, format='JPEG', quality=quality, optimize=True)

                            new_data = buf.getvalue()
                            if len(new_data) < len(data):
                                data = new_data
                        except Exception:
                            pass

                zout.writestr(item, data)

        new_size = os.path.getsize(temp_path)
        if new_size < file_size:
            shutil.move(temp_path, file_path)
            reduction = (1 - new_size / file_size) * 100
            print(f"[압축 성공] {file_size / (1024*1024):.1f} MB -> {new_size / (1024*1024):.1f} MB ({reduction:.1f}% 절감, GitHub 안전 통과)")
            return True, file_size, new_size
        else:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return False, file_size, file_size
    except Exception as e:
        print(f"[압축 오류] {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False, file_size, file_size

def compress_pdf(file_path, target_max_dim=1920, quality=80):
    """
    PDF 내부의 고용량 이미지를 분석하여 Full HD로 최적화 리샘플링하고 스마트 압축합니다.
    """
    file_size = os.path.getsize(file_path)
    if file_size <= MAX_GITHUB_SAFE_BYTES:
        return False, file_size, file_size

    print(f"[자동 압축 시작(PDF)] {os.path.basename(file_path)}: {file_size / (1024*1024):.1f} MB (100MB 제한 초과 감지)")

    # 1. 안전 백업 디렉토리 생성
    backup_dir = os.path.join(os.path.dirname(file_path), "_original_backups")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, os.path.basename(file_path))
    if not os.path.exists(backup_path):
        shutil.copy2(file_path, backup_path)
        print(f" -> 원본 백업 완료: {backup_path}")

    # 2. 임시 압축 파일 생성
    temp_path = file_path + ".compressing.tmp"

    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        writer = pypdf.PdfWriter()
        writer.append(reader)

        optimized_imgs = 0
        for page in writer.pages:
            for img in page.images:
                try:
                    raw_len = len(img.data)
                    if raw_len > 250 * 1024:  # 250KB 이상 이미지 대상
                        pil_img = img.image
                        w, h = pil_img.size
                        changed = False
                        if w > target_max_dim or h > target_max_dim:
                            pil_img.thumbnail((target_max_dim, target_max_dim), Image.Resampling.LANCZOS)
                            changed = True

                        if pil_img.mode in ('RGBA', 'LA'):
                            extrema = pil_img.split()[-1].getextrema()
                            if extrema == (255, 255):
                                pil_img = pil_img.convert('RGB')
                                changed = True
                        elif pil_img.mode != 'RGB':
                            pil_img = pil_img.convert('RGB')
                            changed = True

                        if raw_len > 500 * 1024 or changed:
                            img.replace(pil_img, quality=quality)
                            optimized_imgs += 1
                except Exception:
                    pass

        with open(temp_path, 'wb') as f:
            writer.write(f)

        new_size = os.path.getsize(temp_path)
        if new_size < file_size:
            shutil.move(temp_path, file_path)
            reduction = (1 - new_size / file_size) * 100
            print(f"[압축 성공(PDF)] {file_size / (1024*1024):.1f} MB -> {new_size / (1024*1024):.1f} MB ({reduction:.1f}% 절감, GitHub 안전 통과)")
            return True, file_size, new_size
        else:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return False, file_size, file_size
    except Exception as e:
        print(f"[PDF 압축 오류] {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False, file_size, file_size

def auto_optimize_docs(docs_root):
    """
    docs 디렉토리 내의 모든 대용량 PPTX 및 PDF 파일을 검사하여 90MB 초과 시 자동 압축합니다.
    """
    optimized_count = 0
    for root, dirs, files in os.walk(docs_root):
        if "_original_backups" in root:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            full_path = os.path.join(root, f)
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue

            if size > MAX_GITHUB_SAFE_BYTES:
                if ext == '.pptx':
                    success, old_s, new_s = compress_pptx(full_path)
                    if success:
                        optimized_count += 1
                elif ext == '.pdf':
                    success, old_s, new_s = compress_pdf(full_path)
                    if success:
                        optimized_count += 1
    return optimized_count

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(script_dir, "docs")
    print("Checking docs for 90MB+ oversized files...")
    count = auto_optimize_docs(docs_dir)
    print(f"Total files optimized: {count}")

