// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all menu items and content sections
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Add click event listeners to menu items
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionName = this.getAttribute('data-section');
            switchSection(sectionName);
        });
    });
    
    // Initialize with dashboard section active
    switchSection('dashboard');
});

// Function to switch between dashboard sections
function switchSection(sectionName) {
    // Remove active class from all menu items and content sections
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked menu item (if it exists) and corresponding content section
    const menuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    const contentSection = document.getElementById(sectionName);
    if (contentSection) {
        contentSection.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionName);
    
    // If switching to dashboard, update with allpeople data and refresh file list
    if (sectionName === 'dashboard') {
        console.log('Switching to dashboard, checking for allpeople data...');
        setTimeout(() => {
            updateDashboardFromAllPeople();
            updateAllPeopleFilesList();
            updateOpenPositionsFromHiring(); // Update open positions from hiring data
        }, 100);
    }
    
    // If switching to tracking, update tracking table with allpeople data
    if (sectionName === 'tracking') {
        console.log('Switching to tracking, updating with allpeople data...');
        setTimeout(() => {
            const updated = updateDashboardFromAllPeople();
            if (!updated) {
                console.log('No allpeople data found for tracking update');
            }
        }, 100);
    }
    
    // If switching to hiring, check for existing hiring data
    if (sectionName === 'hiring') {
        console.log('Switching to hiring, checking for existing hiring data...');
        setTimeout(() => {
            refreshHiringData();
        }, 100);
    }
}

// Function to update page title based on active section
function updatePageTitle(sectionName) {
    const titles = {
        'dashboard': 'Aeris Tech People Dashboard',
        'tracking': 'Employee Tracking - Aeris Tech',
        'hiring': 'Hiring Management - Aeris Tech',
        'file-manager': 'File Upload Manager - Aeris Tech'
    };
    
    document.title = titles[sectionName] || 'Aeris Tech People Dashboard';
}

// Tracking section functionality
function initializeTracking() {
    const departmentFilter = document.getElementById('department-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (departmentFilter && statusFilter) {
        departmentFilter.addEventListener('change', filterEmployees);
        statusFilter.addEventListener('change', filterEmployees);
    }
}

function filterEmployees() {
    const department = document.getElementById('department-filter').value;
    const status = document.getElementById('status-filter').value;
    
    // This would typically filter the employee table
    // For now, we'll just log the filters
    console.log('Filtering employees:', { department, status });
    
    // In a real application, you would:
    // 1. Make an API call to fetch filtered data
    // 2. Update the table with new data
    // 3. Show loading state while fetching
}

// Hiring section functionality
function addNewPosition() {
    // This would typically open a modal or navigate to a form
    alert('Add New Position functionality would be implemented here');
}

function exportReport() {
    // This would typically generate and download a report
    alert('Export Report functionality would be implemented here');
}

function viewApplicants(positionId) {
    // This would typically show applicants for a specific position
    console.log('Viewing applicants for position:', positionId);
    alert('View Applicants functionality would be implemented here');
}

function editPosition(positionId) {
    // This would typically open an edit form for the position
    console.log('Editing position:', positionId);
    alert('Edit Position functionality would be implemented here');
}

function reviewApplication(applicationId) {
    // This would typically open the application review interface
    console.log('Reviewing application:', applicationId);
    alert('Review Application functionality would be implemented here');
}

// Hiring CSV Upload and Analysis Functions
function handleHiringFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('Please upload a CSV file', 'error');
        return;
    }
    
    console.log('Processing hiring CSV file:', file.name);
    showNotification('Processing hiring data...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const hiringData = parseCSV(csvText);
            
            if (hiringData && hiringData.length > 0) {
                // Store hiring data
                const storageKey = `aeris_hiring_${file.name}`;
                localStorage.setItem(storageKey, JSON.stringify({
                    filename: file.name,
                    rawData: hiringData,
                    uploadedAt: new Date().toISOString(),
                    processedData: true
                }));
                
                // Process and display hiring analysis
                processHiringData(hiringData, file.name);
                showNotification(`Successfully processed ${hiringData.length} hiring records from ${file.name}`, 'success');
            } else {
                showNotification('No valid hiring data found in the CSV file', 'error');
            }
        } catch (error) {
            console.error('Error processing hiring CSV:', error);
            showNotification('Error processing hiring CSV file', 'error');
        }
    };
    
    reader.readAsText(file);
}

function processHiringData(hiringData, filename) {
    console.log('Processing hiring data:', hiringData);
    
    // Show the hiring analysis section
    const analysisSection = document.getElementById('hiringAnalysis');
    if (analysisSection) {
        analysisSection.style.display = 'block';
    }
    
    // Get sTLT data for mapping
    const stltData = getSTLTMapping();
    
    // Analyze job titles and prepare job cards data
    const jobTitleCounts = {};
    const stltCounts = {};
    const jobCards = [];
    let totalOpenPositions = 0;
    
    hiringData.forEach((row, index) => {
        const jobTitle = row['job title'] || row['Job Title'] || row['JOB TITLE'] || row['position'] || row['Position'] || row['role'] || row['Role'] || '';
        const status = (row['status'] || row['Status'] || row['job status'] || row['Job Status'] || '').toLowerCase();
        
        // Use Column B 'country' for location, with fallbacks
        const location = row['country'] || row['Country'] || row['COUNTRY'] || 
                         row[Object.keys(row)[1]] || // Column B (2nd column, zero-based index 1)
                         row['location'] || row['Location'] || row['office'] || row['Office'] || row['site'] || row['Site'] || '';
        
        const stlt = row['stlt'] || row['sTLT'] || row['STLT'] || row['team'] || row['Team'] || row['department'] || row['Department'] || '';
        
        // Use 'Hiring manager' column instead of applicants
        const hiringManager = row['hiring manager'] || row['Hiring manager'] || row['Hiring Manager'] || row['HIRING MANAGER'] || 
                             row['hiring_manager'] || row['manager'] || row['Manager'] || '';
        
        const postedDate = row['posted date'] || row['Posted Date'] || row['date posted'] || row['Date Posted'] || row['created'] || row['Created'] || '';
        const description = row['description'] || row['Description'] || row['job description'] || row['Job Description'] || '';
        
        // Determine if position is open
        const isOpen = status.includes('open') || status.includes('active') || status.includes('available') || status === '';
        
        // Create job card data
        const jobCard = {
            id: `job_${index}`,
            title: jobTitle,
            status: status || 'open',
            location: location || 'Location TBD',
            hiringManager: hiringManager || 'Manager TBD',
            postedDate: postedDate,
            description: description,
            stlt: stlt,
            isOpen: isOpen
        };
        
        jobCards.push(jobCard);
        
        // Count open positions
        if (isOpen) {
            totalOpenPositions++;
            
            // Count by job title
            if (jobTitle) {
                jobTitleCounts[jobTitle] = (jobTitleCounts[jobTitle] || 0) + 1;
            }
            
            // Count by sTLT - try to map to known sTLTs if possible
            let mappedSTLT = stlt;
            if (!stlt && stltData && jobTitle) {
                // Try to map job title to sTLT based on known mapping
                mappedSTLT = mapJobTitleToSTLT(jobTitle, stltData);
            }
            
            if (mappedSTLT) {
                stltCounts[mappedSTLT] = (stltCounts[mappedSTLT] || 0) + 1;
            }
        }
    });
    
    // Update statistics
    document.getElementById('totalOpenPositions').textContent = totalOpenPositions;
    document.getElementById('uniqueJobTitles').textContent = Object.keys(jobTitleCounts).length;
    document.getElementById('stltsWithOpenings').textContent = Object.keys(stltCounts).length;
    
    // Update breakdown sections
    updateJobTitleBreakdown(jobTitleCounts);
    updateSTLTBreakdown(stltCounts);
    
    // Update hiring grid with job cards
    updateHiringGrid(jobCards);
    
    // Update main dashboard open positions card
    updateStatCard('Open Positions', totalOpenPositions);
    
    // Update remove button visibility
    updateRemoveButtonVisibility();
}

function getSTLTMapping() {
    // Try to get sTLT data from Tech People Portal or stored sTLT data
    try {
        if (typeof getPortalSTLTData === 'function') {
            return getPortalSTLTData();
        }
        
        // Check localStorage for sTLT data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('stlt')) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.rawData) {
                    return data.rawData;
                }
            }
        }
    } catch (error) {
        console.log('Could not get sTLT mapping:', error);
    }
    return null;
}

function mapJobTitleToSTLT(jobTitle, stltData) {
    if (!stltData || !Array.isArray(stltData)) return '';
    
    const jobTitleLower = jobTitle.toLowerCase();
    
    // Common job title to functional area mapping
    const titleMappings = {
        'software engineer': 'Software Engineering',
        'senior software engineer': 'Software Engineering',
        'developer': 'Software Engineering',
        'programmer': 'Software Engineering',
        'frontend': 'Software Engineering',
        'backend': 'Software Engineering',
        'fullstack': 'Software Engineering',
        'data scientist': 'Data Science',
        'data analyst': 'Data Science',
        'data engineer': 'Data Science',
        'machine learning': 'Data Science',
        'product manager': 'Product Management',
        'product owner': 'Product Management',
        'ux designer': 'Design',
        'ui designer': 'Design',
        'designer': 'Design',
        'devops': 'Platform Engineering',
        'infrastructure': 'Platform Engineering',
        'security': 'Security',
        'cybersecurity': 'Security',
        'qa': 'Quality Assurance',
        'tester': 'Quality Assurance',
        'quality': 'Quality Assurance'
    };
    
    // Try exact mapping first
    for (const [keyword, functionalArea] of Object.entries(titleMappings)) {
        if (jobTitleLower.includes(keyword)) {
            return functionalArea;
        }
    }
    
    // Try to match with sTLT data functional areas
    for (const stltRow of stltData) {
        const functionalArea = stltRow['Functional Area'] || stltRow['functional area'] || stltRow[Object.keys(stltRow)[0]] || '';
        if (functionalArea && jobTitleLower.includes(functionalArea.toLowerCase())) {
            return functionalArea;
        }
    }
    
    return 'Other';
}

function updateJobTitleBreakdown(jobTitleCounts) {
    const container = document.getElementById('openingsByJobTitle');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort by count (descending)
    const sortedTitles = Object.entries(jobTitleCounts)
        .sort(([,a], [,b]) => b - a);
    
    if (sortedTitles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; margin: 2rem 0;">No job titles found</p>';
        return;
    }
    
    sortedTitles.forEach(([title, count]) => {
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
            <span class="breakdown-label">${title}</span>
            <span class="breakdown-count">${count}</span>
        `;
        container.appendChild(item);
    });
}

function updateSTLTBreakdown(stltCounts) {
    const container = document.getElementById('openingsBySTLT');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort by count (descending)
    const sortedSTLTs = Object.entries(stltCounts)
        .sort(([,a], [,b]) => b - a);
    
    if (sortedSTLTs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d; margin: 2rem 0;">No sTLT data found</p>';
        return;
    }
    
    sortedSTLTs.forEach(([stlt, count]) => {
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
            <span class="breakdown-label">${stlt}</span>
            <span class="breakdown-count">${count}</span>
        `;
        container.appendChild(item);
    });
}

function updateHiringGrid(jobCards) {
    const hiringGrid = document.getElementById('hiringGrid');
    const noHiringData = document.getElementById('noHiringData');
    
    if (!hiringGrid) return;
    
    // Clear existing content
    hiringGrid.innerHTML = '';
    
    if (jobCards.length === 0) {
        // Show no data message
        hiringGrid.appendChild(noHiringData);
        return;
    }
    
    // Hide no data message and create job cards
    if (noHiringData) {
        noHiringData.style.display = 'none';
    }
    
    jobCards.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        
        // Format posted date
        let postedDateDisplay = 'Date TBD';
        if (job.postedDate) {
            try {
                const date = new Date(job.postedDate);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    postedDateDisplay = 'Posted today';
                } else if (diffDays === 1) {
                    postedDateDisplay = 'Posted 1 day ago';
                } else if (diffDays < 7) {
                    postedDateDisplay = `Posted ${diffDays} days ago`;
                } else if (diffDays < 14) {
                    postedDateDisplay = 'Posted 1 week ago';
                } else {
                    postedDateDisplay = `Posted ${Math.floor(diffDays / 7)} weeks ago`;
                }
            } catch (error) {
                postedDateDisplay = job.postedDate;
            }
        }
        
        // Determine status class and display
        let statusClass = 'open';
        let statusDisplay = 'Open';
        
        if (job.status.includes('filled') || job.status.includes('closed')) {
            statusClass = 'filled';
            statusDisplay = 'Filled';
        } else if (job.status.includes('review') || job.status.includes('progress')) {
            statusClass = 'in-review';
            statusDisplay = 'In Review';
        } else if (job.status.includes('paused') || job.status.includes('hold')) {
            statusClass = 'paused';
            statusDisplay = 'On Hold';
        }
        
        jobCard.innerHTML = `
            <div class="job-header">
                <h3>${job.title || 'Untitled Position'}</h3>
                <span class="job-status ${statusClass}">${statusDisplay}</span>
            </div>
            <div class="job-details">
                <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                <p><i class="fas fa-user-tie"></i> Hiring Manager: ${job.hiringManager}</p>
                <p><i class="fas fa-calendar"></i> ${postedDateDisplay}</p>
                ${job.stlt ? `<p><i class="fas fa-sitemap"></i> ${job.stlt}</p>` : ''}
            </div>
        `;
        
        hiringGrid.appendChild(jobCard);
    });
}

