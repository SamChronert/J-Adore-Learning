import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        unreviewed: filter === 'unreviewed',
        flagged: filter === 'flagged',
      };
      
      const [feedbackData, statsData] = await Promise.all([
        api.getAllFeedback(filters),
        api.getFeedbackStats()
      ]);
      
      setFeedback(feedbackData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (feedbackId) => {
    try {
      await api.markFeedbackReviewed(feedbackId);
      await loadData();
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
    }
  };

  const handleToggleFlag = async (feedbackId) => {
    try {
      await api.toggleFeedbackFlag(feedbackId);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getFeedbackTypeLabel = (type) => {
    const labels = {
      difficulty: 'Difficulty Level',
      clarity: 'Question Clarity',
      answer_issue: 'Answer Issue',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Feedback Dashboard</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.total_feedback || 0}</div>
            <div className="text-gray-600 text-sm">Total Feedback</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.unreviewed_count || 0}</div>
            <div className="text-gray-600 text-sm">Unreviewed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.flagged_count || 0}</div>
            <div className="text-gray-600 text-sm">Flagged</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Feedback
        </button>
        <button
          onClick={() => setFilter('unreviewed')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'unreviewed'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unreviewed
        </button>
        <button
          onClick={() => setFilter('flagged')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'flagged'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Flagged
        </button>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No feedback found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  item.is_flagged ? 'border-l-4 border-red-500' : ''
                }`}
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{item.username}</span>
                      <span className="text-yellow-500">{getRatingStars(item.rating)}</span>
                      {item.feedback_type && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getFeedbackTypeLabel(item.feedback_type)}
                        </span>
                      )}
                      {item.question_type === 'ai_generated' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          AI Question
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Question ID: {item.question_id}</p>
                    {item.comment && (
                      <p className="text-sm text-gray-800 mt-2">{item.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!item.admin_reviewed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkReviewed(item.id);
                        }}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFlag(item.id);
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        item.is_flagged
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {item.is_flagged ? 'Unflag' : 'Flag'}
                    </button>
                  </div>
                </div>
                {item.admin_reviewed && item.admin_notes && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                    <strong>Admin Notes:</strong> {item.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Feedback Details</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">User:</label>
                <p>{selectedFeedback.username}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Question ID:</label>
                <p>{selectedFeedback.question_id}</p>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Rating:</label>
                <p className="text-yellow-500">{getRatingStars(selectedFeedback.rating)}</p>
              </div>
              
              {selectedFeedback.feedback_type && (
                <div>
                  <label className="font-medium text-gray-700">Type:</label>
                  <p>{getFeedbackTypeLabel(selectedFeedback.feedback_type)}</p>
                </div>
              )}
              
              {selectedFeedback.comment && (
                <div>
                  <label className="font-medium text-gray-700">Comment:</label>
                  <p className="bg-gray-50 p-3 rounded">{selectedFeedback.comment}</p>
                </div>
              )}
              
              <div>
                <label className="font-medium text-gray-700">Submitted:</label>
                <p>{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                {!selectedFeedback.admin_reviewed && (
                  <button
                    onClick={() => {
                      handleMarkReviewed(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => {
                    handleToggleFlag(selectedFeedback.id);
                    setSelectedFeedback(null);
                  }}
                  className={`px-4 py-2 rounded ${
                    selectedFeedback.is_flagged
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {selectedFeedback.is_flagged ? 'Remove Flag' : 'Flag for Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;