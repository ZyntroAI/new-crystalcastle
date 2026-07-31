documentation


# Configuring larger runners for default setup

Run code scanning default setup more quickly on bigger codebases using larger runners.

> \[!NOTE]
> Support for larger runners for code scanning default setup is currently in public preview and subject to change.

## Provisioning organization-level larger runners for default setup

1. Add a larger runner to your organization. See [Managing larger runners](/en/actions/using-github-hosted-runners/about-larger-runners/managing-larger-runners#adding-a-larger-runner-to-an-organization).

   * To add a custom label to your larger runner, give the runner a name that matches that label. You can use this custom label when you configure default setup with larger runners.

2. By default, all repositories in your organization have access to organization-level runners, meaning every repository can use your larger runner. For information on granting only select repositories access to a larger runner, see [Managing larger runners](/en/actions/using-github-hosted-runners/about-larger-runners/managing-larger-runners#allowing-repositories-to-access-larger-runners).

3. You can now configure default setup for your organization and repositories, and your larger runner will automatically pick up code scanning jobs. For more information on configuring default setup, see [Configuring default setup for code scanning](/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning) and [Configuring default setup for code scanning at scale](/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning-at-scale).

## Extra steps for Swift analysis

Currently, Swift analysis is not available on larger runners for default setup. Additionally, if your repository has access to a runner with the `code-scanning` label, such as a larger runner provisioned for default setup, default setup workflows will *only* use runners labeled `code-scanning`. If you would like to configure default setup on larger runners *and* analyze Swift, you have two options:

* Provision a self-hosted macOS runner with the `code-scanning` label in addition to your larger runner. For more information, see [Adding self-hosted runners](/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners#adding-a-self-hosted-runner-to-a-repository).
* Ensure any repositories containing Swift *do not* have access to runners with the label `code-scanning`. Default setup workflows for that repository will only use standard runners
