import { useState, useEffect } from "react";

export default function App() {
  const [interval, setInterval] = useState("hourly"); // Default to hourly
  const [books, setBooks] = useState<
    { title: string; price: string; created_at: string }[]
  >([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // Call your update interval function here (if needed)
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

      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Function to format the created_at timestamp
  const formatDuration = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - createdAt.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hr ago`;
    }
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

      <h2>List of Books</h2>
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
                {formatDuration(book.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
