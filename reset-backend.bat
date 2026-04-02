@echo off
echo ========================================
echo Backend Database Reset Script
echo ========================================
echo.

echo Step 1: Checking if database exists...
if exist "backend\.tmp\data.db" (
    echo Found database at: backend\.tmp\data.db
    echo.
    echo Step 2: Deleting database...
    del "backend\.tmp\data.db"
    echo Database deleted!
) else (
    echo Database not found (already deleted or never created)
)

echo.
echo ========================================
echo Database Reset Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Start backend:
echo    cd backend
echo    npm run develop
echo.
echo 2. Wait for: "Server started on http://localhost:1337"
echo.
echo 3. Setup admin account:
echo    Open: http://localhost:1337/admin
echo    Create admin account
echo.
echo 4. Enable public registration:
echo    Settings -^> Users ^& Permissions -^> Roles -^> Public
echo    Enable all auth.* permissions
echo    Click Save
echo.
echo 5. Test authentication:
echo    node fix-auth-automated.js
echo.
echo 6. Create your account:
echo    http://localhost:3000/auth/signup
echo.
pause
