"use client";
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FaGithub, FaStar, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function RepositoryDisplay({ username }) {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [repos, setRepos] = useState([]);
  const [languages, setLanguages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust this number as needed
  const [showPopular, setShowPopular] = useState(false);
  const [showDocumented, setShowDocumented] = useState(false);
  const [showActive, setShowActive] = useState(false);

  // Fetch repositories or set repos data here
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        console.log("Fetching repos for username:", username);
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched repos:", data);
        
        setRepos(data);

        // Extract languages from repos and update languages state
        const langCount = {};
        data.forEach((repo) => {
          if (repo.language) {
            langCount[repo.language] = (langCount[repo.language] || 0) + 1;
          }
        });
        setLanguages(langCount);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    };

    if (username) {
      fetchRepos();
    }
  }, [username]);


  const handleLanguageChange = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    );
  };

  const filteredAndSortedRepos = repos
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguages =
        selectedLanguages.length === 0 ||
        (selectedLanguages.includes("No Language") && !repo.language) ||
        (repo.language && selectedLanguages.includes(repo.language));
      const matchesLive =
        !showLiveOnly || repo.homepage || repo.html_url.includes("github.io");
      const matchesPopular = !showPopular || (
        repo.stargazers_count > 5 || 
        repo.forks_count > 2 ||
        repo.open_issues_count > 3 ||
        repo.watchers_count > 5
      );
      const matchesDocumented = !showDocumented || (repo.has_wiki && repo.description && repo.description.length > 100);
      const matchesActive = !showActive || (
        // Check if updated within last week
        ((new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24) <= 7) ||
        // Check if has recent commits (multiple updates within a month shows consistency)
        (repo.pushed_at && (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24) <= 30) ||
        // Check if actively maintained (issues/PRs indicate engagement)
        (repo.open_issues_count > 0 && repo.updated_at > repo.created_at) ||
        // Check if popular and being watched (community interest shows activity)
        (repo.watchers_count > 10 && repo.stargazers_count > 20)
      );

      return matchesSearch && matchesLanguages && matchesLive && 
             matchesPopular && matchesDocumented && matchesActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return new Date(b.updated_at) - new Date(a.updated_at);
        case "watchers":
          return b.watchers_count - a.watchers_count;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

  // Calculate pagination values
  const totalItems = filteredAndSortedRepos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedRepos.slice(startIndex, endIndex);

  // Add this function to handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActivityStatus = (repo) => {
    const daysSinceUpdate = (new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    const daysSincePush = repo.pushed_at ? (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24) : null;
    
    const reasons = [];
    
    // Check for recent updates
    if (daysSinceUpdate <= 7) {
      reasons.push("Updated this week");
    } else if (daysSinceUpdate <= 30) {
      reasons.push("Updated this month");
    }

    // Check for consistent commits
    if (daysSincePush && daysSincePush <= 7) {
      reasons.push("Active development");
    }

    // Check for community engagement
    if (repo.open_issues_count > 0 && daysSinceUpdate <= 30) {
      reasons.push("Active issues & PRs");
    }

    // Check for community interest
    if (repo.watchers_count > 10) {
      reasons.push("Actively watched");
    }

    // Additional criteria you might want to add to getActivityStatus:
    if (repo.stargazers_count > 20 && repo.watchers_count > 10) {
      reasons.push("Popular & maintained");
    }

    if (repo.forks_count > 5 && daysSinceUpdate <= 30) {
      reasons.push("Active forks");
    }

    if (repo.subscribers_count > 10) {
      reasons.push("Actively followed");
    }

    return reasons;
  };

  return (
    <div className="container mx-auto p-4">
      {repos.length > 0 && (
        <div className="mt-6 border rounded-xl border-[#242424] p-10">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4">
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-[#00D1B2] rounded-[25px] px-2 md:px-3 py-2 min-w-sm max-w-md"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently update</SelectItem>
                  <SelectItem value="stars">Most Stars</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                  <SelectItem value="watchers">Most Watchers</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="size">Largest Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2">
                <div className="relative inline-block cursor-pointer">
                  <Checkbox
                    id="live-only"
                    checked={showLiveOnly}
                    onCheckedChange={setShowLiveOnly}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="live-only"
                    className={`px-2 py-1 rounded ${
                      showLiveOnly
                        ? "bg-[#00D1B2] text-white"
                        : "bg-transparent text-[#00D1B2]"
                    } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                  >
                    Live Demo Available
                  </Label>
                </div>

                <div className="relative inline-block cursor-pointer">
                  <Checkbox
                    id="popular"
                    checked={showPopular}
                    onCheckedChange={setShowPopular}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="popular"
                    className={`px-2 py-1 rounded ${
                      showPopular
                        ? "bg-[#00D1B2] text-white"
                        : "bg-transparent text-[#00D1B2]"
                    } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                  >
                    Most Forks and PRs
                  </Label>
                </div>

                <div className="relative inline-block cursor-pointer">
                  <Checkbox
                    id="documented"
                    checked={showDocumented}
                    onCheckedChange={setShowDocumented}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="documented"
                    className={`px-2 py-1 rounded ${
                      showDocumented
                        ? "bg-[#00D1B2] text-white"
                        : "bg-transparent text-[#00D1B2]"
                    } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                  >
                    Detailed Documentation
                  </Label>
                </div>

                <div className="relative inline-block cursor-pointer">
                  <Checkbox
                    id="active"
                    checked={showActive}
                    onCheckedChange={setShowActive}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="active"
                    className={`px-2 py-1 rounded ${
                      showActive
                        ? "bg-[#00D1B2] text-white"
                        : "bg-transparent text-[#00D1B2]"
                    } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                  >
                    Mostly Active
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            {Object.keys(languages).length > 0 && (
              <>
                <h4 className="text-center text-lg">Languages Used</h4>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  <div className="relative inline-block cursor-pointer">
                    <Checkbox
                      id="lang-none"
                      checked={selectedLanguages.includes("No Language")}
                      onCheckedChange={() => handleLanguageChange("No Language")}
                      className="sr-only"
                    />
                    <Label
                      htmlFor="lang-none"
                      className={`px-2 py-1 rounded ${
                        selectedLanguages.includes("No Language")
                          ? "bg-[#00D1B2] text-white"
                          : "bg-transparent text-[#00D1B2]"
                      } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                    >
                      No Specific Language
                    </Label>
                  </div>
                  {Object.entries(languages).map(([lang]) => (
                    <div
                      key={lang}
                      className="relative inline-block cursor-pointer"
                    >
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={selectedLanguages.includes(lang)}
                        onCheckedChange={() => handleLanguageChange(lang)}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`lang-${lang}`}
                        className={`px-2 py-1 rounded ${
                          selectedLanguages.includes(lang)
                            ? "bg-[#00D1B2] text-white"
                            : "bg-transparent text-[#00D1B2]"
                        } transition-colors shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] duration-200 ease-in-out`}
                      >
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {currentItems.map((repo) => (
          <div
            key={repo.id}
            className="flex flex-col gap-4 justify-between items-start border border-[#242424] p-4 drop-shadow-md rounded-xl hover:shadow-[0_0_15px_rgba(136,136,136,0.4)] transition-all duration-200 ease-in-out relative"
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-col gap-1 items-start justify-start py-2">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-lg font-bold">{repo.name}</h2>
                  <div className="flex flex-col gap-1 items-end">
                    {(() => {
                      const daysSinceCreation = Math.floor(
                        (new Date() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24)
                      );
                      if (daysSinceCreation <= 7) {
                        return (
                          <span className="text-[10px] px-[3px] bg-[#00D1B2]/10 text-[#00D1B2] rounded-lg border border-[#00D1B2]">
                            New
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {showActive && getActivityStatus(repo).length > 0 && (
                      <div className="relative group">
                        <FaInfoCircle 
                          className="text-green-500 cursor-help hover:text-green-400 transition-colors" 
                          size={16}
                        />
                        {/* Tooltip */}
                        <div className="absolute right-0 z-50 hidden group-hover:block transform -translate-y-full -top-2
                            bg-black/90 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg
                            min-w-[200px] max-w-[300px] 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex flex-col gap-2">
                            {getActivityStatus(repo).map((reason, index) => (
                              <span 
                                key={index}
                                className="text-[10px] px-2 py-1 bg-green-500/10 text-green-400 
                                           rounded-full border border-green-500/30
                                           flex items-center justify-center
                                           whitespace-nowrap"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                          {/* Arrow */}
                          <div className="absolute -bottom-1.5 right-[6px] w-3 h-3 bg-black/90 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="w-[80%]" />
                <div className="text-[10px] text-gray-400/80 self-end">
                  (Updated:{" "}
                  {(() => {
                    const diff = new Date() - new Date(repo.updated_at);
                    const minutes = Math.floor(diff / (1000 * 60));
                    const hours = Math.floor(minutes / 60);
                    const days = Math.floor(hours / 24);
                    const weeks = Math.floor(days / 7);
                    const months = Math.floor(days / 30);

                    if (minutes < 60) return `${minutes} minutes ago`;
                    if (hours < 24) return `${hours} hours ago`;
                    if (days < 7) return `${days} days ago`;
                    if (weeks < 4) return `${weeks} weeks ago`;
                    return `${months} months ago`;
                  })()}
                  ) - <span className="font-semibold">Size:</span> {(repo.size / 1024).toFixed(2)} MB 
                </div>
              </div>
              <p className="text-[12px] text-gray-400/80">{repo.description}</p>
            </div>

            <div className="w-full">
              {repo.language && (
                <p className="text-sm">
                  Mostly used <strong> {repo.language} </strong>
                </p>
              )}
              <div className="flex items-end justify-between w-full gap-2">
                <div>
                  <p className="flex items-center space-x-5 text-sm">
                    <strong>
                      <FaStar className="text-yellow-400" />
                    </strong>{" "}
                    <span>{repo.stargazers_count}</span>
                  </p>
                  <p className="flex items-center space-x-5 text-sm">
                    <strong>
                      <FaCodeFork />
                    </strong>{" "}
                    <span>{repo.forks_count}</span>
                  </p>
                </div>
                <div>
                  <div className="flex items-center space-x-5">
                    {repo.homepage && (
                      <Link
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="text-[12px] flex items-center text-[#00D1B2] shadow-2xl border border-[#00D1B2] cursor-pointer rounded-[25px] px-2 py-1">
                          Visit&nbsp;
                          <FaExternalLinkAlt />
                        </span>
                      </Link>
                    )}
                    {!repo.homepage && repo.html_url.includes("github.io") && (
                      <Link
                        href={`https://${repo.owner.login}.github.io/${repo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=""
                      >
                        <span className="flex items-center">
                          <FaExternalLinkAlt />
                        </span>
                      </Link>
                    )}
                    <Link
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline"
                    >
                      <span className="flex items-center">
                        <FaGithub />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                
                // Show first page, current page, last page, and pages around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className={`cursor-pointer ${
                          currentPage === pageNumber 
                            ? 'text-[#00D1B2] border-[#00D1B2]' 
                            : ''
                        }`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis for gaps
                if (
                  (pageNumber === currentPage - 2 && pageNumber > 2) ||
                  (pageNumber === currentPage + 2 && pageNumber < totalPages - 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
