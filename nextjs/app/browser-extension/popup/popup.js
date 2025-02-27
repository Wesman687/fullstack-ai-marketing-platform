document.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start");
  const stopBtn = document.getElementById("stop");
  const crawlBtn = document.getElementById("start-crawl");
  const scrapeBtn = document.getElementById("start-scrape");
  const clearBtn = document.getElementById("clear"); // ✅ New Clear Button
  const output = document.getElementById("output");

  if (!startBtn || !stopBtn || !crawlBtn || !scrapeBtn || !clearBtn || !output) {
      console.error("❌ Error: Missing elements in popup.html");
      return;
  }

  const NEXTJS_API_URL = "http://localhost:3000/api/user";

  // ✅ Fetch User ID from Next.js API and store it
  async function fetchUserId() {
      try {
          const response = await fetch(NEXTJS_API_URL);
          if (!response.ok) throw new Error("Failed to fetch user ID");
          const data = await response.json();
          chrome.storage.local.set({ userId: data.userId });
          console.log("✅ Fetched userId:", data.userId);
      } catch (error) {
          console.error("❌ Error fetching user ID:", error);
      }
  }

  await fetchUserId();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
      });
  });

  startBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: () => window.startSelection()
          });
      });
  });

  stopBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: () => window.stopSelection()
          });
      });
  });

  function sendData(endpoint) {
      chrome.storage.local.get(["scrapedData", "userId"], async (result) => {
          if (!result.scrapedData || result.scrapedData.length === 0) {
              alert("❌ No data collected! Try selecting elements first.");
              return;
          }
          if (!result.userId) {
              alert("❌ No user ID found! Please log in.");
              return;
          }

          const response = await fetch(`http://localhost:5000/scrape/${endpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  userId: result.userId,
                  url: window.location.href,
                  data: result.scrapedData
              }),
          });

          if (response.ok) {
              alert(`✅ ${endpoint} started successfully!`);
          } else {
              alert(`❌ Failed to start ${endpoint}.`);
          }
      });
  }

  crawlBtn.addEventListener("click", () => sendData("crawl"));
  scrapeBtn.addEventListener("click", () => sendData("scrape"));

  // ✅ Clear Data Button - Resets Storage & Output
  clearBtn.addEventListener("click", () => {
      chrome.storage.local.set({ scrapedData: [] }, () => {
          output.innerText = "No data yet...";
          alert("🗑 Data cleared!");

          // ✅ Remove borders from selected elements
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.scripting.executeScript({
                  target: { tabId: tabs[0].id },
                  function: () => {
                      document.querySelectorAll("*").forEach(el => el.style.border = "");
                      console.log("🗑 Removed all highlights.");
                  }
              });
          });
      });
  });

  chrome.storage.local.get("scrapedData", (data) => {
      output.innerText = JSON.stringify(data.scrapedData || [], null, 2);
  });
});
