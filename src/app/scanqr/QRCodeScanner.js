"use client";
import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRCodeScanner = ({ onScan }) => {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    html5QrcodeScanner.render(onScanSuccess);
    setScanner(html5QrcodeScanner);

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const onScanSuccess = (decodedText) => {
    const data = JSON.parse(decodedText);
    console.log(`Scanned data: ${decodedText}`); // Log the decoded text
    onScan(data);

    // Stop the scanner after a successful scan
    if (scanner) {
      scanner.clear().then(() => {
        console.log("Scanner stopped");
      }).catch((error) => {
        console.error("Failed to stop scanner", error);
      });
    }
  };

  return (
    <div>
      <div id="reader" className="mx-auto w-full" style={{ width: "500px" }}></div>
    </div>
  );
};

export default QRCodeScanner;
