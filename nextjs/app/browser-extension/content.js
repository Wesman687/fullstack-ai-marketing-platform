let selectedFields = [];
let isSelecting = false;

function startSelection() {
    isSelecting = !isSelecting;

    if (isSelecting) {
        alert("🔍 Click on elements to select/unselect them. Click 'Stop Selection' when done.");
        document.addEventListener("click", handleSelection, true);
    } else {
        document.removeEventListener("click", handleSelection, true);
    }
}

function handleSelection(event) {
    if (!isSelecting) return;
    
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    const textContent = element.innerText.trim();
    const selector = getSelector(element);
    const imageSrc = element.tagName.toLowerCase() === "img" ? element.src : null;

    const existingIndex = selectedFields.findIndex((field) => field.selector === selector);
    if (existingIndex > -1) {
        selectedFields.splice(existingIndex, 1);
        element.style.border = "";
    } else {
        selectedFields.push({ selector, text: textContent, image: imageSrc });
        element.style.border = "2px solid red";
    }

    chrome.storage.local.set({ scrapedData: selectedFields });
}

function getSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(" ").join(".")}`;
    return element.tagName.toLowerCase();
}

function stopSelection() {
    isSelecting = false;
    alert("✅ Selection completed. Data saved!");

    document.removeEventListener("click", handleSelection, true);

    chrome.storage.local.set({ scrapedData: selectedFields }, () => {
        console.log("✅ Data saved to storage:", selectedFields);
    });

    document.querySelectorAll("*").forEach(el => el.style.border = "");
}

// ✅ Expose Functions for Popup
window.startSelection = startSelection;
window.stopSelection = stopSelection;
