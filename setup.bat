@echo off
echo ========================================
echo   GENTS SHOP - Setup Script
echo ========================================
echo.

echo [1/4] Running database migrations...
cd backend
php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Creating storage link...
php artisan storage:link

echo.
echo [3/4] Installing frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   Backend:  cd backend ^&^& php artisan serve
echo   Frontend: cd backend\frontend ^&^& npm run dev
echo.
echo Default credentials:
echo   Admin:    admin@gentsshop.com / admin123
echo   Staff:    staff@gentsshop.com / staff123
echo.
pause
