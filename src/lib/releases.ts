import { Octokit } from "@octokit/rest";
import { Endpoints } from "@octokit/types";

export type ReposListReleasesResponseData = Endpoints["GET /repos/:owner/:repo/releases"]["response"]["data"][0];

const octokit = new Octokit();

export const GH_REGEX = new RegExp("(?:https?://)?github.com/([A-z0-9-_]+)/([A-z0-9-_]+)/?");

const PAGE_REGEX = /&page=(\d+)/;

export const validGitHubRepoURL = (value: string) => {
  const valid = GH_REGEX.test(value);

  if (!valid) {
    return "Please enter a valid GitHub URL";
  }
};

export const getReleases = async (
  owner: string,
  repo: string,
  progress: (completed: number, total: number, remaining: number, limit: number, reset: number) => void
) => {
  let page = 1;

  const results: ReposListReleasesResponseData[] = [];

  const pageResult = await octokit.repos.listReleases({ owner, repo, per_page: 100, page: 1 });

  results.push(...pageResult.data);

  const link = pageResult.headers.link;

  if (!link) {
    return results;
  }

  const [, last] = link.split(",");

  const pageParts = PAGE_REGEX.exec(last);

  if (pageParts === null) {
    console.log("Unable to extract last page # from", last);
    return results;
  }

  const numPages = Number(pageParts[1]);

  while (page < numPages) {
    page++;

    const pageResult = await octokit.repos.listReleases({ owner, repo, per_page: 100, page });

    results.push(...pageResult.data);

    const rateLimitRemaining = pageResult.headers["x-ratelimit-remaining"] ?? 0;
    const rateLimit = pageResult.headers["x-ratelimit-limit"] ?? 0;
    const rateLimitReset = pageResult.headers["x-ratelimit-reset"] ?? 0;

    progress(page, numPages, Number(rateLimitRemaining), Number(rateLimit), Number(rateLimitReset));

    if (rateLimitRemaining === 0) {
      return results;
    }
  }

  return results;
};
