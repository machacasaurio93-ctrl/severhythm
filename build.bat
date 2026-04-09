@echo off
echo ============================================
echo   SeveRhythm - Empaquetado FAT JAR
echo ============================================
echo.

echo [1/4] Compilando frontend...
cd backend\frontend
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Fallo la compilacion del frontend
    pause
    exit /b 1
)

echo.
echo [2/4] Copiando frontend al backend...
if exist ..\backend\src\main\resources\static rmdir /s /q ..\backend\src\main\resources\static
mkdir ..\backend\src\main\resources\static
xcopy /s /e /y dist\* ..\backend\src\main\resources\static\

echo.
echo [3/4] Compilando backend y generando JAR...
cd ..\backend
call mvn clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERROR: Fallo la compilacion del backend
    pause
    exit /b 1
)

echo.
echo [4/4] Copiando JAR a la raiz del proyecto...
copy target\backend-0.0.1-SNAPSHOT.jar ..\..\SeveRhythm.jar

echo.
echo ============================================
echo   LISTO! Ejecuta con: java -jar SeveRhythm.jar
echo   Luego abre: http://localhost:8080
echo ============================================
pause
