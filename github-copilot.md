Based on the text provided from the GitHub Copilot pricing and FAQ page, here are the key instructions and guidelines for using GitHub Copilot, categorized by user needs:

### **1. Choosing the Right Plan**
*   **Free Plan:** Best for getting started. Includes **2,000 completions/month**, access to specific models (Haiku 4.5, GPT-5 mini), Copilot CLI, and community support. No credit card required.
*   **Pro ($10/user/month):** For everyday coding. Includes **unlimited** code completions, access to Cloud agent, code review, and third-party agents (Claude Code, Codex). Includes $15 in monthly AI credits.
*   **Pro+ ($39/user/month):** For complex development. Includes everything in Pro plus **premium models** (e.g., Opus), audit logs, and **4x+ usage** of Pro ($70 in credits).
*   **Max ($100/user/month):** For high-volume agent workflows. Includes priority access to new models, **2.9x+ usage** of Pro+, and **$200 in credits**.
*   **Business/Enterprise:** For organizations. Includes license management, policy controls, IP indemnity, and (for Enterprise) integration with GitHub.com and custom model fine-tuning.

### **2. Setup and Installation**
*   **Supported Platforms:** GitHub.com, VS Code, Visual Studio, Xcode, JetBrains IDEs, Neovim, Eclipse, Raycast, SQL Server Management Studio, and Zed.
*   **How to Enable:**
    *   Copilot is **opt-in** only. You must manually enable it in your editor settings or GitHub account.
    *   You can configure usage directly in the editor to enable/disable it at any time.
    *   You can control which file types Copilot is active for.
*   **Upgrade Path:** If you are on Free, upgrade to Pro via the **Copilot settings page** or the marketing page.

### **3. Managing Usage and Billing**
*   **GitHub AI Credits:**
    *   Used for chat, agents, CLI, Spaces, and Spark.
    *   **1 AI Credit = $0.01 USD**.
    *   **Code completions and next edits do NOT use credits** (they are unlimited on paid plans).
    *   Credits reset monthly.
*   **When You Hit Your Limit:**
    *   Wait for the next cycle (reset).
    *   Set a **dollar budget** for paid usage (credits draw down at $0.01 each).
    *   Switch to a less expensive/lightweight model.
*   **Admin Controls (Business/Enterprise):**
    *   Admins can set usage limits and decide if paid overages are allowed.
    *   Admins can enable/disable Copilot code review for users *without* a license (billed as AI credits to the org).
    *   Network firewalls can be used to allow/block specific Copilot tiers.

### **4. Privacy and Data Control**
*   **Individual Users (Free/Pro/Pro+):**
    *   GitHub **may use** your prompts, suggestions, and code snippets to **train AI models** unless you opt out.
    *   **How to Opt Out:** Go to `https://github.com/settings/copilot/features`. Opting out does not affect feature access.
*   **Business/Enterprise Users:**
    *   GitHub **does NOT** use your data to train models.
    *   **Data Retention:**
        *   IDE Chat/Completions: Prompts/suggestions are **not retained**.
        *   Other Access (Web/Mobile/CLI): Prompts/suggestions retained for **28 days**.
        *   Engagement data kept for **2 years**.
*   **Compliance:** Supports GDPR via a Data Protection Agreement (DPA).

### **5. Responsible AI and Security**
*   **Copyright & IP:**
    *   Copilot does **not** "copy/paste" code but generates probabilistic suggestions.
    *   Rarely (<1%), suggestions may match public code.
    *   **Filter:** Enable the **code referencing filter** (admin setting) to block suggestions matching public code over 65 lexemes (~150 chars).
    *   **Indemnity:** GitHub provides IP indemnity for unmodified suggestions if the filtering feature is enabled.
*   **Security:**
    *   Copilot includes filters to block insecure patterns (e.g., SQL injection, hardcoded credentials).
    *   **Best Practice:** Always review generated code. Do not automatically compile or run code without human oversight.
    *   Use tools like GitHub Advanced Security, Dependabot, and CodeQL alongside Copilot.

### **6. Feature Availability by Plan**
| Feature | Free | Pro | Pro+ | Max |
| :--- | :---: | :---: | :---: | :---: |
| **Code Completions** | 2,000/mo | Unlimited | Unlimited | Unlimited |
| **Agent Mode** | ❌ | ✅ | ✅ | ✅ |
| **Code Review** | ❌ | ✅ | ✅ | ✅ |
| **3rd Party Agents** | ❌ | ❌ | ✅ | ✅ |
| **Premium Models** | ❌ | ❌ | ✅ | ✅ |
| **Audit Logs** | ❌ | ❌ | ✅ | ✅ |

