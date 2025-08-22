#!/usr/bin/env node

const puppeteer = require('puppeteer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const path = require('path');
const config = require('./config/citizens-bank');

const argv = yargs(hideBin(process.argv))
  .option('list-accounts', {
    alias: 'l',
    type: 'boolean',
    description: 'List all available accounts'
  })
  .option('account', {
    alias: 'a',
    type: 'string',
    description: 'Account name to download statements from'
  })
  .option('timeframe', {
    alias: 't',
    type: 'string',
    description: 'Timeframe for filtering statements',
    choices: ['30', '60', '90', 'year'],
    default: '90'
  })
  .option('output-dir', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for downloaded files',
    default: process.cwd()
  })
  .help()
  .argv;

class BankStatementDownloader {
  constructor() {
    this.browser = null;
    this.page = null;
    this.config = config;
  }

  async log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  async connectToBrowser() {
    try {
      this.log('Connecting to browser...');
      this.browser = await puppeteer.connect({
        browserURL: 'http://127.0.0.1:9222'
      });
      
      const pages = await this.browser.pages();
      this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();
      
      this.log('Successfully connected to browser');
      return true;
    } catch (error) {
      console.error('Failed to connect to browser:', error.message);
      console.error('Make sure Chrome is running with --remote-debugging-port=9222');
      return false;
    }
  }

  async navigateToDocumentCenter() {
    try {
      this.log('Navigating to document center...');
      await this.page.goto(this.config.documentCenterUrl, {
        waitUntil: 'networkidle2'
      });
      
      await new Promise(resolve => setTimeout(resolve, this.config.waitTimes.pageLoad));
      this.log('Successfully navigated to document center');
      return true;
    } catch (error) {
      console.error('Failed to navigate to document center:', error.message);
      return false;
    }
  }

