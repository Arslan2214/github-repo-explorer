import RepositoryDisplay from "./RepositoryDisplay";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useGithubStats } from '@/hooks/useGithubStats';
import UserStats from "./UserStats";

const defaultAvatarUrl = "/default_github_profile_img.png";

export default function UserDisplay({ userData, error, hasSearched }) {
  const { languages, activity, loading, error: statsError } = useGithubStats(userData?.login);
  console.log(userData)
  if (error === "not_found" && hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="flex flex-col space-y-2 items-center text-sm">
          <span className="font-bold text-4xl">Oops...🤐</span>
          <p>
            Can't find this user, Please search by{" "}
            <span className="font-semibold">username</span>.
          </p>
        </p>
        <Image
          src={"/nothing.png"}
          alt={"No Such User"}
          width={190}
          height={190}
          className="mb-2 md:mx-auto"
          priority
          unoptimized
        />
      </div>
    );
  }

  if (error === "rate_limit") {
    return null;
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col justify-center mt-4 space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-8 py-4 border border-[#242424] rounded-xl">
        <div className="w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center items-center">
          <Image
            src={userData?.avatar_url || defaultAvatarUrl}
            alt={userData.name || "User avatar"}
            width={160}
            height={160}
            className="rounded-full mb-2 md:mx-auto"
            priority
            unoptimized
          />
          <div className="flex flex-col mt-3 space-y-2">
            <Link
              href={userData.html_url}
              target="_blank"
              className="text-4xl font-bold font-mono text-center md:text-left"
            >
              {userData.name}
            </Link>
            <p className="text-slate-300/60 text-sm text-center md:text-left">
              {userData.login} ({userData.type}) <br />
              ID: {userData.id}
            </p>

            <p className="text-slate-300 text-sm mt-2 text-center md:text-left">
              Created on{" "}
              <span className="underline underline-offset-2">
                {new Date(userData.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
            <p>
              <span className="font-bold">Bio:</span> {userData.bio}
            </p>
            <div className="flex items-center space-x-4">
              <p>
                <span className="font-bold">Followers:</span>{" "}
                {userData.followers}
              </p>
              <p>
                <span className="font-bold">Following:</span>{" "}
                {userData.following}
              </p>
            </div>
            <p className="text-slate-100 mt-2">
              <span className="font-bold">Location:</span> {userData.location}
            </p>
            {userData.company && (
              <p className="text-slate-100 mt-2">
                <span className="font-bold">Company:</span> {userData.company}
              </p>
            )}
            {userData.blog && (
              <p className="text-slate-100 mt-2">
                <span className="font-bold">Blog:</span> {userData.blog}
              </p>
            )}
            {userData.email && (
              <p className="text-slate-100 mt-2">
                <span className="font-bold">Email:</span> {userData.email}
              </p>
            )}
            <div className="flex items-center space-x-4">
              <p>
                <span className="font-bold">Public repos:</span>{" "}
                {userData.public_repos ? userData.public_repos : "None"}
              </p>
              {userData.private_repos &&
              <p>
                <span className="font-bold">Private repos:</span>{" "}
                {userData.private_repos ? userData.private_repos : "None"}
              </p>
              }
            </div>
          </div>
        </div>
        {/* * User Status - Includes Graph or Performance & Graph of Languages */}
        {/* <hr className="w-[80%] mx-auto my-3" />
         <UserStats 
          languages={languages}
          activity={activity}
          loading={loading}
        /> */}
      </div>
      <div>
        {userData?.login ? (
          <RepositoryDisplay username={userData.login} />
        ) : (
          console.log("No login found in userData")
        )}
      </div> 
    </>
  );
}
