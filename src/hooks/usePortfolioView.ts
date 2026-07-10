import { useEffect } from "react";
import { submitToWeb3Forms } from "@/lib/web3forms";

export function usePortfolioView() {
  useEffect(() => {
    submitToWeb3Forms({
      subject: "Portfolio View Notification",
      from_name: "Portfolio Viewer",
      message: `Someone visited your portfolio at EST ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`,
      from_email: "portfolio-view@notification.com",
    }).then((sent) => {
      if (sent) {
        console.log("Portfolio view notification sent");
      }
    });
  }, []);
}
