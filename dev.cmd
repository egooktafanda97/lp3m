@echo off
REM Fix PATH untuk terminal CMD yang tidak mendeteksi nvm/nodejs
set "NVM_HOME=C:\Users\s\AppData\Roaming\nvm"
set "NVM_SYMLINK=C:\Program Files\nodejs"
set "PATH=%NVM_SYMLINK%;%NVM_HOME%;%PATH%"

cd /d "%~dp0"

REM Pakai versi dari .nvmrc jika terinstall, fallback ke 22.12.0 / 18.20.8
if exist .nvmrc (
  for /f "usebackq delims=" %%v in (".nvmrc") do (
    call nvm use %%v >nul 2>&1
    if not errorlevel 1 goto :run
  )
)
call nvm use 22.12.0 >nul 2>&1
if errorlevel 1 call nvm use 18.20.8 >nul 2>&1

:run
echo Node: 
node -v
echo.
npm run dev
