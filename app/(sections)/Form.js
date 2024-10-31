"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDisplay from "./UserDisplay";

export default function Form() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserData(null);
    setHasSearched(true);

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (response.status === 403) {
        setError("rate_limit");
        setIsLoading(false);
        return;
      }
      
      if (response.status === 404) {
        setError("Issue with API");
        setIsLoading(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        setError("not_found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("network_error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRateLimitError = () => (
    <div className="text-slate-100 mt-4 max-w-md">
      <div className="text-[#00D1B2] text-center text-center mt-4">
            <p className="font-bold text-2xl">Sorry... 😅</p>
            <p className="text-sm mt-1">
              Looks like GitHub API rate limit reached. 
            </p>
          </div>
      <div className="mt-3 text-sm space-y-1">
        <p className="underline underline-offset-2 font-semibold">To resolve this:</p>
        <ul className="list-disc list-inside">
          <li>Wait for few minutes before trying again</li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col w-full max-w-sm items-center space-y-4 my-10">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md items-center space-x-4 border border-[#00D1B2] rounded-[25px] px-2 md:px-3 py-2"
        >
          <Input
            type="text"
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
        {error === "rate_limit" && renderRateLimitError()}
      </div>
      <UserDisplay 
        userData={userData} 
        error={error} 
        hasSearched={hasSearched} 
      />
    </>
  );
}
