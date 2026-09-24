#!/bin/bash
# Setup environment
pkg update -y && pkg install python sqlite -y
DB_PATH="/data/data/com.zangi.messenger/databases/zangi.db"
TEMP_DB="zangi_temp.db"
echo "[*] Checking for root access and Zangi database..."
if [ ! -f "$DB_PATH" ]; then     echo "[-] Database not found at $DB_PATH.";     echo "[-] Ensure your device is rooted and Zangi is installed.";     exit 1; fi
#!/bin/bash
# Ensure Termux has storage permissions if needed, and bash outputs properly
export PS4='+ '
echo "[*] Checking Termux packages..."
command -v python3 >/dev/null 2>&1 || { echo "[*] Installing Python..."; pkg update -y && pkg install python -y; }
DB_PATH="/data/data/com.zangi.messenger/databases/zangi.db"
TEMP_DB="./zangi_temp.db"
echo "[*] Requesting root access and checking database..."
SU_CHECK=$(su -c "id -u" 2>&1)
if [ "$SU_CHECK" != "0" ]; then     echo "[-] Root access denied or not available. Termux requires Magisk/KernelSU root permission.";     exit 1; fi
ping -c 1 8.8.8.8
ping -c 1 8.8.8.8
#!/bin/bash
# 1. Check Internet & Python
if ! command -v python3 &>/dev/null; then     echo "[*] Python not found. Trying to install...";     pkg update -y && pkg install python -y;     if [ $? -ne 0 ]; then         echo "[-] Cannot install packages. Check your internet connection.";         exit 1;     fi; fi
su
#!/usr/bin/env bash
set -eo pipefail
PACKAGE_NAME="com.zangi.messenger"
TARGET_DIR="$HOME/storage/shared/Download/Zangi_Direct_Extracts"
mkdir -p "$TARGET_DIR"
echo "[*] Extracting Zangi databases via root..."
# Copy app databases directly using root
TEMP_DIR="/data/local/tmp/zangi_db_dump"
su -c "rm -rf $TEMP_DIR && mkdir -p $TEMP_DIR"
#!/usr/bin/env bash
set -eo pipefail
CORRECT_PACKAGE="com.beint.zangi"
TARGET_DIR="$HOME/storage/shared/Download/Zangi_Direct_Extracts"
mkdir -p "$TARGET_DIR"
echo "[*] Scanning device filesystems for Zangi databases..."
if command -v su &> /dev/null && su -c "id" &> /dev/null; then     echo "[+] Root permissions active. Extracting package: $CORRECT_PACKAGE";          DATA_PATH="/data/data/$CORRECT_PACKAGE";     if su -c "[ -d '$DATA_PATH' ]"; then         TEMP_DUMP="/data/local/tmp/zangi_dump";         su -c "rm -rf $TEMP_DUMP && mkdir -p $TEMP_DUMP";         su -c "cp -r $DATA_PATH/* $TEMP_DUMP/" 2>/dev/null || true;         
        su -c "cp -r $TEMP_DUMP/* /sdcard/Download/" 2>/dev/null ||         su -c "cp -r $TEMP_DUMP/* /storage/emulated/0/Download/" 2>/dev/null || true;                  su -c "rm -rf $TEMP_DUMP";         echo "[+] Extraction complete. Check your Download folder for extracted app files.";         exit 0;     else         echo "[-] Standard path not found. Searching all user packages...";         su -c "find /data/data -name '*zangi*' -print";     fi; else     echo "[-] Root access required. Please enable su/root permissions in your superuser manager and re-run.";     exit 1; fi
#!/usr/bin/env bash
set -eo pipefail
PACKAGE_NAME="com.beint.zangi"
OUT_DIR="$HOME/storage/shared/Download/Zangi_Direct_Extracts"
mkdir -p "$OUT_DIR"
echo "[*] Checking root permissions..."
if ! command -v su &> /dev/null || ! su -c "id" &> /dev/null; then     echo "[-] Error: Root (su) is not available or was denied.";     exit 1; fi
#!/usr/bin/env bash
set -eo pipefail
TARGET_DIR="$HOME/storage/shared/Download/Zangi_Direct_Extracts"
mkdir -p "$TARGET_DIR"
echo "[*] Locating Zangi database files via root..."
# Search the entire /data/data tree for any file or database belonging to zangi
su -c "find /data/data -name '*zangi*' -o -name '*.db'" | while read -r item; do     echo "[+] Found: $item";     su -c "cp -r '$item' '$TARGET_DIR/'" 2>/dev/null || true; done
