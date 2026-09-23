import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getHighlighter } from 'shiki';
import { CONFIG, I18N } from '../config/coderabbit.config';

const CodeRabbit = ({
  repoUrl = CONFIG.github.defaultRepo,
  prNumber = CONFIG.github.defaultPR,
  githubToken = import.meta.env[CONFIG.github.tokenEnvKey] || null,
  diffData = [],
  onReviewSubmit,
  onFetchError,
  autoFetch = true,
  isLoading: externalLoading = false,
  theme = CONFIG.ui.defaultTheme,
  lang = CONFIG.ui.defaultLang
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState({});
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [fetchedDiff, setFetchedDiff] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [highlighter, setHighlighter] = useState(null);
  const [isHighlighting, setIsHighlighting] = useState(false);

  // ── Init Highlighter from Config ─────────────────────────────
  useEffect(() => {
    const loadHighlighter = async () => {
      setIsHighlighting(true);
      try {
        const highlighterInstance = await getHighlighter({
          themes: [theme === 'dark' ? 'github-dark' : 'github-light'],
          langs: CONFIG.highlighter.langs
        });
        setHighlighter(highlighterInstance);
      } catch (err) {
        console.warn('Shiki failed to load:', err);
      } finally {
        setIsHighlighting(false);
      }
    };
    loadHighlighter();
  }, [theme]);

  // ── Language Detection via Config ─────────────────────────────
  const detectLang = useCallback((filePath) => {
    if (!filePath) return 'plaintext';
    const ext = filePath.split('.').pop().toLowerCase();
    return CONFIG.langMap[ext] || 'plaintext';
  }, []);

  // ── Highlight Single Line ────────────────────────────────────
  const highlightLine = useCallback((lineContent, filePath) => {
    if (!highlighter || lineContent.trim() === '') return lineContent;
    const lang = detectLang(filePath);
    try {
      return highlighter.codeToHtml(lineContent, {
        lang,
        theme: theme === 'dark' ? 'github-dark' : 'github-light'
      }).replace(/^<pre[^>]*>/, '').replace(/<\/pre>\s*$/, '');
    } catch {
      return lineContent;
    }
  }, [highlighter, detectLang, theme]);

  // ── Translations ──────────────────────────────────────────────
  const i18n = I18N[lang];

  // ── Parse Repo URL ────────────────────────────────────────────
  const parseRepoUrl = useCallback((url) => {
    try {
      const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?\/?$/);
      return match ? { owner: match[1], repo: match[2] } : null;
    } catch { return null; }
  }, []);

  // ── Parse Patch ───────────────────────────────────────────────
  const parsePatch = useCallback((patch) => {
    if (!patch) return [];
    const lines = [];
    const patchLines = patch.split('\n');
    let oldLine = 0, newLine = 0;
    let inHunk = false;

    for (const line of patchLines) {
      const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (hunkMatch) {
        oldLine = parseInt(hunkMatch[1], 10);
        newLine = parseInt(hunkMatch[2], 10);
        inHunk = true;
        lines.push({ type: 'hunk', content: line, oldNum: null, newNum: null });
        continue;
      }
      if (!inHunk) continue;
      if (line.startsWith('+')) {
        lines.push({ type: 'add', content: line, oldNum: null, newLine });
        newLine++;
      } else if (line.startsWith('-')) {
        lines.push({ type: 'del', content: line, oldLine, newNum: null });
        oldLine++;
      } else {
        lines.push({ type: 'same', content: line, oldLine, newLine });
        oldLine++; newLine++;
      }
    }
    return lines;
  }, []);

  // ── Fetch PR Diff ─────────────────────────────────────────────
  const fetchPRDiff = useCallback(async () => {
    const repoInfo = parseRepoUrl(repoUrl);
    if (!repoInfo || !prNumber) {
      setError('Invalid repository or PR number');
      return;
    }
    setIsFetching(true); setError(null);
    try {
      const { owner, repo } = repoInfo;
      const headers = { ...CONFIG.github.headers };
      if (githubToken) headers['Authorization'] = `token ${githubToken}`;
      const filesRes = await fetch(
        `${CONFIG.github.apiBase}/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        { headers }
      );
      if (!filesRes.ok) throw new Error(`GitHub API: ${filesRes.status}`);
      const filesData = await filesRes.json();
      setFetchedDiff(filesData.map(file => ({
        path: file.filename,
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        status: file.status,
        lines: parsePatch(file.patch)
      })));
    } catch (err) {
      const msg = err.message || 'Unknown error';
      setError(msg); onFetchError?.(msg);
    } finally { setIsFetching(false); }
  }, [repoUrl, prNumber, githubToken, parseRepoUrl, parsePatch, onFetchError]);

  useEffect(() => {
    if (autoFetch && repoUrl && prNumber && diffData.length === 0) fetchPRDiff();
  }, [autoFetch, repoUrl, prNumber, diffData.length, fetchPRDiff]);

  const activeDiff = diffData.length > 0 ? diffData : fetchedDiff;
  const isLoading = externalLoading || isFetching || isHighlighting;

  // ── Comment & Submit ─────────────────────────────────────────
  const handleCommentChange = useCallback((lineKey, text) => {
    setComments(prev => ({ ...prev, [lineKey]: text }));
  }, []);

  const handleSubmit = useCallback(async (summaryComment = '') => {
    const payload = {
      repoUrl, prNumber, status: reviewStatus, comments,
      summary: summaryComment, timestamp: new Date().toISOString()
    };
    if (githubToken && reviewStatus !== 'pending') {
      const repoInfo = parseRepoUrl(repoUrl);
      if (repoInfo) {
        try {
          const { owner, repo } = repoInfo;
          const eventMap = { approved: 'APPROVE', changes_requested: 'REQUEST_CHANGES', pending: 'PENDING' };
          await fetch(
            `${CONFIG.github.apiBase}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
            {
              method: 'POST',
              headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': CONFIG.github.headers.accept,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                event: eventMap[reviewStatus],
                body: summaryComment,
                comments: Object.entries(comments)
                  .filter(([, body]) => body.trim())
                  .map(([lineKey, body]) => {
                    const [path, ...rest] = lineKey.split(':');
                    const idx = parseInt(rest[0], 10);
                    const lineEntry = activeDiff.find(f => f.path === path)?.lines?.[idx];
                    return { path, body, line: lineEntry?.newNum || lineEntry?.oldNum };
                  })
              })
            }
          );
        } catch (apiErr) { console.warn('Submission skipped:', apiErr); }
      }
    }
    onReviewSubmit?.(payload);
  }, [repoUrl, prNumber, reviewStatus, comments, githubToken, parseRepoUrl, activeDiff, onReviewSubmit]);

  const themeClasses = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900';

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={`coderabbit-container ${themeClasses} p-5 rounded-lg shadow max-w-7xl mx-auto`}>
      <header className="mb-6 border-b pb-3">
        <h2 className="text-xl font-bold">{i18n.title}</h2>
        <p className="text-sm text-gray-500">
          {repoUrl} · PR #{prNumber}
          {githubToken && <span className="ml-2 text-green-500">✓ Connected</span>}
          {highlighter && <span className="ml-2 text-emerald-500">✓ {i18n.highlighting}</span>}
        </p>
        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 rounded flex justify-between">
            <span>{i18n.fetchError}: {error}</span>
            <button onClick={fetchPRDiff} className="ml-3 px-2 py-1 bg-red-100 rounded text-sm">
              {i18n.fetchRetry}
            </button>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="py-10 text-center">{i18n.loading}</div>
      ) : activeDiff.length === 0 ? (
        <p className="text-gray-400 text-center py-8">{i18n.noChanges}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File Sidebar */}
          <aside className="lg:col-span-1 border-r pr-3">
            <h3 className="font-semibold mb-2">{i18n.fileList}</h3>
            <ul className="space-y-1">
              {activeDiff.map((file, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                      selectedFile?.path === file.path
                        ? 'bg-blue-100 dark:bg-blue-900 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="block truncate">{file.path}</span>
                    <span className="mt-1">
                      <span className="text-green-500">+{file.additions}</span>
                      <span className="text-red-500 ml-1">-{file.deletions}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Diff Viewer */}
          <main className="lg:col-span-3 pl-3">
            {selectedFile ? (
              <>
                <h3 className="font-semibold mb-3">{selectedFile.path} — {i18n.changes}</h3>
                <div className="overflow-x-auto mb-5">
                  <table className="w-full text-sm border" style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      {selectedFile.lines?.map((line, idx) => {
                        const lineKey = `${selectedFile.path}:${idx}`;
                        const highlighted = useMemo(() => {
                          if (!highlighter || line.type === 'hunk') return null;
                          return highlightLine(line.content.replace(/^[ +-]/, ''), selectedFile.path);
                        }, [highlighter, line.content, line.type, selectedFile.path]);

                        return (
                          <tr
                            key={idx}
                            className={
                              line.type === 'add' ? 'bg-green-50 dark:bg-green-950' :
                              line.type === 'del' ? 'bg-red-50 dark:bg-red-950' :
                              line.type === 'hunk' ? 'bg-gray-50 dark:bg-gray-900 text-gray-500' : ''
                            }
                          >
                            <td className="text-gray-400 px-2 border-r w-12 select-none text-right">
                              {line.oldNum ?? '-'}
                            </td>
                            <td className="text-gray-400 px-2 border-r w-12 select-none text-right">
                              {line.newNum ?? '-'}
                            </td>
                            <td className="px-2 whitespace-pre font-mono" style={{ width: 'calc(100% - 224px)' }}>
                              {highlighted ? (
                                <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                              ) : (
                                <span className={
                                  line.type === 'add' ? 'text-green-700 dark:text-green-400' :
                                  line.type === 'del' ? 'text-red-700 dark:text-red-400' : ''
                                }>
                                  {line.content}
                                </span>
                              )}
                            </td>
                            <td className="w-40 px-1">
                              {line.type !== 'hunk' && CONFIG.ui.enableComments && (
                                <input
                                  type="text"
                                  placeholder={i18n.addComment}
                                  value={comments[lineKey] || ''}
                                  onChange={(e) => handleCommentChange(lineKey, e.target.value)}
                                  className="w-full text-xs border rounded px-1 py-1 bg-transparent dark:bg-gray-800"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 mt-4">
                  <textarea
                    placeholder={i18n.singleComment}
                    className="w-full border rounded p-2 text-sm dark:bg-gray-800"
                    rows={3}
                    id="review-summary"
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="border rounded px-3 py-2 dark:bg-gray-800"
                    >
                      <option value="pending">{i18n.pending}</option>
                      <option value="approved">{i18n.approve}</option>
                      <option value="changes_requested">{i18n.requestChanges}</option>
                    </select>
                    <button
                      onClick={() => {
                        const summary = document.getElementById('review-summary')?.value || '';
                        handleSubmit(summary);
                      }}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {i18n.submitReview}
                    </button>
                    <button
                      onClick={fetchPRDiff}
                      disabled={isFetching}
                      className="px-3 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Select a file to view changes</p>
            )}
          </main>
        </div>
      )}

      <style>{`
        .shiki { background: transparent !important; padding: 0 !important; display: inline; }
        .shiki-line { display: inline !important; }
        pre.shiki { margin: 0; }
      `}</style>
    </div>
  );
};

CodeRabbit.propTypes = {
  repoUrl: PropTypes.string,
  prNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  githubToken: PropTypes.string,
  diffData: PropTypes.array,
  onReviewSubmit: PropTypes.func,
  onFetchError: PropTypes.func,
  autoFetch: PropTypes.bool,
  isLoading: PropTypes.bool,
  theme: PropTypes.oneOf(['light', 'dark']),
  lang: PropTypes.oneOf(['en', 'th'])
};

export default CodeRabbit;
