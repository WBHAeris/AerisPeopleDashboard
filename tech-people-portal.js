// Technology People Portal JavaScript Code
// Based on real sTLT data from CSV analysis

// Function to load real employee data from localStorage (allpeople CSV)
function loadRealEmployeeData() {
    try {
        // Look for allpeople CSV file
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aeris_file_') && key.toLowerCase().includes('allpeople')) {
                const savedData = JSON.parse(localStorage.getItem(key));
                if (savedData && savedData.rawData) {
                    console.log('Loaded allpeople CSV data:', savedData.rawData.length, 'employees');
                    return savedData.rawData;
                }
            }
        }
    } catch (error) {
        console.error('Error loading allpeople CSV data:', error);
    }
    return null;
}

// Debug function to check Gaurav's data specifically
function debugGauravData() {
    const employeeData = loadRealEmployeeData();
    if (!employeeData) {
        console.log('No employee data found');
        return;
    }
    
    const gauravRecord = employeeData.find(emp => {
        const name = emp[Object.keys(emp)[0]] || emp.name || '';
        return name.toLowerCase().includes('gaurav') && name.toLowerCase().includes('jain');
    });
    
    if (gauravRecord) {
        console.log('=== GAURAV JAIN DATA DEBUG ===');
        console.log('Full record:', gauravRecord);
        console.log('Column N (Functional Head):', gauravRecord[Object.keys(gauravRecord)[13]]);
        console.log('Column O (Manager):', gauravRecord[Object.keys(gauravRecord)[14]]);
        console.log('===============================');
    } else {
        console.log('Gaurav Jain not found in CSV data');
    }
}

// Function to load sTLT CSV data from localStorage
function loadSTLTData() {
    try {
        // Look for sTLT CSV file
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aeris_file_') && (
                key.toLowerCase().includes('stlt') || 
                key.toLowerCase().includes('s_tlt') ||
                key.toLowerCase().includes('team') ||
                key.toLowerCase().includes('leadership')
            )) {
                const savedData = JSON.parse(localStorage.getItem(key));
                if (savedData && savedData.rawData) {
                    console.log('Loaded sTLT CSV data:', savedData.rawData.length, 'records');
                    return savedData.rawData;
                }
            }
        }
    } catch (error) {
        console.error('Error loading sTLT CSV data:', error);
    }
    return null;
}

// Function to load sTLT functional area mappings
function loadSTLTFunctionalAreas() {
    // Try to load sTLT mapping from uploaded file
    try {
        const stltMappingData = localStorage.getItem('stlt_mapping_data');
        if (stltMappingData) {
            const mappingData = JSON.parse(stltMappingData);
            console.log('Loaded sTLT functional area mappings from uploaded file');
            return mappingData;
        }
    } catch (error) {
        console.error('Error loading sTLT mapping data:', error);
    }
    
    // Fallback to comprehensive functional area mapping based on common sTLT names
    return {
        // Engineering & Development
        'engineering': 'engineering',
        'software engineering': 'engineering',
        'software development': 'engineering',
        'development': 'engineering',
        'backend engineering': 'engineering',
        'frontend engineering': 'engineering',
        'full stack engineering': 'engineering',
        'mobile engineering': 'engineering',
        'web development': 'engineering',
        'application development': 'engineering',
        'systems engineering': 'engineering',
        'platform engineering': 'engineering',
        'eng': 'engineering',
        'dev': 'engineering',
        
        // Quality Assurance & Testing
        'quality': 'quality',
        'quality assurance': 'quality',
        'testing': 'quality',
        'qa': 'quality',
        'qe': 'quality',
        'quality engineering': 'quality',
        'test engineering': 'quality',
        'automation testing': 'quality',
        'manual testing': 'quality',
        'performance testing': 'quality',
        'security testing': 'quality',
        
        // Architecture & Design
        'architecture': 'architecture',
        'software architecture': 'architecture',
        'system architecture': 'architecture',
        'solution architecture': 'architecture',
        'technical architecture': 'architecture',
        'enterprise architecture': 'architecture',
        'design': 'architecture',
        'tech lead': 'architecture',
        'technical lead': 'architecture',
        'arch': 'architecture',
        
        // Infrastructure & Operations
        'infrastructure': 'infrastructure',
        'devops': 'infrastructure',
        'cloud infrastructure': 'infrastructure',
        'platform operations': 'infrastructure',
        'site reliability': 'infrastructure',
        'sre': 'infrastructure',
        'operations': 'infrastructure',
        'cloud engineering': 'infrastructure',
        'deployment': 'infrastructure',
        'monitoring': 'infrastructure',
        'infra': 'infrastructure',
        'ops': 'infrastructure',
        
        // Data & Analytics
        'data engineering': 'data',
        'data science': 'data',
        'analytics': 'data',
        'business intelligence': 'data',
        'machine learning': 'data',
        'ai': 'data',
        'data': 'data',
        
        // Security
        'security': 'security',
        'cybersecurity': 'security',
        'information security': 'security',
        'application security': 'security',
        'network security': 'security',
        
        // Product & UX
        'product': 'product',
        'product management': 'product',
        'ux': 'product',
        'ui': 'product',
        'user experience': 'product',
        'user interface': 'product',
        'design': 'product'
    };
}

