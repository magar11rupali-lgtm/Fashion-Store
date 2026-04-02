@echo off
echo ========================================
echo Frontend Restart Script
echo ========================================
echo.

echo Step 1: Clearing Next.js cache...
if exist "frontend\.next" (
    echo Deleting .next folder...
    rmdir /s /q "frontend\.next"
    echo Cache cleared!
) else (
    echo No cache found (already clean)
)

echo.
echo ========================================
echo Frontend Cache Cleared!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Start frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 2. Wait for: "Ready in X.Xs"
echo.
echo 3. Clear browser cache:
echo    Press Ctrl+Shift+Delete
echo    Clear cookies and cached files
echo.
echo 4. Test sign in with:
echo    Email: frontendtest@example.com
echo    Password: Test123456
echo.
echo 5. Go to: http://localhost:3000/auth/signin
echo.
pause
