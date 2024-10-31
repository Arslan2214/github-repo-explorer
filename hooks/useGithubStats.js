import { useState, useEffect } from 'react';

export function useGithubStats(username) {
  const [stats, setStats] = useState({
    languages: [],
    activity: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchStats() {
      if (!username) return;
      
      try {
        // Fetch user's repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await reposResponse.json();

        // Fetch language data for each repo
        const languagePromises = repos.map(repo =>
          fetch(repo.languages_url).then(res => res.json())
        );
        const languagesData = await Promise.all(languagePromises);

        // Process languages data
        const languageTotals = languagesData.reduce((acc, curr) => {
          Object.entries(curr).forEach(([lang, bytes]) => {
            acc[lang] = (acc[lang] || 0) + bytes;
          });
          return acc;
        }, {});

        const languages = Object.entries(languageTotals).map(([name, value]) => ({
          name,
          value
        }));

        // Fetch commit activity
        const activityPromises = repos.map(repo =>
          fetch(`https://api.github.com/repos/${username}/${repo.name}/stats/commit_activity`)
            .then(res => res.json())
            .catch(() => [])
        );
        const activitiesData = await Promise.all(activityPromises);

        // Process activity data
        const activity = activitiesData.flat().reduce((acc, week) => {
          if (week) {
            const date = new Date(week.week * 1000);
            acc.push({
              date: date.toISOString().split('T')[0],
              commits: week.total
            });
          }
          return acc;
        }, []);

        setStats({
          languages,
          activity,
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    }

    fetchStats();
  }, [username]);

  return stats;
} 