const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));

app.get("/api/leetcode-stats", async (req, res) => {
  const username = req.query.username;
  // console.log(username);
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
              profile {
                realName
                ranking
              }
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

    const userData = response.data.data.matchedUser;
    const submissionData = userData.submitStats.acSubmissionNum;
    const stats = {
      profileName: userData.profile?.realName || "N/A",
      rank: userData.profile?.ranking || "N/A",
      total: submissionData.reduce((acc, curr) => acc + curr.count, 0),
      easy: submissionData.find((item) => item.difficulty === "Easy")?.count || 0,
      medium: submissionData.find((item) => item.difficulty === "Medium")?.count || 0,
      hard: submissionData.find((item) => item.difficulty === "Hard")?.count || 0,
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

