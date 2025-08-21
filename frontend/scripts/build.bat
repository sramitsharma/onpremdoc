@echo off
setlocal enabledelayedexpansion

REM Build script for OnPrem TechPrimer Docker deployment (Windows)
setlocal

REM Configuration
set IMAGE_NAME=onprem-techprimer
set IMAGE_TAG=%1
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest
set CONTAINER_NAME=onprem-techprimer-frontend

echo 🚀 OnPrem TechPrimer Docker Build Script
echo ========================================

REM Check if help is requested
if "%1"=="-h" goto :usage
if "%1"=="--help" goto :usage

REM Check if Docker is running
echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo [SUCCESS] Docker is running

REM Build the Docker image
echo [INFO] Building Docker image: %IMAGE_NAME%:%IMAGE_TAG%
docker build --target production -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .
if errorlevel 1 (
    echo [ERROR] Failed to build Docker image
    exit /b 1
)
echo [SUCCESS] Docker image built successfully

REM Stop and remove existing container
echo [INFO] Cleaning up existing container...
docker ps -a --format "table {{.Names}}" | findstr /c:"%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
    echo [SUCCESS] Existing container cleaned up
) else (
    echo [INFO] No existing container found
)

REM Run the container
echo [INFO] Starting container: %CONTAINER_NAME%
docker run -d --name %CONTAINER_NAME% -p 80:80 -p 443:443 -e NODE_ENV=production -e ENVIRONMENT=production --restart unless-stopped %IMAGE_NAME%:%IMAGE_TAG%
if errorlevel 1 (
    echo [ERROR] Failed to start container
    exit /b 1
)
echo [SUCCESS] Container started successfully

REM Wait for container to be ready
echo [INFO] Waiting for container to be ready...
timeout /t 5 /nobreak >nul

REM Check container health
echo [INFO] Checking container health...
docker ps --format "table {{.Names}}" | findstr /c:"%CONTAINER_NAME%" >nul
if not errorlevel 1 (
    echo [SUCCESS] Container is running
    
    REM Check health endpoint (if curl is available)
    curl -f http://localhost/health >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Application is healthy
    ) else (
        echo [WARNING] Health check failed, but container is running
    )
) else (
    echo [ERROR] Container is not running
    exit /b 1
)

REM Show container logs
echo [INFO] Container logs:
docker logs %CONTAINER_NAME% --tail 20

echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo 🌐 Application URLs:
echo    HTTP:  http://localhost
echo    HTTPS: https://localhost (self-signed certificate)
echo.
echo 📊 Container management:
echo    View logs:    docker logs %CONTAINER_NAME%
echo    Stop:         docker stop %CONTAINER_NAME%
echo    Restart:      docker restart %CONTAINER_NAME%
echo    Remove:       docker rm -f %CONTAINER_NAME%
goto :eof

:usage
echo Usage: %0 [IMAGE_TAG]
echo.
echo Options:
echo   IMAGE_TAG    Docker image tag (default: latest)
echo.
echo Examples:
echo   %0           # Build with 'latest' tag
echo   %0 v1.0.0    # Build with 'v1.0.0' tag
echo   %0 dev       # Build with 'dev' tag
goto :eof
