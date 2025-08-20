// sTLT Analysis JavaScript
// Adapting concepts from React GCP Cost Analysis for employee data

// Global variables
let employeeData = [];
let analysisData = {};
let charts = {};

// Initialize the analysis when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();
    
    // Load the analysis
    loadAnalysis();
});

// Main function to load and process employee data
async function loadAnalysis() {
    try {
        showLoading(true);
        hideError();
        
        // Get employee data from localStorage (allpeople files)
        const allPeopleData = getAllPeopleData();
        
        if (!allPeopleData || allPeopleData.length === 0) {
            throw new Error('No employee data found. Please upload allpeople files first in the File Upload Manager.');
        }
        
        console.log('Processing employee data:', allPeopleData.length, 'records');
        
        // Process the data
        analysisData = processEmployeeData(allPeopleData);
        
        // Generate all visualizations and tables
        generateSummaryCards();
        generateExecutiveSummary();
        generateSTLTDistribution();
        generateManagerAnalysis();
        generateDetailedBreakdown();
        generateFutureJoinersAnalysis();
        
        showLoading(false);
        document.getElementById('analysis-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading analysis:', error);
        showError(error.message);
        showLoading(false);
    }
}

// Get employee data from localStorage
function getAllPeopleData() {
    try {
        const allPeopleFiles = JSON.parse(localStorage.getItem('allPeopleFiles') || '[]');
        let combinedData = [];
        
        allPeopleFiles.forEach(fileData => {
            if (fileData.data && Array.isArray(fileData.data)) {
                combinedData = combinedData.concat(fileData.data);
            }
        });
        
        return combinedData;
    } catch (error) {
        console.error('Error getting employee data:', error);
        return [];
    }
}

// Process employee data using the enhanced CSV parser approach
function processEmployeeData(rawData) {
    console.log('Processing employee data with enhanced sTLT analysis...');
    
    // Filter out rows without proper sTLT data
    const cleanData = rawData.filter(row => {
        const stlt = getColumnValue(row, 'STLT') || getColumnValue(row, 'sTLT') || '';
        return stlt && stlt.trim() !== '' && stlt !== 'null' && stlt !== null;
    });
    
    console.log('Clean data:', cleanData.length, 'records');
    
    // Use lodash to group by sTLT (similar to the CSV parser)
    const groupedBySTLT = _.groupBy(cleanData, row => {
        const stlt = getColumnValue(row, 'STLT') || getColumnValue(row, 'sTLT') || '';
        return stlt.toString().trim();
    });
    
    // Process each sTLT group to get the hierarchical structure
    const stltGroups = {};
    const managerData = {};
    const futureJoiners = {};
    
    Object.entries(groupedBySTLT).forEach(([stltName, people]) => {
        // Get unique managers for this sTLT
        const uniqueManagers = _.uniq(
            people.map(person => getColumnValue(person, 'Manager') || '')
                .filter(manager => manager && 
                       manager !== 'null' && 
                       manager !== null && 
                       manager.toString().trim() !== '')
        );
        
        // Get all people names for this sTLT
        const peopleNames = people.map(person => 
            getColumnValue(person, 'Name') || 
            getColumnValue(person, 'Employee Name') || 
            getColumnValue(person, 'Full Name') || ''
        ).filter(name => name && name.trim() !== '');
        
        // Count future joiners
        const futureCount = people.filter(person => {
            const status = getColumnValue(person, 'Status') || '';
            const startDate = getColumnValue(person, 'Start Date') || '';
            return isFutureJoiner(startDate, status);
        }).length;
        
        // Create sTLT group data
        stltGroups[stltName] = {
            employees: people,
            managers: uniqueManagers,
            managerCount: uniqueManagers.length,
            totalCount: people.length,
            activeCount: people.length - futureCount,
            futureCount: futureCount,
            peopleList: peopleNames
        };
        
        if (futureCount > 0) {
            futureJoiners[stltName] = futureCount;
        }
        
        // Create detailed manager data for each manager in this sTLT
        uniqueManagers.forEach(manager => {
            const managerReports = people.filter(person => {
                const personManager = getColumnValue(person, 'Manager') || '';
                return personManager === manager;
            });
            
            const managerKey = `${stltName}::${manager}`;
            managerData[managerKey] = {
                stlt: stltName,
                manager: manager,
                directReports: managerReports.map(person => 
                    getColumnValue(person, 'Name') || 
                    getColumnValue(person, 'Employee Name') || 
                    getColumnValue(person, 'Full Name') || ''
                ).filter(name => name),
                teamSize: managerReports.length
            };
        });
    });
    
    // Calculate summary statistics
    const totalEmployees = cleanData.length;
    const totalSTLTs = Object.keys(stltGroups).length;
    const totalManagers = Object.keys(managerData).length;
    const totalFutureJoiners = Object.values(futureJoiners).reduce((sum, count) => sum + count, 0);
    
    // Create sTLT leadership summary (like your example)
    const stltLeadershipSummary = Object.entries(stltGroups)
        .map(([stltName, data]) => ({
            name: stltName,
            totalPeople: data.totalCount,
            managerCount: data.managerCount,
            managers: data.managers
        }))
        .sort((a, b) => b.totalPeople - a.totalPeople);
    
    return {
        stltGroups,
        managerData,
        futureJoiners,
        stltLeadershipSummary,
        summary: {
            totalEmployees,
            totalSTLTs,
            totalManagers,
            totalFutureJoiners,
            averageTeamSize: totalManagers > 0 ? (totalEmployees / totalManagers).toFixed(1) : 0,
            averagePeoplePerSTLT: totalSTLTs > 0 ? Math.round(totalEmployees / totalSTLTs) : 0
        },
        rawData: cleanData
    };
}

