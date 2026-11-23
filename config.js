// Jedino mesto gde se pominje GitHub nalog. Sve ostalo čita odavde.
const SITE = (function () {
  const owner = "bosnicaleksa";
  const repo = "sveska";
  return Object.freeze({
    owner: owner,
    repo: repo,
    branch: "main",
    profileUrl: "https://github.com/" + owner,
    apiBase: "https://api.github.com/repos/" + owner + "/" + repo
  });
})();
