// Excel-Style Pivot Table Algorithm for sTLT Analysis
// This mimics Excel's pivot table functionality

class PivotTable {
    constructor() {
        this.data = [];
        this.rows = [];
        this.columns = [];
        this.values = [];
        this.aggregations = {};
    }

    // Load data into the pivot table
    setData(data) {
        this.data = data;
        return this;
    }

    // Add fields to rows (like dragging STLT and Manager to Rows area)
    addRowFields(...fields) {
        this.rows = [...this.rows, ...fields];
        return this;
    }

    // Add fields to columns
    addColumnFields(...fields) {
        this.columns = [...this.columns, ...fields];
        return this;
    }

    // Add value fields with aggregation (like Count of Name)
    addValueField(field, aggregation = 'count', label = null) {
        this.values.push({
            field: field,
            aggregation: aggregation,
            label: label || `${aggregation.toUpperCase()} of ${field}`
        });
        return this;
    }

    // Generate the pivot table structure
    generate() {
        console.log('=== EXCEL-STYLE PIVOT TABLE GENERATION ===');
        console.log('Rows:', this.rows);
        console.log('Columns:', this.columns);
        console.log('Values:', this.values);
        
        // Step 1: Create row grouping hierarchy
        const rowHierarchy = this.createRowHierarchy();
        
        // Step 2: Calculate aggregated values for each row group
        const pivotResult = this.calculateAggregations(rowHierarchy);
        
        // Step 3: Create Excel-like display structure
        const displayStructure = this.createDisplayStructure(pivotResult);
        
        return {
            hierarchy: rowHierarchy,
            aggregations: pivotResult,
            display: displayStructure,
            summary: this.createSummary(pivotResult)
        };
    }

    // Create hierarchical row grouping (like Excel's row structure)
    createRowHierarchy() {
        const hierarchy = {};
        
        this.data.forEach(row => {
            let current = hierarchy;
            
            // Build nested structure based on row fields
            this.rows.forEach((field, level) => {
                const value = row[field] || 'Unassigned';
                
                if (!current[value]) {
                    current[value] = {
                        _data: [],
                        _children: {},
                        _level: level,
                        _field: field,
                        _value: value
                    };
                }
                
                current[value]._data.push(row);
                current = current[value]._children;
            });
        });
        
        return hierarchy;
    }

    // Calculate aggregations for each group (like Excel's value calculations)
    calculateAggregations(hierarchy) {
        const result = {};
        
        const processLevel = (level, path = []) => {
            Object.entries(level).forEach(([key, group]) => {
                const currentPath = [...path, key];
                const pathKey = currentPath.join(' > ');
                
                // Calculate aggregations for this group
                result[pathKey] = {
                    path: currentPath,
                    level: group._level,
                    field: group._field,
                    value: group._value,
                    data: group._data,
                    aggregations: {}
                };
                
                // Calculate each value field
                this.values.forEach(valueConfig => {
                    const aggregatedValue = this.calculateAggregation(
                        group._data, 
                        valueConfig.field, 
                        valueConfig.aggregation
                    );
                    
                    result[pathKey].aggregations[valueConfig.label] = aggregatedValue;
                });
                
                // Process children recursively
                if (Object.keys(group._children).length > 0) {
                    processLevel(group._children, currentPath);
                }
            });
        };
        
        processLevel(hierarchy);
        return result;
    }

    // Calculate specific aggregation (COUNT, SUM, AVERAGE, etc.)
    calculateAggregation(data, field, aggregation) {
        switch (aggregation.toLowerCase()) {
            case 'count':
                return data.length;
            
            case 'sum':
                return data.reduce((sum, row) => {
                    const value = parseFloat(row[field]) || 0;
                    return sum + value;
                }, 0);
            
            case 'average':
                const sum = this.calculateAggregation(data, field, 'sum');
                return data.length > 0 ? sum / data.length : 0;
            
            case 'min':
                return Math.min(...data.map(row => parseFloat(row[field]) || 0));
            
            case 'max':
                return Math.max(...data.map(row => parseFloat(row[field]) || 0));
            
            case 'distinct_count':
                const unique = new Set(data.map(row => row[field]));
                return unique.size;
            
            default:
                return data.length;
        }
    }

