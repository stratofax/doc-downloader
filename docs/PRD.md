# Product Requirements Document

## Automated Bank Statement Downloader

* **Version:** 1.0
* **Date:** August 3, 2025
* **Status:** In Development
* **Author:** Gemini

### 1. Introduction & Problem Statement

Many individuals and small businesses need to regularly download and archive bank statements for accounting, record-keeping, and financial analysis. The manual process of logging into a bank's website, navigating to the document center, selecting the correct account and date range, and downloading each statement PDF one by one is repetitive, time-consuming, and prone to human error.

This document outlines the requirements for a script-based tool that automates the statement retrieval process from a pre-authenticated browser session, increasing efficiency and ensuring a complete and accurate collection of financial documents.

### 2. Goals & Objectives

* **Primary Goal:** To create a reliable and configurable script that automates the downloading of bank statement PDFs from a specific bank's website.
* **Efficiency:** Eliminate the manual effort required to download statements on a recurring basis.
* **Accuracy:** Ensure the correct statements for the specified account and date range are downloaded without misses.
* **Security:** Avoid storing or handling user login credentials within the script by leveraging a pre-authenticated browser session.
* **Flexibility:** Allow the user to specify different download criteria, such as account, date range, or a full history download.

### 3. User Persona

The target user is a technically proficient individual (e.g., a small business owner, freelance developer, or power user) who is comfortable with the command line and needs to archive financial documents systematically. This user prioritizes security and prefers a solution that hooks into their manual login session rather than one that handles authentication directly.

### 4. Use Cases & Scenarios

* **Use Case 1: Quarterly Tax Prep Download**
    * **Scenario:** The user needs to gather all statements for their "Business Checking" account for the most recent quarter.
    * **Action:** The user runs the script, specifying the account name "Business Checking" and a start date of March 2025.
    * **Expected Outcome:** The script navigates to the document center, selects the "Business Checking" account, filters for statements from March 2025 to the present, and downloads all resulting PDFs to a local folder.

* **Use Case 2: New Account Setup / Full History Archive**
    * **Scenario:** The user wants a complete historical archive of all statements for their "Primary Savings" account.
    * **Action:** The user runs the script, specifying the account name "Primary Savings" and a command to download all available statements.
    * **Expected Outcome:** The script selects the specified account and downloads every statement PDF available for it on the portal.

* **Use Case 3: Initial Script Configuration**
    * **Scenario:** The user is setting up the script for the first time and is unsure of the exact account names as they appear in the bank's dropdown menu.
    * **Action:** The user runs the script in a "list accounts" mode.
    * **Expected Outcome:** The script prints a list of all account names (e.g., "Business Checking (...1234)", "Business Savings (...5678)") exactly as they appear in the web interface's account selector, which the user can then use for future download commands.

### 5. Functional Requirements

| ID | Requirement | Use Cases |
| :--- | :--- | :--- |
| **FR-1** | The system **must** be implemented using Node.js and the Puppeteer library. | All |
| **FR-2** | The system **must** connect to a running instance of a Chrome-based browser that has been manually authenticated by the user. | All |
| **FR-3** | The system **must** navigate to the bank's pre-defined Document Center URL. | All |
| **FR-4** | The system **must** provide a "list accounts" mode that reads and outputs the names of all available accounts from the filter/selector UI element on the page. | UC-3 |
| **FR-5** | The system **must** be able to programmatically select a specific account from the account selector based on a user-provided string (e.g., "Business Checking"). | UC-1, UC-2 |
| **FR-6** | The system **must** support filtering statements by a date range, specifically a "start month and year" to the present. | UC-1 |
| **FR-7** | The system **must** support a "download all" mode that retrieves all available statements for the selected account, ignoring date filters. | UC-2 |
| **FR-8** | The system **must** identify all download links for statement PDFs that match the filter criteria. | UC-1, UC-2 |
| **FR-9** | The system **must** download the identified PDF files into a specified local directory. | UC-1, UC-2 |
| **FR-10**| The system **must** provide clear, real-time status updates in the console (e.g., "Connecting to browser...", "Found 3 accounts", "Downloading statement for May 2025..."). | All |

### 6. Non-Functional Requirements

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **NFR-1**| **Security** | The script **must not** store, handle, or request user login credentials (username, password, MFA codes). Authentication is the user's responsibility. |
| **NFR-2**| **Usability** | The script **must** be configurable via command-line arguments (e.g., `--account "name"`, `--start_date "YYYY-MM"`, `--list_accounts`). |
| **NFR-3**| **Reliability**| The script **must** incorporate appropriate waits to handle dynamic page content loading (AJAX) after filters are applied. |
| **NFR-4**| **Maintainability** | CSS selectors and other page-specific identifiers **must** be stored in a separate configuration section or file for easy updates when the bank's website changes. |

### 7. Technical Implementation Outline

* **Stack:** Node.js, Puppeteer library.
* **Browser:** Any Chrome-based browser (Google Chrome, Microsoft Edge, Brave).
* **Authentication Flow:**
    1.  The user closes all instances of their Chrome-based browser.
    2.  The user launches the browser from the command line with the remote debugging flag enabled: `chrome.exe --remote-debugging-port=9222`.
    3.  The user manually navigates to the bank's website, logs in, and completes any MFA steps.
    4.  The user runs the Node.js script.
    5.  The script uses `puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })` to take control of the authenticated browser instance.
* **Configuration:** Script execution will be controlled via command-line arguments, parsed using a library like `yargs`.
* **Core Logic:**
    1.  Parse command-line arguments to determine the mode (`list_accounts` or `download`) and parameters (account name, date).
    2.  Connect to the running browser.
    3.  Navigate to the Document Center URL.
    4.  **If `list_accounts` mode:** Find the account selector, extract the `text` or `value` from each `option`, print the list, and exit.
    5.  **If `download` mode:**
        * Select the specified account from the dropdown.
        * Wait for the page to update.
        * Apply date filters if provided.
        * Wait for the statement list to refresh.
        * Create a list of all statement download links.
        * Loop through the list, clicking each link to trigger the download.

### 8. Questions for Clarification

To ensure the script is robust, I have the following questions about the target website's behavior:

1.  **Date Filtering UI:** How are dates selected on the website? Are they dropdown menus for month and year, text input fields, or a pop-up calendar widget? The implementation for manipulating these controls will differ significantly.
2.  **Dynamic Content:** After selecting an account or changing a date filter, does the entire page reload, or does the list of statements update dynamically in place (e.g., via an AJAX request)? This determines the "wait" strategy the script must use.
3.  **File Naming:** What is the desired file naming convention for the downloaded PDFs? Should the script rename them to a standard format (e.g., `YYYY-MM_Business-Checking_Statement.pdf`) or keep the original filename provided by the bank?
4.  **Pagination:** If there are many statements, are they displayed on a single page, or are they split across multiple pages (e.g., "Page 1, 2, 3..." or an "infinite scroll" mechanism)?