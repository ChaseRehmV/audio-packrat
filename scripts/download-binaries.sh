#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux) echo "linux" ;;
    MINGW*|MSYS*|CYGWIN*) echo "win" ;;
    *) echo "Unsupported platform" >&2; exit 1 ;;
  esac
}

PLATFORM=$(detect_platform)
BIN_DIR="$PROJECT_DIR/resources/bin/$PLATFORM"
mkdir -p "$BIN_DIR"

echo "Downloading binaries for platform: $PLATFORM"

# Download yt-dlp
echo "Downloading yt-dlp..."
case "$PLATFORM" in
  mac)
    curl -L -o "$BIN_DIR/yt-dlp" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
    chmod +x "$BIN_DIR/yt-dlp"
    ;;
  linux)
    curl -L -o "$BIN_DIR/yt-dlp" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
    chmod +x "$BIN_DIR/yt-dlp"
    ;;
  win)
    curl -L -o "$BIN_DIR/yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    ;;
esac

# Download ffmpeg
echo "Downloading ffmpeg..."
case "$PLATFORM" in
  mac)
    curl -L -o "$BIN_DIR/ffmpeg.zip" "https://evermeet.cx/ffmpeg/getrelease/zip"
    unzip -o "$BIN_DIR/ffmpeg.zip" -d "$BIN_DIR"
    rm "$BIN_DIR/ffmpeg.zip"
    chmod +x "$BIN_DIR/ffmpeg"
    ;;
  linux)
    curl -L -o "$BIN_DIR/ffmpeg.tar.xz" "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
    tar -xf "$BIN_DIR/ffmpeg.tar.xz" --strip-components=1 -C "$BIN_DIR" --wildcards "*/ffmpeg"
    rm "$BIN_DIR/ffmpeg.tar.xz"
    chmod +x "$BIN_DIR/ffmpeg"
    ;;
  win)
    echo "For Windows, download ffmpeg from https://www.gyan.dev/ffmpeg/builds/"
    echo "Place ffmpeg.exe in $BIN_DIR"
    ;;
esac

echo "Done! Binaries installed to $BIN_DIR"