// Job action functions
function viewJobDetails(jobId) {
    console.log('Viewing job details for:', jobId);
    showNotification('Job details functionality would be implemented here', 'info');
}

function viewApplicants(jobId) {
    console.log('Viewing applicants for:', jobId);
    showNotification('View applicants functionality would be implemented here', 'info');
}

function archiveJob(jobId) {
    console.log('Archiving job:', jobId);
    showNotification('Archive job functionality would be implemented here', 'info');
}

// Function to remove all hiring data
function removeHiringData() {
    // Show confirmation dialog
    const confirmRemove = confirm('Are you sure you want to remove all hiring CSV data? This action cannot be undone.');
    
    if (!confirmRemove) {
        return;
    }
    
    console.log('Removing all hiring data...');
    
    // Remove all hiring data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_hiring_')) {
            keysToRemove.push(key);
        }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('Removed hiring data:', key);
    });
    
    // Clear the hiring grid and show no data message
    const hiringGrid = document.getElementById('hiringGrid');
    const noHiringData = document.getElementById('noHiringData');
    const analysisSection = document.getElementById('hiringAnalysis');
    
    if (hiringGrid && noHiringData) {
        hiringGrid.innerHTML = '';
        hiringGrid.appendChild(noHiringData);
        noHiringData.style.display = 'block';
    }
    
    // Hide the analysis section
    if (analysisSection) {
        analysisSection.style.display = 'none';
    }
    
    // Reset open positions to 0 on dashboard
    updateStatCard('Open Positions', 0);
    
    // Clear file input
    const fileInput = document.getElementById('hiringFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Show success notification
    showNotification('All hiring CSV data has been removed', 'success');
    
    // Update remove button visibility (should hide it now)
    updateRemoveButtonVisibility();
    
    console.log('Hiring data removal completed');
}

// Function to update remove button visibility based on data availability
function updateRemoveButtonVisibility() {
    const removeButton = document.querySelector('button[onclick="removeHiringData()"]');
    if (!removeButton) return;
    
    // Check if any hiring data exists
    let hasHiringData = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_hiring_')) {
            hasHiringData = true;
            break;
        }
    }
    
    // Show/hide button based on data availability
    if (hasHiringData) {
        removeButton.style.display = 'inline-flex';
    } else {
        removeButton.style.display = 'none';
    }
}

// Function to update Open Positions card from hiring data
function updateOpenPositionsFromHiring() {
    console.log('Updating open positions from hiring data...');
    
    // Look for hiring data in localStorage
    let hiringData = null;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_hiring_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.rawData) {
                    hiringData = data.rawData;
                    break;
                }
            } catch (error) {
                console.error('Error loading hiring data for open positions:', error);
            }
        }
    }
    
    let openPositionsCount = 0;
    
    if (hiringData && Array.isArray(hiringData)) {
        // Count open positions from hiring data
        hiringData.forEach(row => {
            const status = (row['status'] || row['Status'] || row['job status'] || row['Job Status'] || '').toLowerCase();
            const isOpen = status.includes('open') || status.includes('active') || status.includes('available') || status === '';
            
            if (isOpen) {
                openPositionsCount++;
            }
        });
        
        console.log(`Found ${openPositionsCount} open positions from hiring data`);
    } else {
        console.log('No hiring data found, setting open positions to 0');
    }
    
    // Update the open positions card
    updateStatCard('Open Positions', openPositionsCount);
    
    return openPositionsCount;
}

function refreshHiringData() {
    // Look for hiring data in localStorage
    let hiringData = null;
    let filename = '';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_hiring_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.rawData) {
                    hiringData = data.rawData;
                    filename = data.filename || 'hiring data';
                    break;
                }
            } catch (error) {
                console.error('Error loading hiring data:', error);
            }
        }
    }
    
    if (hiringData) {
        processHiringData(hiringData, filename);
        updateOpenPositionsFromHiring(); // Ensure dashboard card is updated
        showNotification('Hiring data refreshed', 'success');
    } else {
        // No hiring data found - show no data message
        const hiringGrid = document.getElementById('hiringGrid');
        const noHiringData = document.getElementById('noHiringData');
        const analysisSection = document.getElementById('hiringAnalysis');
        
        if (hiringGrid && noHiringData) {
            hiringGrid.innerHTML = '';
            hiringGrid.appendChild(noHiringData);
            noHiringData.style.display = 'block';
        }
        
        if (analysisSection) {
            analysisSection.style.display = 'none';
        }
        
        // Reset open positions to 0 when no hiring data
        updateStatCard('Open Positions', 0);
        
        console.log('No hiring data found - showing empty state');
    }
    
    // Update remove button visibility
    updateRemoveButtonVisibility();
}

// Utility functions for dashboard interactions
function showEmployeeDetails(employeeId) {
    console.log('Showing details for employee:', employeeId);
    alert('Employee details functionality would be implemented here');
}

function updateEmployeeStatus(employeeId, newStatus) {
    console.log('Updating employee status:', { employeeId, newStatus });
    // This would typically make an API call to update the status
}

// Search functionality
function performSearch() {
    const searchQuery = document.querySelector('.search-input')?.value || '';
    console.log('Performing search:', searchQuery);
    // Implement search logic here
}

// Notification system
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type); // Debug log
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#17a2b8';
            break;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

// Data refresh functionality
function refreshDashboardData() {
    showNotification('Refreshing dashboard data...', 'info');
    
    // Update the allpeople files list
    updateAllPeopleFilesList();
    
    // Update dashboard with allpeople data
    const updated = updateDashboardFromAllPeople();
    
    setTimeout(() => {
        if (updated) {
            showNotification('Dashboard data updated successfully from allpeople files', 'success');
        } else {
            showNotification('No allpeople files found. Upload a file with "allpeople" in the name.', 'warning');
        }
        // Update UI with new data
    }, 1500);
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate real-time data updates
        updateStatNumbers();
    }, 30000); // Update every 30 seconds
}

function updateStatNumbers() {
    // Simulate dynamic stat updates
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        const variation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newValue = Math.max(0, currentValue + variation);
        stat.textContent = newValue;
    });
}

// Initialize dashboard features
document.addEventListener('DOMContentLoaded', function() {
    initializeTracking();
    initializeFileUpload();
    loadSavedFiles(); // Load previously saved files
    startRealTimeUpdates();
});

// Load saved files from localStorage
function loadSavedFiles() {
    console.log('Loading saved files from localStorage...');
    
    const savedFiles = [];
    
    // Scan localStorage for saved files
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_file_')) {
            try {
                const savedData = JSON.parse(localStorage.getItem(key));
                const filename = key.replace('aeris_file_', '');
                
                // Recreate file object
                const fileObj = {
                    name: filename,
                    size: savedData.metadata.size,
                    type: savedData.metadata.type,
                    lastModified: new Date(savedData.metadata.uploadDate).getTime()
                };
                
                // Add to memory storage
                window.fileStorage.set(filename, {
                    content: savedData.content,
                    file: fileObj,
                    uploadDate: savedData.metadata.uploadDate,
                    processed: savedData.metadata.processed,
                    size: savedData.metadata.size,
                    type: savedData.metadata.type,
                    rawData: savedData.rawData || null,
                    processedData: savedData.processedData || null
                });
                
                savedFiles.push({ filename, data: savedData });
                console.log('Loaded saved file:', filename);
                
            } catch (error) {
                console.error('Error loading saved file:', key, error);
            }
        }
    }
    
    // Display saved files in the UI
    if (savedFiles.length > 0) {
        console.log(`Loaded ${savedFiles.length} saved files`);
        
        let hasAllPeopleFile = false;
        
        savedFiles.forEach(({ filename, data }) => {
            displaySavedFile(filename, data);
            
            // Check if this is an allpeople file
            if (filename.toLowerCase().includes('allpeople')) {
                hasAllPeopleFile = true;
            }
        });
        
        updateFileCount();
        showNotification(`Loaded ${savedFiles.length} previously saved files`, 'success');
        
        // If we found an allpeople file, update the dashboard
        if (hasAllPeopleFile) {
            console.log('Found allpeople file on startup, updating dashboard...');
            setTimeout(() => {
                updateDashboardFromAllPeople();
                updateAllPeopleFilesList();
            }, 1000);
        } else {
            // Still update the files list to show no files message
            setTimeout(() => {
                updateAllPeopleFilesList();
            }, 500);
        }
    } else {
        console.log('No saved files found');
    }
}

// Display a saved file in the UI
function displaySavedFile(filename, data) {
    const fileItem = createSimpleFileItem({
        name: filename,
        size: data.metadata.size,
        type: data.metadata.type
    });
    
    const filesList = document.getElementById('filesList');
    if (filesList) {
        filesList.appendChild(fileItem);
        
        // Update status based on processed state
        if (data.metadata.processed) {
            updateFileStatus(filename, 'processed', 'Processed');
        } else {
            updateFileStatus(filename, 'uploaded', 'Uploaded');
        }
    }
}

// File Upload Manager functionality
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadZone || !fileInput) return;
    
    // Drag and drop functionality
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    processUploadedFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    console.log('Files selected:', files); // Debug log
    if (files.length > 0) {
        processUploadedFiles(files);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
}

function processUploadedFiles(files) {
    Array.from(files).forEach(file => {
        if (validateFile(file)) {
            uploadFile(file);
        } else {
            showNotification(`Invalid file type: ${file.name}`, 'error');
        }
    });
}

function validateFile(file) {
    const allowedTypes = [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    
    const allowedExtensions = ['.csv', '.json', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
}

// Simple file upload function (fallback)
function uploadFile(file) {
    console.log('Simple upload for file:', file.name); // Debug log
    
    showNotification(`Uploading ${file.name}...`, 'info');
    
    // Create a simple file item without progress bar first
    const fileItem = createSimpleFileItem(file);
    const filesList = document.getElementById('filesList');
    
    if (filesList) {
        filesList.insertBefore(fileItem, filesList.firstChild);
        
        // Add to file storage
        addToFileStorage(file);
        
        // Update file status after a short delay
        setTimeout(() => {
            updateFileStatus(file.name, 'uploaded', 'Uploaded');
            showNotification(`${file.name} uploaded successfully!`, 'success');
            
            // Auto-process the file
            setTimeout(() => {
                processFileData(file);
            }, 1000);
        }, 500);
    } else {
        console.error('Files list element not found'); // Debug log
    }
}

function createSimpleFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas ${fileIcon.icon} file-icon ${fileIcon.class}"></i>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} • Just uploaded</p>
                <span class="file-status uploading">Processing...</span>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-small" onclick="viewFileData('${file.name}')">
                <i class="fas fa-eye"></i>
                View Data
            </button>
            <button class="btn-small" onclick="downloadFile('${file.name}')">
                <i class="fas fa-download"></i>
                Download
            </button>
            <button class="btn-small" onclick="processFile('${file.name}')">
                <i class="fas fa-sync"></i>
                Process
            </button>
            <button class="btn-small btn-danger" onclick="deleteFile('${file.name}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    
    return fileItem;
}

function addFileToList(file) {
    const filesList = document.getElementById('filesList');
    const fileItem = createFileItem(file);
    filesList.insertBefore(fileItem, filesList.firstChild);
}

function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    const uploadTime = new Date().toLocaleString();
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas ${fileIcon.icon} file-icon ${fileIcon.class}"></i>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} • Uploaded just now</p>
                <span class="file-status uploading">Processing...</span>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-small" onclick="viewFileData('${file.name}')">
                <i class="fas fa-eye"></i>
                View Data
            </button>
            <button class="btn-small" onclick="processFile('${file.name}')">
                <i class="fas fa-sync"></i>
                Reprocess
            </button>
            <button class="btn-small btn-danger" onclick="deleteFile('${file.name}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    
    return fileItem;
}

function getFileIcon(filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    switch (extension) {
        case '.csv':
            return { icon: 'fa-file-csv', class: 'csv' };
        case '.json':
            return { icon: 'fa-file-code', class: 'json' };
        case '.xlsx':
        case '.xls':
            return { icon: 'fa-file-excel', class: 'excel' };
        default:
            return { icon: 'fa-file', class: 'default' };
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function processFileData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        let data;
        
        try {
            if (file.name.endsWith('.json')) {
                data = JSON.parse(content);
                updateDashboardWithJSON(data, file.name);
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(content);
                updateDashboardWithCSV(data, file.name);
            }
            
            // Update file status to processed
            updateFileStatus(file.name, 'processed', 'Processed');
            showNotification(`${file.name} processed successfully!`, 'success');
            
        } catch (error) {
            updateFileStatus(file.name, 'error', 'Processing Error');
            showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
}

function parseCSV(csv) {
    console.log('🔍 CSV Parsing Debug:');
    console.log(`📄 Raw CSV length: ${csv.length} characters`);
    
    const lines = csv.split('\n');
    console.log(`📊 Total lines found: ${lines.length}`);
    console.log(`📋 First line (headers): ${lines[0]}`);
    console.log(`📋 Last line preview: ${lines[lines.length - 1]}`);
    
    // Better CSV parsing that handles quoted fields
    const result = [];
    let headers = [];
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex].trim();
        if (!line) continue; // Skip empty lines
        
        const fields = [];
        let field = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(field.trim());
                field = '';
            } else {
                field += char;
            }
        }
        fields.push(field.trim()); // Add the last field
        
        if (lineIndex === 0) {
            headers = fields;
            console.log(`📋 Parsed headers (${headers.length}):`, headers);
        } else {
            if (fields.length > 0 && fields[0]) { // Only add non-empty rows
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = fields[index] || '';
                });
                result.push(row);
            }
        }
    }
    
    console.log(`✅ CSV parsed successfully: ${result.length} data rows`);
    console.log(`📊 Sample row:`, result[0]);
    
    return result;
}

