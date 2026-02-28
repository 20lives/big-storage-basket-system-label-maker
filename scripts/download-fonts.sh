#!/usr/bin/env bash
# Download Google Fonts .ttf files for the labels-maker app.
#
# Variable fonts come from the google/fonts GitHub repo (full charset).
# Static fonts (Lato, Poppins) come from GitHub; PT Sans from gstatic.
set -euo pipefail

DEST="public/fonts"
GITHUB_RAW="https://raw.githubusercontent.com/google/fonts/main/ofl"
mkdir -p "$DEST"

# download_variable <github-dir> <filename> <output-name>
download_variable() {
  local dir="$1" file="$2" out="$3"
  if [ -f "$DEST/$out" ]; then
    echo "  [skip] $out"
    return
  fi
  echo "  [get]  $out"
  curl -sfL "$GITHUB_RAW/$dir/$file" -o "$DEST/$out" || { echo "  [FAIL] $out"; rm -f "$DEST/$out"; return 1; }
}

# download_static <github-dir> <filename>
download_static() {
  local dir="$1" file="$2"
  if [ -f "$DEST/$file" ]; then
    echo "  [skip] $file"
    return
  fi
  echo "  [get]  $file"
  curl -sfL "$GITHUB_RAW/$dir/$file" -o "$DEST/$file" || { echo "  [FAIL] $file"; rm -f "$DEST/$file"; return 1; }
}

# download_url <url> <output-name>
download_url() {
  local url="$1" out="$2"
  if [ -f "$DEST/$out" ]; then
    echo "  [skip] $out"
    return
  fi
  echo "  [get]  $out"
  curl -sfL "$url" -o "$DEST/$out" || { echo "  [FAIL] $out"; rm -f "$DEST/$out"; return 1; }
}

echo "=== Downloading Variable Fonts (full charset, from GitHub) ==="
echo ""

echo "--- Roboto (variable) ---"
download_variable "roboto" "Roboto%5Bwdth%2Cwght%5D.ttf" "Roboto-Variable.ttf"

echo "--- Open Sans (variable) ---"
download_variable "opensans" "OpenSans%5Bwdth%2Cwght%5D.ttf" "OpenSans-Variable.ttf"

echo "--- Montserrat (variable) ---"
download_variable "montserrat" "Montserrat%5Bwght%5D.ttf" "Montserrat-Variable.ttf"

echo "--- Inter (variable) ---"
download_variable "inter" "Inter%5Bopsz%2Cwght%5D.ttf" "Inter-Variable.ttf"

echo "--- Oswald (variable) ---"
download_variable "oswald" "Oswald%5Bwght%5D.ttf" "Oswald-Variable.ttf"

echo "--- Raleway (variable) ---"
download_variable "raleway" "Raleway%5Bwght%5D.ttf" "Raleway-Variable.ttf"

echo "--- Merriweather (variable) ---"
download_variable "merriweather" "Merriweather%5Bwght%5D.ttf" "Merriweather-Variable.ttf"

echo "--- Nunito (variable) ---"
download_variable "nunito" "Nunito%5Bwght%5D.ttf" "Nunito-Variable.ttf"

echo "--- Playfair Display (variable) ---"
download_variable "playfairdisplay" "PlayfairDisplay%5Bwght%5D.ttf" "PlayfairDisplay-Variable.ttf"

echo "--- Caveat (variable) ---"
download_variable "caveat" "Caveat%5Bwght%5D.ttf" "Caveat-Variable.ttf"

echo ""
echo "=== Downloading Static Fonts (full charset, from GitHub) ==="
echo ""

echo "--- Lato (static Regular + Bold) ---"
download_static "lato" "Lato-Regular.ttf"
download_static "lato" "Lato-Bold.ttf"

echo "--- Poppins (static Regular + Bold) ---"
download_static "poppins" "Poppins-Regular.ttf"
download_static "poppins" "Poppins-Bold.ttf"

echo ""
echo "=== Downloading PT Sans (from gstatic) ==="
echo ""
echo "--- PT Sans (static Regular + Bold) ---"
download_url "https://fonts.gstatic.com/s/ptsans/v18/jizaRExUiTo99u79P0U.ttf" "PTSans-Regular.ttf"
download_url "https://fonts.gstatic.com/s/ptsans/v18/jizfRExUiTo99u79B_mh4Ok.ttf" "PTSans-Bold.ttf"

echo ""
echo "=== Downloading Hebrew Fonts ==="
echo ""

