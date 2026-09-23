@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@REM set %ENABLE_DIR_VARS% to 1 to enable directory variables
@SETLOCAL
@SETLOCAL ENABLEDELAYEDEXPANSION

@REM Resolve maven.home
SET "EXEC_DIR=%~dp0"
SET "MAVEN_PROJECTBASEDIR=%EXEC_DIR%"

SET "MAVEN_CMD_LINE_ARGS=%*"

IF NOT EXIST "%EXEC_DIR%\.mvn\wrapper\maven-wrapper.properties" (
  ECHO Error: Could not find .mvn\wrapper\maven-wrapper.properties
  EXIT /B 1
)

FOR /F "tokens=1,2 delims==" %%A IN (%EXEC_DIR%\.mvn\wrapper\maven-wrapper.properties) DO (
  IF "%%A"=="distributionUrl" SET "DIST_URL=%%B"
)

SET "WRAPPER_DIR=%USERPROFILE%\.m2\wrapper\dists"
FOR /F "delims=" %%I IN ("%DIST_URL%") DO SET "ZIP_NAME=%%~nxI"
FOR /F "delims=" %%I IN ("%ZIP_NAME%") DO SET "FOLDER_NAME=%%~nI"
SET "MAVEN_EXTRACT_DIR=%WRAPPER_DIR%\%FOLDER_NAME%"
SET "MAVEN_HOME=%MAVEN_EXTRACT_DIR%\apache-maven-3.9.9"

IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
  ECHO Downloading Maven distribution from %DIST_URL% ...
  IF NOT EXIST "%MAVEN_EXTRACT_DIR%" MKDIR "%MAVEN_EXTRACT_DIR%"
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DIST_URL%', '%MAVEN_EXTRACT_DIR%\%ZIP_NAME%')"
  powershell -Command "Expand-Archive -Path '%MAVEN_EXTRACT_DIR%\%ZIP_NAME%' -DestinationPath '%MAVEN_EXTRACT_DIR%' -Force"
)

IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
  CALL "%MAVEN_HOME%\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
  EXIT /B %ERRORLEVEL%
) ELSE (
  FOR /D %%D IN ("%MAVEN_EXTRACT_DIR%\apache-maven-*") DO (
    IF EXIST "%%D\bin\mvn.cmd" (
      CALL "%%D\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
      EXIT /B !ERRORLEVEL!
    )
  )
)

ECHO Error: Could not execute maven.
EXIT /B 1