function updateDashboardWithJSON(data, filename) {
    console.log('Processing JSON data from:', filename, data);
    
    // Determine data type and update accordingly
    if (data.employees || (Array.isArray(data) && data[0] && data[0].name)) {
        updateEmployeeData(data.employees || data);
    } else if (data.jobs || data.applications) {
        updateHiringData(data);
    }
}

function updateDashboardWithCSV(data, filename) {
    console.log('🔄 Processing CSV data from:', filename);
    console.log('📊 CSV Data Preview:', data.length, 'records');
    console.log('📋 First record sample:', data[0]);
    
    // Store in appropriate location based on filename
    const storageKey = `aeris_file_${filename}`;
    const fileData = {
        filename: filename,
        rawData: data,
        uploadedAt: new Date().toISOString(),
        processedData: true
    };
    
    localStorage.setItem(storageKey, JSON.stringify(fileData));
    console.log(`💾 Stored CSV data with key: ${storageKey}`);
    
    // Also store in memory for immediate access
    if (typeof window.fileStorage === 'undefined') {
        window.fileStorage = new Map();
    }
    window.fileStorage.set(filename, fileData);
    console.log(`🧠 Stored in memory storage:`, filename);
    
    // Determine data type based on headers and filename
    if (data.length > 0) {
        const headers = Object.keys(data[0]).map(h => h.toLowerCase());
        console.log('📋 Headers detected:', headers);
        
        if (filename.toLowerCase().includes('allpeople')) {
            console.log('✅ Detected as ALLPEOPLE file - will update dashboard');
            updateDashboardFromAllPeople();
        } else if (headers.includes('name') || headers.includes('employee')) {
            console.log('✅ Detected as EMPLOYEE data');
            updateEmployeeData(data);
        } else if (headers.includes('position') || headers.includes('job')) {
            console.log('✅ Detected as HIRING data');
            updateHiringData({ applications: data });
        } else {
            console.log('⚠️ Unknown data type, treating as general employee data');
            updateEmployeeData(data);
        }
    }
}

function updateEmployeeData(employees) {
    // Update employee statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => 
        emp.status && emp.status.toLowerCase() === 'active'
    ).length;
    
    // Update stat cards
    updateStatCard('Total Tech People Count', totalEmployees);
    updateStatCard('Active Tracking', activeEmployees);
    
    showNotification(`Updated dashboard with ${totalEmployees} employee records`, 'success');
}

// New function to specifically handle allpeople file data
function updateDashboardFromAllPeople() {
    console.log('🔄 Looking for allpeople file data...');
    
    // Debug: Check what's in localStorage
    console.log('📋 Checking localStorage for allpeople files...');
    let foundFiles = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_file_')) {
            foundFiles.push(key);
            if (key.toLowerCase().includes('allpeople')) {
                console.log(`✅ Found allpeople file: ${key}`);
            }
        }
    }
    console.log(`📂 Total files in localStorage: ${foundFiles.length}`, foundFiles);
    
    // Look for file with "allpeople" in the name (case insensitive)
    let allPeopleData = null;
    let fileName = null;
    
    // Check in memory storage first
    if (typeof window.fileStorage !== 'undefined') {
        for (let [name, data] of window.fileStorage.entries()) {
            if (name.toLowerCase().includes('allpeople')) {
                allPeopleData = data;
                fileName = name;
                console.log(`✅ Found allpeople in memory: ${name}`);
                break;
            }
        }
    } else {
        console.log('⚠️ window.fileStorage not initialized');
    }
    
    // If not found in memory, check localStorage
    if (!allPeopleData) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('allpeople')) {
                try {
                    const savedData = JSON.parse(localStorage.getItem(key));
                    allPeopleData = savedData;
                    fileName = key.replace('aeris_file_', '');
                    console.log('Found allpeople file in localStorage:', fileName);
                    break;
                } catch (error) {
                    console.error('Error loading allpeople file from localStorage:', error);
                }
            }
        }
    }
    
    if (allPeopleData && allPeopleData.rawData) {
        console.log('Updating dashboard with allpeople data:', fileName);
        const employeeData = allPeopleData.rawData;
        
        if (Array.isArray(employeeData) && employeeData.length > 0) {
            // Filter for currently active employees only
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison
            
            const activeEmployeesData = employeeData.filter(employee => {
                // Get onboard date from Column I (index 8)
                const onboardDateStr = employee[Object.keys(employee)[8]] || '';
                // Get offboard date from Column J (index 9) 
                const offboardDateStr = employee[Object.keys(employee)[9]] || '';
                
                // Parse onboard date
                let onboardDate = null;
                if (onboardDateStr && onboardDateStr.trim() !== '') {
                    onboardDate = new Date(onboardDateStr);
                    if (isNaN(onboardDate.getTime())) {
                        // Try different date formats if needed
                        const parts = onboardDateStr.split('/');
                        if (parts.length === 3) {
                            onboardDate = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
                        }
                    }
                }
                
                // Parse offboard date
                let offboardDate = null;
                if (offboardDateStr && offboardDateStr.trim() !== '') {
                    offboardDate = new Date(offboardDateStr);
                    if (isNaN(offboardDate.getTime())) {
                        // Try different date formats if needed
                        const parts = offboardDateStr.split('/');
                        if (parts.length === 3) {
                            offboardDate = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
                        }
                    }
                }
                
                // Employee is active if:
                // 1. Onboard date is today or in the past (or missing/invalid)
                // 2. Offboard date is in the future (or missing/invalid) 
                const isOnboarded = !onboardDate || onboardDate <= today;
                const isNotOffboarded = !offboardDate || offboardDate > today;
                
                const isActive = isOnboarded && isNotOffboarded;
                
                // Debug specific exclusions
                if (!isActive) {
                    const name = employee[Object.keys(employee)[0]] || 'Unknown';
                    if (!isOnboarded) {
                        console.log(`EXCLUDED (future start): ${name} - onboard date: ${onboardDateStr} (parsed: ${onboardDate})`);
                    }
                    if (!isNotOffboarded) {
                        console.log(`EXCLUDED (past/current end): ${name} - offboard date: ${offboardDateStr} (parsed: ${offboardDate})`);
                    }
                }
                
                return isActive;
            });
            
            // Count exclusions for verification
            const futureStarts = employeeData.filter(emp => {
                const onboardDateStr = emp[Object.keys(emp)[8]] || '';
                if (onboardDateStr && onboardDateStr.trim() !== '') {
                    let onboardDate = new Date(onboardDateStr);
                    if (isNaN(onboardDate.getTime())) {
                        const parts = onboardDateStr.split('/');
                        if (parts.length === 3) {
                            onboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    }
                    return onboardDate && onboardDate > today;
                }
                return false;
            }).length;
            
            const pastEnds = employeeData.filter(emp => {
                const offboardDateStr = emp[Object.keys(emp)[9]] || '';
                if (offboardDateStr && offboardDateStr.trim() !== '') {
                    let offboardDate = new Date(offboardDateStr);
                    if (isNaN(offboardDate.getTime())) {
                        const parts = offboardDateStr.split('/');
                        if (parts.length === 3) {
                            offboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                        }
                    }
                    return offboardDate && offboardDate <= today;
                }
                return false;
            }).length;
            
            console.log(`=== EMPLOYEE FILTERING DEBUG ===`);
            console.log(`📅 Today's date: ${today.toDateString()}`);
            console.log(`📋 Total records in CSV: ${employeeData.length}`);
            console.log(`🎯 Filtering criteria:`);
            console.log(`   ✅ INCLUDE: Onboard date ≤ ${today.toDateString()} (or missing)`);
            console.log(`   ✅ INCLUDE: Offboard date > ${today.toDateString()} (or missing)`);
            console.log(`================================`);
            
            console.log(`📊 Filtering Results:`);
            console.log(`- Total records in CSV: ${employeeData.length}`);
            console.log(`- Future starts (excluded): ${futureStarts}`);
            console.log(`- Past/current ends (excluded): ${pastEnds}`);
            console.log(`- Currently active employees: ${activeEmployeesData.length}`);
            console.log(`- Math check: ${employeeData.length} - ${futureStarts} - ${pastEnds} = ${employeeData.length - futureStarts - pastEnds}`);
            
            // Expected: 424 total - 5 past ends = 419 active
            if (employeeData.length === 424 && pastEnds === 5 && futureStarts === 0) {
                console.log(`✅ PERFECT! Expected: 424 - 5 = 419, Got: ${activeEmployeesData.length}`);
            } else {
                console.log(`⚠️  Expected ~419 active (424 total - 5 past ends), Got: ${activeEmployeesData.length}`);
                console.log(`   📋 Your CSV: ${employeeData.length} total records`);
                console.log(`   🔮 Future starts: ${futureStarts}`);
                console.log(`   📅 Past ends: ${pastEnds}`);
            }
            
            console.log(`✅ FINAL RESULT: ${activeEmployeesData.length} currently active employees`);
            
            // Calculate statistics from filtered active employees data
            const totalEmployees = activeEmployeesData.length;
            
            // Count active employees (check various possible status field names)
            const activeEmployees = activeEmployeesData.filter(emp => {
                const status = (emp.status || emp.Status || emp.employment_status || emp.active || '').toString().toLowerCase();
                return status === 'active' || status === 'true' || status === '1' || status === 'yes';
            }).length;
            
            // Count employees on leave from active employees
            const onLeaveEmployees = activeEmployeesData.filter(emp => {
                const status = (emp.status || emp.Status || emp.employment_status || '').toString().toLowerCase();
                return status.includes('leave') || status.includes('vacation') || status.includes('absent');
            }).length;
            
            // Calculate new hires this month using Column I 'onboard date' from active employees
            let newHiresThisMonth = 0;
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            activeEmployeesData.forEach(emp => {
                // Use Column I 'onboard date' (index 8, zero-based)
                const onboardDate = emp['onboard date'] || 
                                   emp['Onboard Date'] || 
                                   emp['ONBOARD DATE'] || 
                                   emp['onboard_date'] ||
                                   emp[Object.keys(emp)[8]] || // Column I (9th column, zero-based index 8)
                                   null;
                
                if (onboardDate) {
                    const empDate = new Date(onboardDate);
                    if (empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear) {
                        newHiresThisMonth++;
                    }
                }
            });
            
            // Calculate new additions year to date using Column I 'onboard date'
            let newAdditionsYTD = 0;
            const currentDate = new Date();
            
            activeEmployeesData.forEach(emp => {
                // Use Column I 'onboard date' (index 8, zero-based)
                const onboardDate = emp['onboard date'] || 
                                   emp['Onboard Date'] || 
                                   emp['ONBOARD DATE'] || 
                                   emp['onboard_date'] ||
                                   emp[Object.keys(emp)[8]] || // Column I (9th column, zero-based index 8)
                                   null;
                
                if (onboardDate) {
                    const empDate = new Date(onboardDate);
                    // Check if onboard date is <= today and in current year
                    if (empDate <= currentDate && empDate.getFullYear() === currentYear) {
                        newAdditionsYTD++;
                    }
                }
            });
            
            // Calculate employees leaving by end of this month using Column J 'offboard date'
            let leavingThisMonth = 0;
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
            
            employeeData.forEach(emp => {
                // Use Column J 'offboard date' (index 9, zero-based)
                const offboardDate = emp['offboard date'] || 
                                    emp['Offboard Date'] || 
                                    emp['OFFBOARD DATE'] || 
                                    emp['offboard_date'] ||
                                    emp[Object.keys(emp)[9]] || // Column J (10th column, zero-based index 9)
                                    null;
                
                if (offboardDate) {
                    const empDate = new Date(offboardDate);
                    // Check if offboard date is by end of current month
                    if (empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear) {
                        leavingThisMonth++;
                    }
                }
            });
            
            // Update dashboard statistics
            updateStatCard('Total Tech People Count', totalEmployees);
            updateStatCard('Active Tracking', activeEmployees);
            updateStatCard('New Hires (This Month)', newHiresThisMonth);
            updateStatCard('New Additions (Year to Date)', newAdditionsYTD);
            updateStatCard('Leaving This Month', leavingThisMonth);
            
            // Update tracking table if we're on the tracking page (using active employees only)
            updateTrackingTable(activeEmployeesData);
            
            // Trigger refresh of Tech People Portal data if it's available
            try {
                if (typeof refreshPortalData !== 'undefined') {
                    console.log('Refreshing Tech People Portal data after allpeople update...');
                    refreshPortalData();
                } else if (window.refreshPortalData) {
                    console.log('Refreshing Tech People Portal data via window object...');
                    window.refreshPortalData();
                }
            } catch (error) {
                console.log('Portal refresh not available:', error.message);
            }
            
            showNotification(`Dashboard updated from ${fileName} with ${totalEmployees} employee records`, 'success');
            
            return true;
        }
    }
    
    console.log('No allpeople file found or no data available');
    return false;
}

