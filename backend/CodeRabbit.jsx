- name: Run CodeRabbit Review
  uses: coderabbitai/ai-pr-reviewer@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