// Function to determine functional area from sTLT name
function determineFunctionalArea(stltName, employeeRole = '') {
    if (!stltName) return 'other';
    
    const functionalAreaMap = loadSTLTFunctionalAreas();
    const stltLower = stltName.toLowerCase().trim();
    const roleLower = employeeRole.toLowerCase().trim();
    
    // Direct mapping from sTLT name
    if (functionalAreaMap[stltLower]) {
        return functionalAreaMap[stltLower];
    }
    
    // Check if sTLT name contains keywords
    for (const [keyword, area] of Object.entries(functionalAreaMap)) {
        if (stltLower.includes(keyword) || roleLower.includes(keyword)) {
            return area;
        }
    }
    
    // If sTLT name is a person's name, try to determine from their role
    if (stltName.split(' ').length >= 2) { // Likely a person's name
        // Check role-based keywords
        const roleKeywords = {
            'engineering': ['engineer', 'developer', 'programmer', 'software'],
            'quality': ['qa', 'test', 'quality', 'qe'],
            'architecture': ['architect', 'lead', 'principal', 'senior'],
            'infrastructure': ['devops', 'sre', 'infrastructure', 'platform', 'cloud'],
            'data': ['data', 'analytics', 'scientist', 'ml', 'ai'],
            'security': ['security', 'cyber'],
            'product': ['product', 'ux', 'ui', 'design']
        };
        
        for (const [area, keywords] of Object.entries(roleKeywords)) {
            if (keywords.some(keyword => roleLower.includes(keyword))) {
                return area;
            }
        }
    }
    
    return 'other'; // Default functional area
}

// Function to get functional area display name and color
function getFunctionalAreaInfo(area) {
    const areaInfo = {
        'engineering': { 
            name: 'Engineering', 
            color: '#1e3c72',
            icon: 'fas fa-code'
        },
        'quality': { 
            name: 'Quality Assurance', 
            color: '#4a90e2',
            icon: 'fas fa-check-circle'
        },
        'architecture': { 
            name: 'Architecture & Design', 
            color: '#00d4ff',
            icon: 'fas fa-drafting-compass'
        },
        'infrastructure': { 
            name: 'Infrastructure & DevOps', 
            color: '#0066cc',
            icon: 'fas fa-server'
        },
        'data': { 
            name: 'Data & Analytics', 
            color: '#8e44ad',
            icon: 'fas fa-database'
        },
        'security': { 
            name: 'Security', 
            color: '#e74c3c',
            icon: 'fas fa-shield-alt'
        },
        'product': { 
            name: 'Product & UX', 
            color: '#f39c12',
            icon: 'fas fa-paint-brush'
        },
        'other': { 
            name: 'Other', 
            color: '#95a5a6',
            icon: 'fas fa-users'
        }
    };
    
    return areaInfo[area] || areaInfo['other'];
}

