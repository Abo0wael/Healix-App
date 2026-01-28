import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.HF_API_KEY;
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

const URLS = [
    `https://api-inference.huggingface.co/models/${MODEL}`,
    `https://router.huggingface.co/hf-inference/models/${MODEL}`,
    `https://router.huggingface.co/models/${MODEL}`
];

async function testUrl(url) {
    console.log(`Testing: ${url}`);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: "Hello, are you working?" })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS! Response:", JSON.stringify(data).slice(0, 50) + "...");
            return true;
        } else {
            const text = await response.text();
            console.log("Error Body:", text.slice(0, 100));
        }
    } catch (e) {
        console.log("Fetch Error:", e.message);
    }
    console.log("-".repeat(20));
    return false;
}

async function run() {
    console.log(`Testing HF URLs for model: ${MODEL}\n`);
    for (const url of URLS) {
        if (await testUrl(url)) break;
    }
}

run();
