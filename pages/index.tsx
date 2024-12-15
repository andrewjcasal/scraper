import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export default function App() {
  const [interval, setInterval] = useState("hourly"); // Default to hourly

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      client.mutations.updateInterval({
        interval,
      });
      alert("Scraping interval updated!");
    } catch (error) {
      console.error("Error updating interval", error);
      alert("Error updating interval");
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <label htmlFor="interval">Select Scraping Interval: </label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit">Update Interval</button>
      </form>
    </main>
  );
}
