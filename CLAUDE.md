# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **COMPLETED** Automated Bank Statement Downloader built with Node.js and Puppeteer. The tool automates downloading bank statement PDFs from Citizens Bank by connecting to a pre-authenticated browser session, prioritizing security by never handling user credentials directly.

## Implementation Status: ✅ COMPLETE

The tool has been fully implemented and tested with Citizens Bank's Document Center. All core functionality is working, including account selection, date filtering, custom date ranges, and reliable PDF downloads.

## Key Architecture

- **Authentication Strategy**: Connects to Chrome/Brave browser with remote debugging enabled (`--remote-debugging-port=9222`)
- **Browser Control**: Uses `puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })` to control authenticated session
- **Command Line Interface**: Uses `yargs` for argument parsing with comprehensive options
- **Configuration**: Bank-specific CSS selectors stored in `config/citizens-bank.js` for maintainability
- **Timing Strategy**: Implemented robust waiting mechanisms for form validation and reliable downloads

## Completed Features

1. **✅ Account Management**: Lists and selects specific bank accounts from dropdown UI
2. **✅ Multiple Date Filtering Options**:
   - Preset timeframes (30, 60, 90 days, year)
   - Custom date ranges with start-date and optional end-date
3. **✅ Robust Download Handling**: 4-second intervals between downloads to prevent skipping
4. **✅ Dynamic Content Handling**: Proper waits for AJAX content and form validation
5. **✅ Real-time Status Reporting**: Comprehensive console logging throughout execution
6. **✅ Form Validation**: Handles Citizens Bank's complex form validation timing
7. **✅ Error Handling**: Multiple click strategies and fallback mechanisms

## Current CLI Commands

```bash
# Install dependencies
npm install

# List all available accounts
node index.js --list-accounts

# Download with preset timeframes
node index.js --account "PAYROLL" --timeframe 90
node index.js --account "PROFIT" --timeframe year

# Custom date ranges (end-date defaults to today if not provided)
node index.js --account "TAX" --timeframe custom --start-date "01/01/2025"
node index.js --account "OPEX" --timeframe custom --start-date "01/01/2025" --end-date "08/22/2025"

# Bulk download with bash loops
for account in "OPEX" "INCOME" "PROFIT"; do node index.js --account "$account" --timeframe custom --start-date "01/01/2025"; done
```

## Technical Implementation Details

### Browser Setup

- **Tested Browsers**: Chrome, Brave Browser
- **Launch Command**: `chrome.exe --remote-debugging-port=9222` or `brave.exe --remote-debugging-port=9222`
- **Connection**: Script connects to `http://127.0.0.1:9222`

### Citizens Bank Integration

- **Target URL**: `https://www.citizensbankonline.com/olb-root/home/document-center`
- **Configuration File**: `config/citizens-bank.js` contains all CSS selectors
- **Form Handling**: 3-second waits for account selection, date picker validation
- **Apply Button**: Uses JavaScript click to bypass `aria-disabled` visual states

### Download Strategy

- **Timing**: 2-second initial wait + 2-second pause between downloads (4 seconds total)
- **Reliability**: Prevents PDF download skipping that occurred with faster timing
- **Success Rate**: Consistently downloads all available statements without misses

### Date Handling

- **Custom Ranges**: Supports MM/DD/YYYY format for date inputs
- **Auto End-Date**: When end-date not provided, automatically uses today's date
- **Date Picker**: Handles Citizens Bank's complex date picker UI with proper event triggering

## Solved Technical Challenges

1. **Form Validation Timing**: Citizens Bank requires 3-second waits after account selection
2. **Apply Button Issues**: `aria-disabled="true"` bypassed using JavaScript click events
3. **Date Picker Complexity**: Implemented proper focus, typing, and validation event handling
4. **Download Reliability**: Added 4-second intervals to prevent missed PDFs
5. **Page Loading**: Added proper waiting for form elements before interaction

## File Structure

- `index.js` - Main application script with CLI interface
- `config/citizens-bank.js` - Bank-specific configuration and CSS selectors
- `package.json` - Dependencies (puppeteer, yargs)
- `README.md` - User-facing documentation
- `docs/PRD.md` - Product requirements (updated to reflect completion)

## Security Implementation

- **✅ No Credential Storage**: Never handles usernames, passwords, or MFA codes
- **✅ Pre-authenticated Sessions**: Leverages user's manual browser login
- **✅ Read-only Operations**: Only reads from and interacts with Document Center
- **✅ Local File Handling**: Downloads PDFs to local filesystem only

## Known Working Configurations

- **Citizens Bank Document Center**: Fully implemented and tested
- **Account Types**: Works with business accounts (PAYROLL, PROFIT, TAX, OPEX, INCOME)
- **Date Ranges**: Successfully tested from 01/01/2025 to present
- **Download Volumes**: Handles 7+ statements per account reliably

## Maintenance Notes

- CSS selectors in `config/citizens-bank.js` may need updates if Citizens Bank changes their UI
- Timing configurations in `waitTimes` object can be adjusted if needed
- Download intervals can be modified in the `downloadStatements` method if reliability issues arise