// Function to update the allpeople files list in dashboard
function updateAllPeopleFilesList() {
    const filesList = document.getElementById('allpeopleFilesList');
    const noFilesMessage = document.getElementById('noFilesMessage');
    
    if (!filesList) return;
    
    // Find all allpeople files
    const allPeopleFiles = [];
    
    // Check memory storage
    for (let [name, data] of window.fileStorage.entries()) {
        if (name.toLowerCase().includes('allpeople')) {
            allPeopleFiles.push({ name, data, source: 'memory' });
        }
    }
    
    // Check localStorage for files not in memory
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('allpeople')) {
            const filename = key.replace('aeris_file_', '');
            
            // Skip if already found in memory
            if (!allPeopleFiles.find(f => f.name === filename)) {
                try {
                    const savedData = JSON.parse(localStorage.getItem(key));
                    allPeopleFiles.push({ 
                        name: filename, 
                        data: savedData, 
                        source: 'localStorage' 
                    });
                } catch (error) {
                    console.error('Error loading file from localStorage:', error);
                }
            }
        }
    }
    
    console.log('Found allpeople files:', allPeopleFiles.length);
    
    if (allPeopleFiles.length === 0) {
        // Show no files message
        if (noFilesMessage) {
            noFilesMessage.style.display = 'block';
        }
        // Clear any existing file items
        const existingItems = filesList.querySelectorAll('.allpeople-file-item');
        existingItems.forEach(item => item.remove());
    } else {
        // Hide no files message
        if (noFilesMessage) {
            noFilesMessage.style.display = 'none';
        }
        
        // Clear existing items
        const existingItems = filesList.querySelectorAll('.allpeople-file-item');
        existingItems.forEach(item => item.remove());
        
        // Add file items
        allPeopleFiles.forEach((fileInfo, index) => {
            const fileItem = createAllPeopleFileItem(fileInfo);
            filesList.appendChild(fileItem);
        });
    }
}

// Function to create an allpeople file item
function createAllPeopleFileItem(fileInfo) {
    const { name, data, source } = fileInfo;
    const fileItem = document.createElement('div');
    fileItem.className = 'allpeople-file-item';
    
    // Determine if this is the active data source (most recent or only one)
    const isActive = true; // For now, mark all as active since they all contribute
    if (isActive) {
        fileItem.classList.add('active');
    }
    
    // Get file statistics
    let recordCount = 0;
    let lastUpdated = 'Unknown';
    let fileSize = 0;
    
    if (data.processedData) {
        recordCount = data.processedData.recordCount || 0;
    } else if (data.rawData && Array.isArray(data.rawData)) {
        recordCount = data.rawData.length;
    }
    
    if (data.metadata && data.metadata.uploadDate) {
        lastUpdated = new Date(data.metadata.uploadDate).toLocaleDateString();
    }
    
    if (data.metadata && data.metadata.size) {
        fileSize = data.metadata.size;
    }
    
    // Get file extension for icon
    const extension = name.toLowerCase().substring(name.lastIndexOf('.') + 1);
    let iconClass = 'fa-file';
    if (extension === 'csv') iconClass = 'fa-file-csv';
    else if (extension === 'json') iconClass = 'fa-file-code';
    else if (extension === 'xlsx' || extension === 'xls') iconClass = 'fa-file-excel';
    
    fileItem.innerHTML = `
        <div class="allpeople-file-info">
            <div class="allpeople-file-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="allpeople-file-details">
                <h4>${name}</h4>
                <p>Last updated: ${lastUpdated}</p>
                <p>Size: ${formatFileSize(fileSize)} • Source: ${source}</p>
            </div>
        </div>
        
        <div class="allpeople-file-stats">
            <div class="file-stat">
                <span class="file-stat-number">${recordCount}</span>
                <span class="file-stat-label">Records</span>
            </div>
            <div class="file-stat">
                <span class="file-stat-number">${data.processedData ? 'Yes' : 'No'}</span>
                <span class="file-stat-label">Processed</span>
            </div>
        </div>
        
        <div class="allpeople-file-actions">
            <button class="file-action-btn primary" onclick="useFileForDashboard('${name}')">
                <i class="fas fa-sync"></i>
                Update Dashboard
            </button>
            <button class="file-action-btn secondary" onclick="viewFileData('${name}')">
                <i class="fas fa-eye"></i>
                View Data
            </button>
            <button class="file-action-btn secondary" onclick="downloadFile('${name}')">
                <i class="fas fa-download"></i>
                Download
            </button>
            <button class="file-action-btn danger" onclick="removeAllPeopleFile('${name}')">
                <i class="fas fa-trash-alt"></i>
                Remove File
            </button>
        </div>
    `;
    
    return fileItem;
}

// Function to use a specific file for dashboard update
function useFileForDashboard(filename) {
    console.log('Using file for dashboard update:', filename);
    
    // Mark this file as active
    const fileItems = document.querySelectorAll('.allpeople-file-item');
    fileItems.forEach(item => item.classList.remove('active'));
    
    // Find and mark the selected file as active
    fileItems.forEach(item => {
        const nameElement = item.querySelector('h4');
        if (nameElement && nameElement.textContent === filename) {
            item.classList.add('active');
        }
    });
    
    // Update dashboard with this file's data
    const fileData = window.fileStorage.get(filename) || getFileFromLocalStorage(filename);
    
    if (fileData && fileData.rawData) {
        const employeeData = fileData.rawData;
        updateDashboardWithSpecificFile(employeeData, filename);
        showNotification(`Dashboard updated with data from ${filename}`, 'success');
    } else {
        showNotification(`No processed data found for ${filename}`, 'error');
    }
}

// Helper function to get file from localStorage
function getFileFromLocalStorage(filename) {
    try {
        const savedData = localStorage.getItem(`aeris_file_${filename}`);
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error('Error loading file from localStorage:', error);
        return null;
    }
}

// Function to update dashboard with specific file data
function updateDashboardWithSpecificFile(employeeData, filename) {
    if (!Array.isArray(employeeData) || employeeData.length === 0) {
        showNotification('No employee data found in file', 'warning');
        return;
    }
    
    // Calculate statistics
    const totalEmployees = employeeData.length;
    
    const activeEmployees = employeeData.filter(emp => {
        const status = (emp.status || emp.Status || emp.employment_status || emp.active || '').toString().toLowerCase();
        return status === 'active' || status === 'true' || status === '1' || status === 'yes';
    }).length;
    
    const onLeaveEmployees = employeeData.filter(emp => {
        const status = (emp.status || emp.Status || emp.employment_status || '').toString().toLowerCase();
        return status.includes('leave') || status.includes('vacation') || status.includes('absent');
    }).length;
    
    // Calculate new hires this month using Column I 'onboard date'
    let newHiresThisMonth = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    employeeData.forEach(emp => {
        // Use Column I 'onboard date' (index 8, zero-based)
        const onboardDate = emp['onboard date'] || 
                           emp['Onboard Date'] || 
                           emp['ONBOARD DATE'] || 
                           emp['onboard_date'] ||
                           emp[Object.keys(emp)[8]] || // Column I (9th column, zero-based index 8)
                           null;
        
        if (onboardDate) {
            const empDate = new Date(onboardDate);
            if (empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear) {
                newHiresThisMonth++;
            }
        }
    });
    
    // Update dashboard statistics with animation
    updateStatCardWithAnimation('Total Tech People Count', totalEmployees);
    updateStatCardWithAnimation('Active Tracking', activeEmployees);
    updateStatCardWithAnimation('New Hires (This Month)', newHiresThisMonth);
    
    // Update tracking table
    updateTrackingTable(employeeData);
    
    console.log(`Dashboard updated with ${filename}: ${totalEmployees} employees, ${activeEmployees} active`);
}

// Enhanced stat card update with animation
function updateStatCardWithAnimation(title, value) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const cardTitle = card.querySelector('h3');
        if (cardTitle && cardTitle.textContent === title) {
            const statNumber = card.querySelector('.stat-number');
            if (statNumber) {
                // Add pulse animation
                statNumber.style.transform = 'scale(1.1)';
                statNumber.style.color = '#667eea';
                
                setTimeout(() => {
                    statNumber.textContent = value;
                }, 150);
                
                setTimeout(() => {
                    statNumber.style.transform = 'scale(1)';
                    statNumber.style.color = '#2c3e50';
                }, 300);
            }
        }
    });
}

function updateHiringData(data) {
    const applications = data.applications || data.jobs || [];
    const openPositions = applications.filter(app => 
        app.status && app.status.toLowerCase().includes('open')
    ).length;
    
    updateStatCard('Open Positions', openPositions);
    showNotification(`Updated dashboard with ${applications.length} hiring records`, 'success');
}

function updateStatCard(title, value) {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const cardTitle = card.querySelector('h3');
        if (cardTitle && cardTitle.textContent === title) {
            const statNumber = card.querySelector('.stat-number');
            if (statNumber) {
                statNumber.textContent = value;
                // Add a brief animation to highlight the update
                statNumber.style.transition = 'color 0.5s ease';
                statNumber.style.color = '#667eea';
                setTimeout(() => {
                    statNumber.style.color = '#2c3e50';
                }, 500);
            }
        }
    });
}

// Function to update the tracking table with employee data
function updateTrackingTable(employeeData) {
    const trackingTableBody = document.querySelector('.tracking-table tbody');
    
    if (!trackingTableBody || !Array.isArray(employeeData)) {
        return;
    }
    
    // Clear existing rows (except sample data)
    trackingTableBody.innerHTML = '';
    
    // Take first 10 employees for display
    const displayEmployees = employeeData.slice(0, 10);
    
    displayEmployees.forEach(emp => {
        const row = document.createElement('tr');
        
        // Extract employee information (handle different possible field names)
        const name = emp.name || emp.full_name || emp.employee_name || emp.first_name + ' ' + (emp.last_name || '') || 'Unknown';
        const department = emp.department || emp.dept || emp.division || emp.team || 'Not specified';
        const status = emp.status || emp.employment_status || emp.active || 'Unknown';
        const lastActivity = emp.last_activity || emp.last_login || emp.last_seen || 'N/A';
        const performance = emp.performance || emp.performance_score || emp.rating || Math.floor(Math.random() * 40) + 60; // Random if not provided
        
        // Normalize status
        let statusClass = 'active';
        let statusText = 'Active';
        const statusLower = status.toString().toLowerCase();
        
        if (statusLower.includes('leave') || statusLower.includes('vacation')) {
            statusClass = 'on-leave';
            statusText = 'On Leave';
        } else if (statusLower === 'inactive' || statusLower === 'false' || statusLower === '0') {
            statusClass = 'inactive';
            statusText = 'Inactive';
        }
        
        row.innerHTML = `
            <td>
                <div class="employee-info">
                    <img src="https://via.placeholder.com/32x32?text=${name.charAt(0)}" alt="Employee" class="employee-avatar">
                    <span>${name}</span>
                </div>
            </td>
            <td>${department}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${formatLastActivity(lastActivity)}</td>
            <td>
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${performance}%"></div>
                </div>
                <span>${performance}%</span>
            </td>
            <td>
                <button class="btn-small" onclick="showEmployeeDetails('${name}')">View Details</button>
            </td>
        `;
        
        trackingTableBody.appendChild(row);
    });
    
    console.log(`Updated tracking table with ${displayEmployees.length} employees from allpeople data`);
}

// Helper function to format last activity
function formatLastActivity(activity) {
    if (!activity || activity === 'N/A') {
        return 'N/A';
    }
    
    // If it's a date, format it nicely
    try {
        const date = new Date(activity);
        if (!isNaN(date.getTime())) {
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return 'Today';
            } else if (diffDays === 1) {
                return '1 day ago';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString();
            }
        }
    } catch (error) {
        // If not a valid date, return as is
    }
    
    return activity;
}

