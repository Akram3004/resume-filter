import { useState, useEffect } from 'react';

export default function ApplicationList({ activeJobId }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeJobId) {
      fetchApplications();
    }
  }, [minScore, sortBy, sortOrder, page, activeJobId]);

  async function fetchApplications() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications?minScore=${minScore}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&jobId=${activeJobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      console.log('Fetched applications:', data);
      setApplications(data.applications);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert(`Failed to fetch applications: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Applications</h2>
      <div className="flex flex-wrap items-center mb-4 space-x-4">
        <div>
          <label className="mr-2 text-gray-600">Minimum Score:</label>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="border border-gray-300 rounded p-1 w-20"
          />
        </div>
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="timestamp">Date</option>
            <option value="score">Score</option>
          </select>
        </div>
        <div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <p className="text-center text-gray-600">Loading applications...</p>
      ) : (
        <>
          <ul className="space-y-4">
            {applications.map((application) => (
              <li key={application._id} className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <p><strong className="text-gray-700">Applicant Email:</strong> {application.applicantEmail}</p>
                  <p><strong className="text-gray-700">Job Title:</strong> {application.jobTitle}</p>
                  <p><strong className="text-gray-700">Score:</strong> <span className="text-lg font-semibold">{application.score}</span></p>
                  <p><strong className="text-gray-700">Date:</strong> {new Date(application.timestamp).toLocaleString()}</p>
                </div>
                <div className="mt-4">
                  <a
                    href={`/api/download-resume?emailId=${application.emailId}`}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Resume
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}