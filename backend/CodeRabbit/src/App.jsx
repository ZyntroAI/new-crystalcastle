import CodeRabbit from './components/CodeRabbit';

function App() {
  const handleReviewSubmit = (payload) => {
    console.log('✅ Review submitted:', payload);
  };

  const handleFetchError = (err) => {
    console.error('❌ Fetch error:', err);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <CodeRabbit
        onReviewSubmit={handleReviewSubmit}
        onFetchError={handleFetchError}
        // Override defaults here if needed
        // repoUrl="https://github.com/OtherOrg/other-repo"
        // prNumber="99"
        // theme="dark"
        // lang="th"
      />
    </div>
  );
}

export default App;