// Helper function to get column value by various possible names
function getColumnValue(row, columnIdentifier) {
    // Try direct access first
    if (row[columnIdentifier]) {
        return row[columnIdentifier];
    }
    
    // Try common column name variations
    const columnMappings = {
        'Name': ['Name', 'Employee Name', 'Full Name', 'First Name', 'Employee'],
        'STLT': ['STLT', 'sTLT', 'Team', 'Department', 'Senior Leadership', 'Senior Team Lead'],
        'Manager': ['Manager', 'Manager Name', 'Supervisor', 'Reports To', 'Direct Manager'],
        'Status': ['Status', 'Employment Status', 'Employee Status', 'Work Status'],
        'Start Date': ['Start Date', 'Join Date', 'Hire Date', 'Employment Start Date']
    };
    
    // Check if we have a mapping for this identifier
    if (columnMappings[columnIdentifier]) {
        for (const possibleName of columnMappings[columnIdentifier]) {
            if (row[possibleName]) {
                return row[possibleName];
            }
        }
    }
    
    // Try case-insensitive search
    const keys = Object.keys(row);
    const lowerIdentifier = columnIdentifier.toLowerCase();
    for (const key of keys) {
        if (key.toLowerCase().includes(lowerIdentifier)) {
            return row[key];
        }
    }
    
    return '';
}

// Check if an employee is a future joiner
function isFutureJoiner(startDate, status) {
    if (!startDate) return false;
    
    const today = new Date();
    const joinDate = new Date(startDate);
    
    return joinDate > today || status.toLowerCase().includes('future') || status.toLowerCase().includes('pending');
}

// Generate summary cards
function generateSummaryCards() {
    const summaryHtml = `
        <div class="summary-card">
            <div class="card-value">${analysisData.summary.totalEmployees}</div>
            <div class="card-label">Total Employees</div>
        </div>
        <div class="summary-card">
            <div class="card-value">${analysisData.summary.totalSTLTs}</div>
            <div class="card-label">sTLT Groups</div>
        </div>
        <div class="summary-card">
            <div class="card-value">${analysisData.summary.totalManagers}</div>
            <div class="card-label">Total Managers</div>
        </div>
        <div class="summary-card">
            <div class="card-value">${analysisData.summary.averageTeamSize}</div>
            <div class="card-label">Avg Team Size</div>
        </div>
        <div class="summary-card">
            <div class="card-value">${analysisData.summary.totalFutureJoiners}</div>
            <div class="card-label">Future Joiners</div>
        </div>
    `;
    
    document.getElementById('summary-cards').innerHTML = summaryHtml;
}

