import { Octokit } from "octokit";

const octokit = new Octokit({ 
  auth: 'YOUR-TOKEN',
});

async function getChangedFiles({owner, repo, pullNumber}) {
  let filesChanged = []

  try {
    const iterator = octokit.paginate.iterator("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
      owner: owner,
      repo: repo,
      pull_number: pullNumber,
      per_page: 100,
      headers: {
        "x-github-api-version": "2026-03-10",
      },
    });

    for await (const {data} of iterator) {
      filesChanged = [...filesChanged, ...data.map(fileData => fileData.filename)];
    }
  } catch (error) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    }
    console.error(error)
  }

  return filesChanged
}

async function commentIfDataFilesChanged({owner, repo, pullNumber}) {
  const changedFiles = await getChangedFiles({owner, repo, pullNumber});

  const filePathRegex = new RegExp(/\/data\//, "i");
  if (!changedFiles.some(fileName => filePathRegex.test(fileName))) {
    return;
  }

  try {
    const {data: comment} = await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner: owner,
      repo: repo,
      issue_number: pullNumber,
      body: `It looks like you changed a data file. These files are auto-generated. \n\nYou must revert any changes to data files before your pull request will be reviewed.`,
      headers: {
        "x-github-api-version": "2026-03-10",
      },
    });

    return comment.html_url;
  } catch (error) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`)
    }
    console.error(error)
  }
}

await commentIfDataFilesChanged({owner: "github", repo: "docs", pullNumber: 191});
