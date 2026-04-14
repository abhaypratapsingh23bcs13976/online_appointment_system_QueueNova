const { readDB, writeDB } = require('./db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    console.log('--- Starting AWS Database Seeding ---');
    try {
        const dataPath = path.join(__dirname, 'data', 'database.json');
        console.log(`Checking data path: ${dataPath}`);
        
        if (!fs.existsSync(dataPath)) {
            throw new Error(`Data file not found at ${dataPath}`);
        }

        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const dbState = JSON.parse(fileContent);

        console.log(`Successfully loaded:`);
        console.log(`- ${dbState.hospitals?.length || 0} Hospitals`);
        console.log(`- ${dbState.doctors?.length || 0} Doctors`);
        console.log(`- ${dbState.labTests?.length || 0} Lab Tests`);
        console.log(`- ${dbState.medicines?.length || 0} Medicines`);
        console.log(`- ${dbState.services?.length || 0} Services`);

        // Add additional data
        const newHospital = {
            id: 'h-vn-1',
            name: "QueueNova Digital Care",
            city: "Cloud",
            address: "Digital Health Corridor",
            phone: "+91 800 123 4567",
            email: "care@queuenova.com",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
            departments: ["Telemedicine", "Digital Consult", "Mental Health"],
            rating: 5.0,
            established: 2024,
            beds: 0,
            specialty: "Digital Healthcare"
        };

        if (!dbState.hospitals.find(h => h.id === newHospital.id)) {
            dbState.hospitals.push(newHospital);
            console.log('Added QueueNova Digital Care hospital.');
        }

        console.log('Uploading to AWS DynamoDB (this may take 10-20 seconds)...');
        await writeDB(dbState);
        console.log('--- SUCCESS: Database Seeded Successfully ---');
        console.log('You can now refresh your website.');
        
    } catch (err) {
        console.error('!!! FATAL SEEDING ERROR !!!');
        console.error(err);
        process.exit(1);
    }
}

seed().catch(err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
