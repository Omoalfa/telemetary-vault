import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
const API_KEY = "secret_api_key";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function verify() {
  console.log("Starting verification...");

  // 1. Health Check
  try {
    const health = await fetch(`${BASE_URL}/health`);
    if (health.status === 200) {
      console.log("✅ Health Check Passed");
    } else {
      console.error("❌ Health Check Failed", health.status);
      process.exit(1);
    }
  } catch (e) {
    console.error("❌ App not running?");
    process.exit(1);
  }

  // 2. Ingest Event
  const eventId = "test-event-" + Date.now();
  const payload = {
    source: "test-script",
    timestamp: new Date().toISOString(),
    payload: { cpu: 50, memory: 1024 },
    event_id: eventId
  };

  const ingestRes = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (ingestRes.status === 202) {
    console.log("✅ Ingest Accepted");
  } else {
    console.error("❌ Ingest Failed", ingestRes.status, await ingestRes.text());
    process.exit(1);
  }

  // 3. Wait for Worker
  console.log("Waiting for worker to process...");
  await sleep(2000);

  // 4. Query Event
  const queryRes = await fetch(`${BASE_URL}/query?source=test-script`, {
    headers: {
      "X-API-KEY": API_KEY
    }
  });

  if (queryRes.status === 200) {
    const data = await queryRes.json();
    // @ts-ignore
    const found = data.data.find((e: any) => e.event_id === eventId);
    if (found) {
      console.log("✅ Query Verified (Event Found)");
    } else {
      console.error("❌ Query Verified but Event Not Found (Worker lag?)");
      console.log("Data:", JSON.stringify(data, null, 2));
    }
  } else {
    console.error("❌ Query Failed", queryRes.status);
  }
}

verify();