function updateFileStatus(filename, statusClass, statusText) {
    const fileId = `file-${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const fileItem = document.getElementById(fileId);
    
    if (fileItem) {
        const statusElement = fileItem.querySelector('.file-status');
        if (statusElement) {
            statusElement.className = `file-status ${statusClass}`;
            statusElement.textContent = statusText;
        }
    }
}

function viewFileData(filename) {
    console.log('Viewing data for file:', filename);
    
    const fileData = window.fileStorage.get(filename);
    
    if (!fileData) {
        // Try to load from localStorage
        try {
            const savedData = localStorage.getItem(`aeris_file_${filename}`);
            if (savedData) {
                const parsedSavedData = JSON.parse(savedData);
                console.log('Loaded file data from localStorage');
                displayFileDataModal(filename, parsedSavedData);
                return;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        
        showNotification(`File data not found for ${filename}`, 'error');
        return;
    }
    
    displayFileDataModal(filename, fileData);
}

function displayFileDataModal(filename, fileData) {
    const modal = document.createElement('div');
    modal.className = 'data-modal';
    
    let contentHtml = '';
    
    if (fileData.processedData) {
        const summary = fileData.processedData.summary;
        const recordCount = fileData.processedData.recordCount;
        
        contentHtml = `
            <div class="data-summary">
                <h4>File Analysis Summary</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <strong>Records:</strong> ${recordCount}
                    </div>
                    <div class="stat-item">
                        <strong>Data Type:</strong> ${fileData.processedData.dataType || 'Unknown'}
                    </div>
                    <div class="stat-item">
                        <strong>Columns:</strong> ${summary?.columns || 0}
                    </div>
                    <div class="stat-item">
                        <strong>File Size:</strong> ${formatFileSize(fileData.size)}
                    </div>
                </div>
            </div>
        `;
        
        if (summary?.columnNames && summary.columnNames.length > 0) {
            contentHtml += `
                <div class="columns-info">
                    <h4>Columns Found:</h4>
                    <div class="columns-list">
                        ${summary.columnNames.map(col => `<span class="column-badge">${col}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (fileData.rawData && Array.isArray(fileData.rawData) && fileData.rawData.length > 0) {
            const previewData = fileData.rawData.slice(0, 5); // Show first 5 records
            contentHtml += `
                <div class="data-preview">
                    <h4>Data Preview (First 5 records):</h4>
                    <div class="table-container">
                        <table class="preview-table">
                            <thead>
                                <tr>
                                    ${Object.keys(previewData[0]).map(key => `<th>${key}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${previewData.map(record => 
                                    `<tr>${Object.values(record).map(value => `<td>${value || ''}</td>`).join('')}</tr>`
                                ).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    } else {
        contentHtml = `
            <div class="no-data">
                <p>File is uploaded but not yet processed.</p>
                <button class="btn-primary" onclick="processFile('${filename}'); this.closest('.data-modal').remove();">
                    Process Now
                </button>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>File Data: ${filename}</h3>
                <button onclick="this.closest('.data-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${contentHtml}
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="downloadFile('${filename}')">
                        <i class="fas fa-download"></i>
                        Download File
                    </button>
                    <button class="btn-primary" onclick="exportAnalysis('${filename}')">
                        <i class="fas fa-chart-bar"></i>
                        Export Analysis
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Function to export analysis data
function exportAnalysis(filename) {
    const fileData = window.fileStorage.get(filename);
    
    if (!fileData || !fileData.processedData) {
        showNotification('No analysis data available for export', 'warning');
        return;
    }
    
    const analysisReport = {
        filename: filename,
        uploadDate: fileData.uploadDate,
        processedAt: fileData.processedData.processedAt,
        summary: fileData.processedData.summary,
        dataType: fileData.processedData.dataType,
        recordCount: fileData.processedData.recordCount,
        columns: fileData.processedData.columns,
        sampleData: fileData.rawData ? fileData.rawData.slice(0, 10) : null
    };
    
    const blob = new Blob([JSON.stringify(analysisReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    showNotification(`Analysis exported for ${filename}`, 'success');
}

function processFile(filename) {
    showNotification(`Reprocessing ${filename}...`, 'info');
    updateFileStatus(filename, 'uploading', 'Processing...');
    
    setTimeout(() => {
        updateFileStatus(filename, 'processed', 'Processed');
        showNotification(`${filename} reprocessed successfully!`, 'success');
    }, 2000);
}

function deleteFile(filename) {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
        const fileId = `file-${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const fileItem = document.getElementById(fileId);
        
        if (fileItem) {
            // Add delete animation
            fileItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            fileItem.style.opacity = '0';
            fileItem.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                fileItem.remove();
                updateFileHistory(filename, 'deleted');
                showNotification(`${filename} deleted successfully`, 'success');
                
                // Update file count in sidebar if needed
                updateFileCount();
            }, 300);
        }
    }
}

// Enhanced file upload with progress tracking
function uploadFileWithProgress(file) {
    return new Promise((resolve, reject) => {
        const fileId = `file-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Create file item with progress bar
        const fileItem = createFileItemWithProgress(file);
        const filesList = document.getElementById('filesList');
        filesList.insertBefore(fileItem, filesList.firstChild);
        
        // Simulate file upload with progress
        let progress = 0;
        const progressBar = fileItem.querySelector('.upload-progress-fill');
        const progressText = fileItem.querySelector('.progress-text');
        
        const uploadInterval = setInterval(() => {
            progress += Math.random() * 15 + 5; // 5-20% increments
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(uploadInterval);
                
                // Complete upload
                progressBar.style.width = '100%';
                progressText.textContent = 'Upload Complete';
                
                setTimeout(() => {
                    // Hide progress bar and show file actions
                    const progressContainer = fileItem.querySelector('.upload-progress');
                    const fileActions = fileItem.querySelector('.file-actions');
                    
                    progressContainer.style.display = 'none';
                    fileActions.style.display = 'flex';
                    
                    // Update status
                    updateFileStatus(file.name, 'uploaded', 'Uploaded');
                    
                    // Add to file storage
                    addToFileStorage(file);
                    
                    resolve(file);
                }, 500);
            } else {
                progressBar.style.width = progress + '%';
                progressText.textContent = `Uploading... ${Math.round(progress)}%`;
            }
        }, 200);
        
        // Handle upload errors (simulate 5% failure rate)
        if (Math.random() < 0.05) {
            setTimeout(() => {
                clearInterval(uploadInterval);
                updateFileStatus(file.name, 'error', 'Upload Failed');
                progressText.textContent = 'Upload Failed';
                progressBar.style.backgroundColor = '#dc3545';
                reject(new Error('Upload failed'));
            }, 2000);
        }
    });
}

function createFileItemWithProgress(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item uploading';
    fileItem.id = `file-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas ${fileIcon.icon} file-icon ${fileIcon.class}"></i>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize} • Uploading...</p>
                <span class="file-status uploading">Uploading</span>
            </div>
        </div>
        <div class="upload-progress">
            <div class="progress-bar">
                <div class="upload-progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-text">Starting upload...</span>
        </div>
        <div class="file-actions" style="display: none;">
            <button class="btn-small" onclick="viewFileData('${file.name}')">
                <i class="fas fa-eye"></i>
                View Data
            </button>
            <button class="btn-small" onclick="downloadFile('${file.name}')">
                <i class="fas fa-download"></i>
                Download
            </button>
            <button class="btn-small" onclick="processFile('${file.name}')">
                <i class="fas fa-sync"></i>
                Process
            </button>
            <button class="btn-small btn-danger" onclick="deleteFile('${file.name}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    
    return fileItem;
}

// File storage management
if (!window.fileStorage) {
    window.fileStorage = new Map();
}
const fileStorage = window.fileStorage;

function addToFileStorage(file) {
    console.log('Adding file to storage:', file.name); // Debug log
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File read successfully, content length:', e.target.result.length); // Debug log
        
        const fileData = {
            content: e.target.result,
            file: {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            },
            uploadDate: new Date().toISOString(),
            processed: false,
            size: file.size,
            type: file.type,
            rawData: null, // Will store parsed data
            processedData: null // Will store processed analysis data
        };
        
        window.fileStorage.set(file.name, fileData);
        console.log('File stored in memory:', file.name, 'Total files:', window.fileStorage.size); // Debug log
        
        // Also save to localStorage for persistence
        try {
            const storageData = JSON.stringify({
                content: e.target.result,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: fileData.uploadDate,
                    processed: false
                }
            });
            localStorage.setItem(`aeris_file_${file.name}`, storageData);
            console.log('File saved to localStorage:', file.name); // Debug log
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
        
        updateFileCount();
        updateFileHistory(file.name, 'uploaded');
        
        // Auto-process the file immediately after storage
        setTimeout(() => {
            processFileData(file);
        }, 500);
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        showNotification(`Error reading file ${file.name}`, 'error');
    };
    
    reader.readAsText(file);
}

function removeFromFileStorage(filename) {
    window.fileStorage.delete(filename);
    updateFileCount();
}

function updateFileCount() {
    const fileCount = window.fileStorage.size;
    // Update any file count displays in the UI
    const fileCountElements = document.querySelectorAll('.file-count');
    fileCountElements.forEach(element => {
        element.textContent = fileCount;
    });
}

// Enhanced file processing
async function processUploadedFiles(files) {
    console.log('Processing uploaded files:', files); // Debug log
    
    const validFiles = Array.from(files).filter(file => {
        console.log('Validating file:', file.name, file.type); // Debug log
        if (validateFile(file)) {
            return true;
        } else {
            showNotification(`Invalid file type: ${file.name}. Supported: CSV, JSON, Excel`, 'error');
            return false;
        }
    });
    
    if (validFiles.length === 0) {
        showNotification('No valid files selected', 'warning');
        return;
    }
    
    showNotification(`Processing ${validFiles.length} file(s)...`, 'info');
    
    // Try to use simple upload method for better compatibility
    for (const file of validFiles) {
        try {
            console.log('Uploading file:', file.name); // Debug log
            uploadFile(file); // Use simpler upload method
        } catch (error) {
            console.error('Upload error:', error); // Debug log
            showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
        }
    }
}

// File download function
function downloadFile(filename) {
    const fileData = window.fileStorage.get(filename);
    
    if (!fileData) {
        showNotification(`File ${filename} not found`, 'error');
        return;
    }
    
    try {
        const blob = new Blob([fileData.content], { type: fileData.type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showNotification(`${filename} downloaded successfully`, 'success');
        
    } catch (error) {
        showNotification(`Failed to download ${filename}: ${error.message}`, 'error');
    }
}

// Remove allpeople file function
function removeAllPeopleFile(filename) {
    if (confirm(`Are you sure you want to remove "${filename}"? This action cannot be undone.`)) {
        try {
            // Remove from memory storage
            if (window.fileStorage.has(filename)) {
                window.fileStorage.delete(filename);
                console.log(`Removed ${filename} from memory storage`);
            }
            
            // Remove from localStorage
            const localStorageKey = `aeris_file_${filename}`;
            if (localStorage.getItem(localStorageKey)) {
                localStorage.removeItem(localStorageKey);
                console.log(`Removed ${filename} from localStorage`);
            }
            
            // Update the files list display
            updateAllPeopleFilesList();
            
            // Update dashboard stats if this was the active file
            setTimeout(() => {
                const updated = updateDashboardFromAllPeople();
                if (!updated) {
                    // If no allpeople files remain, reset dashboard to default values
                    updateStatCard('Total Tech People Count', 127);
                    showNotification('No allpeople files remaining. Dashboard reset to default values.', 'warning');
                } else {
                    showNotification('Dashboard updated with remaining allpeople files.', 'success');
                }
            }, 100);
            
            showNotification(`File "${filename}" removed successfully`, 'success');
            
        } catch (error) {
            console.error('Error removing file:', error);
            showNotification(`Failed to remove file "${filename}": ${error.message}`, 'error');
        }
    }
}

// Bulk file operations
function deleteAllFiles() {
    if (confirm('Are you sure you want to delete ALL uploaded files? This action cannot be undone.')) {
        const fileItems = document.querySelectorAll('.file-item');
        
        fileItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'translateX(100%)';
                
                setTimeout(() => {
                    item.remove();
                }, 300);
            }, index * 100); // Stagger the animations
        });
        
        // Clear file storage
        window.fileStorage.clear();
        updateFileCount();
        
        setTimeout(() => {
            showNotification('All files deleted successfully', 'success');
        }, fileItems.length * 100 + 300);
    }
}

function processAllFiles() {
    const unprocessedFiles = Array.from(window.fileStorage.values()).filter(file => !file.processed);
    
    if (unprocessedFiles.length === 0) {
        showNotification('No unprocessed files found', 'info');
        return;
    }
    
    showNotification(`Processing ${unprocessedFiles.length} files...`, 'info');
    
    unprocessedFiles.forEach((fileData, index) => {
        setTimeout(() => {
            processFileData(fileData.file);
        }, index * 500); // Process files with delay to avoid overwhelming
    });
}

// File history management
function updateFileHistory(filename, action) {
    const historyTable = document.querySelector('.history-table tbody');
    
    if (action === 'uploaded') {
        const fileData = fileStorage.get(filename);
        if (fileData) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${filename}</td>
                <td>${determineFileType(filename)}</td>
                <td>${formatFileSize(fileData.size)}</td>
                <td>${new Date().toLocaleString()}</td>
                <td><span class="status-badge success">Success</span></td>
                <td>Processing...</td>
            `;
            historyTable.insertBefore(row, historyTable.firstChild);
        }
    } else if (action === 'deleted') {
        // Mark as deleted in history instead of removing
        const rows = historyTable.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.cells[0] && row.cells[0].textContent === filename) {
                const statusCell = row.querySelector('.status-badge');
                if (statusCell) {
                    statusCell.className = 'status-badge error';
                    statusCell.textContent = 'Deleted';
                }
            }
        });
    }
}

function determineFileType(filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    switch (extension) {
        case '.csv':
            return 'Employee Data';
        case '.json':
            return 'Analytics Data';
        case '.xlsx':
        case '.xls':
            return 'Hiring Data';
        default:
            return 'Unknown';
    }
}

// Enhanced file validation
function validateFile(file) {
    console.log('Validating file:', file.name, 'Type:', file.type, 'Size:', file.size); // Debug log
    
    const allowedTypes = [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain' // Allow plain text files too
    ];
    
    const allowedExtensions = ['.csv', '.json', '.xlsx', '.xls', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    console.log('File extension:', fileExtension); // Debug log
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        console.log('File too large:', file.size, 'Max:', maxSize); // Debug log
        showNotification(`File ${file.name} is too large. Maximum size is 50MB.`, 'error');
        return false;
    }
    
    // Check file type - be more lenient, check extension if type is not recognized
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
        console.log('Invalid file type. Type:', file.type, 'Extension:', fileExtension); // Debug log
        showNotification(`File ${file.name} has an unsupported format. Please use CSV, JSON, or Excel files.`, 'error');
        return false;
    }
    
    console.log('File validation passed'); // Debug log
    return true;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + 1 = Dashboard
    if (e.altKey && e.key === '1') {
        e.preventDefault();
        switchSection('dashboard');
    }
    
    // Alt + 2 = Tracking
    if (e.altKey && e.key === '2') {
        e.preventDefault();
        switchSection('tracking');
    }
    
    // Alt + 3 = Hiring
    if (e.altKey && e.key === '3') {
        e.preventDefault();
        switchSection('hiring');
    }
    
    // Alt + 4 = File Manager
    if (e.altKey && e.key === '4') {
        e.preventDefault();
        switchSection('file-manager');
    }
    
    // Alt + R = Refresh
    if (e.altKey && e.key === 'r') {
        e.preventDefault();
        refreshDashboardData();
    }
});

