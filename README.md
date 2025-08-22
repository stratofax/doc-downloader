# Automated Bank Statement Downloader

**✅ COMPLETED PROJECT** - A Node.js script that automates downloading bank statement PDFs from Citizens Bank's document center using Puppeteer. The script connects to a pre-authenticated browser session for maximum security and efficiency.

## 🎯 Current Status: Fully Functional

Successfully implemented and tested with Citizens Bank. All core features are working reliably, including account selection, flexible date filtering, custom date ranges, and robust PDF downloads.

## ✨ Features

- **🔐 Secure Authentication**: Uses your existing logged-in browser session - no credential storage required
- **📋 Account Management**: List available accounts and select specific accounts for downloading  
- **📅 Flexible Date Filtering**: Multiple options for date ranges
  - Preset timeframes (30, 60, 90 days, year)
  - Custom date ranges with optional end-date (defaults to today)
- **📦 Bulk Operations**: Download from multiple accounts with bash loops
- **⏱️ Reliable Downloads**: 4-second intervals prevent PDF skipping
- **📊 Real-time Status**: Comprehensive console logging throughout execution
- **🏦 Citizens Bank Integration**: Specifically configured for Citizens Bank Document Center

## 🚀 Use Cases

- **📋 Tax Preparation**: Download quarterly/yearly statements for accounting
- **🗄️ Archive Management**: Create complete historical backups of financial documents  
- **🔄 Regular Maintenance**: Automate recurring statement downloads
- **💼 Business Accounting**: Bulk download across multiple business accounts

## 📋 Prerequisites

- Node.js installed
- Chrome-based browser (Chrome, Edge, Brave Browser - all tested)
- Active login session with Citizens Bank

## ⚡ Quick Start

1. **Set up authenticated browser session:**
   ```bash
   # Close all browser instances first, then launch with debugging
   chrome.exe --remote-debugging-port=9222
   # OR for Brave Browser:
   brave.exe --remote-debugging-port=9222
   
   # Navigate to Citizens Bank and log in manually
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **List available accounts:**
   ```bash
   node index.js --list-accounts
   ```

4. **Download statements:**
   ```bash
   # Preset timeframes
   node index.js --account "PAYROLL" --timeframe 90
   node index.js --account "PROFIT" --timeframe year
   
   # Custom date ranges (end-date optional, defaults to today)
   node index.js --account "TAX" --timeframe custom --start-date "01/01/2025"
   node index.js --account "OPEX" --timeframe custom --start-date "01/01/2025" --end-date "08/22/2025"
   
   # Bulk download across multiple accounts
   for account in "OPEX" "INCOME" "PROFIT"; do 
     node index.js --account "$account" --timeframe custom --start-date "01/01/2025"
   done
   ```

## 🔧 Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--list-accounts` | Display all available account names | `node index.js --list-accounts` |
| `--account "name"` | Specify account to download from | `--account "PAYROLL"` |
| `--timeframe <period>` | Timeframe: 30, 60, 90, year, custom | `--timeframe 90` |
| `--start-date "MM/DD/YYYY"` | Start date for custom range | `--start-date "01/01/2025"` |
| `--end-date "MM/DD/YYYY"` | End date for custom range (optional) | `--end-date "08/22/2025"` |
| `--output-dir "path"` | Output directory for PDFs | `--output-dir ./statements` |

## 🛡️ Security

This tool prioritizes security by:
- ✅ **Never storing or handling login credentials** (username, password, MFA)
- ✅ **Using your manual authentication session** (you control the login)
- ✅ **Operating through browser remote debugging** (read-only access)
- ✅ **Local file operations only** (PDFs saved to your computer)

## ⚙️ Technical Details

- **Stack**: Node.js + Puppeteer 24.9.0 + yargs 17.7.2
- **Target**: Citizens Bank Document Center
- **Browser Support**: Chrome, Edge, Brave Browser (tested)
- **Authentication**: Pre-authenticated browser session via remote debugging
- **Output**: PDF files with original bank naming
- **Reliability**: 4-second intervals between downloads, robust error handling

## 🎯 Tested Configuration

- **✅ Citizens Bank Document Center**: Fully implemented and tested
- **✅ Account Types**: Business accounts (PAYROLL, PROFIT, TAX, OPEX, INCOME)  
- **✅ Date Ranges**: January 2025 to present, custom ranges working
- **✅ Download Volumes**: 7+ statements per account, bulk operations successful
- **✅ Browsers**: Chrome and Brave Browser confirmed working

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)**: Complete technical implementation details for developers
- **[docs/PRD.md](docs/PRD.md)**: Product requirements document with full specifications  
- **[config/citizens-bank.js](config/citizens-bank.js)**: Bank-specific configuration and CSS selectors

## 🔧 Troubleshooting

**Browser Connection Issues:**
- Ensure browser launched with `--remote-debugging-port=9222`
- Close all browser instances before launching with debug flag
- Verify you're logged into Citizens Bank before running script

**Missing PDFs:**
- Downloads use 4-second intervals for reliability
- Check your browser's default download folder
- Ensure sufficient time between bulk operations

**Account Selection:**
- Use `--list-accounts` to see exact account names as they appear in the UI
- Account names are case-sensitive and must match exactly