// Function to process sTLT CSV data and allpeople CSV data separately
function processSTLTAndAllPeopleData() {
    console.log('Processing sTLT CSV and allpeople CSV data separately...');
    
    // Load both data sources
    const stltData = loadSTLTData();
    const allPeopleData = loadRealEmployeeData();
    
    if (!stltData || stltData.length === 0) {
        console.log('No sTLT CSV data found');
        return null;
    }
    
    console.log('Processing sTLT data:', stltData.length, 'records');
    console.log('Processing allpeople data:', allPeopleData ? allPeopleData.length : 0, 'records');
    
    const stltGroups = {};
    const functionalAreas = new Set();
    let technologyHead = null;
    let totalTechHeadcount = 0; // includes head once assigned
    let staffOnlyHeadcount = 0; // excludes division head
    
    // Find the Technology head (Drew Johnson) and collect all functional areas
    stltData.forEach((record, index) => {
        const functionalArea = record['Functional Area'] ||
                              record['functional area'] ||
                              record['FUNCTIONAL AREA'] ||
                              record['Functional_Area'] ||
                              Object.values(record)[0] || 
                              'Unknown Area';
        
        const functionalHead = record['Functional Head'] ||
                              record['functional head'] ||
                              record['FUNCTIONAL HEAD'] ||
                              record['Functional_Head'] ||
                              Object.values(record)[1] ||
                              'Unknown Head';
        
        // Check if this is the main Technology entry
        if (functionalArea.toLowerCase().includes('technology')) {
            technologyHead = functionalHead;
            console.log(`Found Technology Head: ${technologyHead}`);
        }
        
        // Only add non-Technology functional areas to the set (for counting sub-areas)
        if (!functionalArea.toLowerCase().includes('technology')) {
            functionalAreas.add(functionalArea);
        }
        
        // Create individual functional area cards
        if (!stltGroups[functionalArea]) {
            stltGroups[functionalArea] = {
                name: functionalArea,
                functionalArea: 'technology', // All belong to technology
                leader: functionalHead,
                leaderTitle: 'Functional Head',
                headcount: 0,
                managers: [],
                employees: [],
                isSubTeam: functionalArea.toLowerCase() !== 'technology'
            };
        }
    });
    
    // Calculate headcount per functional area from allpeople data
    if (allPeopleData && allPeopleData.length > 0) {
    // Compute both totals: including and excluding the division head
    totalTechHeadcount = allPeopleData.length; // Include everyone
    // We'll derive staffOnlyHeadcount by subtracting the head if present below
        
        console.log(`Starting mapping with ${allPeopleData.length} total people`);
        console.log('Available functional heads from sTLT CSV:', Object.values(stltGroups).map(g => g.leader));
        
        // Derive column order once (Column N / O mapping) with alias detection
        const sampleKeys = allPeopleData.length ? Object.keys(allPeopleData[0]) : [];
        // Column letters: N=14th (index 13), O=15th (index 14)
        const colNIndex = 13 < sampleKeys.length ? 13 : -1;
        const colOIndex = 14 < sampleKeys.length ? 14 : -1;
        const functionalHeadAliases = ['functional head','functional_head','stlt','sTLT','STLT','team','department','reports to functional head'];
        const managerAliases = ['manager','people manager','reports to','reports_to','supervisor','line manager'];
        function resolveAlias(row, aliases){
            for(const a of aliases){
                const exact = Object.keys(row).find(k => k.toLowerCase().trim() === a.toLowerCase());
                if(exact) return row[exact];
            }
            return null;
        }
        allPeopleData.forEach((employee, index) => {
            let empReportsTo = resolveAlias(employee, functionalHeadAliases);
            if(!empReportsTo && colNIndex !== -1) empReportsTo = employee[sampleKeys[colNIndex]];
            empReportsTo = (empReportsTo || '').toString().trim() || 'Unassigned';

            let empManager = resolveAlias(employee, managerAliases);
            if(!empManager && colOIndex !== -1) empManager = employee[sampleKeys[colOIndex]];
            empManager = empManager ? empManager.toString().trim() : null;
            
            const empName = employee['Name'] || employee['Full Name'] || 'Unknown';
            const empRole = employee['Position'] || employee['Job Title'] || '';
            
            // Skip Drew Johnson from functional area assignments (he's the overall head)
            const isDrawJohnson = empName.toLowerCase().includes('drew') && empName.toLowerCase().includes('johnson');
            if (isDrawJohnson) {
                staffOnlyHeadcount = totalTechHeadcount - 1; // derive once
                console.log(`Skipping ${empName} from functional area assignments (Technology Head)`);
                return;
            }
            
            // Find functional area where the functional head matches Column N
            let matchedFunctionalArea = null;
            
            Object.keys(stltGroups).forEach(functionalAreaName => {
                if (!matchedFunctionalArea && stltGroups[functionalAreaName].isSubTeam) {
                    const functionalHeadName = stltGroups[functionalAreaName].leader;
                    
                    // Check if Column N (empReportsTo) matches this functional head
                    if (empReportsTo && functionalHeadName) {
                        const reportsToLower = empReportsTo.toLowerCase().trim();
                        const headNameLower = functionalHeadName.toLowerCase().trim();
                        
                        // Exact match or partial match (for name variations)
                        if (reportsToLower === headNameLower ||
                            reportsToLower.includes(headNameLower) ||
                            headNameLower.includes(reportsToLower)) {
                            matchedFunctionalArea = functionalAreaName;
                        }
                    }
                }
            });
            
            if (index < 10) { // Debug first 10 employees
                console.log(`Employee ${index + 1}: ${empName}, Reports To (Col N): "${empReportsTo}", Manager (Col O): "${empManager}", Matched to: ${matchedFunctionalArea || 'None'}`);
            }
            
            // If matched to a functional area, add employee details
            if (matchedFunctionalArea && stltGroups[matchedFunctionalArea]) {
                stltGroups[matchedFunctionalArea].headcount++;
                
                stltGroups[matchedFunctionalArea].employees.push({
                    name: empName,
                    manager: empManager, // Column O - immediate manager
                    role: empRole,
                    reportsTo: empReportsTo // Column N - functional head
                });
                
                // Track unique managers from Column O (these are managers under this functional head)
                if (empManager && empManager.trim() !== '' && empManager.toLowerCase() !== 'unassigned') {
                    const normalizedManager = empManager.trim();
                    const functionalHeadName = stltGroups[matchedFunctionalArea].leader;
                    
                    // Don't add the functional head as a manager in their own team
                    const isFunctionalHead = functionalHeadName && 
                        normalizedManager.toLowerCase().trim() === functionalHeadName.toLowerCase().trim();
                    
                    // Don't add if this manager is also an sTLT head (functional head) from sTLT CSV
                    const isSTLTHead = Object.values(stltGroups).some(group => 
                        group.leader && group.leader.toLowerCase().trim() === normalizedManager.toLowerCase().trim()
                    );
                    
                    if (!isFunctionalHead && !isSTLTHead) {
                        // Check for case-insensitive duplicates - more robust check
                        const managerExists = stltGroups[matchedFunctionalArea].managers.find(existingManager => 
                            existingManager.toLowerCase().trim() === normalizedManager.toLowerCase().trim()
                        );
                        
                        if (!managerExists) {
                            stltGroups[matchedFunctionalArea].managers.push(normalizedManager);
                            console.log(`Added manager "${normalizedManager}" to ${matchedFunctionalArea}`);
                        } else {
                            console.log(`Skipped duplicate manager "${normalizedManager}" in ${matchedFunctionalArea}`);
                        }
                    } else if (isSTLTHead) {
                        console.log(`Skipped "${normalizedManager}" - they are an sTLT functional head, not a manager`);
                    } else {
                        console.log(`Skipped functional head "${normalizedManager}" from their own manager list in ${matchedFunctionalArea}`);
                    }
                }
                
                if (index < 10) {
                    console.log(`✓ Mapped ${empName} to ${matchedFunctionalArea} (reports to ${empReportsTo})`);
                }
            } else {
                if (index < 10) { // Only log first 10 unmapped for debugging
                    console.log(`✗ Could not map employee ${empName} with reports-to: "${empReportsTo}"`);
                }
            }
        });
        
        if (!staffOnlyHeadcount) {
            // Fallback if we never matched the head name in loop (naming variance)
            staffOnlyHeadcount = totalTechHeadcount - 1;
        }
        console.log(`\nTechnology Division headcount: Total=${totalTechHeadcount} (incl. head), Staff=${staffOnlyHeadcount} (excl. head)`);
        console.log('\nFinal functional area mapping results:');
        Object.keys(stltGroups).forEach(area => {
            if (stltGroups[area].isSubTeam) {
                // Final cleanup: Remove any remaining duplicates
                const uniqueManagers = [];
                stltGroups[area].managers.forEach(manager => {
                    const normalizedManager = manager.trim();
                    const exists = uniqueManagers.find(existing => 
                        existing.toLowerCase().trim() === normalizedManager.toLowerCase().trim()
                    );
                    if (!exists) {
                        uniqueManagers.push(normalizedManager);
                    }
                });
                stltGroups[area].managers = uniqueManagers;
                
                const headName = stltGroups[area].leader;
                console.log(`${area} (Head: ${headName}): ${stltGroups[area].headcount} people, ${stltGroups[area].managers.length} unique managers`);
                if (stltGroups[area].managers.length > 0) {
                    console.log(`  Managers under ${headName}: ${stltGroups[area].managers.join(', ')}`);
                }
            }
        });
    }
    
    // Create cards - Technology head card first, then functional area cards
    const stltCards = [];
    
    // Add Technology Head card (Drew Johnson) as the top-level card
    if (technologyHead) {
        stltCards.push({
            name: 'Technology', 
            title: 'Technology Division',
            department: 'technology',
            departmentName: 'Technology',
            reports: staffOnlyHeadcount, // direct reports (span) excludes head
            headcount: totalTechHeadcount, // full division including head
            staffHeadcount: staffOnlyHeadcount,
            totalHeadcount: totalTechHeadcount,
            email: `${technologyHead.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            directReports: Array.from(new Set(Object.values(stltGroups)
                .filter(team => team.isSubTeam)
                .map(team => team.leader))),
            stlt: 'Technology',
            functionalArea: 'technology',
            topManager: technologyHead,
            totalManagers: Object.values(stltGroups).filter(team => team.isSubTeam).length,
            isTopLevel: true
        });
    }
    
    // Add functional area cards as sub-teams
    Object.values(stltGroups).forEach(stlt => {
        if (stlt.isSubTeam) { // Only add sub-teams, not the main Technology entry
            stltCards.push({
                name: stlt.name,
                title: `${stlt.name} Team`,
                department: 'technology',
                departmentName: 'Technology',
                reports: stlt.headcount,
                headcount: stlt.headcount,
                email: `${stlt.leader.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                directReports: stlt.managers.length > 0 ? stlt.managers : [stlt.leader],
                stlt: stlt.name,
                functionalArea: 'technology',
                topManager: stlt.leader,
                totalManagers: stlt.managers.length || 1,
                reportsTo: technologyHead, // Show hierarchy
                isSubTeam: true
            });
        }
    });
    
    // Sort: Technology head first, then sub-teams by headcount
    stltCards.sort((a, b) => {
        if (a.isTopLevel) return -1;
        if (b.isTopLevel) return 1;
        return b.headcount - a.headcount;
    });
    
    console.log('Generated hierarchical sTLT cards:', stltCards.length, 'cards');
    console.log('Technology Head:', technologyHead, 'with', totalTechHeadcount, 'total (including head) and', staffOnlyHeadcount, 'staff');
    console.log('Functional areas under Technology:', Array.from(functionalAreas));
    
    return {
        stltCards,
        functionalAreas: Array.from(functionalAreas),
        totalPeople: allPeopleData ? allPeopleData.length : 0,
        totalSTLTs: stltCards.length,
        technologyHead: technologyHead,
        hierarchy: 'Technology Division with functional sub-teams'
    };
}

