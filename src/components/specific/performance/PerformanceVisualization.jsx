import React, { useMemo } from 'react';
import { BarChart as BarChartIcon, PieChart, TrendingUp, TrendingDown, Users, AlertCircle, Info } from 'lucide-react';

const PerformanceVisualization = ({ performanceData, passingThreshold = 75, showBars = true, displayMode = "detailed" }) => {
  // Show no data state if there's no performance data
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Info size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data Available</h3>
          <p className="text-gray-500 text-center max-w-md">
            Performance insights will appear here once students start submitting assessments.
          </p>
        </div>
      </div>
    );
  }

  // Group data for visualization
  const groupedData = useMemo(() => {
    const excellent = performanceData.filter(d => d.score >= 90);
    const good = performanceData.filter(d => d.score >= passingThreshold && d.score < 90);
    const average = performanceData.filter(d => d.score >= 60 && d.score < passingThreshold);
    const needsSupport = performanceData.filter(d => d.score > 0 && d.score < 60);
    const notSubmitted = performanceData.filter(d => d.score === 0);

    return {
      excellent,
      good,
      average,
      needsSupport,
      notSubmitted,
      total: performanceData.length
    };
  }, [performanceData, passingThreshold]);

  // Calculate percentages for the chart
  const chartData = useMemo(() => {
    const total = groupedData.total || 1; // Avoid division by zero
    return [
      { name: 'Excellent', value: groupedData.excellent.length / total * 100, color: '#10B981' },
      { name: 'Good', value: groupedData.good.length / total * 100, color: '#3B82F6' },
      { name: 'Average', value: groupedData.average.length / total * 100, color: '#F59E0B' },
      { name: 'Needs Support', value: groupedData.needsSupport.length / total * 100, color: '#EF4444' },
      { name: 'Not Submitted', value: groupedData.notSubmitted.length / total * 100, color: '#9CA3AF' }
    ];
  }, [groupedData]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const passingCount = groupedData.excellent.length + groupedData.good.length;
    const submittedCount = groupedData.total - groupedData.notSubmitted.length;
    
    return {
      passingRate: groupedData.total ? (passingCount / groupedData.total * 100).toFixed(1) : 0,
      submissionRate: groupedData.total ? (submittedCount / groupedData.total * 100).toFixed(1) : 0,
      averageScore: performanceData.length ? 
        (performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length).toFixed(1) : 0
    };
  }, [groupedData, performanceData]);

  // Render summary view (simple card view)
  if (displayMode === "summary") {
    return (
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <div className="text-xs text-green-600 mb-1">Excellent</div>
            <div className="font-bold text-green-700">{groupedData.excellent.length}</div>
            <div className="text-[10px] text-green-600">students</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">Good</div>
            <div className="font-bold text-blue-700">{groupedData.good.length}</div>
            <div className="text-[10px] text-blue-600">students</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <div className="text-xs text-yellow-600 mb-1">Average</div>
            <div className="font-bold text-yellow-700">{groupedData.average.length}</div>
            <div className="text-[10px] text-yellow-600">students</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <div className="text-xs text-red-600 mb-1">Needs Support</div>
            <div className="font-bold text-red-700">{groupedData.needsSupport.length}</div>
            <div className="text-[10px] text-red-600">students</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Not Submitted</div>
            <div className="font-bold text-gray-700">{groupedData.notSubmitted.length}</div>
            <div className="text-[10px] text-gray-600">students</div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed visualization mode
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Performance distribution visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChartIcon size={20} className="text-blue-500" />
          Performance Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Score Distribution</h4>
            {showBars && (
              <div className="space-y-3">
                {chartData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium text-gray-700">
                        {Math.round(item.value)}% ({index === 4 ? groupedData.notSubmitted.length : 
                          index === 0 ? groupedData.excellent.length :
                          index === 1 ? groupedData.good.length :
                          index === 2 ? groupedData.average.length :
                          groupedData.needsSupport.length})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!showBars && (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="text-center">
                  <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No visualization data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary statistics */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Insights</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full mt-1">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{stats.passingRate}%</div>
                  <div className="text-sm text-gray-600">Student passing rate</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full mt-1">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{stats.submissionRate}%</div>
                  <div className="text-sm text-gray-600">Submission rate</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-full mt-1">
                  <BarChartIcon size={16} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600">Average score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance breakdown table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-purple-500" />
          Student Performance Breakdown
        </h3>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`font-medium ${
                      student.score >= 90 ? 'text-green-600' :
                      student.score >= passingThreshold ? 'text-blue-600' :
                      student.score >= 60 ? 'text-yellow-600' :
                      student.score > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {student.score === 0 ? '—' : `${student.score.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.score >= 90 ? 'bg-green-100 text-green-800' :
                      student.score >= passingThreshold ? 'bg-blue-100 text-blue-800' :
                      student.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      student.score > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.score >= 90 ? 'Excellent' :
                       student.score >= passingThreshold ? 'Good' :
                       student.score >= 60 ? 'Average' :
                       student.score > 0 ? 'Needs Support' : 'Not Submitted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceVisualization;