// Export functions for global access
window.switchSection = switchSection;
window.addNewPosition = addNewPosition;
window.exportReport = exportReport;
window.viewApplicants = viewApplicants;
window.editPosition = editPosition;
window.reviewApplication = reviewApplication;
window.showEmployeeDetails = showEmployeeDetails;
window.deleteFile = deleteFile;
window.downloadFile = downloadFile;
window.processFile = processFile;
window.viewFileData = viewFileData;
window.deleteAllFiles = deleteAllFiles;
window.processAllFiles = processAllFiles;
window.downloadAllFiles = downloadAllFiles;
window.exportAnalysis = exportAnalysis;
window.useFileForDashboard = useFileForDashboard;
window.refreshDashboardData = refreshDashboardData;

// Download all files function
function downloadAllFiles() {
    if (window.fileStorage.size === 0) {
        showNotification('No files available for download', 'info');
        return;
    }
    
    showNotification(`Preparing ${window.fileStorage.size} files for download...`, 'info');
    
    // Create a zip-like experience by downloading files one by one
    let downloadCount = 0;
    const totalFiles = window.fileStorage.size;
    
    window.fileStorage.forEach((fileData, filename) => {
        setTimeout(() => {
            downloadFile(filename);
            downloadCount++;
            
            if (downloadCount === totalFiles) {
                setTimeout(() => {
                    showNotification(`All ${totalFiles} files downloaded successfully`, 'success');
                }, 1000);
            }
        }, downloadCount * 500); // Stagger downloads to avoid browser blocking
    });
}

// Enhanced file upload initialization
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.getElementById('browseButton');
    
    console.log('Initializing file upload...', { uploadZone, fileInput, browseButton }); // Debug log
    
    if (!uploadZone || !fileInput) {
        console.error('Upload zone or file input not found'); // Debug log
        return;
    }
    
    // Browse button click handler
    if (browseButton) {
        browseButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Browse button clicked'); // Debug log
            fileInput.click();
        });
    }
    
    // Upload zone click handler (fallback)
    uploadZone.addEventListener('click', function(e) {
        // Only trigger file input if not clicking on the browse button
        if (e.target !== browseButton && !browseButton.contains(e.target)) {
            console.log('Upload zone clicked'); // Debug log
            fileInput.click();
        }
    });
    
    // Drag and drop functionality with enhanced feedback
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    
    // File input change with multiple file support
    fileInput.addEventListener('change', handleFileSelect);
    
    // Prevent default drag behaviors on the document
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    
    // Initialize file storage if not exists
    if (!window.fileStorage) {
        window.fileStorage = new Map();
    }
    
    console.log('File upload initialized successfully'); // Debug log
}

// Enhanced drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadZone = e.currentTarget;
    uploadZone.classList.add('dragover');
    
    // Check if dragged items are files
    const items = e.dataTransfer.items;
    let hasValidFiles = false;
    
    for (let item of items) {
        if (item.kind === 'file') {
            hasValidFiles = true;
            break;
        }
    }
    
    if (hasValidFiles) {
        uploadZone.classList.add('drag-active');
        uploadZone.classList.remove('drag-reject');
    } else {
        uploadZone.classList.add('drag-reject');
        uploadZone.classList.remove('drag-active');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadZone = e.currentTarget;
    
    // Only remove classes if we're leaving the upload zone entirely
    if (!uploadZone.contains(e.relatedTarget)) {
        uploadZone.classList.remove('dragover', 'drag-active', 'drag-reject');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const uploadZone = e.currentTarget;
    uploadZone.classList.remove('dragover', 'drag-active', 'drag-reject');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processUploadedFiles(files);
    }
}

// File storage management with persistence
if (!window.fileStorage) {
    window.fileStorage = new Map();
}
// Use the global fileStorage reference

function addToFileStorage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        window.fileStorage.set(file.name, {
            content: e.target.result,
            file: {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            },
            uploadDate: new Date(),
            processed: false,
            size: file.size,
            type: file.type
        });
        
        updateFileCount();
        updateFileHistory(file.name, 'uploaded');
    };
    reader.readAsText(file);
}

function removeFromFileStorage(filename) {
    if (window.fileStorage.has(filename)) {
        window.fileStorage.delete(filename);
        updateFileCount();
        return true;
    }
    return false;
}

// Enhanced file processing with better error handling
async function processFileData(file) {
    const fileData = window.fileStorage.get(file.name);
    
    if (!fileData) {
        console.error('File data not found for:', file.name);
        showNotification(`File data not found for ${file.name}`, 'error');
        return;
    }
    
    console.log('Processing file data for:', file.name, 'Content length:', fileData.content.length);
    
    try {
        updateFileStatus(file.name, 'processing', 'Processing...');
        
        let parsedData;
        const content = fileData.content;
        
        if (file.name.toLowerCase().endsWith('.json')) {
            console.log('Processing as JSON file');
            parsedData = JSON.parse(content);
            fileData.rawData = parsedData;
            await updateDashboardWithJSON(parsedData, file.name);
        } else if (file.name.toLowerCase().endsWith('.csv')) {
            console.log('Processing as CSV file');
            parsedData = parseCSV(content);
            fileData.rawData = parsedData;
            await updateDashboardWithCSV(parsedData, file.name);
        } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
            console.log('Processing as Excel file');
            showNotification(`Excel file processing: treating as CSV format.`, 'warning');
            parsedData = parseCSV(content);
            fileData.rawData = parsedData;
            await updateDashboardWithCSV(parsedData, file.name);
        } else if (file.name.toLowerCase().endsWith('.txt')) {
            console.log('Processing as text file');
            // Try to detect if it's CSV format
            if (content.includes(',') && content.includes('\n')) {
                parsedData = parseCSV(content);
                fileData.rawData = parsedData;
                await updateDashboardWithCSV(parsedData, file.name);
            } else {
                showNotification(`Text file processed as raw data`, 'info');
                parsedData = { rawText: content };
                fileData.rawData = parsedData;
            }
        }
        
        // Mark as processed and save analysis results
        fileData.processed = true;
        fileData.processedData = {
            recordCount: Array.isArray(parsedData) ? parsedData.length : 1,
            columns: Array.isArray(parsedData) && parsedData.length > 0 ? Object.keys(parsedData[0]) : [],
            dataType: determineDataType(parsedData, file.name),
            processedAt: new Date().toISOString(),
            summary: generateDataSummary(parsedData)
        };
        
        // Update storage
        window.fileStorage.set(file.name, fileData);
        
        // Update localStorage with processed data
        try {
            const storageData = JSON.stringify({
                content: fileData.content,
                rawData: fileData.rawData,
                processedData: fileData.processedData,
                metadata: {
                    name: file.name,
                    size: fileData.size,
                    type: fileData.type,
                    uploadDate: fileData.uploadDate,
                    processed: true
                }
            });
            localStorage.setItem(`aeris_file_${file.name}`, storageData);
            console.log('Processed data saved to localStorage'); // Debug log
        } catch (error) {
            console.warn('Could not save processed data to localStorage:', error);
        }
        
        updateFileStatus(file.name, 'processed', 'Processed');
        showNotification(`${file.name} processed successfully! Found ${fileData.processedData.recordCount} records`, 'success');
        
        // Update history with record count
        updateFileHistoryWithRecords(file.name, fileData.processedData.recordCount);
        
        // If this is an allpeople file, update the dashboard automatically
        if (file.name.toLowerCase().includes('allpeople')) {
            console.log('Detected allpeople file, updating dashboard...');
            setTimeout(() => {
                updateDashboardFromAllPeople();
            }, 500);
        }
        
        console.log('File processing completed:', file.name, 'Records:', fileData.processedData.recordCount);
        
    } catch (error) {
        console.error('File processing error:', error);
        updateFileStatus(file.name, 'error', 'Processing Error');
        showNotification(`Error processing ${file.name}: ${error.message}`, 'error');
        
        // Still mark as processed but with error status
        fileData.processed = true;
        fileData.processedData = {
            error: error.message,
            processedAt: new Date().toISOString()
        };
        window.fileStorage.set(file.name, fileData);
    }
}

// Helper function to determine data type
function determineDataType(data, filename) {
    if (!Array.isArray(data) || data.length === 0) {
        return 'unknown';
    }
    
    const headers = Object.keys(data[0]).map(h => h.toLowerCase());
    
    if (headers.some(h => h.includes('employee') || h.includes('name') || h.includes('department'))) {
        return 'employee';
    } else if (headers.some(h => h.includes('job') || h.includes('position') || h.includes('application'))) {
        return 'hiring';
    } else if (headers.some(h => h.includes('metric') || h.includes('performance') || h.includes('kpi'))) {
        return 'analytics';
    }
    
    return 'general';
}

// Helper function to generate data summary
function generateDataSummary(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return 'No structured data found';
    }
    
    const columns = Object.keys(data[0]);
    const summary = {
        totalRecords: data.length,
        columns: columns.length,
        columnNames: columns,
        sampleRecord: data[0]
    };
    
    return summary;
}

function updateFileHistoryWithRecords(filename, recordCount) {
    const historyTable = document.querySelector('.history-table tbody');
    const rows = historyTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.cells[0] && row.cells[0].textContent === filename) {
            const recordCell = row.cells[5];
            if (recordCell) {
                recordCell.textContent = `${recordCount} records`;
            }
        }
    });
}

// Function to load allpeople data from storage (compatible with existing system)
function loadAllPeopleDataFromStorage() {
    console.log('Loading allpeople file data...');
    
    // Look for file with "allpeople" in the name (case insensitive)
    let allPeopleData = null;
    let fileName = null;
    
    // Check in memory storage first
    for (let [name, data] of window.fileStorage.entries()) {
        if (name.toLowerCase().includes('allpeople')) {
            allPeopleData = data;
            fileName = name;
            console.log('Found allpeople file in memory:', fileName);
            break;
        }
    }
    
    // If not found in memory, check localStorage
    if (!allPeopleData) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('allpeople')) {
                try {
                    const savedData = JSON.parse(localStorage.getItem(key));
                    allPeopleData = savedData;
                    fileName = key.replace('aeris_file_', '');
                    console.log('Found allpeople file in localStorage:', fileName);
                    break;
                } catch (error) {
                    console.error('Error loading allpeople file from localStorage:', error);
                }
            }
        }
    }
    
    // Return the raw employee data if found
    if (allPeopleData && allPeopleData.rawData) {
        console.log(`Loaded ${allPeopleData.rawData.length} employee records from ${fileName}`);
        return allPeopleData.rawData;
    }
    
    console.log('No allpeople file found or no data available');
    return null;
}