// Function to refresh real team data from latest uploaded files
function refreshRealTeamData() {
    console.log('Refreshing real team data from latest sTLT and allpeople CSV files...');
    
    // Process both sTLT and allpeople data
    const processedData = processSTLTAndAllPeopleData();
    
    if (processedData && processedData.stltCards.length > 0) {
        console.log('Successfully refreshed team data:', processedData.stltCards.length, 'sTLTs found');
        console.log('Total people from allpeople CSV:', processedData.totalPeople);
        console.log('Functional areas from sTLT CSV:', processedData.functionalAreas);
        return processedData.stltCards;
    } else {
        console.log('No sTLT CSV data found, keeping existing data');
        return realTeamData; // Keep existing data if no new data found
    }
}

// Explicit sample data (only used if neither sTLT nor allpeople present)
const SAMPLE_PORTAL_DATA = [
    {
        name: "Sample Technology Head",
        title: "(Sample) Technology Division Head",
        department: "technology",
        reports: 0,
        email: "sample.head@company.com",
        directReports: ["Sample Manager A", "Sample Manager B"],
        sample: true
    }
];

let realTeamData = [];
let usedSampleFallback = false;

const processedData = processSTLTAndAllPeopleData();
if (processedData && processedData.stltCards.length > 0) {
    realTeamData = processedData.stltCards;
    console.log('✅ Tech People Portal using real hierarchical data:', realTeamData.length, 'cards');
} else {
    // Try synthesizing from allpeople alone
    const allPeople = loadRealEmployeeData();
    if (allPeople && allPeople.length) {
        console.log('ℹ️ No sTLT data found; synthesizing hierarchy from allpeople only');
        // Group by Manager (or Reports To) to create pseudo-functional areas
        const headerMap = buildHeaderMap(allPeople[0] || {}); // reuse logic if available globally; else lightweight
        const managerKey = ['Manager','manager','Reports To','reports to','Supervisor','supervisor']
            .find(k => k in (allPeople[0]||{})) || Object.keys(allPeople[0]||{})[0];
        const groups = {};
        allPeople.forEach(emp => {
            const manager = (emp[managerKey] || 'Unassigned').trim();
            if(!groups[manager]) groups[manager] = [];
            groups[manager].push(emp);
        });
        // Choose a top-level head heuristically: largest group manager name containing 'cto' or first manager
        const managerNames = Object.keys(groups);
        const topName = managerNames.find(n => /cto|chief|head/i.test(n)) || managerNames[0] || 'Technology Head';
        const cards = [];
        // Top card
        cards.push({
            name: topName,
            title: 'Technology Division (Synthesized)',
            department: 'technology',
            departmentName: 'Technology',
            reports: allPeople.length - 1,
            headcount: allPeople.length - 1,
            email: `${topName.toLowerCase().replace(/\s+/g,'.')}@company.com`,
            directReports: managerNames.filter(n => n !== topName),
            stlt: 'Technology',
            functionalArea: 'technology',
            topManager: topName,
            totalManagers: managerNames.length - 1,
            isTopLevel: true
        });
        managerNames.forEach(mgr => {
            if(mgr === topName) return;
            const list = groups[mgr];
            cards.push({
                name: mgr || 'Unassigned',
                title: `${mgr || 'Unassigned'} Team`,
                department: 'technology',
                departmentName: 'Technology',
                reports: list.length,
                headcount: list.length,
                email: `${(mgr||'team').toLowerCase().replace(/\s+/g,'.')}@company.com`,
                directReports: [],
                stlt: mgr,
                functionalArea: 'technology',
                topManager: mgr,
                totalManagers: 0,
                reportsTo: topName,
                isSubTeam: true
            });
        });
        realTeamData = cards;
    } else {
        console.warn('⚠️ No sTLT or allpeople data found – using SAMPLE_PORTAL_DATA');
        realTeamData = SAMPLE_PORTAL_DATA;
        usedSampleFallback = true;
    }
}

