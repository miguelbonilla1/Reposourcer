import React, { useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

const App = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [keySavedMessage, setKeySavedMessage] = useState("");

  // Filter States
  const [filterByLocation, setFilterByLocation] = useState(false);
  const [filterByEmail, setFilterByEmail] = useState(false);

  const handleSearch = async () => {
    if (!apiKey) {
      setError("Please enter your GitHub API Key.");
      return;
    }

    setLoading(true);
    setError("");
    setContributors([]);

    try {
      const repoName = repoUrl.split("github.com/")[1];
      if (!repoName) {
        setError("Invalid URL");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://api.github.com/repos/${repoName}/contributors`,
        {
          headers: {
            Authorization: `token ${apiKey}`,
          },
        }
      );

      const detailedContributors = await Promise.all(
        response.data.map(async (contributor) => {
          const userDetails = await axios.get(contributor.url, {
            headers: {
              Authorization: `token ${apiKey}`,
            },
          });
          return { ...contributor, ...userDetails.data };
        })
      );

      setContributors(detailedContributors);
    } catch (error) {
      setError("Failed to fetch contributors");
    }

    setLoading(false);
  };

  const handleAddApiKey = () => {
    if (newApiKey.trim() !== "") {
      setApiKey(newApiKey.trim());
      setNewApiKey("");
      setKeySavedMessage("Key saved");
      setTimeout(() => setKeySavedMessage(""), 3000);
    }
  };

  const displayColumn = (column) => {
    if (!filterByLocation && !filterByEmail) return true;
    if (filterByLocation && column === "Location") return true;
    if (filterByEmail && column === "Email") return true;
    return false;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Reposourcer</h1>


      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your GitHub API Key"
          className="border p-2 mr-2 w-1/2"
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
        />
        <button
          onClick={handleAddApiKey}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Save API Key
        </button>
        {keySavedMessage && (
          <p className="text-green-500 mt-2">{keySavedMessage}</p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="https://github.com/owner/repo"
          className="border p-2 mr-2 w-1/2"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={filterByLocation}
            onChange={() => setFilterByLocation(!filterByLocation)}
          />
          Filter by Location
        </label>
        <label className="ml-4">
          <input
            type="checkbox"
            checked={filterByEmail}
            onChange={() => setFilterByEmail(!filterByEmail)}
          />
          Filter by Email
        </label>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading && <p>Loading...</p>}

      <CSVLink
        data={contributors.map((contributor) => ({
          Username: contributor.login || "N/A",
          Name: contributor.name || "N/A",
          Location: contributor.location || "N/A",
          Company: contributor.company || "N/A",
          "Total Stars": contributor.public_repos || "N/A",
          Activity: contributor.contributions || "N/A",
          Twitter: contributor.twitter_username || "N/A",
          Website: contributor.blog || "N/A",
          Email: contributor.email || "N/A",
        }))}
        headers={[
          { label: "Username", key: "Username" },
          { label: "Name", key: "Name" },
          { label: "Location", key: "Location" },
          { label: "Company", key: "Company" },
          { label: "Total Stars", key: "Total Stars" },
          { label: "Activity", key: "Activity" },
          { label: "Twitter", key: "Twitter" },
          { label: "Website", key: "Website" },
          { label: "Email", key: "Email" },
        ]}
        separator={";"}
        filename={"contributors.csv"}
        className="bg-yellow-500 text-white px-4 py-2 mb-4 inline-block"
        target="_blank"
      >
        Export to CSV
      </CSVLink>

      {/* Contributors data */}
      <table className="table-auto min-w-full bg-white border-collapse border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Avatar</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Name</th>
            {displayColumn("Location") && (
              <th className="border px-4 py-2">Location</th>
            )}
            {displayColumn("Company") && (
              <th className="border px-4 py-2">Company</th>
            )}
            {displayColumn("Total Stars") && (
              <th className="border px-4 py-2">Total Stars</th>
            )}
            {displayColumn("Activity") && (
              <th className="border px-4 py-2">Activity</th>
            )}
            {displayColumn("Twitter") && (
              <th className="border px-4 py-2">Twitter</th>
            )}
            {displayColumn("Website") && (
              <th className="border px-4 py-2">Website</th>
            )}
            {displayColumn("Email") && (
              <th className="border px-4 py-2">Email</th>
            )}
          </tr>
        </thead>
        <tbody>
          {contributors.length > 0 ? (
            contributors.map((contributor) => (
              <tr key={contributor.id}>
                <td className="border px-4 py-2">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <td className="border px-4 py-2">{contributor.login}</td>
                <td className="border px-4 py-2">{contributor.name || "N/A"}</td>
                {displayColumn("Location") && (
                  <td className="border px-4 py-2">
                    {contributor.location || "N/A"}
                  </td>
                )}
                {displayColumn("Company") && (
                  <td className="border px-4 py-2">{contributor.company || "N/A"}</td>
                )}
                {displayColumn("Total Stars") && (
                  <td className="border px-4 py-2">{contributor.public_repos || "N/A"}</td>
                )}
                {displayColumn("Activity") && (
                  <td className="border px-4 py-2">{contributor.contributions}</td>
                )}
                {displayColumn("Twitter") && (
                  <td className="border px-4 py-2">{contributor.twitter_username || "N/A"}</td>
                )}
                {displayColumn("Website") && (
                  <td className="border px-4 py-2">
                    {contributor.blog ? (
                      <a href={contributor.blog} target="_blank" rel="noopener noreferrer">
                        {contributor.blog}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                )}
                {displayColumn("Email") && (
                  <td className="border px-4 py-2">{contributor.email || "N/A"}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="10">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;
