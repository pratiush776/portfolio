import { useEffect } from "react";

export function usePortfolioView() {
  useEffect(() => {
    const notifyPortfolioView = async () => {
      try {
        const response = await fetch("/api/notify-portfolio-view", {
          method: "POST",
        });

        const result = await response.json();
        if (result.success) {
          console.log("Portfolio view notification sent");
        }
      } catch (error) {
        console.error("Failed to send portfolio view notification:", error);
      }
    };

    notifyPortfolioView();
  }, []);
}