  async listAccounts() {
    try {
      this.log('Finding available accounts...');
      
      const accountOptions = await this.page.$$(this.config.selectors.accountOptions);
      const accounts = [];
      
      for (const option of accountOptions) {
        const accountText = await this.page.evaluate(el => el.textContent.trim(), option);
        if (accountText && accountText !== this.config.selectors.accountPlaceholder) {
          accounts.push(accountText);
        }
      }
      
      if (accounts.length === 0) {
        this.log('No accounts found. Make sure you are logged in and on the correct page.');
        return [];
      }
      
      this.log(`Found ${accounts.length} accounts:`);
      accounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account}`);
      });
      
      return accounts;
    } catch (error) {
      console.error('Failed to list accounts:', error.message);
      return [];
    }
  }

  async selectAccount(accountName) {
    try {
      this.log(`Selecting account: ${accountName}`);
      
      const accountOptions = await this.page.$$(this.config.selectors.accountOptions);
      let accountValue = null;
      let accountFound = false;
      
      for (const option of accountOptions) {
        const accountText = await this.page.evaluate(el => el.textContent.trim(), option);
        if (accountText.includes(accountName)) {
          accountValue = await this.page.evaluate(el => el.value, option);
          accountFound = true;
          this.log(`Found matching account: ${accountText}`);
          break;
        }
      }
      
      if (!accountFound) {
        throw new Error(`Account "${accountName}" not found`);
      }
      
      await this.page.select(this.config.selectors.accountDropdown, accountValue);
      this.log(`Selected account with value: ${accountValue}`);
      
      // Trigger change event to ensure form validation updates
      await this.page.evaluate(selector => {
        const select = document.querySelector(selector);
        if (select) {
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, this.config.selectors.accountDropdown);
      
      // Wait longer for any JavaScript to process the selection and form validation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify the selection actually worked
      const currentValue = await this.page.evaluate(selector => {
        const select = document.querySelector(selector);
        return select ? select.value : 'NOT_FOUND';
      }, this.config.selectors.accountDropdown);
      
      this.log(`Current selected value after selection: ${currentValue}`);
      
      // Take a screenshot to see if account selection worked
      try {
        await this.page.screenshot({ path: 'debug-after-account-selection.png', fullPage: true });
        this.log('Saved debug screenshot as debug-after-account-selection.png');
      } catch (screenshotError) {
        this.log('Could not save debug screenshot');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to select account:', error.message);
      return false;
    }
  }

  async applyDateFilter(timeframe) {
    try {
      if (timeframe && timeframe !== 'all') {
        const timeframeMap = {
          '30': 'Last 30 days',
          '60': 'Last 60 days', 
          '90': 'Last 90 days',
          'year': 'Last year'
        };
        
        const timeframeValue = timeframeMap[timeframe];
        this.log(`Applying timeframe filter: ${timeframeValue}`);
        
        await this.page.select(this.config.selectors.timeFrameDropdown, timeframeValue);
        this.log(`Selected "${timeframeValue}" timeframe`);
        
        await new Promise(resolve => setTimeout(resolve, this.config.waitTimes.elementInteraction));
      } else {
        this.log('No specific timeframe filter applied - using default');
      }
      
      // Set document type to Statements for PDF downloads
      await this.page.select(this.config.selectors.documentTypeFilter, 'Statements');
      this.log('Selected "Statements" document type');
      
      // Verify the document type selection worked
      const docTypeValue = await this.page.evaluate(selector => {
        const select = document.querySelector(selector);
        return select ? select.value : 'NOT_FOUND';
      }, this.config.selectors.documentTypeFilter);
      this.log(`Current document type value: ${docTypeValue}`);
      
      return true;
    } catch (error) {
      console.error('Failed to apply date filter:', error.message);
      return false;
    }
  }

  async downloadStatements(outputDir) {
    try {
      this.log('Applying filters and searching for downloadable statements...');
      
      // Check if Apply button exists and is clickable
      let applyButton = await this.page.$(this.config.selectors.applyButton);
      if (!applyButton) {
        this.log('Primary apply button selector not found, trying alternative...');
        applyButton = await this.page.$(this.config.selectors.applyButtonAlt);
      }
      
      if (!applyButton) {
        this.log('Apply button not found with any selector! Checking page state...');
        // Take a screenshot to help debug
        try {
          await this.page.screenshot({ path: 'debug-no-apply-button.png', fullPage: true });
          this.log('Saved debug screenshot as debug-no-apply-button.png');
        } catch (screenshotError) {
          this.log('Could not save debug screenshot');
        }
        return 0;
      }
      
      this.log('Found apply button, checking if it\'s enabled...');
      const buttonState = await this.page.evaluate(btn => {
        return {
          disabled: btn.disabled,
          ariaDisabled: btn.getAttribute('aria-disabled'),
          className: btn.className,
          computedStyle: window.getComputedStyle(btn).pointerEvents
        };
      }, applyButton);
      
      this.log(`Apply button state: ${JSON.stringify(buttonState)}`);
      
      if (buttonState.disabled) {
        this.log('Apply button is disabled - may need to select an account first');
        return 0;
      }
      
      if (buttonState.ariaDisabled === 'true') {
        this.log('Apply button has aria-disabled=true, but trying to click anyway since it may be a visual state issue...');
      }
      
      this.log('Preparing to click apply button...');
      
      // Scroll the button into view first
      await applyButton.scrollIntoView();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check button state again after scrolling and waiting
      const finalButtonState = await this.page.evaluate(btn => {
        return {
          disabled: btn.disabled,
          ariaDisabled: btn.getAttribute('aria-disabled'),
          className: btn.className
        };
      }, applyButton);
      
      this.log(`Final apply button state: ${JSON.stringify(finalButtonState)}`);
      
      this.log('Clicking apply button...');
      
      // Try different click approaches
      try {
        // Method 1: Mouse click simulation with hover first
        const buttonBox = await applyButton.boundingBox();
        if (buttonBox) {
          const centerX = buttonBox.x + buttonBox.width / 2;
          const centerY = buttonBox.y + buttonBox.height / 2;
          
          // Hover first, then click
          await this.page.mouse.move(centerX, centerY);
          await new Promise(resolve => setTimeout(resolve, 100));
          await this.page.mouse.click(centerX, centerY);
          this.log('Mouse hover and click attempted');
        } else {
          throw new Error('Could not get button bounding box');
        }
        
      } catch (error) {
        this.log(`Mouse click failed: ${error.message}, trying direct click...`);
        
        // Method 2: Direct click
        await applyButton.click();
        this.log('Direct click attempted');
      }
      
      await new Promise(resolve => setTimeout(resolve, this.config.waitTimes.filterApplication));
      
      // Check if we still see the "Please select an account" message
      const noDocsMessage = await this.page.$('.olb-c-documentCenter__tableFooter');
      if (noDocsMessage) {
        const messageText = await this.page.evaluate(el => el.textContent.trim(), noDocsMessage);
        if (messageText.includes('Please select an account')) {
          this.log('Still showing "Please select an account" message - filters may not have been applied correctly');
          return 0;
        }
      }
      
      // Wait for results to load and look for download links
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for any links that might be download links (PDFs)
      const downloadLinks = await this.page.$$(this.config.selectors.downloadLinks);
      
      if (downloadLinks.length === 0) {
        this.log('No download links found. The page may need more time to load results or selectors may need adjustment.');
        
        // Take a screenshot to help debug
        try {
          await this.page.screenshot({ path: 'debug-after-apply.png', fullPage: true });
          this.log('Saved debug screenshot as debug-after-apply.png');
        } catch (screenshotError) {
          this.log('Could not save debug screenshot');
        }
        
        return 0;
      }
      
      this.log(`Found ${downloadLinks.length} statements to download`);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      let downloadCount = 0;
      for (let i = 0; i < downloadLinks.length; i++) {
        try {
          this.log(`Downloading statement ${i + 1} of ${downloadLinks.length}...`);
          
          const link = downloadLinks[i];
          await link.click();
          await new Promise(resolve => setTimeout(resolve, this.config.waitTimes.downloadStart));
          
          downloadCount++;
        } catch (error) {
          console.error(`Failed to download statement ${i + 1}:`, error.message);
        }
      }
      
      this.log(`Successfully initiated ${downloadCount} downloads`);
      return downloadCount;
    } catch (error) {
      console.error('Failed to download statements:', error.message);
      return 0;
    }
  }

  async run() {
    try {
      if (!(await this.connectToBrowser())) {
        return false;
      }

      if (!(await this.navigateToDocumentCenter())) {
        return false;
      }

      if (argv.listAccounts) {
        await this.listAccounts();
        return true;
      }

      if (!argv.account) {
        console.error('Account name is required. Use --list-accounts to see available accounts.');
        return false;
      }

      if (!(await this.selectAccount(argv.account))) {
        return false;
      }

      if (!(await this.applyDateFilter(argv.timeframe))) {
        return false;
      }

      const downloadCount = await this.downloadStatements(argv.outputDir);
      
      if (downloadCount > 0) {
        this.log(`Download process completed. Check your downloads folder for ${downloadCount} PDF files.`);
        return true;
      } else {
        this.log('No files were downloaded');
        return false;
      }

    } catch (error) {
      console.error('Unexpected error:', error.message);
      return false;
    } finally {
      if (this.browser) {
        // Don't close the browser since it's user-controlled
        this.log('Disconnecting from browser (browser will remain open)');
      }
    }
  }
}

if (require.main === module) {
  const downloader = new BankStatementDownloader();
  downloader.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = BankStatementDownloader;