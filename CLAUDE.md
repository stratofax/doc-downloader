# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Automated Bank Statement Downloader built with Node.js and Puppeteer. The tool automates downloading bank statement PDFs by connecting to a pre-authenticated browser session, prioritizing security by never handling user credentials directly.

## Key Architecture

- **Authentication Strategy**: Connects to Chrome browser with remote debugging enabled (`--remote-debugging-port=9222`)
- **Browser Control**: Uses `puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })` to control authenticated session
- **Command Line Interface**: Uses `yargs` for argument parsing with modes: `--list_accounts`, `--account`, `--start_date`, `--download_all`
- **Configuration**: CSS selectors and page-specific identifiers should be stored separately for maintainability

## Core Functional Requirements

1. **Account Management**: Must be able to list and select specific bank accounts from dropdown UI
2. **Date Filtering**: Support filtering by start month/year to present
3. **Download Modes**: Both targeted date range downloads and full history downloads
4. **Dynamic Content Handling**: Must handle AJAX-loaded content with appropriate waits
5. **Status Reporting**: Provide real-time console updates during execution

## Development Commands

```bash
# Install dependencies
npm install

# Run the script (examples)
node index.js --list_accounts
node index.js --account "Business Checking" --start_date "2025-03"
node index.js --account "Primary Savings" --download_all
```

## Security Constraints

- **NEVER** store, handle, or request user login credentials
- **NEVER** implement direct authentication - always use pre-authenticated browser
- Authentication is entirely the user's responsibility via manual browser login

## Technical Implementation Notes

- **Browser Setup**: User must launch Chrome with `chrome.exe --remote-debugging-port=9222`
- **Page Navigation**: Script navigates to bank's Document Center URL
- **Element Selection**: Account dropdowns, date filters, and download links must be identified via CSS selectors
- **File Handling**: Downloads PDF files to specified local directory
- **Error Handling**: Must incorporate waits for dynamic content loading

## Key Files Structure

- `docs/PRD.doc` - Complete product requirements document
- `README.md` - User-facing documentation
- `.mcp.json` - MCP server configurations
- Main script will be `index.js` or similar entry point

## Development Considerations

- CSS selectors should be configurable for website changes
- Implement proper wait strategies for AJAX content
- Handle pagination if statements span multiple pages
- Consider file naming conventions for downloaded PDFs
- Plan for different date input UI patterns (dropdowns vs text fields vs calendars)
