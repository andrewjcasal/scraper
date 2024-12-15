import { useState, useEffect } from "react";
import { generateClient } from "@aws-amplify/api";
import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export default function App() {
  const [interval, setInterval] = useState("hourly"); // Default to hourly
  const [books, setBooks] = useState<
    { title: string; price: string; created_at: string }[]
  >([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      client.mutations.updateInterval({
        interval: interval,
      });
      alert("Scraping interval updated!");
    } catch (error) {
      console.error("Error updating interval", error);
      alert("Error updating interval");
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books"); // Call the new API route
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setBooks(
        data.sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Replace the formatDuration function with this new formatDateTime function
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 5);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main
      style={{ padding: "20px", fontFamily: "Arial, sans-serif", margin: "0" }}
    >
      <h1>Book Scraper</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label htmlFor="interval">Select Scraping Interval: </label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="every minute">Every Minute</option>
          <option value="every three minutes">Every Three Minutes</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button
          type="submit"
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          Update Interval
        </button>
      </form>

      <h2>List of Books Scraped Randomly</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {book.title}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {book.price}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {formatDateTime(book.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
