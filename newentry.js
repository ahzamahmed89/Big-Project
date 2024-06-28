document.addEventListener('DOMContentLoaded', function() {
  const generateButton = document.getElementById('generateFormButton');
  const branchCode = document.getElementById('branchCode');
  const branchName = document.getElementById('branchName');
  const regionName = document.getElementById('regionName');
  const monthInput = document.getElementById('month');
  const quarterInput = document.getElementById('quarter');
  const visitDateInput = document.getElementById('visitDate');
  const visitedBy = document.getElementById('visitedBy');
  const reviewedBy = document.getElementById('reviewedBy');
  const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
  const submitButtonContainer = document.getElementById('submitButtonContainer');
  const currentDate = new Date();
  visitDateInput.valueAsDate = currentDate;

  function updateButtonState() {
    generateButton.disabled = !branchCode.value.trim() ||
      branchName.value.trim() === "Branch not found" ||
      !branchName.value.trim() ||
      !regionName.value.trim() ||
      !visitDateInput.value.trim();
  }

  function initializeSelectors() {
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let minDate;
    if (currentDay >= 11) {
      minDate = new Date(currentYear, currentMonth, 1);
    } else {
      minDate = new Date(currentYear, currentMonth - 1, 1);
    }

    const maxDate = currentDate;

    visitDateInput.min = minDate.toISOString().split('T')[0];
    visitDateInput.max = maxDate.toISOString().split('T')[0];

    updateMonthAndQuarter(new Date(visitDateInput.value));
  }

  function updateMonthAndQuarter(selectedDate) {
    const selectedMonth = selectedDate.getMonth();
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const selectedQuarter = Math.floor(selectedMonth / 3);

    monthInput.value = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(selectedDate);
    quarterInput.value = quarters[selectedQuarter];
  }

  initializeSelectors();
  updateButtonState();

  generateButton.addEventListener('click', function(event) {
    event.preventDefault();
    const branchCodeValue = branchCode.value.trim();
    const year = new Date(visitDateInput.value).getFullYear();
    const month = monthInput.value;
    const quarter = quarterInput.value;

    if (!branchCodeValue) {
      alert("Branch code is required.");
      return;
    }

    if (branchName.value.trim() === "Branch not found") {
      alert("Invalid branch name.");
      return;
    }

    fetch(`http://localhost:5000/check-entry?branchCode=${branchCodeValue}&year=${year}&quarter=${quarter}&month=${month}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          alert(data.message);
        } else {
          renderTableData(data.data);
          createSubmitButton();
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('An error occurred while checking the entry. Please try again.');
      });
  });

  branchCode.addEventListener('input', function() {
    const code = this.value.trim();
    console.log('Branch code input:', code); // Log input value
    if (code && code.length == 3) {
      fetch(`http://localhost:5000/branch/${code}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          console.log('Response data:', data); // Log response data
          if (data.success) {
            branchName.value = data.data.Branch_Name;
            regionName.value = data.data.Region;
          } else {
            branchName.value = "Branch not found";
            regionName.value = "";
          }
          updateButtonState();
        })
        .catch(error => {
          console.error('Fetch error:', error); // Log fetch errors
          alert('An error occurred while fetching branch details. Please try again.');
        });
    } else {
      branchName.value = "";
      regionName.value = "";
      updateButtonState();
    }
  });

  visitDateInput.addEventListener('input', function() {
    const selectedDate = new Date(this.value);
    if (selectedDate > currentDate) {
      alert("Future Date Cannot Be Selected, Please Select Current Date");
      this.value = "";
      return;
    }

    updateMonthAndQuarter(selectedDate);
    updateButtonState();
  });

  function renderTableData(fullData) {
    tableBody.innerHTML = '';
  
    const formElements = document.querySelectorAll('#entryForm input, #entryForm select, #entryForm textarea, #generateFormButton');
    
    // Ensure all elements exist before setting properties
    if (formElements) {
      formElements.forEach(element => {
        if (element) {
          element.disabled = true;
        }
      });
    }
  
    if (visitedBy) {
      visitedBy.disabled = false;
    }
    
    if (reviewedBy) {
      reviewedBy.disabled = false;
    }
  
    const submitButton = submitButtonContainer.querySelector('button');
    if (submitButton) {
      submitButton.disabled = false;
    }
  
    fullData.forEach(item => {
      const row = tableBody.insertRow();
      row.dataset.code = item.Code;
      row.dataset.weightage = item.Weightage; // Ensure weightage is set correctly
  
      const categoryCell = row.insertCell(0);
      const activityCell = row.insertCell(1);
      const statusCell = row.insertCell(2);
      const responsibilityCell = row.insertCell(3);
      const remarksCell = row.insertCell(4);
      const imageCell = row.insertCell(5);
  
      categoryCell.textContent = item.Category;
      activityCell.textContent = item.Activity;
  
      // Create a select element for status and populate it
      const statusSelect = createStatusSelect(item.Status);
      statusCell.appendChild(statusSelect);
  
      const responsibilitySelect = createResponsibilitySelect();
      responsibilityCell.appendChild(responsibilitySelect);
  
      const remarksInput = document.createElement('input');
      remarksInput.type = 'text';
      remarksCell.appendChild(remarksInput);
  
      const imageInput = document.createElement('input');
      imageInput.type = 'file';
      imageInput.accept = 'image/*';
      imageInput.capture = 'camera';
      imageCell.appendChild(imageInput);
    });
  }
  

  function createStatusSelect(selectedStatus) {
    const statusSelect = document.createElement('select');
    ['Yes', 'No', 'NA'].forEach(status => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      if (selectedStatus === status) {
        option.selected = true;
      }
      statusSelect.appendChild(option);
    });

    // Add event listener for status change
    statusSelect.addEventListener('change', function() {
      if (this.value === 'Yes') {
        this.style.color = 'darkgreen';
        this.style.backgroundColor = 'lightgreen';
        this.style.fontWeight = 'bold';
      } else if (this.value === 'No') {
        this.style.color = 'darkred';
        this.style.backgroundColor = 'lightcoral';
        this.style.fontWeight = 'bold';
      } else if (this.value === 'NA') {
        this.style.color = 'goldenrod';
        this.style.backgroundColor = 'lightgoldenrodyellow';
        this.style.fontWeight = 'bold';
      }
    });

    statusSelect.dispatchEvent(new Event('change'));
    return statusSelect;
  }

  function createResponsibilitySelect() {
    const responsibilitySelect = document.createElement('select');
    responsibilitySelect.appendChild(document.createElement('option'));
    ['Admin', 'Branch Operations', 'IT', 'Marketing', 'Business', 'HR', 'Others'].forEach(resp => {
      const option = document.createElement('option');
      option.value = resp;
      option.textContent = resp;
      responsibilitySelect.appendChild(option);
    });
    return responsibilitySelect;
  }

  function createSubmitButton() {
    submitButtonContainer.innerHTML = '<button id="submitFormButton">Submit Form</button>';

    const submitFormButton = document.getElementById('submitFormButton');
    submitFormButton.addEventListener('click', function(event) {
      event.preventDefault();
      if (validateForm() && validateStatus()) {
        submitForm();
      }
    });
  }

  function validateForm() {
    let valid = true;
    let message = '';

    if (!branchCode.value.trim()) {
      valid = false;
      message += 'Branch Code is required.\n';
    }
    if (!branchName.value.trim() || branchName.value.trim() === "Branch not found") {
      valid = false;
      message += 'Valid Branch Name is required.\n';
    }
    if (!regionName.value.trim()) {
      valid = false;
      message += 'Region Name is required.\n';
    }
    if (!visitedBy.value.trim()) {
      valid = false;
      message += 'Visited By is required.\n';
    }
    if (!visitDateInput.value.trim()) {
      valid = false;
      message += 'Visit Date is required.\n';
    }

    if (!valid) {
      alert(message);
    }

    return valid;
  }

  function validateStatus() {
    let valid = true;
    let message = '';

    const tableRows = tableBody.getElementsByTagName('tr');

    for (let row of tableRows) {
      const status = row.cells[2].getElementsByTagName('select')[0].value;
      const responsibility = row.cells[3].getElementsByTagName('select')[0].value.trim();
      const remarks = row.cells[4].getElementsByTagName('input')[0].value.trim();
      const activity = row.cells[1].textContent;

      if (status === 'No') {
        if (!responsibility) {
          valid = false;
          message += `Responsibility is required for activity "${activity}" with status "No".\n`;
        }
        if (!remarks) {
          valid = false;
          message += `Remarks are required for activity "${activity}" with status "No".\n`;
        }
      }
    }

    if (!valid) {
      alert(message);
    }

    return valid;
  }

  function submitForm() {
    const confirmedTime = prompt("Please confirm the visit time (HH:MM:SS AM/PM):", currentDate.toLocaleTimeString());
    const visitData = collectVisitData();
    const formData = new FormData();

    const dataToSend = {
      Branch_Code: branchCode.value.trim(),
      Branch_Name: branchName.value.trim(),
      Region_Name: regionName.value.trim(),
      Quarter: quarterInput.value.trim(),
      Month: monthInput.value.trim(),
      Year: new Date(visitDateInput.value).getFullYear(),
      Visited_By: visitedBy.value.trim(),
      Visit_Date: visitDateInput.value.trim(),
      Visit_Time: confirmedTime,
      Reviewed_By_OM_BM: reviewedBy.value.trim(),
      Activities: visitData.activities
    };

    formData.append('data', JSON.stringify(dataToSend));

    visitData.images.forEach((file, index) => {
      formData.append(`image${index}`, file);
    });

    fetch('http://localhost:5000/submit-data', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      if (data.success) {
          alert('Form submitted successfully!');
          location.reload(); // Reload the page after successful submission
      } else {
          alert('Error submitting form: ' + data.message);
      }
  })
  .catch(error => {
      console.error('Fetch error:', error);
      alert('Fetch error: ' + error.message);
  });
  
  }

  function collectVisitData() {
    const visitData = {
      activities: [],
      images: []
    };

    const tableRows = tableBody.getElementsByTagName('tr');

    for (let row of tableRows) {
      const code = row.dataset.code;
      const weightage = row.dataset.weightage;
      const category = row.cells[0].textContent;
      const activity = row.cells[1].textContent;
      const status = row.cells[2].getElementsByTagName('select')[0].value;
      const responsibility = row.cells[3].getElementsByTagName('select')[0].value.trim();
      const remarks = row.cells[4].getElementsByTagName('input')[0].value.trim();
      const imageInput = row.cells[5].getElementsByTagName('input')[0];

      const imageName = `${branchCode.value.trim()}${monthInput.value}${new Date().getFullYear()}${code.padStart(3, '0')}.PNG`;

      if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        visitData.images.push(file);
      }

      visitData.activities.push({
        Code: parseInt(code),
        Category: category,
        Activity: activity,
        Weightage: weightage,
        Status: status,
        Responsibility: responsibility,
        Remarks: remarks,
        Images: imageName
      });
    }
    return visitData;
  }

  function saveImageToDisk(arrayBuffer, path) {
    // This function needs to be implemented server-side to save the image to disk
  }
});
