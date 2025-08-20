// Sample test data for sTLT Analysis
// This simulates the data structure you described

const sampleSTLTData = [
    // Stephen Blackburn's team
    { Name: "John Smith", STLT: "Stephen Blackburn", Manager: "Alice Johnson" },
    { Name: "Mary Davis", STLT: "Stephen Blackburn", Manager: "Alice Johnson" },
    { Name: "Bob Wilson", STLT: "Stephen Blackburn", Manager: "Alice Johnson" },
    { Name: "Sarah Brown", STLT: "Stephen Blackburn", Manager: "Bob Chen" },
    { Name: "Mike Miller", STLT: "Stephen Blackburn", Manager: "Bob Chen" },
    { Name: "Lisa Garcia", STLT: "Stephen Blackburn", Manager: "Bob Chen" },
    { Name: "David Martinez", STLT: "Stephen Blackburn", Manager: "Carol White" },
    { Name: "Jennifer Lopez", STLT: "Stephen Blackburn", Manager: "Carol White" },
    { Name: "Tom Anderson", STLT: "Stephen Blackburn", Manager: "Carol White" },
    { Name: "Alice Johnson", STLT: "Stephen Blackburn", Manager: "Stephen Blackburn" },
    { Name: "Bob Chen", STLT: "Stephen Blackburn", Manager: "Stephen Blackburn" },
    { Name: "Carol White", STLT: "Stephen Blackburn", Manager: "Stephen Blackburn" },
    
    // Add more people to reach 112 for Stephen Blackburn
    ...Array.from({length: 100}, (_, i) => ({
        Name: `Employee ${i + 1}`,
        STLT: "Stephen Blackburn",
        Manager: `Manager ${(i % 9) + 1}`
    })),
    
    // Eran Netanel's team - 98 people, 13 managers
    { Name: "Manager A", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager B", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager C", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager D", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager E", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager F", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager G", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager H", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager I", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager J", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager K", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager L", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    { Name: "Manager M", STLT: "Eran Netanel", Manager: "Eran Netanel" },
    
    ...Array.from({length: 85}, (_, i) => ({
        Name: `Eran Team Member ${i + 1}`,
        STLT: "Eran Netanel",
        Manager: `Manager ${String.fromCharCode(65 + (i % 13))}`
    })),
    
    // Claudio Taglienti's team - 75 people, 8 managers
    { Name: "Team Lead 1", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 2", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 3", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 4", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 5", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 6", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 7", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    { Name: "Team Lead 8", STLT: "Claudio Taglienti", Manager: "Claudio Taglienti" },
    
    ...Array.from({length: 67}, (_, i) => ({
        Name: `Claudio Team Member ${i + 1}`,
        STLT: "Claudio Taglienti",
        Manager: `Team Lead ${(i % 8) + 1}`
    })),
    
    // Subu Balakrishnan's team - 44 people, 8 managers
    { Name: "Senior Manager 1", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 2", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 3", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 4", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 5", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 6", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 7", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    { Name: "Senior Manager 8", STLT: "Subu Balakrishnan", Manager: "Subu Balakrishnan" },
    
    ...Array.from({length: 36}, (_, i) => ({
        Name: `Subu Team Member ${i + 1}`,
        STLT: "Subu Balakrishnan",
        Manager: `Senior Manager ${(i % 8) + 1}`
    })),
    
    // Add some additional STLTs
    ...Array.from({length: 25}, (_, i) => ({
        Name: `Other Team Member ${i + 1}`,
        STLT: "Other Leadership Team",
        Manager: `Other Manager ${(i % 5) + 1}`
    }))
];

// Function to simulate localStorage with sample data
function loadSampleData() {
    const sampleFiles = [{
        fileName: "sample_allpeople_data.csv",
        uploadDate: new Date().toLocaleDateString(),
        data: sampleSTLTData
    }];
    
    localStorage.setItem('allPeopleFiles', JSON.stringify(sampleFiles));
    console.log('Sample sTLT data loaded with:', sampleSTLTData.length, 'employee records');
}

// Load sample data if no data exists
if (!localStorage.getItem('allPeopleFiles') || JSON.parse(localStorage.getItem('allPeopleFiles')).length === 0) {
    loadSampleData();
}
