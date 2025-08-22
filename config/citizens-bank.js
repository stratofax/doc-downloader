module.exports = {
  bank: 'Citizens Bank',
  baseUrl: 'https://www.citizensbankonline.com',
  documentCenterUrl: 'https://www.citizensbankonline.com/olb-root/home/document-center',
  
  selectors: {
    // Document type dropdown (should be set to "Banking documents")  
    documentTypeDropdown: 'select#documentCategory',
    documentTypeOption: 'option[value="Account Documents"]',
    
    // Time frame dropdown
    timeFrameDropdown: 'select#timeFrame',
    timeFrameOptions: {
      select: 'option[value="Select"]',
      last30Days: 'option[value="Last 30 days"]',
      last60Days: 'option[value="Last 60 days"]', 
      last90Days: 'option[value="Last 90 days"]',
      lastYear: 'option[value="Last year"]',
      date: 'option[value="Date"]',
      dateRange: 'option[value="Date range"]'
    },
    
    // Account dropdown
    accountDropdown: 'select#selectedAccount',
    accountOptions: 'select#selectedAccount option:not([disabled])',
    accountPlaceholder: 'Please select account',
    
    // Document type filter
    documentTypeFilter: 'select#documentTypes',
    documentTypeOptions: {
      allChecks: 'option[value="CheckImage"]',
      checksIDeposited: 'option[value="CheckIDeposited"]', 
      checksIWrote: 'option[value="CheckIWrote"]',
      eNotices: 'option[value="eNotice"]',
      statements: 'option[value="Statements"]',
      taxForms: 'option[value="TaxForm"]'
    },
    
    // Apply/Clear buttons
    applyButton: '.olb-c-documentCenter__applyButton button[type="submit"]',
    applyButtonAlt: 'button[cbdata-reason="doccenter-apply"]',
    clearButton: 'button[cbdata-reason="doccenter-clearall"]',
    
    // Date picker elements (for custom date range)
    startDateInput: 'input#cbds-date-picker-document-fromDate',
    endDateInput: 'input#cbds-date-picker-document-toDate',
    startDateCalendarButton: 'button#cbds-date-picker-document-fromDate-cbds-datePickerDialog-toggleCalendar',
    endDateCalendarButton: 'button#cbds-date-picker-document-toDate-cbds-datePickerDialog-toggleCalendar',
    calendarDialog: '.cbds-c-datePickerDialog',
    calendarDayButton: 'button[data-datepickerdialog-date]',
    
    // Statement list and download links 
    statementList: 'table tbody',
    statementRows: 'table tbody tr',
    downloadLinks: 'a[cbdata-reason="doccenter-download"]',
    
    // Loading indicators
    loadingSpinner: '.cbds-c-spinner', // Generic spinner class
    
    // Error messages
    errorMessage: '.cbds-c-alert--error',
    noDocumentsMessage: 'Please select an account above to view documents.'
  },
  
  waitTimes: {
    pageLoad: 3000,
    filterApplication: 2000,
    downloadStart: 2000,
    elementInteraction: 500
  }
};