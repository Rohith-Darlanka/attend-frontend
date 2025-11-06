import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import authApi from '../api/authApi';

export default function MLModelsDashboard({ courseId = null, sessionId = null }) {
  const [selectedModel, setSelectedModel] = useState('linear-regression');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [courseId, sessionId]);

  const loadData = async () => {
    try {
      if (courseId) {
        const res = await authApi.get('/sessions/');
        const courseSessions = res.data.filter(s => s.course_id_copy === courseId);
        setSessions(courseSessions);
      } else if (sessionId) {
        const res = await authApi.get(`/sessions/${sessionId}/`);
        setSessions([res.data]);
      } else {
        const res = await authApi.get('/sessions/');
        setSessions(res.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load session data');
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      runMLModel(selectedModel);
    }
  }, [selectedModel, sessions]);

  const runMLModel = async (model) => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      let payload = { sessions };
      
      switch (model) {
        case 'linear-regression':
          endpoint = '/ml/linear-regression/';
          break;
        case 'random-forest':
          endpoint = '/ml/random-forest/';
          break;
        case 'kmeans':
          endpoint = '/ml/kmeans/';
          payload.n_clusters = 4;
          break;
        default:
          setError('Invalid model selected');
          setLoading(false);
          return;
      }
      
      const response = await authApi.post(endpoint, payload);
      console.log('ML Response:', response.data); // Debug log
      setPredictions(response.data);
    } catch (error) {
      console.error('ML Model error:', error);
      setError(error.response?.data?.error || 'Failed to run ML model');
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  const models = [
    { 
      id: 'linear-regression', 
      name: 'Linear Regression', 
      icon: '', 
      desc: 'Predict future attendance trends',
      category: 'Regression',
      badge: 'scikit-learn'
    },
    { 
      id: 'random-forest', 
      name: 'Random Forest', 
      icon: '', 
      desc: 'Classify student risk levels',
      category: 'Classification',
      badge: 'scikit-learn'
    },
    { 
      id: 'kmeans', 
      name: 'K-Means Clustering', 
      icon: '', 
      desc: 'Group students by performance',
      category: 'Clustering',
      badge: 'scikit-learn'
    }
  ];

  if (sessions.length === 0) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10"></div>
        <div className="relative text-center py-24 bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl">
          <div className="text-7xl mb-6"></div>
          <h3 className="text-2xl font-bold text-white mb-3">No Data Available or wait</h3>
          <p className="text-gray-500 text-lg">Create sessions to start using ML models</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Model Selection */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
        <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                 Machine Learning Models
              </h2>
              <p className="text-sm text-gray-500">scikit-learn</p>
            </div>
            <div className="text-sm text-gray-500">
              {sessions.length} sessions analyzed
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`relative group/btn overflow-hidden transition-all duration-300 ${
                  selectedModel === model.id ? 'scale-105' : ''
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl blur transition-opacity duration-300 ${
                  selectedModel === model.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 opacity-30'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-20'
                }`}></div>
                <div className={`relative p-6 rounded-2xl transition-all duration-300 text-left ${
                  selectedModel === model.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50'
                    : 'bg-gray-900/50 border border-gray-800 group-hover/btn:border-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-4xl">{model.icon}</div>
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-md text-xs font-bold">
                      {model.badge}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded-md font-semibold">
                      {model.category}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{model.name}</h3>
                  <p className="text-gray-500 text-sm">{model.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Display */}
      {error && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-red-950/50 backdrop-blur-xl border border-red-900 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-lg font-medium">Running ML Model...</p>
            <p className="text-gray-600 text-sm mt-2">Processing with scikit-learn</p>
          </div>
        </div>
      ) : predictions ? (
        <div className="space-y-6">
          {selectedModel === 'linear-regression' && <LinearRegressionResults data={predictions} />}
          {selectedModel === 'random-forest' && <RandomForestResults data={predictions} />}
          {selectedModel === 'kmeans' && <KMeansResults data={predictions} />}
        </div>
      ) : null}
    </div>
  );
}

// Linear Regression Results Component
function LinearRegressionResults({ data }) {
  // Add safety check for data
  if (!data || !data.metrics) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-20"></div>
        <div className="relative bg-red-950/50 backdrop-blur-xl border border-red-900 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Invalid Data</h3>
          <p className="text-gray-400">Unable to display Linear Regression results</p>
        </div>
      </div>
    );
  }

  const trendColors = {
    'Improving': { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30', text: 'text-green-400', icon: '' },
    'Declining': { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-400', icon: '📉' },
    'Stable': { bg: 'from-blue-600/20 to-indigo-600/20', border: 'border-blue-500/30', text: 'text-blue-400', icon: '➡️' }
  };
  
  // Default to Stable if trend is undefined or not found
  const color = trendColors[data.trend] || trendColors['Stable'];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10"></div>
      <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl"></span>
            Linear Regression Analysis
          </h3>
          <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-bold">
            scikit-learn
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">R² Score</p>
            <p className="text-4xl font-bold text-white">{data.metrics?.r2_score || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Slope</p>
            <p className="text-3xl font-bold text-white font-mono">{data.metrics?.slope || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Rate of change</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Intercept</p>
            <p className="text-3xl font-bold text-white font-mono">{data.metrics?.intercept || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Starting point</p>
          </div>
          <div className={`bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl p-6`}>
            <p className="text-gray-400 text-sm mb-2">Trend</p>
            <p className={`text-2xl font-bold ${color.text}`}>
              {color.icon} {data.trend || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Direction</p>
          </div>
        </div>

        {data.metrics?.equation && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-white mb-2">Regression Equation</h4>
            <p className="text-2xl font-mono text-purple-400 font-bold">{data.metrics.equation}</p>
          </div>
        )}

        {data.historical_data && data.historical_data.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Historical Fit</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.historical_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
                <Scatter dataKey="actual" fill="#10b981" name="Actual %" />
                <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} name="Predicted %" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {data.future_predictions && data.future_predictions.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Future Predictions</h4>
            <div className="space-y-3">
              {data.future_predictions.map((pred, i) => (
                <div key={i} className="flex justify-between items-center bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-purple-400">#{i + 1}</span>
                    <span className="text-white font-bold">{pred.session}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{pred.predicted}%</div>
                    <div className="text-sm text-gray-500">Confidence: {pred.confidence}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Random Forest Results Component
function RandomForestResults({ data }) {
  // Add safety checks for data structure
  if (!data || !data.metrics) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-20"></div>
        <div className="relative bg-red-950/50 backdrop-blur-xl border border-red-900 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Invalid Data</h3>
          <p className="text-gray-400">Unable to display Random Forest results</p>
        </div>
      </div>
    );
  }

  const featureImportance = data.feature_importance || {};
  const passStudents = data.pass_students || [];
  const failStudents = data.fail_students || [];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10"></div>
      <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl"></span>
            Random Forest Classification
          </h3>
          <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-bold">
            scikit-learn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Accuracy</p>
            <p className="text-5xl font-bold text-white">{data.metrics.accuracy || 0}%</p>
            <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Trees</p>
            <p className="text-5xl font-bold text-white">{data.metrics.n_estimators || 100}</p>
            <p className="text-xs text-gray-500 mt-1">Ensemble size</p>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Pass</p>
            <p className="text-5xl font-bold text-white">{data.metrics.pass_predictions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Students</p>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Fail</p>
            <p className="text-5xl font-bold text-white">{data.metrics.fail_predictions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Students</p>
          </div>
        </div>

        {Object.keys(featureImportance).length > 0 && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">Feature Importance</h4>
            <div className="space-y-3">
              {Object.entries(featureImportance).map(([feature, importance]) => (
                <div key={feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{feature}</span>
                    <span className="text-purple-400 font-bold">{importance}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${importance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Pass Predictions</h4>
              <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg font-bold">
                {passStudents.length}
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {passStudents.map(student => (
                <div key={student.roll} className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-mono font-bold">{student.roll}</span>
                    <span className="text-green-400 font-bold">{student.attendance_rate}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">Confidence: {student.confidence}%</div>
                    <div className="text-gray-400">Consistency: {student.consistency}%</div>
                  </div>
                </div>
              ))}
              {passStudents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No pass predictions</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Fail Predictions</h4>
              <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg font-bold">
                {failStudents.length}
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {failStudents.map(student => (
                <div key={student.roll} className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-mono font-bold">{student.roll}</span>
                    <span className="text-red-400 font-bold">{student.attendance_rate}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">Confidence: {student.confidence}%</div>
                    <div className="text-gray-400">Consistency: {student.consistency}%</div>
                  </div>
                </div>
              ))}
              {failStudents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No fail predictions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// K-Means Results Component
function KMeansResults({ data }) {
  if (!data || !data.metrics || !data.clusters) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-20"></div>
        <div className="relative bg-red-950/50 backdrop-blur-xl border border-red-900 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">Invalid Data</h3>
          <p className="text-gray-400">Unable to display K-Means results</p>
        </div>
      </div>
    );
  }

  const clusterColors = [
    { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/30', text: 'text-green-400' },
    { bg: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    { bg: 'from-yellow-600/20 to-orange-600/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-400' }
  ];

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-10"></div>
      <div className="relative bg-black/80 backdrop-blur-xl border border-gray-900 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl"></span>
            K-Means Clustering
          </h3>
          <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-bold">
            scikit-learn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Clusters</p>
            <p className="text-5xl font-bold text-white">{data.metrics.n_clusters}</p>
            <p className="text-xs text-gray-500 mt-1">K value</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Silhouette Score</p>
            <p className="text-4xl font-bold text-white">{data.metrics.silhouette_score}</p>
            <p className="text-xs text-gray-500 mt-1">Cluster quality</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Students</p>
            <p className="text-5xl font-bold text-white">{data.metrics.total_students}</p>
            <p className="text-xs text-gray-500 mt-1">Total analyzed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(data.clusters).map(([key, cluster], idx) => {
            const color = clusterColors[idx % clusterColors.length];
            return (
              <div key={key} className={`bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-bold ${color.text}`}>{cluster.name}</h4>
                  <span className={`px-4 py-2 bg-black/30 ${color.text} rounded-lg font-bold`}>
                    {cluster.size}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-gray-400 mb-1">Avg Rate</p>
                    <p className={`font-bold ${color.text}`}>{cluster.center.attendance_rate}%</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-gray-400 mb-1">Consistency</p>
                    <p className={`font-bold ${color.text}`}>{cluster.center.consistency}%</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-gray-400 mb-1">Sessions</p>
                    <p className={`font-bold ${color.text}`}>{cluster.center.avg_sessions}</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cluster.students.slice(0, 10).map(student => (
                    <div key={student.roll} className={`bg-black/30 border ${color.border} rounded-lg p-3 flex justify-between items-center`}>
                      <span className={`${color.text} font-mono font-bold`}>{student.roll}</span>
                      <span className={`${color.text} text-sm`}>{student.attendance_rate}%</span>
                    </div>
                  ))}
                  {cluster.students.length > 10 && (
                    <p className="text-gray-500 text-sm text-center pt-2">+{cluster.students.length - 10} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { MLModelsDashboard };