const wsStyleLight = `
        /* 1. Base Styles & Light Mode (Default) */
        .jss_worksheet_container, .jss_worksheet, .jss, jss_worksheet {
           background-color: #ffffff !important;
        }
        .jss_worksheet_container *, .jss_worksheet *, .jss *, jss_worksheet * {
          color: #1f2937 !important; /* gray-800 */
        }
        .jss_worksheet thead td {
          background-color: #f3f4f6 !important; /* gray-100 */
          color: #111827 !important; /* gray-900 */
          font-weight: 700 !important;
          border: 1px solid #d1d5db !important;
          text-align: center !important;
        }
        .jss_worksheet thead td div {
          color: #111827 !important;
        }
        .jss_worksheet tbody td {
          background-color: #ffffff !important;
          color: #374151 !important; /* gray-700 */
          border: 1px solid #e5e7eb !important;
        }
        .jss_worksheet tbody td div {
          color: #374151 !important;
        }
        .jss_worksheet td.jss_number, .jss_worksheet td:first-child {
          background-color: #f9fafb !important;
          color: #6b7280 !important;
          border-right: 1px solid #d1d5db !important;
        }

        /* 3. Content Selection & Highlight (Excludes Titles) */
        /* Multi-cell selection background */
        .selected .highlight,
        .selected .highlight-selected {
          background-color: #5A9CB5 !important;
        }

        /* Active selection border (floating element) */
        .selected .jss_highlight, 
        .selected jss_worksheet_highlight,
        .selected .highlight {
          border: 1px solid #f6f8f9ff !important;
          z-index: 10 !important;
        }

        /* Specific border highlights */
       .selected .highlight-top { border-top: 1px solid #5A9CB5 !important; }
       .selected .highlight-bottom { border-bottom: 1px solid #5A9CB5 !important; }
       .selected .highlight-left { border-left: 1px solid #5A9CB5 !important; }
       .selected .highlight-right { border-right: 1px solid #5A9CB5 !important; }

        `;

const wsStyleDark = `
        /* 2. Dark Mode Styles */
        html.dark .jss_worksheet_container, 
        html.dark .jss_worksheet, 
        html.dark .jss, 
        html.dark jss_worksheet {
           background-color: #111827 !important;
        }
        
        html.dark .jss_worksheet_container *, 
        html.dark .jss_worksheet *, 
        html.dark .jss *, 
        html.dark jss_worksheet * {
          color: #f3f4f6 !important;
        }

        html.dark .jss_worksheet thead td {
          background-color: #374151 !important;
          color: #f9fafb !important;
          border: 1px solid #4b5563 !important;
        }
        html.dark .jss_worksheet thead td div {
          color: #f9fafb !important;
        }

        html.dark .jss_worksheet tbody td {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
          border: 1px solid #374151 !important;
        }
        html.dark .jss_worksheet tbody td div {
          color: #e5e7eb !important;
        }

        html.dark .jss_worksheet td.jss_number, 
        html.dark .jss_worksheet td:first-child {
          background-color: #111827 !important;
          color: #9ca3af !important;
          border-right: 1px solid #374151 !important;
        }

        /* Input and editors in dark mode */
        html.dark .jss_worksheet input,
        html.dark .jss_worksheet select,
        html.dark .jss_worksheet textarea,
        html.dark .jss_worksheet_editor {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
          
        /* 3. Content Selection & Highlight (Excludes Titles) */
        /* Multi-cell selection background */
        html.dark .selected .highlight,
        html.dark .selected .highlight-selected {
          background-color: #5A9CB5 !important;
        }

        /* Active selection border (floating element) */
        html.dark .selected .jss_highlight, 
        html.dark .selected jss_worksheet_highlight,
        html.dark .selected .highlight {
          border: 1px solid #f6f8f9ff !important;
          z-index: 10 !important;
        }

        /* Specific border highlights */
        html.dark .selected .highlight-top { border-top: 1px solid #5A9CB5 !important; }
        html.dark .selected .highlight-bottom { border-bottom: 1px solid #5A9CB5 !important; }
        html.dark .selected .highlight-left { border-left: 1px solid #5A9CB5 !important; }
        html.dark .selected .highlight-right { border-right: 1px solid #5A9CB5 !important; }
        
        /* JSuites Dropdown / Autocomplete Menu Dark Mode (Common in JSpreadsheet) */
        html.dark .jdropdown-content {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1) !important;
        }

        html.dark .jdropdown-item {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border-bottom: 1px solid #374151 !important;
        }

        html.dark .jdropdown-item:hover,
        html.dark .jdropdown-item.jdropdown-selected {
          background-color: #374151 !important;
          color: #ffffff !important;
        }
        
        /* Ensure text in items is readable */
        html.dark .jdropdown-item * {
             color: #f3f4f6 !important;
        }

        /* Calendar Dark Mode (if used) */
        html.dark .jcalendar {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #374151 !important;
        }
        html.dark .jcalendar-content {
            background-color: #1f2937 !important;
        }
        html.dark .jcalendar-table td {
            color: #f3f4f6 !important;
        }
        html.dark .jcalendar-table td:hover,
        html.dark .jcalendar-table td.jcalendar-selected {
            background-color: #374151 !important;
            color: #fff !important;
        }
        html.dark .jcalendar-controls, 
        html.dark .jcalendar-header {
             background-color: #374151 !important;
             color: #fff !important;
        }

        `;

const wsStyle = `
        ${wsStyleLight}
        ${wsStyleDark}
      `;

export default wsStyle
