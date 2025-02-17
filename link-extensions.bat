@echo off
REM Change to the parent directory
cd ..

REM Set CDIR to the current directory (after moving up)
set "CDIR=%CD%"

REM Remove the existing extensions folder using rimraf via npx
npx rimraf "%CDIR%\release\app\node_modules\@tagspaces\extensions"

REM Create a directory symbolic link named "extensions" inside the @tagspaces folder,
REM pointing to the local extensions folder.
mklink /D "%CDIR%\release\app\node_modules\@tagspaces\extensions" "%CDIR%\extensions"

echo Done.
pause
