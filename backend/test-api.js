// Simple test script to verify the API is working
// Run with: node test-api.js

const testDrugAlternatives = async (drugName) => {
    try {
        console.log(`\n🧪 Testing API with drug: ${drugName}\n`);

        const response = await fetch('http://localhost:3000/ai/drug-alternatives', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ drug: drugName }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ API Response:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n');

        return data;
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
};

// Test with different drugs
const runTests = async () => {
    console.log('🚀 Starting API tests...\n');
    console.log('Make sure the backend server is running on http://localhost:3000\n');

    // Wait a moment to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Aspirin
    await testDrugAlternatives('Aspirin');

    // Test 2: Metformin
    await testDrugAlternatives('Metformin');

    // Test 3: Amoxicillin
    await testDrugAlternatives('Amoxicillin');

    console.log('✅ All tests completed!\n');
};

runTests();