// Utility Functions
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getDepartmentColor(dept) {
    const functionalAreaInfo = getFunctionalAreaInfo(dept);
    return functionalAreaInfo.color;
}

function getDepartmentIcon(dept) {
    const functionalAreaInfo = getFunctionalAreaInfo(dept);
    return functionalAreaInfo.icon;
}

function getDepartmentName(dept) {
    const functionalAreaInfo = getFunctionalAreaInfo(dept);
    return functionalAreaInfo.name;
}

// Team Card Creation
function createTeamCard(member) {
    const departmentName = member.departmentName || getDepartmentName(member.department);
    const departmentIcon = getDepartmentIcon(member.department);
    const isTopLevel = member.isTopLevel;
    const isSubTeam = member.isSubTeam;
    
    return `
        <div class="team-card ${isTopLevel ? 'top-level-card' : ''} ${isSubTeam ? 'sub-team-card' : ''}" 
             data-department="${member.department}" 
             data-name="${member.name.toLowerCase()}">
            <button class="expand-btn" onclick="toggleDetails(this)">⌄</button>
            
            ${isTopLevel ? '<div class="hierarchy-badge">Technology Division Head</div>' : ''}
            ${isSubTeam ? `<div class="reports-to-badge">Reports to: ${member.reportsTo}</div>` : ''}
            
            <div class="profile-section">
                <div class="avatar ${isTopLevel ? 'top-level-avatar' : ''}" 
                     style="background: linear-gradient(135deg, ${getDepartmentColor(member.department)}, #00d4ff)">
                    ${getInitials(member.name)}
                </div>
                <div class="profile-info">
                    <h3>${member.name}</h3>
                    ${member.topManager && member.topManager !== member.name ? `<p class="top-manager">Lead: ${member.topManager}</p>` : ''}
                    ${isTopLevel ? '<p class="division-info">Oversees all Technology functional areas</p>' : ''}
                </div>
            </div>

            <div class="department" style="background: linear-gradient(135deg, ${getDepartmentColor(member.department)}, #00d4ff)">
                <i class="${departmentIcon}"></i>
                ${isTopLevel ? 'Technology Division' : departmentName}
            </div>

            <div class="metrics">
                <div class="metric">
                    <span class="metric-number clickable-headcount" 
                          onclick="showHeadcountDetails('${member.name}', '${member.department}', ${isTopLevel})" 
                          title="Click to see category breakdown">
                        ${member.headcount || member.reports}
                    </span>
                    <span class="metric-label">${isTopLevel ? 'Total Division Headcount' : 'Team Headcount'}</span>
                </div>
                <div class="metric managers-metric">
                    <div class="manager-names" id="managers-${member.name.replace(/\s+/g, '-').toLowerCase()}">
                        ${member.directReports.slice(0, 3).map(report => `<span class="manager-name">${report}</span>`).join('')}
                        ${member.directReports.length > 3 ? `<span class="more-count" onclick="showAllManagers('${member.name.replace(/\s+/g, '-').toLowerCase()}', ${JSON.stringify(member.directReports).replace(/"/g, '&quot;')})">+${member.directReports.length - 3} more</span>` : ''}
                    </div>
                    <span class="metric-label">${isTopLevel ? `${member.directReports.length} Functional Head${member.directReports.length !== 1 ? 's' : ''}` : `${member.directReports.length} Manager${member.directReports.length !== 1 ? 's' : ''}`}</span>
                </div>
            </div>

            <div class="contact-info">
                <span><i class="fas fa-envelope"></i> ${member.email}</span>
            </div>

            <div class="team-details">
                <h4 style="margin-bottom: 10px; color: #333;">${isTopLevel ? 'Functional Area Leaders:' : 'Direct Management Reports:'}</h4>
                <div class="direct-reports">
                    ${member.directReports.map(report => `<span class="report-tag">${report}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Rendering Functions
function renderTeamCards(data = realTeamData) {
    const grid = document.getElementById('teamGrid');
    if (grid) {
        grid.innerHTML = data.map(createTeamCard).join('');
    }
}

function updateStats(data = realTeamData) {
    const totalLeadersEl = document.getElementById('totalLeaders');
    const departmentsEl = document.getElementById('departments');
    
    // Get data from both sources
    let stltCount = 0;
    let totalPeople = 0;
    let avgSTLTSize = 0;
    let functionalAreasCount = 0;
    
    try {
        // Get sTLT count and functional areas from sTLT CSV
        const stltData = loadSTLTData();
        if (stltData && stltData.length > 0) {
            // Count unique sTLTs from sTLT CSV
            const uniqueSTLTs = new Set();
            const functionalAreasSet = new Set();
            
            stltData.forEach(record => {
                const stltName = record['sTLT'] || 
                               record['stlt'] || 
                               record['STLT'] || 
                               record['Team'] ||
                               record['Team_Name'] ||
                               record['Department'] ||
                               Object.values(record)[0];
                
                // Use 'Functional Area' column for functional area naming and counting (1st column)
                const functionalArea = record['Functional Area'] ||
                                      record['functional area'] ||
                                      record['FUNCTIONAL AREA'] ||
                                      record['Functional_Area'] ||
                                      record['Function'] ||
                                      record['Area'] ||
                                      record['Category'] ||
                                      record['Type'] ||
                                      Object.values(record)[0] || // First column as fallback
                                      determineFunctionalArea(stltName, record['Role'] || '');
                
                if (stltName && stltName.trim() !== '') {
                    uniqueSTLTs.add(stltName.trim());
                }
                
                // Only count functional areas that are NOT "Technology" (since Technology is the umbrella)
                if (functionalArea && functionalArea.trim() !== '' && 
                    !functionalArea.toLowerCase().includes('technology')) {
                    functionalAreasSet.add(functionalArea.trim());
                }
            });
            
            stltCount = uniqueSTLTs.size;
            functionalAreasCount = functionalAreasSet.size; // This will be n-1 (excluding Technology umbrella)
            
            console.log(`sTLT data: ${stltCount} sTLTs, ${functionalAreasCount} functional areas (excluding Technology umbrella) from 'functional area' column`);
        }
        
        // Fallback to processed data if CSV files not available
        if (stltCount === 0) {
            stltCount = data.length;
            functionalAreasCount = new Set(data.map(m => m.department)).size;
            console.log(`Using processed data: ${stltCount} sTLTs, ${functionalAreasCount} functional areas`);
        }
        // Derive total people from cards if allpeople not directly available
        try {
            const allPeople = loadRealEmployeeData();
            totalPeople = allPeople ? allPeople.length : data.reduce((sum,c)=> sum + (c.headcount || c.reports || 0), 0);
        } catch(_) { totalPeople = data.reduce((sum,c)=> sum + (c.headcount || c.reports || 0), 0); }
        if (stltCount > 0) {
            const sizes = data.filter(c=>!c.isTopLevel).map(c=> c.headcount || c.reports || 0);
            if (sizes.length) avgSTLTSize = Math.round((sizes.reduce((a,b)=>a+b,0)/sizes.length)*10)/10; else avgSTLTSize = 0;
        }
        
    } catch (error) {
        console.log('Error accessing CSV data, using fallback calculations:', error);
        // Final fallback calculations
        stltCount = data.length;
        functionalAreasCount = new Set(data.map(m => m.department)).size;
    }
    
    // Update the display
    if (totalLeadersEl) totalLeadersEl.textContent = stltCount;
    if (departmentsEl) departmentsEl.textContent = functionalAreasCount;
    
    console.log(`Stats updated: ${stltCount} sTLTs (from sTLT CSV), ${functionalAreasCount} functional areas (from sTLT CSV)`);
    
    // Return the stats for external use
    return { totalSTLTs: stltCount, totalPeople, avgSTLTSize, functionalAreas: functionalAreasCount, dataSource: 'csv' };
}

// Interactive Functions
function toggleDetails(button) {
    const card = button.closest('.team-card');
    const details = card.querySelector('.team-details');
    
    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        button.style.transform = 'translateY(-50%)';
    } else {
        // Close other expanded cards first
        document.querySelectorAll('.team-details.expanded').forEach(detail => {
            detail.classList.remove('expanded');
            const btn = detail.closest('.team-card').querySelector('.expand-btn');
            btn.style.transform = 'translateY(-50%)';
        });
        
        // Expand current card
        details.classList.add('expanded');
        button.style.transform = 'translateY(-50%) rotate(180deg)';
    }
}

// Function to show all manager names when "+X more" is clicked
function showAllManagers(memberKey, allManagers) {
    const managersContainer = document.getElementById(`managers-${memberKey}`);
    if (!managersContainer) return;
    
    // Create all manager name tags
    const allManagerTags = allManagers.map(manager => 
        `<span class="manager-name">${manager}</span>`
    ).join('');
    
    // Add a "show less" option
    const showLessTag = `<span class="show-less" onclick="showLessManagers('${memberKey}', ${JSON.stringify(allManagers).replace(/"/g, '&quot;')})">Show less</span>`;
    
    // Update the container with all managers
    managersContainer.innerHTML = allManagerTags + showLessTag;
}