// Generate executive summary with sTLT leadership breakdown
function generateExecutiveSummary() {
    const summaryHtml = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h3 style="margin-bottom: 15px; color: #333;">sTLT Leadership Overview:</h3>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">
                    ${analysisData.summary.totalSTLTs} STLTs managing ${analysisData.summary.totalEmployees} people
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-top: 15px;">
                    ${analysisData.stltLeadershipSummary.map(stlt => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                            <div style="font-weight: bold; font-size: 1.1em; color: #333; margin-bottom: 8px;">
                                ${stlt.name}
                            </div>
                            <div style="color: #666; font-size: 0.95em;">
                                <strong>${stlt.totalPeople} people</strong>, <strong>${stlt.managerCount} managers</strong>
                            </div>
                            <div style="font-size: 0.85em; color: #888; margin-top: 5px;">
                                Managers: ${stlt.managers.slice(0, 3).join(', ')}${stlt.managers.length > 3 ? ` (+${stlt.managers.length - 3} more)` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <h3 style="margin-bottom: 15px; color: #333;">Key Insights:</h3>
            <ul style="list-style-type: disc; padding-left: 20px; line-height: 1.6;">
                <li>The organization has <strong>${analysisData.summary.totalEmployees} total employees</strong> distributed across <strong>${analysisData.summary.totalSTLTs} sTLT groups</strong></li>
                <li>Average of <strong>${analysisData.summary.averagePeoplePerSTLT} people per sTLT</strong> with <strong>${analysisData.summary.totalManagers} total managers</strong></li>
                <li>Largest sTLT: <strong>${analysisData.stltLeadershipSummary[0]?.name}</strong> with ${analysisData.stltLeadershipSummary[0]?.totalPeople} people and ${analysisData.stltLeadershipSummary[0]?.managerCount} managers</li>
                <li>Average team size is <strong>${analysisData.summary.averageTeamSize} employees per manager</strong></li>
                ${analysisData.summary.totalFutureJoiners > 0 ? `<li>There are <strong>${analysisData.summary.totalFutureJoiners} future joiners</strong> across all sTLTs</li>` : ''}
            </ul>
        </div>
    `;
    
    document.getElementById('executive-summary-text').innerHTML = summaryHtml;
}

// Generate sTLT distribution chart and table
function generateSTLTDistribution() {
    // Prepare data for charts using stltLeadershipSummary
    const stltData = analysisData.stltLeadershipSummary;
    
    const labels = stltData.map(item => item.name);
    const counts = stltData.map(item => item.totalPeople);
    const colors = generateColors(labels.length);
    
    // Create pie chart
    const ctx1 = document.getElementById('stltDistributionChart').getContext('2d');
    if (charts.stltDistribution) charts.stltDistribution.destroy();
    charts.stltDistribution = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Employee Distribution by sTLT'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Create bar chart for hierarchy
    const ctx2 = document.getElementById('stltHierarchyChart').getContext('2d');
    if (charts.stltHierarchy) charts.stltHierarchy.destroy();
    charts.stltHierarchy = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total People',
                data: counts,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }, {
                label: 'Managers',
                data: stltData.map(item => item.managerCount),
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'sTLT Team Sizes & Manager Counts'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Populate table with correct structure
    const tableBody = document.getElementById('stlt-distribution-body');
    tableBody.innerHTML = stltData.map(item => {
        const stltGroup = analysisData.stltGroups[item.name];
        const avgTeamSize = item.managerCount > 0 ? (item.totalPeople / item.managerCount).toFixed(1) : 'N/A';
        const percentage = ((item.totalPeople / analysisData.summary.totalEmployees) * 100).toFixed(1);
        
        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.totalPeople}</td>
                <td><span class="direct-report-count">${item.managerCount}</span></td>
                <td>${stltGroup ? stltGroup.activeCount : item.totalPeople}</td>
                <td>${avgTeamSize}</td>
                <td>${percentage}%</td>
            </tr>
        `;
    }).join('');
}

// Generate manager analysis
function generateManagerAnalysis() {
    const managerArray = Object.values(analysisData.managerData)
        .sort((a, b) => b.teamSize - a.teamSize);
    
    // Prepare data for charts
    const managerLabels = managerArray.slice(0, 10).map(m => `${m.manager} (${m.stlt})`);
    const managerCounts = managerArray.slice(0, 10).map(m => m.teamSize);
    
    // Manager distribution chart
    const ctx1 = document.getElementById('managerDistributionChart').getContext('2d');
    if (charts.managerDistribution) charts.managerDistribution.destroy();
    charts.managerDistribution = new Chart(ctx1, {
        type: 'horizontalBar',
        data: {
            labels: managerLabels,
            datasets: [{
                label: 'Team Size',
                data: managerCounts,
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Managers by Team Size'
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Team size distribution
    const teamSizes = managerArray.map(m => m.teamSize);
    const sizeRanges = ['1-2', '3-5', '6-10', '11-15', '16+'];
    const sizeCounts = [
        teamSizes.filter(s => s >= 1 && s <= 2).length,
        teamSizes.filter(s => s >= 3 && s <= 5).length,
        teamSizes.filter(s => s >= 6 && s <= 10).length,
        teamSizes.filter(s => s >= 11 && s <= 15).length,
        teamSizes.filter(s => s >= 16).length
    ];
    
    const ctx2 = document.getElementById('teamSizeChart').getContext('2d');
    if (charts.teamSize) charts.teamSize.destroy();
    charts.teamSize = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: sizeRanges,
            datasets: [{
                data: sizeCounts,
                backgroundColor: generateColors(5),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Team Size Distribution'
                }
            }
        }
    });
    
    // Populate manager table
    const tableBody = document.getElementById('manager-analysis-body');
    tableBody.innerHTML = managerArray.map(manager => {
        const stltData = analysisData.stltGroups[manager.stlt];
        const stltPercentage = stltData ? ((manager.teamSize / stltData.totalCount) * 100).toFixed(1) : '0.0';
        
        return `
            <tr class="manager-highlight">
                <td><strong>${manager.stlt}</strong></td>
                <td>${manager.manager}</td>
                <td><span class="direct-report-count">${manager.teamSize}</span></td>
                <td>${manager.teamSize}</td>
                <td>${stltPercentage}%</td>
            </tr>
        `;
    }).join('');
}

// Generate detailed breakdown with correct hierarchical structure
function generateDetailedBreakdown() {
    const container = document.getElementById('detailed-breakdown');
    
    const breakdownHtml = analysisData.stltLeadershipSummary.map(stlt => {
        const stltData = analysisData.stltGroups[stlt.name];
        
        // Get managers for this sTLT with their team details
        const managerDetails = stlt.managers.map(manager => {
            const managerKey = `${stlt.name}::${manager}`;
            const managerInfo = analysisData.managerData[managerKey];
            const reportCount = managerInfo ? managerInfo.teamSize : 0;
            
            return {
                name: manager,
                reportCount: reportCount,
                directReports: managerInfo ? managerInfo.directReports : []
            };
        }).sort((a, b) => b.reportCount - a.reportCount);
        
        return `
            <div style="margin-bottom: 30px; padding: 25px; border: 2px solid #667eea; border-radius: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #667eea; margin: 0; font-size: 1.4em;">
                        ${stlt.name}
                    </h3>
                    <div style="background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                        ${stlt.totalPeople} people, ${stlt.managerCount} managers
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
                    ${managerDetails.map(manager => `
                        <div style="background: white; padding: 18px; border-radius: 10px; border-left: 4px solid #4caf50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
                                <div style="font-weight: bold; font-size: 1.1em; color: #333;">
                                    ${manager.name}
                                </div>
                                <div style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">
                                    ${manager.reportCount} reports
                                </div>
                            </div>
                            <div style="font-size: 0.9em; color: #666; line-height: 1.4;">
                                <strong>Direct Reports:</strong><br>
                                ${manager.directReports.length > 0 ? 
                                    manager.directReports.slice(0, 8).join(', ') + 
                                    (manager.directReports.length > 8 ? ` <em>(+${manager.directReports.length - 8} more)</em>` : '')
                                    : 'No direct reports found'}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #667eea;">Statistics:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div><strong>Active Employees:</strong> ${stltData ? stltData.activeCount : stlt.totalPeople}</div>
                        <div><strong>Future Joiners:</strong> ${stltData ? stltData.futureCount : 0}</div>
                        <div><strong>Total Count:</strong> ${stlt.totalPeople}</div>
                        <div><strong>Avg Team Size:</strong> ${(stlt.totalPeople / stlt.managerCount).toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = breakdownHtml;
}

// Generate future joiners analysis
function generateFutureJoinersAnalysis() {
    const futureData = Object.entries(analysisData.futureJoiners)
        .filter(([, count]) => count > 0)
        .sort(([,a], [,b]) => b - a);
    
    if (futureData.length === 0) {
        document.getElementById('futureJoinersChart').getContext('2d').fillText('No future joiners data available', 10, 50);
        document.getElementById('joinersTimelineChart').getContext('2d').fillText('No timeline data available', 10, 50);
        document.getElementById('future-joiners-body').innerHTML = '<tr><td colspan="5">No future joiners found</td></tr>';
        return;
    }
    
    const labels = futureData.map(([stlt]) => stlt);
    const counts = futureData.map(([, count]) => count);
    
    // Future joiners by sTLT
    const ctx1 = document.getElementById('futureJoinersChart').getContext('2d');
    if (charts.futureJoiners) charts.futureJoiners.destroy();
    charts.futureJoiners = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Future Joiners',
                data: counts,
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Future Joiners by sTLT'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Timeline placeholder (would need actual date data)
    const ctx2 = document.getElementById('joinersTimelineChart').getContext('2d');
    if (charts.joinersTimeline) charts.joinersTimeline.destroy();
    charts.joinersTimeline = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Current', 'Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Projected Team Growth',
                data: [analysisData.summary.totalEmployees, 
                       analysisData.summary.totalEmployees + Math.floor(analysisData.summary.totalFutureJoiners * 0.25),
                       analysisData.summary.totalEmployees + Math.floor(analysisData.summary.totalFutureJoiners * 0.5),
                       analysisData.summary.totalEmployees + Math.floor(analysisData.summary.totalFutureJoiners * 0.75),
                       analysisData.summary.totalEmployees + analysisData.summary.totalFutureJoiners],
                borderColor: 'rgba(255, 193, 7, 1)',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Projected Growth Timeline'
                }
            }
        }
    });
    
    // Populate future joiners table
    const tableBody = document.getElementById('future-joiners-body');
    tableBody.innerHTML = futureData.map(([stlt, futureCount]) => {
        const currentCount = analysisData.stltGroups[stlt].activeCount;
        const totalProjected = currentCount + futureCount;
        const growthPercentage = currentCount > 0 ? ((futureCount / currentCount) * 100).toFixed(1) : 'N/A';
        
        return `
            <tr>
                <td><strong>${stlt}</strong></td>
                <td>${currentCount}</td>
                <td>${futureCount}</td>
                <td>${totalProjected}</td>
                <td>${growthPercentage}%</td>
            </tr>
        `;
    }).join('');
}

// Utility functions
function generateColors(count) {
    const colors = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C',
        '#8884D8', '#4CAF50', '#E91E63', '#9C27B0', '#FF5722',
        '#FFC107', '#3F51B5', '#607D8B', '#009688', '#795548'
    ];
    
    return Array.from({length: count}, (_, i) => colors[i % colors.length]);
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error').style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

// Make sure charts are responsive
window.addEventListener('resize', function() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.resize();
    });
});
