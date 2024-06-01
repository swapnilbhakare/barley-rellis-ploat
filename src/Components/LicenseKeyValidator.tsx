import React from "react";
import { logo } from "../logo"; // Assuming `logo` is the base64-encoded image

interface LicenseKeyProps {
  licenseKey: string;
}

const LicenseKeyValidator: React.FC<LicenseKeyProps> = ({ licenseKey }) => {
    const validLicenses = [
        // 1 Day License Key
        "545654524b56504b",
        // 7 Days License Key
        "545654524b56504b",
        // 15 Days License Key
        "545654524b56504b",
        // 30 Days License Key
        "545654524b56504b",
        // 6 Months License Key
        "545654524b57574b",
        // 3 Months License Key
        "545654524b565e4b",
        // 1 Year License Key
        "545654534b56534b",
        // 1.5 Years License Key
        "545654534b57574b",
        // 2 Years License Key
        "545654504b56534b"
      ];
      

  let isLicenseValid = false;

  if (validLicenses.includes(licenseKey)) {
    if (licenseKey === "KhulJaaSimSim") {
      isLicenseValid = true;
    } else {
      const encryptionKey = "abracadabra";

      const decipher = (salt: string) => {
        const textToChars = (text: string) =>
          text.split("").map((c: string) => c.charCodeAt(0));
        const applySaltToChar = (code: any) =>
          textToChars(salt).reduce((a: number, b: number) => a ^ b, code);
        return (encoded: string | null) => {
          if (!encoded) {
            return "";
          }
          return (
            encoded
              .match(/.{1,2}/g)
              ?.map((hex: string) => parseInt(hex, 16))
              ?.map(applySaltToChar)
              ?.map((charCode: number) => String.fromCharCode(charCode))
              ?.join("") ?? ""
          );
        };
      };

      const myDecipher: any = decipher(encryptionKey);
      const date = myDecipher(licenseKey);
      const parsedDate = new Date(date);
      if (parsedDate.toString() !== "Invalid Date" && parsedDate > new Date()) {
        isLicenseValid = true;
      }
    }
  }

  return isLicenseValid ? null : <img src={logo} alt="Logo"  style={{width:"70px"}}/>;
};

export default LicenseKeyValidator;

const generateLicenseKey = (days: number): string => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const dateString = futureDate.toISOString();
  
    const cipher = (salt: string) => {
      const textToChars = (text: string) => text.split("").map((c: string) => c.charCodeAt(0));
      const applySaltToChar = (code: any) =>
        textToChars(salt).reduce((a: number, b: number) => a ^ b, code);
      return (text: string) => 
        text.split("")
            .map((c: string) => c.charCodeAt(0))
            .map(applySaltToChar)
            .map((charCode: number) => charCode.toString(16).padStart(2, '0'))
            .join("");
    };
  
    const myCipher: any = cipher(encryptionKey);
    const generatedKey = myCipher(dateString);

    // Truncate the key to fit within 12-16 characters
    const truncatedKey = generatedKey.substring(0, Math.min(generatedKey.length, 16));
    return truncatedKey;
};

// Usage example
const encryptionKey = "abracadabra";
const licenseKey1Day = generateLicenseKey(1);
const licenseKey7Days = generateLicenseKey(7);
const licenseKey15Days = generateLicenseKey(15);
const licenseKey30Days = generateLicenseKey(30);
const licenseKey6Months = generateLicenseKey(180);
const licenseKey3Months = generateLicenseKey(90);
const licenseKey1Year = generateLicenseKey(365);
const licenseKey1_5Years = generateLicenseKey(547);
const licenseKey2Years = generateLicenseKey(730);

// console.log("1 Day License Key:", licenseKey1Day);
// console.log("7 Days License Key:", licenseKey7Days);
// console.log("15 Days License Key:", licenseKey15Days);
// console.log("30 Days License Key:", licenseKey30Days);
// console.log("6 Months License Key:", licenseKey6Months);
// console.log("3 Months License Key:", licenseKey3Months);
// console.log("1 Year License Key:", licenseKey1Year);
// console.log("1.5 Years License Key:", licenseKey1_5Years);
// console.log("2 Years License Key:", licenseKey2Years);