function processEmployeeData(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    console.log('Processing employee data, sample record:', data[0]);
    console.log('Available columns:', Object.keys(data[0] || {}));
    
    const currentEmployees = [];
    const toBeJoined = [];
    const stltGroups = {};
    const managerReports = {}; // Track manager -> direct reports mapping
    const employeeHierarchy = {}; // Track employee -> manager mapping
    
    // First pass: Process all employees and build hierarchy
    data.forEach((employee, index) => {
        // Handle different possible column names for start date
        const startDateValue = employee['Start Date'] || 
                              employee['start_date'] || 
                              employee['startDate'] || 
                              employee['Start'] ||
                              employee['Start date'] ||
                              employee['start date'];
        
        // Handle different possible column names for sTLT (Column N)
        const stlt = employee['sTLT'] || 
                     employee['stlt'] || 
                     employee['STLT'] || 
                     employee['Team'] ||
                     employee['Department'] ||
                     employee[Object.keys(employee)[13]] || // Column N (0-indexed = 13)
                     'Unassigned';
        
        // Handle manager column (Column O) - who this person reports to
        const manager = employee['Manager'] ||
                       employee['manager'] ||
                       employee['Supervisor'] ||
                       employee['supervisor'] ||
                       employee['Reports To'] ||
                       employee['reports_to'] ||
                       employee['Direct Manager'] ||
                       employee['ReportsTo'] ||
                       employee['Boss'] ||
                       employee[Object.keys(employee)[14]] || // Column O (0-indexed = 14)
                       null;
        
        if (index < 5) {
            console.log(`Employee ${index}:`, {
                name: employee['Name'] || employee['Full Name'] || Object.values(employee)[0],
                stlt: stlt,
                manager: manager,
                columnN: employee[Object.keys(employee)[13]],
                columnO: employee[Object.keys(employee)[14]],
                allColumns: Object.keys(employee)
            });
        }
        
        // Parse start date
        let startDate = null;
        if (startDateValue) {
            startDate = new Date(startDateValue);
            // If invalid date, try different parsing methods
            if (isNaN(startDate.getTime())) {
                // Try parsing with different formats
                const dateStr = startDateValue.toString();
                const parts = dateStr.split(/[-\/]/);
                if (parts.length === 3) {
                    // Try MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
                    startDate = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
                    if (isNaN(startDate.getTime())) {
                        startDate = new Date(parts[2], parts[1] - 1, parts[0]); // DD/MM/YYYY
                    }
                    if (isNaN(startDate.getTime())) {
                        startDate = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY/MM/DD
                    }
                }
            }
        }
        
        // Prepare employee object
        const employeeObj = {
            name: employee['Name'] || employee['Full Name'] || employee['Employee Name'] || 'Unknown',
            stlt: stlt,
            startDate: startDate,
            startDateStr: startDateValue || 'Not specified',
            role: employee['Position'] || employee['Job Title'] || employee['Role'] || '',
            manager: manager,
            rawData: employee
        };
        
        // Build hierarchy mappings
        if (manager && manager.trim() !== '') {
            if (!managerReports[manager]) {
                managerReports[manager] = [];
            }
            managerReports[manager].push(employeeObj.name);
            employeeHierarchy[employeeObj.name] = manager;
        }
        
        // Categorize employee
        if (startDate && !isNaN(startDate.getTime())) {
            if (startDate > today) {
                toBeJoined.push(employeeObj);
            } else {
                currentEmployees.push(employeeObj);
            }
        } else {
            // If no valid start date, assume current employee
            currentEmployees.push(employeeObj);
        }
        
        // Group by sTLT (only for current employees)
        if (!startDate || startDate <= today) {
            if (!stltGroups[stlt]) {
                stltGroups[stlt] = {
                    employees: [],
                    managers: new Set(),
                    totalCount: 0,
                    directReportCounts: {}
                };
            }
            stltGroups[stlt].employees.push(employeeObj);
        }
    });
    
    console.log('Manager Reports mapping:', managerReports);
    console.log('Found managers:', Object.keys(managerReports));
    
    // Second pass: Calculate pivot data for each sTLT
    Object.keys(stltGroups).forEach(stltName => {
        const group = stltGroups[stltName];
        group.totalCount = group.employees.length;
        
        // Find managers in this sTLT and calculate their direct reports
        group.employees.forEach(emp => {
            const directReports = managerReports[emp.name] || [];
            const directReportsInSTLT = directReports.filter(reportName => {
                return group.employees.some(e => e.name === reportName);
            });
            
            if (directReports.length > 0) {
                group.managers.add(emp.name);
                group.directReportCounts[emp.name] = {
                    totalDirectReports: directReports.length,
                    directReportsInSTLT: directReportsInSTLT.length,
                    directReportsOutsideSTLT: directReports.length - directReportsInSTLT.length
                };
                
                console.log(`Manager ${emp.name} in ${stltName}: ${directReports.length} direct reports`);
            }
        });
        
        // Calculate total team size for each manager (including indirect reports)
        group.employees.forEach(emp => {
            if (group.directReportCounts[emp.name]) {
                const totalTeamSize = calculateTotalTeamSize(emp.name, managerReports);
                group.directReportCounts[emp.name].totalTeamSize = totalTeamSize;
            }
        });
        
        console.log(`sTLT ${stltName}: ${group.totalCount} employees, ${group.managers.size} managers`);
    });
    
    // Sort to be joined by start date
    toBeJoined.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return a.startDate - b.startDate;
    });
    
    return {
        currentEmployees,
        toBeJoined,
        stltGroups: Object.keys(stltGroups).sort().reduce((sorted, key) => {
            sorted[key] = stltGroups[key];
            return sorted;
        }, {}),
        managerReports,
        employeeHierarchy
    };
}

// Helper function to calculate total team size (including indirect reports)
function calculateTotalTeamSize(managerName, managerReports) {
    const directReports = managerReports[managerName] || [];
    let totalSize = directReports.length;
    
    // Recursively count indirect reports
    directReports.forEach(reportName => {
        if (managerReports[reportName]) {
            totalSize += calculateTotalTeamSize(reportName, managerReports);
        }
    });
    
    return totalSize;
}

// New function to analyze CSV structure and create manager-employee pivot
function analyzeCSVStructure(data) {
    if (!data || data.length === 0) {
        console.log('No data to analyze');
        return null;
    }
    
    console.log('=== CSV STRUCTURE ANALYSIS ===');
    console.log('Total records:', data.length);
    console.log('Sample record:', data[0]);
    console.log('All columns:', Object.keys(data[0]));
    
    // Get all column names and map them by position
    const columns = Object.keys(data[0]);
    console.log('Column mapping:');
    columns.forEach((col, index) => {
        console.log(`Column ${String.fromCharCode(65 + index)} (${index}): ${col}`);
    });
    
    // Try to identify sTLT column (Column N = index 13)
    const stltColumn = columns[13] || 'sTLT';
    console.log('Using sTLT column (Column N):', stltColumn);
    
    // Try to identify Manager column (Column O = index 14)
    const managerColumn = columns[14] || 'Manager';
    console.log('Using Manager column (Column O):', managerColumn);
    
    // Step 1: Group all employees by sTLT (Column N)
    const employeesBySTLT = {};
    const allManagersGlobal = {};
    
    console.log('=== STEP 1: GROUPING BY sTLT (Column N) ===');
    data.forEach((employee, index) => {
        const name = employee['Name'] || employee['Full Name'] || employee['Employee Name'] || Object.values(employee)[0] || `Employee_${index}`;
        const stlt = employee[stltColumn] || 'Unassigned';
        const manager = employee[managerColumn] || null;
        
        // Log first few records for debugging
        if (index < 5) {
            console.log(`Employee ${index}:`, {
                name: name,
                stlt: stlt,
                manager: manager,
                columnN_value: employee[columns[13]],
                columnO_value: employee[columns[14]]
            });
        }
        
        // Group by sTLT
        if (!employeesBySTLT[stlt]) {
            employeesBySTLT[stlt] = [];
        }
        
        employeesBySTLT[stlt].push({
            name: name,
            manager: manager ? manager.trim() : null,
            rawData: employee
        });
        
        // Track all managers globally for reference
        if (manager && manager.trim() !== '') {
            const managerName = manager.trim();
            if (!allManagersGlobal[managerName]) {
                allManagersGlobal[managerName] = [];
            }
            allManagersGlobal[managerName].push(name);
        }
    });
    
    console.log('Employees grouped by sTLT:', Object.keys(employeesBySTLT).map(stlt => `${stlt}: ${employeesBySTLT[stlt].length} employees`));
    
    // Step 2: For each sTLT, identify managers and count their reports
    const stltAnalysis = {};
    
    console.log('=== STEP 2: ANALYZING MANAGERS PER sTLT ===');
    Object.entries(employeesBySTLT).forEach(([stlt, employees]) => {
        console.log(`\nAnalyzing sTLT: ${stlt} (${employees.length} employees)`);
        
        // Find unique managers mentioned in Column O within this sTLT
        const managersInThisSTLT = new Set();
        employees.forEach(emp => {
            if (emp.manager) {
                managersInThisSTLT.add(emp.manager);
            }
        });
        
        console.log(`  Managers mentioned in this sTLT: ${Array.from(managersInThisSTLT).join(', ')}`);
        
        // For each manager, count how many people report to them
        const managerReportCounts = {};
        Array.from(managersInThisSTLT).forEach(manager => {
            // Count people in THIS sTLT who report to this manager
            const reportsInThisSTLT = employees.filter(emp => emp.manager === manager);
            
            // Count total reports across ALL sTLTs
            const totalReports = allManagersGlobal[manager] || [];
            
            managerReportCounts[manager] = {
                reportsInThisSTLT: reportsInThisSTLT.length,
                reportsInThisSTLTNames: reportsInThisSTLT.map(emp => emp.name),
                totalReportsAcrossAllSTLTs: totalReports.length,
                totalReportsNames: totalReports
            };
            
            console.log(`    Manager ${manager}:`);
            console.log(`      - Reports in ${stlt}: ${reportsInThisSTLT.length} (${reportsInThisSTLT.map(r => r.name).join(', ')})`);
            console.log(`      - Total reports across all sTLTs: ${totalReports.length}`);
        });
        
        // Check if any employees in this sTLT are managers themselves (appear in Column O elsewhere)
        const employeesWhoAreManagers = employees.filter(emp => 
            allManagersGlobal[emp.name] && allManagersGlobal[emp.name].length > 0
        );
        
        console.log(`  Employees in ${stlt} who are also managers: ${employeesWhoAreManagers.map(emp => emp.name).join(', ')}`);
        
        stltAnalysis[stlt] = {
            totalEmployees: employees.length,
            managersReferencedInColumnO: Array.from(managersInThisSTLT),
            employeesWhoAreManagers: employeesWhoAreManagers.map(emp => emp.name),
            managerReportCounts: managerReportCounts,
            allEmployees: employees
        };
    });
    
    console.log('=== FINAL sTLT ANALYSIS ===');
    Object.entries(stltAnalysis).forEach(([stlt, analysis]) => {
        console.log(`${stlt}:`);
        console.log(`  Total employees: ${analysis.totalEmployees}`);
        console.log(`  Managers referenced: ${analysis.managersReferencedInColumnO.length}`);
        console.log(`  Employees who are managers: ${analysis.employeesWhoAreManagers.length}`);
        console.log(`  Manager report counts:`, analysis.managerReportCounts);
    });
    
    return {
        stltColumn,
        managerColumn,
        employeesBySTLT,
        stltAnalysis,
        allManagersGlobal
    };
}