echo "--- Noto Sans Hebrew (from notofonts release) ---"
NOTO_RELEASE="https://github.com/notofonts/hebrew/releases/download/NotoSansHebrew-v3.001/NotoSansHebrew-v3.001.zip"
if [ ! -f "$DEST/NotoSansHebrew-Regular.ttf" ] || [ ! -f "$DEST/NotoSansHebrew-Bold.ttf" ]; then
  echo "  [get]  NotoSansHebrew-Regular.ttf + NotoSansHebrew-Bold.ttf"
  TMPZIP=$(mktemp)
  curl -sfL "$NOTO_RELEASE" -o "$TMPZIP" || { echo "  [FAIL] download"; rm -f "$TMPZIP"; }
  unzip -o "$TMPZIP" "NotoSansHebrew/full/ttf/NotoSansHebrew-Regular.ttf" "NotoSansHebrew/full/ttf/NotoSansHebrew-Bold.ttf" -d /tmp/ >/dev/null 2>&1
  cp /tmp/NotoSansHebrew/full/ttf/NotoSansHebrew-Regular.ttf "$DEST/" 2>/dev/null
  cp /tmp/NotoSansHebrew/full/ttf/NotoSansHebrew-Bold.ttf "$DEST/" 2>/dev/null
  rm -rf "$TMPZIP" /tmp/NotoSansHebrew
else
  echo "  [skip] NotoSansHebrew-Regular.ttf"
  echo "  [skip] NotoSansHebrew-Bold.ttf"
fi

echo "--- Alef (static Regular + Bold) ---"
download_static "alef" "Alef-Regular.ttf"
download_static "alef" "Alef-Bold.ttf"

echo "--- Heebo (static from gstatic) ---"
download_url "https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyccg.ttf" "Heebo-Regular.ttf"
download_url "https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Ebiuccg.ttf" "Heebo-Bold.ttf"

echo "--- Assistant (static from gstatic) ---"
download_url "https://fonts.gstatic.com/s/assistant/v24/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnEGE.ttf" "Assistant-Regular.ttf"
download_url "https://fonts.gstatic.com/s/assistant/v24/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtgFgEGE.ttf" "Assistant-Bold.ttf"

# ── Dehint fonts for OpenSCAD-wasm compatibility ──────────────────────────
# OpenSCAD-wasm (FreeType in WASM) crashes with "indirect call to null" on fonts
# that have incomplete TrueType hinting: prep bytecode with maxStackElements=0,
# or maxFunctionDefs>0 without fpgm table. Fix: remove all hinting bytecode and
# zero out maxp hinting fields for fonts lacking proper cvt/fpgm tables.
echo ""
echo "=== Dehinting fonts for OpenSCAD-wasm compatibility ==="
if command -v python3 &>/dev/null && python3 -c 'import fontTools' 2>/dev/null; then
  python3 -c "
from fontTools.ttLib import TTFont
import os
fonts_dir = '$DEST'
for f in sorted(os.listdir(fonts_dir)):
    if not f.endswith('.ttf') or f == 'fa-solid-900.ttf': continue
    path = os.path.join(fonts_dir, f)
    font = TTFont(path)
    tables = set(font.keys())
    if 'cvt ' in tables and 'fpgm' in tables:
        font.close(); continue
    changed = False
    for tbl in ['prep', 'cvt ', 'fpgm', 'STAT']:
        if tbl in font: del font[tbl]; changed = True
    maxp = font['maxp']
    for attr in ['maxFunctionDefs','maxInstructionDefs','maxStackElements','maxStorage','maxTwilightPoints']:
        if hasattr(maxp, attr) and getattr(maxp, attr) != 0:
            setattr(maxp, attr, 0); changed = True
    if changed:
        font.save(path)
        print(f'  [fix]  {f}')
    font.close()
"
else
  echo "  [warn] fonttools not installed — fonts not dehinted. Some may crash in OpenSCAD-wasm."
  echo "         Install: pip install fonttools"
fi

echo ""
echo "=== Removing old files ==="
rm -f "$DEST/LiberationSans-Bold.ttf" "$DEST/LiberationSerif-Bold.ttf" "$DEST/LiberationMono-Bold.ttf"
# Remove old Latin-only subset files (replaced by variable fonts)
rm -f "$DEST/Roboto-Regular.ttf" "$DEST/Roboto-Bold.ttf"
rm -f "$DEST/OpenSans-Regular.ttf" "$DEST/OpenSans-Bold.ttf"
rm -f "$DEST/Inter-Regular.ttf" "$DEST/Inter-Bold.ttf"
rm -f "$DEST/Oswald-Regular.ttf" "$DEST/Oswald-Bold.ttf"
rm -f "$DEST/PlayfairDisplay-Regular.ttf" "$DEST/PlayfairDisplay-Bold.ttf"
rm -f "$DEST/Caveat-Regular.ttf" "$DEST/Caveat-Bold.ttf"
rm -f "$DEST/Heebo-Variable.ttf" "$DEST/Assistant-Variable.ttf"

echo ""
echo "=== Font inventory ==="
ls -lhS "$DEST"/*.ttf | awk '{print $5, $NF}'
echo ""
du -sh "$DEST"
