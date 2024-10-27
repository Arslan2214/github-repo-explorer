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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserData(null);

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);

      if (!response.ok) {
        throw new Error("User not found or GitHub API error");
      }

      const data = await response.json();
      setUserData(data);
    //   console.log(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      </div>
      <UserDisplay userData={userData} error={error} />
    </>
  );
}