// Updated function to process employee data using simplified table-based calculation
function processEmployeeDataWithPivot(data) {
    console.log('=== SIMPLIFIED sTLT ANALYSIS WITH EXCEL PIVOT ===');
    console.log('Processing', data.length, 'records');
    
    if (!data || data.length === 0) {
        return { currentEmployees: [], toBeJoined: [], stltGroups: {}, pivotTable: null };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Step 1: Build temporary table with STLT, Manager, and Employee columns
    const tempTable = [];
    const columns = Object.keys(data[0]);
    
    // Try to identify STLT and Manager columns
    let stltColumnName = null;
    let managerColumnName = null;
    let nameColumnName = null;
    
    // Look for STLT column (try common variations)
    const stltVariations = ['STLT', 'sTLT', 'stlt', 'Team', 'Department', 'Senior Leadership'];
    for (const variation of stltVariations) {
        if (columns.includes(variation)) {
            stltColumnName = variation;
            break;
        }
    }
    
    // Look for Manager column
    const managerVariations = ['Manager', 'manager', 'Direct Manager', 'Supervisor', 'Reports To'];
    for (const variation of managerVariations) {
        if (columns.includes(variation)) {
            managerColumnName = variation;
            break;
        }
    }
    
    // Look for Name column
    const nameVariations = ['Name', 'Full Name', 'Employee Name', 'Employee', 'First Name'];
    for (const variation of nameVariations) {
        if (columns.includes(variation)) {
            nameColumnName = variation;
            break;
        }
    }
    
    // Fallback to column positions if names not found
    if (!stltColumnName && columns.length > 13) stltColumnName = columns[13]; // Column N
    if (!managerColumnName && columns.length > 14) managerColumnName = columns[14]; // Column O
    if (!nameColumnName) nameColumnName = columns[0]; // First column
    
    console.log('Column mapping:', {
        stltColumn: stltColumnName,
        managerColumn: managerColumnName,
        nameColumn: nameColumnName
    });
    
    // Build the temporary table
    data.forEach((row, index) => {
        const employeeName = row[nameColumnName] || `Employee_${index}`;
        const stlt = row[stltColumnName] || 'Unassigned';
        const manager = row[managerColumnName] || null;
        
        // Handle start date
        const startDateValue = row['Start Date'] || row['start_date'] || row['startDate'] || row['Start'] || row['Start date'];
        let startDate = null;
        if (startDateValue) {
            startDate = new Date(startDateValue);
            if (isNaN(startDate.getTime())) {
                const dateStr = startDateValue.toString();
                const parts = dateStr.split(/[-\/]/);
                if (parts.length === 3) {
                    startDate = new Date(parts[2], parts[0] - 1, parts[1]);
                    if (isNaN(startDate.getTime())) {
                        startDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                }
            }
        }
        
        tempTable.push({
            employeeName: employeeName.trim(),
            stlt: stlt.trim(),
            manager: manager ? manager.trim() : null,
            startDate: startDate,
            isCurrentEmployee: !startDate || startDate <= today,
            rawData: row
        });
    });
    
    console.log('Temporary table built with', tempTable.length, 'entries');
    
    // Create Excel-style pivot table
    const pivotTableData = tempTable
        .filter(entry => entry.isCurrentEmployee)
        .map(entry => ({
            Name: entry.employeeName,
            STLT: entry.stlt,
            Manager: entry.manager || 'No Manager'
        }));
    
    const pivotTable = createSTLTPivotTable(pivotTableData);
    
    // Step 2: Group by STLT and calculate manager counts
    const stltGroups = {};
    const currentEmployees = [];
    const toBeJoined = [];
    
    // Group all employees by STLT
    const employeesBySTLT = {};
    tempTable.forEach(entry => {
        if (!employeesBySTLT[entry.stlt]) {
            employeesBySTLT[entry.stlt] = [];
        }
        employeesBySTLT[entry.stlt].push(entry);
        
        // Separate current vs future employees
        if (entry.isCurrentEmployee) {
            currentEmployees.push({
                name: entry.employeeName,
                stlt: entry.stlt,
                manager: entry.manager,
                role: entry.rawData['Position'] || entry.rawData['Job Title'] || '',
                rawData: entry.rawData
            });
        } else {
            toBeJoined.push({
                name: entry.employeeName,
                stlt: entry.stlt,
                startDate: entry.startDate,
                startDateStr: entry.rawData['Start Date'] || 'TBD',
                role: entry.rawData['Position'] || entry.rawData['Job Title'] || '',
                rawData: entry.rawData
            });
        }
    });
    
    // Step 3: For each STLT, calculate simplified metrics without direct report counts
    Object.entries(employeesBySTLT).forEach(([stlt, employees]) => {
        console.log(`\nProcessing sTLT: ${stlt} (${employees.length} total employees)`);
        
        // Get only current employees for this STLT
        const currentSTLTEmployees = employees.filter(emp => emp.isCurrentEmployee);
        
        // Find all unique managers in this STLT
        const managersInSTLT = new Set();
        
        // Collect managers
        currentSTLTEmployees.forEach(employee => {
            if (employee.manager) {
                managersInSTLT.add(employee.manager);
            }
        });
        
        // Calculate totals for this STLT
        const totalEmployeesInSTLT = currentSTLTEmployees.length;
        const totalManagersInSTLT = managersInSTLT.size;
        
        console.log(`  Total employees: ${totalEmployeesInSTLT}`);
        console.log(`  Total managers: ${totalManagersInSTLT}`);
        
        // Store the processed data
        stltGroups[stlt] = {
            employees: currentSTLTEmployees.map(emp => ({
                name: emp.employeeName,
                manager: emp.manager,
                role: emp.rawData['Position'] || emp.rawData['Job Title'] || '',
                stlt: stlt,
                rawData: emp.rawData
            })),
            managers: Array.from(managersInSTLT),
            totalEmployees: totalEmployeesInSTLT,
            totalManagers: totalManagersInSTLT
        };
    });
    
    console.log('=== FINAL sTLT SUMMARY ===');
    Object.entries(stltGroups).forEach(([stlt, data]) => {
        console.log(`${stlt}: ${data.totalEmployees} employees, ${data.totalManagers} managers`);
    });
    
    return {
        currentEmployees,
        toBeJoined,
        stltGroups,
        pivotTable
    };
}

// Tech People Portal Integration Functions
function loadTechPeoplePortal() {
    console.log('Loading Tech People Portal...');
    window.location.href = 'tech-people-portal.html';
}

function updateDashboardWithTechPeopleData() {
    console.log('Updating dashboard with Tech People data...');
    
    // First, try to get real data from allpeople CSV files
    const realAllPeopleData = loadAllPeopleDataFromStorage();
    
    if (realAllPeopleData && realAllPeopleData.length > 0) {
        // Filter for currently active employees only
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        const activeEmployees = realAllPeopleData.filter(employee => {
            // Get onboard date from Column I (index 8)
            const onboardDateStr = employee[Object.keys(employee)[8]] || '';
            // Get offboard date from Column J (index 9) 
            const offboardDateStr = employee[Object.keys(employee)[9]] || '';
            
            // Parse onboard date
            let onboardDate = null;
            if (onboardDateStr && onboardDateStr.trim() !== '') {
                onboardDate = new Date(onboardDateStr);
                if (isNaN(onboardDate.getTime())) {
                    // Try different date formats if needed
                    const parts = onboardDateStr.split('/');
                    if (parts.length === 3) {
                        onboardDate = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
                    }
                }
            }
            
            // Parse offboard date
            let offboardDate = null;
            if (offboardDateStr && offboardDateStr.trim() !== '') {
                offboardDate = new Date(offboardDateStr);
                if (isNaN(offboardDate.getTime())) {
                    // Try different date formats if needed
                    const parts = offboardDateStr.split('/');
                    if (parts.length === 3) {
                        offboardDate = new Date(parts[2], parts[0] - 1, parts[1]); // MM/DD/YYYY
                    }
                }
            }
            
            // Employee is active if:
            // 1. Onboard date is today or in the past (or missing/invalid)
            // 2. Offboard date is in the future (or missing/invalid)
            const isOnboarded = !onboardDate || onboardDate <= today;
            const isNotOffboarded = !offboardDate || offboardDate > today;
            
            return isOnboarded && isNotOffboarded;
        });
        
        // Count exclusions for verification
        const futureStarts = realAllPeopleData.filter(emp => {
            const onboardDateStr = emp[Object.keys(emp)[8]] || '';
            if (onboardDateStr && onboardDateStr.trim() !== '') {
                let onboardDate = new Date(onboardDateStr);
                if (isNaN(onboardDate.getTime())) {
                    const parts = onboardDateStr.split('/');
                    if (parts.length === 3) {
                        onboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                    }
                }
                return onboardDate && onboardDate > today;
            }
            return false;
        }).length;
        
        const pastEnds = realAllPeopleData.filter(emp => {
            const offboardDateStr = emp[Object.keys(emp)[9]] || '';
            if (offboardDateStr && offboardDateStr.trim() !== '') {
                let offboardDate = new Date(offboardDateStr);
                if (isNaN(offboardDate.getTime())) {
                    const parts = offboardDateStr.split('/');
                    if (parts.length === 3) {
                        offboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                    }
                }
                return offboardDate && offboardDate <= today;
            }
            return false;
        }).length;
        
        console.log(`=== TECH PEOPLE DATA FILTERING ===`);
        console.log(`- Total records: ${realAllPeopleData.length}`);
        console.log(`- Future starts (excluded): ${futureStarts}`);
        console.log(`- Past/current ends (excluded): ${pastEnds}`);
        console.log(`- Currently active: ${activeEmployees.length}`);
        console.log(`- Expected calculation: ${realAllPeopleData.length} - ${futureStarts} - ${pastEnds} = ${realAllPeopleData.length - futureStarts - pastEnds}`);
        console.log(`=====================================`);
        
        console.log(`Filtered from ${realAllPeopleData.length} total records to ${activeEmployees.length} active employees`);
        console.log(`Excluded: ${realAllPeopleData.length - activeEmployees.length} employees (future onboard or past offboard dates)`);
        
        // Use filtered active employees count
        const totalTechPeople = activeEmployees.length;
        console.log(`Using real allpeople data: ${totalTechPeople} active tech people`);
        
        // Update the main dashboard card with filtered data
        updateStatCard('Total Tech People Count', totalTechPeople);
        
        return {
            totalTechPeople,
            dataSource: 'allpeople_csv',
            employeeData: activeEmployees
        };
    } else {
        // Fallback to leadership structure data if no CSV uploaded
        console.log('No allpeople CSV found, using leadership structure data as fallback');
        
        // Tech People Portal data (leadership structure fallback)
        const techPeopleData = [
        {
            name: "Stephen Blackburn",
            title: "Senior VP of Technology",
            department: "infrastructure",
            reports: 112,
            email: "stephen.blackburn@company.com",
            directReports: ["Vikas Sinha", "Gaurav Jain", "Christopher Baynes", "Rajat Prabhakar", "Bhanu Singh", "Rajesh Kumar", "Manoj Mehta", "Akash Sinha"]
        },
        {
            name: "Eran Netanel",
            title: "Senior VP of Technology",
            department: "quality",
            reports: 98,
            email: "eran.netanel@company.com",
            directReports: ["Sachin Dev", "Deepti Rawat", "Harish Taneja", "Abhishek Arya", "Sreyas Chakravarthi", "Anuj Solanki", "Shubhang Yadav", "Vikas Sehgal"]
        },
        {
            name: "Claudio Taglienti",
            title: "VP of Technology",
            department: "quality", 
            reports: 75,
            email: "claudio.taglienti@company.com",
            directReports: ["Gaurav Jain", "Nikhil Sule", "George Rusu", "Manoj Sharma", "Nikhil Agrawal", "Karan Gupta", "Vinay Kumar", "Sandeep Singh"]
        },
        {
            name: "Subu Balakrishnan",
            title: "Director of Technology",
            department: "quality",
            reports: 44,
            email: "subu.balakrishnan@company.com",
            directReports: ["Siddharth Asthana", "Nishith Murab", "Tazeem Ahmed", "Rajiv Bharti", "Mukesh Kumar", "Ankit Sharma", "Rohit Gupta", "Priya Singh"]
        },
        {
            name: "Asit Goel",
            title: "Senior Technology Manager", 
            department: "quality",
            reports: 26,
            email: "asit.goel@company.com",
            directReports: ["Karan Kapoor", "Vinkal Kumar", "Rajesh Yadav", "Amit Singh", "Neha Agarwal"]
        },
        {
            name: "Drew Johnson",
            title: "Senior Technology Manager",
            department: "architecture",
            reports: 13,
            email: "drew.johnson@company.com",
            directReports: ["Michael Chen", "Sarah Wilson", "David Kumar", "Lisa Thompson"]
        },
        {
            name: "Ronnie Pettersson",
            title: "Senior Technology Manager",
            department: "engineering",
            reports: 9,
            email: "ronnie.pettersson@company.com",
            directReports: ["Erik Johansson", "Anna Lindberg", "Magnus Olsson"]
        },
        {
            name: "Narendra Sharma",
            title: "Senior Technology Manager",
            department: "architecture",
            reports: 7,
            email: "narendra.sharma@company.com",
            directReports: ["Arun Kumar", "Vijay Singh"]
        },
        {
            name: "Fredrik Janson",
            title: "Senior Technology Manager",
            department: "engineering",
            reports: 6,
            email: "fredrik.janson@company.com",
            directReports: ["Johan Andersson", "Emma Carlsson", "Lars Nielsen"]
        },
        {
            name: "Mircea Costache",
            title: "Senior Technology Manager",
            department: "engineering",
            reports: 4,
            email: "mircea.costache@company.com",
            directReports: ["Adrian Popescu"]
        }
    ];

        // Calculate totals from leadership structure as fallback
        const directReports = techPeopleData.reduce((sum, member) => sum + member.reports, 0);
        const totalTechPeople = directReports + techPeopleData.length + 2; // 394 + 10 + 2 = 406
        const totalLeaders = techPeopleData.length;
        const departments = new Set(techPeopleData.map(m => m.department)).size;
        
        // Update the main dashboard card with fallback data
        updateStatCard('Total Tech People Count', totalTechPeople);
        
        console.log(`Updated dashboard with fallback Tech People data: ${totalTechPeople} total people (${directReports} reports + ${totalLeaders} leaders + 2 additional), ${departments} departments`);
        
        return {
            totalTechPeople,
            totalLeaders,
            departments,
            techPeopleData,
            dataSource: 'leadership_structure'
        };
    }
}

// Initialize tech people data on dashboard load
document.addEventListener('DOMContentLoaded', function() {
    // Update dashboard with tech people data after a short delay
    setTimeout(() => {
        console.log('🚀 DOM loaded, calling updateDashboardWithTechPeopleData...');
        updateDashboardWithTechPeopleData();
        
        // Also try to update from allpeople data
        console.log('🚀 Also calling updateDashboardFromAllPeople...');
        updateDashboardFromAllPeople();
    }, 1000);
});

// Debug function to manually refresh data (call from browser console)
function debugRefreshDashboard() {
    console.log('🔧 DEBUG: Manual dashboard refresh triggered');
    console.log('📊 Calling updateDashboardFromAllPeople...');
    const result = updateDashboardFromAllPeople();
    console.log('📊 updateDashboardFromAllPeople result:', result);
    
    console.log('📊 Calling updateDashboardWithTechPeopleData...');
    updateDashboardWithTechPeopleData();
    
    return 'Debug refresh completed - check console for details';
}

// Make debug function available globally
window.debugRefreshDashboard = debugRefreshDashboard;

// Function to check current people count and debug data
function debugPeopleCount() {
    console.log('=== PEOPLE COUNT DEBUG ===');
    
    // Check localStorage for allpeople files
    let allPeopleData = null;
    let fileName = null;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('allpeople')) {
            try {
                const savedData = JSON.parse(localStorage.getItem(key));
                allPeopleData = savedData;
                fileName = key.replace('aeris_file_', '');
                console.log(`📁 Found allpeople file: ${fileName}`);
                console.log(`📊 Raw data count: ${savedData.rawData ? savedData.rawData.length : 'No rawData'}`);
                break;
            } catch (error) {
                console.error('Error loading allpeople file:', error);
            }
        }
    }
    
    if (!allPeopleData) {
        console.log('❌ No allpeople file found in localStorage');
        return { total: 0, active: 0, error: 'No data found' };
    }
    
    const employeeData = allPeopleData.rawData;
    if (!Array.isArray(employeeData)) {
        console.log('❌ Invalid data format');
        return { total: 0, active: 0, error: 'Invalid data format' };
    }
    
    // Apply filtering logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Today: ${today.toDateString()}`);
    console.log(`📋 Total records: ${employeeData.length}`);
    
    const activeEmployees = employeeData.filter(employee => {
        const onboardDateStr = employee[Object.keys(employee)[8]] || '';
        const offboardDateStr = employee[Object.keys(employee)[9]] || '';
        
        let onboardDate = null;
        if (onboardDateStr && onboardDateStr.trim() !== '') {
            onboardDate = new Date(onboardDateStr);
            if (isNaN(onboardDate.getTime())) {
                const parts = onboardDateStr.split('/');
                if (parts.length === 3) {
                    onboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
        }
        
        let offboardDate = null;
        if (offboardDateStr && offboardDateStr.trim() !== '') {
            offboardDate = new Date(offboardDateStr);
            if (isNaN(offboardDate.getTime())) {
                const parts = offboardDateStr.split('/');
                if (parts.length === 3) {
                    offboardDate = new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
        }
        
        const isOnboarded = !onboardDate || onboardDate <= today;
        const isNotOffboarded = !offboardDate || offboardDate > today;
        
        return isOnboarded && isNotOffboarded;
    });
    
    const result = {
        total: employeeData.length,
        active: activeEmployees.length,
        fileName: fileName,
        today: today.toDateString()
    };
    
    console.log(`✅ RESULT: ${result.total} total, ${result.active} active`);
    console.log('=== END DEBUG ===');
    
    return result;
}

// Make debug function available globally
window.debugPeopleCount = debugPeopleCount;