// Function to collapse back to showing only first 3 managers
function showLessManagers(memberKey, allManagers) {
    const managersContainer = document.getElementById(`managers-${memberKey}`);
    if (!managersContainer) return;
    
    // Show only first 3 managers and +X more
    const firstThree = allManagers.slice(0, 3).map(manager => 
        `<span class="manager-name">${manager}</span>`
    ).join('');
    
    const moreCount = allManagers.length > 3 ? 
        `<span class="more-count" onclick="showAllManagers('${memberKey}', ${JSON.stringify(allManagers).replace(/"/g, '&quot;')})">+${allManagers.length - 3} more</span>` : '';
    
    // Update the container back to collapsed view
    managersContainer.innerHTML = firstThree + moreCount;
}

function filterTeams() {
    const searchInput = document.getElementById('searchInput');
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    
    if (!searchInput || !activeFilterBtn) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = activeFilterBtn.dataset.filter;
    const cards = document.querySelectorAll('.team-card');

    let visibleCount = 0;
    cards.forEach(card => {
        const name = card.dataset.name;
        const department = card.dataset.department;
        
        const matchesSearch = name.includes(searchTerm) || 
                            card.textContent.toLowerCase().includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || department === activeFilter;

        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update stats based on filtered results
    if (activeFilter !== 'all') {
        const filteredData = realTeamData.filter(member => member.department === activeFilter);
        updateStats(filteredData);
    } else {
        updateStats(realTeamData);
    }
}

// Function to update filter buttons based on actual functional areas in data
function updateFilterButtons() {
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;
    
    // Get unique functional areas from the current data
    const functionalAreas = [...new Set(realTeamData.map(member => member.department))];
    
    // Create filter buttons HTML
    const filterButtonsHTML = [
        '<button class="filter-btn active" data-filter="all">All Departments</button>',
        ...functionalAreas.map(area => {
            const areaInfo = getFunctionalAreaInfo(area);
            return `<button class="filter-btn" data-filter="${area}">
                        <i class="${areaInfo.icon}"></i>
                        ${areaInfo.name}
                    </button>`;
        })
    ].join('');
    
    filterContainer.innerHTML = filterButtonsHTML;
    
    // Re-attach event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply filter
            filterTeams();
        });
    });
    
    console.log('Updated filter buttons for functional areas:', functionalAreas);
}

