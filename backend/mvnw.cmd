@echo off
setlocal

set ERROR_CODE=0

@REM Check if JAVA_HOME is set
if not "%JAVA_HOME%" == "" goto OkJHome

@REM Try to find java in PATH
where java >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set JAVA_EXE=java
    goto init
)

echo.
echo Error: JAVA_HOME not found in your environment and java is not in your PATH. >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJHome
set JAVA_EXE="%JAVA_HOME%\bin\java.exe"

:init
set MAVEN_PROJECTBASEDIR=%CD%
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

%JAVA_EXE% %MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
exit /B %ERROR_CODE%
