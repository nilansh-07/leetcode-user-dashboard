const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import CORS

const app = express();
const port = 5000;

// Enable CORS for all origins or specific origin
app.use(cors({ origin: "http://localhost:3000" })); // Adjust origin as needed

app.get("/api/leetcode-stats", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql/",
      {
        query: `
          query {
            matchedUser(username: "${username}") {
              username
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data.data.matchedUser.submitStats.acSubmissionNum;
    const stats = {
      total: data.reduce((acc, curr) => acc + curr.count, 0),
      easy: data.find((item) => item.difficulty === "Easy")?.count || 0,
      medium: data.find((item) => item.difficulty === "Medium")?.count || 0,
      hard: data.find((item) => item.difficulty === "Hard")?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
