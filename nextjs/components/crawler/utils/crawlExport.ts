import axios from "axios";
import toast from "react-hot-toast";

export const handleExportAndDownloadExcel = async (id: string, mode: 'crawl' | 'scrape') => {
  try {
    toast.loading("Starting Excel export...", { id: "export-excel" });

    // ✅ Step 1: Start the export
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/excel/${id}`, { mode });

    // ✅ Step 2: Poll until file is ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/excel/${id}?=${mode}`, { responseType: "blob" });

        if (response.status === 200) {
          toast.dismiss("export-excel"); // Remove loading toast
          toast.success("Excel file is ready! Downloading...");

          // ✅ Step 3: Download the file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${mode}_results_${id}.xlsx`);
          document.body.appendChild(link);
          link.click();
          return;
        }
      } catch (error) {
        console.log(`🔄 File not ready, retrying (${attempts + 1}/${maxAttempts})...`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 sec before retrying
      attempts++;
    }

    toast.error("Failed to download file. Try again later.");
  } catch (error) {
    toast.dismiss("export-excel"); // Remove loading toast
    console.error("❌ Error exporting/downloading Excel:", error);
    toast.error("Failed to export Excel.");
  }
};
export const handleDownloadPDF = async (id: string, mode: 'crawl' | 'scrape') => {
  try {
    // ✅ Step 1: Trigger PDF Generation (POST)
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/pdf/${id}`, { mode });
    console.log("📄 PDF generation started...");

    // ✅ Step 2: Wait for the file to be ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/pdf/${id}?mode=${mode}`, { responseType: "blob" });

        if (response.status === 200) {
          console.log("✅ PDF file is ready!");

          // ✅ Step 3: Trigger download
          const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${mode}_results_${id}.pdf`);
          document.body.appendChild(link);
          link.click();
          return;
        }
      } catch (error) {
        console.log(`🔄 File not ready, retrying (${attempts + 1}/${maxAttempts})...`, error);
      }

      // Wait 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    console.error("❌ PDF download failed. Try again later.");
  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
  }
};


export const handleDownloadHTML = async (id: string, mode: 'crawl' | 'scrape') => {
  try {
    // ✅ Step 1: Trigger HTML Generation (POST)
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/html/${id}`, { mode });
    console.log("🌍 HTML generation started...");

    // ✅ Step 2: Wait for the file to be ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/html/${id}?mode=${mode}`, { responseType: "blob" });

        if (response.status === 200) {
          console.log("✅ HTML file is ready!");

          // ✅ Step 3: Trigger download
          const url = URL.createObjectURL(new Blob([response.data], { type: "text/html" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${mode}_results_${id}.html`);
          document.body.appendChild(link);
          link.click();
          return;
        }
      } catch (error) {
        console.log(`🔄 File not ready, retrying (${attempts + 1}/${maxAttempts})...`, error);
      }

      // Wait 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    console.error("❌ HTML download failed. Try again later.");
  } catch (error) {
    console.error("❌ Error downloading HTML:", error);
  }
};

export const handleExportToGoogleSheets = async (
  id: string,
  mode: "crawl" | "scrape",
  setGoogleSheetsErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setShowGoogleSheetsErrorModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    toast.loading("Exporting to Google Sheets...", { id: "export-google" });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}`,
      { mode }
    );

    if (response.status === 202) {
      toast.dismiss("export-google");
      handleMissingSheetId(id, mode); // 🚀 Ask the user to enter a Sheet ID
      return;
    }

    toast.dismiss("export-google");
    toast.success("✅ Data sent to Google Sheets!");
  } catch (error: unknown) {
    toast.dismiss("export-google");

    if (axios.isAxiosError(error)) {
      console.error("❌ Error exporting to Google Sheets:", error);
    
      const status = error.response?.status;
      let message = error.response?.data?.message || "❌ Unknown error occurred while exporting to Google Sheets.";
    
      if (status === 400) {
        message = "⚠️ The operation is not supported for this document. Ensure the Google Sheet ID is correct and that the service account has 'Editor' access.";
      } else if (status === 403) {
        message = "🚫 Permission Denied! Ensure that your service account email is added as an 'Editor' to the Google Sheet.";
      }
    
      // ✅ Display the correct message inside the modal
      setGoogleSheetsErrorMessage(message);
      setShowGoogleSheetsErrorModal(true);
    }
  }
};


const handleMissingSheetId = async (id: string, mode: 'crawl' | 'scrape') => {
  const newSheetId = prompt("⚠️ No Google Sheet ID found! Please enter your Google Sheet ID:");
  if (newSheetId) {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}/update-sheet-id`, 
        { google_sheet_id: newSheetId, mode },
        { headers: { "Content-Type": "application/json" } });
      toast.success("✅ Google Sheet ID saved! Try exporting again.");
    } catch (error) {
      console.error("❌ Error updating Google Sheet ID:", error
      );
      toast.error("❌ Failed to update Google Sheet ID.");
    }
  }
};
export const updateGoogleSheetId = async (id: string, mode: 'crawl' | 'scrape') => {
  const newSheetId = prompt("Enter your new Google Sheet ID:");
  if (!newSheetId) return;

  try {
    await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}/update-sheet-id`, {
      google_sheet_id: newSheetId, mode},
      { headers: { "Content-Type": "application/json" } });

    toast.success("✅ Google Sheet ID updated! Try exporting again.");
  } catch (error) {
    console.error("❌ Error updating Google Sheet ID:", error);
    toast.error("❌ Failed to update Google Sheet ID.");
  }
};
//1H2fe3NTw4zGor_45LxCdkvQ3OsDuWEUz


