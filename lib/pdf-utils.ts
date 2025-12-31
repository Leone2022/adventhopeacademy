/**
 * PDF and Print Utilities
 * Provides functions for generating PDFs and handling print operations
 */

export const generatePDF = async (elementId: string, filename: string = 'document.pdf') => {
  // For client-side PDF generation, we'll use the browser's print functionality
  // For server-side, you would use libraries like puppeteer or jsPDF
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups.');
  }

  // Get the HTML content
  const htmlContent = element.innerHTML;
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  // Write the content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};

export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Create a clone of the element
  const clone = element.cloneNode(true) as HTMLElement;
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    // Fallback to regular print if popup is blocked
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};

export const downloadAsPDF = async (elementId: string, filename: string) => {
  // This is a placeholder - for actual PDF download, you'd need a library like jsPDF
  // or a server-side solution with puppeteer
  console.warn('PDF download requires additional setup. Using print instead.');
  printElement(elementId);
};

