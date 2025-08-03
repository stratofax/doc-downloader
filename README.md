# Automated Bank Statement Downloader

A Node.js script that automates the downloading of bank statement PDFs from a bank's document center using Puppeteer. The script connects to a pre-authenticated browser session for security and efficiency.

## Features

- **Secure Authentication**: Uses your existing logged-in browser session - no credential storage required
- **Account Management**: List available accounts and select specific accounts for downloading
- **Date Filtering**: Download statements from a specific start date to present
- **Bulk Download**: Download all available statements for an account
- **Real-time Status**: Clear console output showing download progress

## Use Cases

- **Tax Preparation**: Download quarterly statements for accounting
- **Archive Management**: Create complete historical backups of financial documents
- **Regular Maintenance**: Automate recurring statement downloads

## Prerequisites

- Node.js installed
- Chrome-based browser (Chrome, Edge, Brave)
- Access to your bank's document center

## Quick Start

1. **Set up authenticated browser session:**
   ```bash
   # Close all browser instances first
   chrome.exe --remote-debugging-port=9222
   # Navigate to your bank and log in
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **List available accounts:**
   ```bash
   node index.js --list_accounts
   ```

4. **Download statements:**
   ```bash
   # Download from specific date
   node index.js --account "Business Checking" --start_date "2025-03"
   
   # Download all statements
   node index.js --account "Primary Savings" --download_all
   ```

## Command Line Options

- `--list_accounts`: Display all available account names
- `--account "name"`: Specify account to download from
- `--start_date "YYYY-MM"`: Start date for filtering (downloads to present)
- `--download_all`: Download all available statements (ignores date filters)

## Security

This tool prioritizes security by:
- Never storing or handling login credentials
- Using your manual authentication session
- Operating through browser remote debugging interface

## Technical Details

- **Stack**: Node.js + Puppeteer
- **Browser**: Chrome-based with remote debugging enabled
- **Authentication**: Pre-authenticated browser session
- **Output**: PDF files downloaded to local directory

## Documentation

See [docs/PRD.doc](docs/PRD.doc) for complete product requirements and technical specifications.