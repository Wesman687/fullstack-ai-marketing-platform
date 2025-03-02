import axios from "axios";
import toast from "react-hot-toast";

export const handleExportAndDownloadExcel = async (id: string) => {
  try {
    toast.loading("Starting Excel export...", { id: "export-excel" });

    // ✅ Step 1: Start the export
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/excel/${id}`);

    // ✅ Step 2: Poll until file is ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/excel/${id}`, { responseType: "blob" });

        if (response.status === 200) {
          toast.dismiss("export-excel"); // Remove loading toast
          toast.success("Excel file is ready! Downloading...");

          // ✅ Step 3: Download the file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `crawl_results_${id}.xlsx`);
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
export const handleDownloadPDF = async (id: string) => {
  try {
    // ✅ Step 1: Trigger PDF Generation (POST)
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/pdf/${id}`);
    console.log("📄 PDF generation started...");

    // ✅ Step 2: Wait for the file to be ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/pdf/${id}`, { responseType: "blob" });

        if (response.status === 200) {
          console.log("✅ PDF file is ready!");

          // ✅ Step 3: Trigger download
          const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `crawl_results_${id}.pdf`);
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


export const handleDownloadHTML = async (id: string) => {
  try {
    // ✅ Step 1: Trigger HTML Generation (POST)
    await axios.post(`${process.env.NEXT_PUBLIC_API}/export/html/${id}`);
    console.log("🌍 HTML generation started...");

    // ✅ Step 2: Wait for the file to be ready
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/export/html/${id}`, { responseType: "blob" });

        if (response.status === 200) {
          console.log("✅ HTML file is ready!");

          // ✅ Step 3: Trigger download
          const url = URL.createObjectURL(new Blob([response.data], { type: "text/html" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `crawl_results_${id}.html`);
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

export const handleExportToGoogleSheets = async (id: string) => {
  try {
    toast.loading("Exporting to Google Sheets...", { id: "export-google" });

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}`);

    if (response.status === 202) {
      toast.dismiss("export-google");
      handleMissingSheetId(id); // 🚀 Ask the user to enter a Sheet ID
      return;
    }

    toast.dismiss("export-google");
    toast.success("✅ Data sent to Google Sheets!");
  } catch (error) {
    toast.dismiss("export-google");
    console.error("❌ Error exporting to Google Sheets:", error);
    toast.error("Failed to export to Google Sheets.");
  }
};

const handleMissingSheetId = async (id: string) => {
  const newSheetId = prompt("⚠️ No Google Sheet ID found! Please enter your Google Sheet ID:");
  if (newSheetId) {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}/update-sheet-id`, { google_sheet_id: newSheetId });
      toast.success("✅ Google Sheet ID saved! Try exporting again.");
    } catch (error) {
      console.error("❌ Error updating Google Sheet ID:", error
      );
      toast.error("❌ Failed to update Google Sheet ID.");
    }
  }
};
export const updateGoogleSheetId = async (id: string) => {
  const newSheetId = prompt("Enter your new Google Sheet ID:");
  if (!newSheetId) return;

  try {
    await axios.patch(`${process.env.NEXT_PUBLIC_API}/export/google-sheets/${id}/update-sheet-id`, {
      google_sheet_id: newSheetId,
    });

    toast.success("✅ Google Sheet ID updated! Try exporting again.");
  } catch (error) {
    console.error("❌ Error updating Google Sheet ID:", error);
    toast.error("❌ Failed to update Google Sheet ID.");
  }
};

