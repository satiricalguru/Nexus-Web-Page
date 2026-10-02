@echo off
title Nexus MUJ - Local Preview
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js from https://nodejs.org/ and then open this file again.
  pause
  exit /b 1
)
pushd "%~dp0"
node serve.mjs --open
if errorlevel 1 pause
popd