// Function to show detailed headcount breakdown by category
function showHeadcountDetails(leaderName, department, isTopLevel) {
    console.log(`=== HEADCOUNT DETAILS DEBUG ===`);
    console.log(`Leader Name: "${leaderName}"`);
    console.log(`Department: "${department}"`);
    console.log(`Is Top Level: ${isTopLevel}`);
    console.log(`================================`);
    
    // Load allpeople data
    const allPeopleData = loadRealEmployeeData();
    if (!allPeopleData || allPeopleData.length === 0) {
        alert('No employee data available. Please upload the allpeople CSV file first.');
        return;
    }
    
    console.log(`Total employees in CSV: ${allPeopleData.length}`);
    
    // Debug: Show some sample Column N values
    console.log('Sample Column N values:');
    allPeopleData.slice(0, 5).forEach((emp, index) => {
        const functionalHead = emp[Object.keys(emp)[13]] || '';
        console.log(`  Row ${index}: Column N = "${functionalHead}"`);
    });
    
    // Use consistent algorithm: filter by Column N (Functional Head) matching the sTLT leader name
    const relevantEmployees = allPeopleData.filter(emp => {
        // Get functional head from Column N (index 13)
        const functionalHead = emp[Object.keys(emp)[13]] || '';
        
        console.log(`Checking employee: ${emp[Object.keys(emp)[0]] || 'Unknown'}, Column N: "${functionalHead}"`);
        
        // For Drew Johnson (Technology Division), he might be listed differently or all employees might report to him indirectly
        if (isTopLevel && leaderName.toLowerCase().includes('drew johnson')) {
            return true;
        }
        
        // Try multiple matching strategies
        const leaderNameLower = leaderName.toLowerCase();
        const functionalHeadLower = functionalHead.toLowerCase();
        
        // Direct matches
        if (functionalHeadLower === leaderNameLower) {
            console.log(`  ✓ Exact match: "${functionalHead}" === "${leaderName}"`);
            return true;
        }
        
        // Check if functional head contains the leader name (e.g., "Eran Netanel" contains "Eran")
        if (functionalHeadLower.includes(leaderNameLower)) {
            console.log(`  ✓ Functional head contains leader: "${functionalHead}" contains "${leaderName}"`);
            return true;
        }
        
        // Check if leader name contains functional head (less likely but possible)
        if (leaderNameLower.includes(functionalHeadLower) && functionalHeadLower.length > 2) {
            console.log(`  ✓ Leader contains functional head: "${leaderName}" contains "${functionalHead}"`);
            return true;
        }
        
        // Word-by-word matching (handles "Eran" matching "Eran Netanel")
        const functionalHeadWords = functionalHeadLower.split(/\s+/).filter(word => word.length > 2);
        const leaderNameWords = leaderNameLower.split(/\s+/).filter(word => word.length > 2);
        
        // Check if any word from leader name appears in functional head
        for (const leaderWord of leaderNameWords) {
            if (functionalHeadWords.some(word => word.includes(leaderWord) || leaderWord.includes(word))) {
                console.log(`  ✓ Word match: "${leaderWord}" matches with functional head words`);
                return true;
            }
        }
        
        // Check if any word from functional head appears in leader name
        for (const headWord of functionalHeadWords) {
            if (leaderNameWords.some(word => word.includes(headWord) || headWord.includes(word))) {
                console.log(`  ✓ Word match: "${headWord}" matches with leader name words`);
                return true;
            }
        }
        
        // Try matching department names or functional areas
        if (department && department.toLowerCase() !== 'technology') {
            const departmentLower = department.toLowerCase();
            if (functionalHeadLower.includes(departmentLower) || departmentLower.includes(functionalHeadLower)) {
                console.log(`  ✓ Department match: "${functionalHead}" matches department "${department}"`);
                return true;
            }
        }
        
        console.log(`  ✗ No match found`);
        return false;
    });
    
    console.log(`Found ${relevantEmployees.length} employees for ${leaderName} using Column N filtering`);
    
    // If we found 0 employees, let's try a broader search
    if (relevantEmployees.length === 0) {
        console.log('No employees found with Column N matching. Trying broader search...');
        
        // Try searching by functional area or department in sTLT CSV
        const stltData = loadSTLTData();
        if (stltData && stltData.length > 0) {
            // Look for this leader in sTLT data to get alternative names
            const stltRecord = stltData.find(record => {
                const recordName = record['sTLT'] || record['stlt'] || record['STLT'] || Object.values(record)[1] || '';
                const functionalArea = record['Functional Area'] || Object.values(record)[0] || '';
                
                return recordName.toLowerCase().includes(leaderName.toLowerCase()) ||
                       leaderName.toLowerCase().includes(recordName.toLowerCase()) ||
                       functionalArea.toLowerCase().includes(leaderName.toLowerCase()) ||
                       leaderName.toLowerCase().includes(functionalArea.toLowerCase());
            });
            
            if (stltRecord) {
                console.log('Found sTLT record:', stltRecord);
                const alternativeName = stltRecord['Functional Head'] || stltRecord['Team Lead'] || Object.values(stltRecord)[1] || '';
                
                if (alternativeName && alternativeName !== leaderName) {
                    console.log(`Trying alternative name from sTLT data: "${alternativeName}"`);
                    
                    // Try matching with the alternative name
                    const alternativeEmployees = allPeopleData.filter(emp => {
                        const functionalHead = emp[Object.keys(emp)[13]] || '';
                        return functionalHead.toLowerCase().includes(alternativeName.toLowerCase()) ||
                               alternativeName.toLowerCase().includes(functionalHead.toLowerCase());
                    });
                    
                    if (alternativeEmployees.length > 0) {
                        console.log(`Found ${alternativeEmployees.length} employees with alternative name`);
                        relevantEmployees.push(...alternativeEmployees);
                    }
                }
            }
        }
        
        // Show all unique Column N values to help debug
        const uniqueColumnN = [...new Set(allPeopleData.map(emp => emp[Object.keys(emp)[13]] || '').filter(val => val.trim() !== ''))];
        console.log('All unique Column N values:', uniqueColumnN);
        
        if (relevantEmployees.length === 0) {
            alert(`No employees found for ${leaderName}. 
        
Debug info:
- Leader name: "${leaderName}"
- Department: "${department}"
- Column N values in CSV: ${uniqueColumnN.slice(0, 10).join(', ')}${uniqueColumnN.length > 10 ? '...' : ''}

Please check the browser console for detailed matching attempts.`);
            return;
        }
    }
    
    // Group by Column B 'category'
    const categoryBreakdown = {};
    let totalCounted = 0;
    
    relevantEmployees.forEach(emp => {
        // Get category from Column B (index 1)
        const category = emp[Object.keys(emp)[1]] || 'Unknown Category';
        
        if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = [];
        }
        
        // Get employee name from first column
        const empName = emp[Object.keys(emp)[0]] || 'Unknown Employee';
        categoryBreakdown[category].push(empName);
        totalCounted++;
    });
    
    // Create and show modal
    showCategoryModal(leaderName, categoryBreakdown, totalCounted, isTopLevel);
}

