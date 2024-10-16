
function scrapeTableData() {
  const table = document.querySelector("table.previous-result-table"); // Adjust this selector based on the target table
  const data = [];
  
  if (table) {
    for (const row of table.rows) {
      const rowData = Array.from(row.cells).map(cell => cell.innerText);
      data.push(rowData);
    }
    
  } else {
    console.log("No table found on the page.");
    return { success: false, message: "No table found on the page." };
  }

  // Scrape the Student ID and Name by looking through all divs
  let studentId = null;
  let name = null;

  const divs = document.querySelectorAll('div');
  divs.forEach(div => {
    if (div.innerText.includes("Student ID")) {
      const parts = div.innerText.split(":");
      if (parts.length > 1) {
        studentId = parts[1].trim();  // Safely handle potential undefined
      }
    }
    if (div.innerText.includes("Name")) {
      const parts = div.innerText.split(":");
      if (parts.length > 1) {
        name = parts[1].trim();  // Safely handle potential undefined
      }
    }
  });


  return { success: true, tableData: data, studentId, name };
}

// Send scraped data to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_TABLE") {
    const { success, tableData, studentId, name } = scrapeTableData();
    
    if (!success) {
      sendResponse({ success, message: "No grade sheet found. Please ensure you are on the BRACU USIS advising page, click on the 'Previous Result' button, and confirm that the grade sheet is visible." });
    } else {
      const additionalData = scrapeAdditionalData();  // Scrape the additional elements
      // console.log("Table data",tableData.at(-3));

      sendResponse({ success, tableData, studentId, name, additionalData });
    }
  }
});

// Scrape additional data
function scrapeAdditionalData() {
  // Find the 'Program' and 'Enrolled Session' rows
  const rows = Array.from(document.querySelectorAll('tr'));
  
  let program = null;
  let enrolledSession = null;
  let creditLimit = null;
  let creditTaken = null;

  rows.forEach(row => {
  const cells = row.querySelectorAll('td');
  
  if (cells[0] && cells[0].innerText.includes('Program')) {
    program = cells[1].querySelector('div') ? cells[1].querySelector('div').innerText.trim() : null;
  }
  if (cells.length > 2) {
    if (cells[2] && cells[2].innerText.includes('Enrolled Session')) {
      enrolledSession = cells[3].querySelector('div') ? cells[3].querySelector('div').innerText.trim() : null;
    }
  }
  
});

  // Scrape credit limit and credit taken using their specific IDs
  creditLimit = document.getElementById('creditLimit') ? document.getElementById('creditLimit').innerText.trim() : null;
  creditTaken = document.getElementById('creditTaken') ? document.getElementById('creditTaken').innerText.trim() : null;

  return {
    program: program,
    enrolledSession: enrolledSession,
    creditLimit: creditLimit,
    creditTaken: creditTaken,
  };
}

// Send scraped data to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_TABLE") {
    const { tableData, studentId, name } = scrapeTableData();
    const additionalData = scrapeAdditionalData();  // Scrape the additional elements
    sendResponse({ tableData, studentId, name, additionalData });
  }
});
