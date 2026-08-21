#!/usr/bin/env node
/**
 * sponsorship-log-sync.ts
 *
 * Pulls current GitHub Sponsors data via the GitHub GraphQL API and syncs
 * it into a markdown log (default: dev-notes/sponsorship-log.md).
 *
 * Designed to run nightly via GitHub Actions (see
 * .github/workflows/sponsorship-log-nightly.yml) but works fine locally.
 *
 * Requirements:
 *   - Node 18+ (native fetch)
 *   - Env var GITHUB_TOKEN with `read:user` and `read:org` scopes
 *     (sponsors data requires a token with sponsorship read access)
 *
 * Usage:
 *   GITHUB_TOKEN=xxx npx tsx scripts/sponsorship-log-sync.ts --login=1napz
 *   GITHUB_TOKEN=xxx npx tsx scripts/sponsorship-log-sync.ts --login=1napz --out=dev-notes/sponsorship-log.md --dry-run
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

interface SponsorNode {
  createdAt: string;
  sponsorEntity: {
    login: string;
    name: string | null;
    url: string;
  };
  tier: {
    name: string;
    monthlyPriceInDollars: number;
  } | null;
  isOneTimePayment: boolean;
}

interface SponsorsResponse {
  data: {
    user: {
      sponsorshipsAsMaintainer: {
        totalCount: number;
        nodes: SponsorNode[];
      };
    } | null;
    organization: {
      sponsorshipsAsMaintainer: {
        totalCount: number;
        nodes: SponsorNode[];
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

const QUERY = /* GraphQL */ `
  query SponsorsForAccount($login: String!) {
    user(login: $login) {
      sponsorshipsAsMaintainer(first: 100, includePrivate: true) {
        totalCount
        nodes {
          createdAt
          isOneTimePayment
          sponsorEntity {
            ... on User {
              login
              name
              url
            }
            ... on Organization {
              login
              name
              url
            }
          }
          tier {
            name
            monthlyPriceInDollars
          }
        }
      }
    }
    organization(login: $login) {
      sponsorshipsAsMaintainer(first: 100, includePrivate: true) {
        totalCount
        nodes {
          createdAt
          isOneTimePayment
          sponsorEntity {
            ... on User {
              login
              name
              url
            }
            ... on Organization {
              login
              name
              url
            }
          }
          tier {
            name
            monthlyPriceInDollars
          }
        }
      }
    }
  }
`;

interface CliArgs {
  login: string;
  out: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: Record<string, string | boolean> = {};
  for (const raw of argv.slice(2)) {
    const [key, value] = raw.replace(/^--/, "").split("=");
    args[key] = value ?? true;
  }

  if (typeof args.login !== "string") {
    throw new Error(
      "Missing required --login=<github-username-or-org> argument"
    );
  }

  return {
    login: args.login,
    out: typeof args.out === "string" ? args.out : "dev-notes/sponsorship-log.md",
    dryRun: Boolean(args["dry-run"]),
  };
}

async function fetchSponsors(login: string, token: string): Promise<SponsorNode[]> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "sponsorship-log-sync",
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as SponsorsResponse;

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  const fromUser = json.data.user?.sponsorshipsAsMaintainer.nodes ?? [];
  const fromOrg = json.data.organization?.sponsorshipsAsMaintainer.nodes ?? [];

  // Exactly one of user/organization will resolve for a given login.
  return [...fromUser, ...fromOrg];
}

function formatRow(node: SponsorNode): string {
  const date = new Date(node.createdAt).toISOString().slice(0, 10);
  const name = node.sponsorEntity.name ?? node.sponsorEntity.login;
  const tier = node.tier
    ? `$${node.tier.monthlyPriceInDollars}/mo — ${node.tier.name}`
    : node.isOneTimePayment
      ? "one-time"
      "n/a";
  return `| ${date} | [${node.sponsorEntity.login}](${node.sponsorEntity.url}) | ${name} | ${tier} |`;
}

function buildMarkdown(login: string, nodes: SponsorNode[]): string {
  const sorted = [...nodes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const totalMonthly = sorted.reduce(
    (sum, n) => sum + (n.tier?.monthlyPriceInDollars ?? 0),
    0
  );

  const header = [
    "---",
    "title: Sponsorship Log",
    `owner: ${login}`,
    `generated_by: sponsorship-log-sync.ts`,
    `last_synced: ${new Date().toISOString()}`,
    "---",
    "",
    `# Sponsorship Log — ${login}`,
    "",
    `- **Active sponsors:** ${sorted.length}`,
    `- **Estimated recurring monthly total:** $${totalMonthly}`,
    "",
    "| Since | Login | Name | Tier |",
    "|---|---|---|---|",
  ];

  const rows = sorted.map(formatRow);

  return [...header, ...rows, ""].join("\n");
}

async function main(): Promise<void> {
  const { login, out, dryRun } = parseArgs(process.argv);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }

  const nodes = await fetchSponsors(login, token);
  const markdown = buildMarkdown(login, nodes);

  if (dryRun) {
    console.log(markdown);
    return;
  }

  await mkdir(dirname(out), { recursive: true });

  // Only write (and let the caller commit) if content actually changed,
  // so nightly runs don't create empty diffs.
  let previous = "";
  try {
    previous = await readFile(out, "utf8");
  } catch {
    // file doesn't exist yet — that's fine
  }

  const previousBody = previous.replace(/last_synced:.*\n/, "");
  const nextBody = markdown.replace(/last_synced:.*\n/, "");

  if (previousBody === nextBody) {
    console.log(`No sponsorship changes detected for ${login}. Skipping write.`);
    return;
  }

  await writeFile(out, markdown, "utf8");
  console.log(`Wrote ${nodes.length} sponsors to ${out}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