// Function to create and display the category breakdown modal
function showCategoryModal(leaderName, categoryBreakdown, totalCount, isTopLevel) {
    // Remove existing modal if any
    const existingModal = document.getElementById('category-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div id="category-modal" class="category-modal-overlay" onclick="closeCategoryModal(event)">
            <div class="category-modal-content" onclick="event.stopPropagation()">
                <div class="category-modal-header">
                    <h2>${isTopLevel ? 'Technology Division' : leaderName} - Category Breakdown</h2>
                    <button class="category-modal-close" onclick="closeCategoryModal()">&times;</button>
                </div>
                <div class="category-modal-body">
                    <div class="category-summary">
                        <p><strong>Total Employees: ${totalCount}</strong></p>
                        <p><strong>Categories: ${Object.keys(categoryBreakdown).length}</strong></p>
                    </div>
                    <div class="category-breakdown">
                        ${Object.entries(categoryBreakdown)
                            .sort(([,a], [,b]) => b.length - a.length) // Sort by count descending
                            .map(([category, employees]) => `
                                <div class="category-item">
                                    <div class="category-header" onclick="toggleCategoryEmployees(this)">
                                        <h3>${category}</h3>
                                        <span class="category-count">${employees.length}</span>
                                        <span class="category-toggle">▼</span>
                                    </div>
                                    <div class="category-employees">
                                        ${employees.map(emp => `<span class="employee-tag">${emp}</span>`).join('')}
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add animation class after a brief delay
    setTimeout(() => {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);
}

// Function to close the category modal
function closeCategoryModal(event) {
    const modal = document.getElementById('category-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Function to toggle employee list visibility within categories
function toggleCategoryEmployees(header) {
    const employeesList = header.nextElementSibling;
    const toggle = header.querySelector('.category-toggle');
    
    if (employeesList.style.display === 'none' || !employeesList.style.display) {
        employeesList.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        employeesList.style.display = 'none';
        toggle.textContent = '▼';
    }
}

// Function to refresh portal data when new files are uploaded
function refreshPortalData() {
    console.log('Refreshing Tech People Portal data...');
    
    // Refresh the team data from latest uploaded files
    realTeamData = refreshRealTeamData();
    
    // Update all displays
    updateFilterButtons();
    renderTeamCards();
    const stats = updateStats();
    
    console.log('Portal data refreshed successfully:', stats);
    return stats;
}

// Event Listeners Setup
function initializePortal() {
    console.log('Initializing Tech People Portal...');
    
    // Debug Gaurav's data first
    debugGauravData();
    
    // Refresh team data from latest uploaded files
    realTeamData = refreshRealTeamData();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTeams);
    }

    // Update filter buttons based on actual data
    updateFilterButtons();

    // Initialize the portal
    renderTeamCards();
    updateStats();
    
    console.log('Tech People Portal initialized successfully with', realTeamData.length, 'sTLT leaders');
}

// Additional utility functions for dashboard integration
function getTeamSummary() {
    return {
        totalLeaders: realTeamData.length,
        departments: new Set(realTeamData.map(m => m.department)).size,
        departmentBreakdown: realTeamData.reduce((acc, member) => {
            acc[member.department] = (acc[member.department] || 0) + 1;
            return acc;
        }, {})
    };
}

function getDepartmentStats() {
    const departments = {};
    realTeamData.forEach(member => {
        if (!departments[member.department]) {
            departments[member.department] = {
                leaders: 0,
                totalReports: 0,
                members: []
            };
        }
        departments[member.department].leaders++;
        departments[member.department].totalReports += member.reports;
        departments[member.department].members.push(member);
    });
    return departments;
}

// Make refreshPortalData available globally for cross-window communication
if (typeof window !== 'undefined') {
    window.refreshPortalData = refreshPortalData;
    window.refreshRealTeamData = refreshRealTeamData;
    window.showHeadcountDetails = showHeadcountDetails;
    window.closeCategoryModal = closeCategoryModal;
    window.toggleCategoryEmployees = toggleCategoryEmployees;
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePortal();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        realTeamData,
        createTeamCard,
        renderTeamCards,
        updateStats,
        toggleDetails,
        filterTeams,
        initializePortal,
        refreshPortalData,
        refreshRealTeamData,
        getTeamSummary,
        getDepartmentStats,
        getInitials,
        getDepartmentColor,
        showAllManagers,
        showLessManagers
    };
}
