@echo off
chcp 65001 > nul
title 르메뜨레(L.REMETTRE) 자료 자동 동기화 및 GitHub 배포

echo ========================================================
echo  🌿 르메뜨레 공식 자료실 자동 동기화 및 배포 마법사
echo ========================================================
echo.
echo [1/3] docs 폴더 문서 스캔 및 resources.json 자동 갱신 중...
python sync_resources.py
if %ERRORLEVEL% NEQ 0 (
    echo [오류] sync_resources.py 실행 중 오류가 발생했습니다.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] 변경 사항 Git 패키징 중...
git add .
git commit -m "docs: 자료 자동 동기화 갱신 (%date% %time%)"

echo.
echo [3/3] GitHub Pages 클라우드로 자동 전송(Push) 중...
git push origin main

echo.
echo ========================================================
echo  🎉 모든 자료가 GitHub 클라우드로 성공적으로 배포되었습니다!
echo  🌐 접속 주소: https://big-kim.github.io/lremettre-hub/
echo ========================================================
echo.
pause