    // Create display structure similar to Excel's pivot table layout
    createDisplayStructure(aggregations) {
        const display = [];
        const sortedKeys = Object.keys(aggregations).sort((a, b) => {
            const pathA = aggregations[a].path;
            const pathB = aggregations[b].path;
            
            // Sort by hierarchy depth first, then alphabetically
            if (pathA.length !== pathB.length) {
                return pathA.length - pathB.length;
            }
            return a.localeCompare(b);
        });
        
        sortedKeys.forEach(key => {
            const item = aggregations[key];
            const indent = item.level || 0;
            
            display.push({
                key: key,
                path: item.path,
                level: item.level,
                field: item.field,
                value: item.value,
                indent: indent,
                aggregations: item.aggregations,
                dataCount: item.data.length,
                isParent: item.path.length < this.rows.length,
                children: this.getChildren(key, aggregations)
            });
        });
        
        return display;
    }

    // Get children for a given item (for hierarchical display)
    getChildren(parentKey, aggregations) {
        const parentPath = aggregations[parentKey].path;
        return Object.keys(aggregations).filter(key => {
            const itemPath = aggregations[key].path;
            return itemPath.length === parentPath.length + 1 && 
                   itemPath.slice(0, -1).join(' > ') === parentPath.join(' > ');
        });
    }

    // Create summary statistics
    createSummary(aggregations) {
        const topLevelItems = Object.values(aggregations).filter(item => item.level === 0);
        
        return {
            totalGroups: topLevelItems.length,
            totalRecords: this.data.length,
            groupSummary: topLevelItems.map(item => ({
                group: item.value,
                count: item.aggregations[this.values[0]?.label] || 0
            })).sort((a, b) => b.count - a.count)
        };
    }
}

// Function to create Excel-style sTLT pivot table
function createSTLTPivotTable(data) {
    console.log('=== CREATING EXCEL-STYLE STLT PIVOT TABLE ===');
    
    const pivot = new PivotTable()
        .setData(data)
        .addRowFields('STLT', 'Manager')  // Drag STLT and Manager to Rows
        .addValueField('Name', 'count', 'Count of Name');  // Drag Name to Values as Count
    
    const result = pivot.generate();
    
    console.log('Pivot table generated:', result);
    return result;
}

// Function to render Excel-style pivot table to HTML
function renderPivotTableHTML(pivotResult) {
    let html = `
        <div class="excel-pivot-table">
            <div class="pivot-header">
                <h3>Employee Count by sTLT and Manager</h3>
                <div class="pivot-summary">
                    Total Groups: ${pivotResult.summary.totalGroups} | 
                    Total Records: ${pivotResult.summary.totalRecords}
                </div>
            </div>
            <table class="pivot-table">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 300px;">Row Labels</th>
                        <th style="text-align: right; width: 150px;">Count of Name</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Render each row with proper indentation and Excel-like styling
    pivotResult.display.forEach(item => {
        const indentStyle = `padding-left: ${item.indent * 20 + 10}px;`;
        const isParent = item.isParent;
        const rowClass = isParent ? 'pivot-parent-row' : 'pivot-child-row';
        const fontWeight = isParent ? 'bold' : 'normal';
        
        // Get the count value
        const countValue = item.aggregations['Count of Name'] || 0;
        
        html += `
            <tr class="${rowClass}">
                <td style="${indentStyle} font-weight: ${fontWeight};">
                    ${isParent ? '▼ ' : ''}${item.value}
                </td>
                <td style="text-align: right; font-weight: ${fontWeight};">
                    ${countValue}
                </td>
            </tr>
        `;
    });
    
    // Add grand total
    html += `
            <tr class="pivot-grand-total">
                <td style="padding-left: 10px; font-weight: bold;">
                    Grand Total
                </td>
                <td style="text-align: right; font-weight: bold;">
                    ${pivotResult.summary.totalRecords}
                </td>
            </tr>
        `;
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Export functions for use in the dashboard
window.PivotTable = PivotTable;
window.createSTLTPivotTable = createSTLTPivotTable;
window.renderPivotTableHTML = renderPivotTableHTML;
