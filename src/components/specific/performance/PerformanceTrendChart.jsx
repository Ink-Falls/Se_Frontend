import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ChevronDown, 
  TrendingUp, 
  Users, 
  Search, 
  X,
  Check,
  Filter
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceTrendChart = ({ performanceData, title = "Student Performance Trends", topPerformerAverages = {} }) => {
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoveredAssessment, setHoveredAssessment] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!performanceData || !performanceData.students || !performanceData.assessments) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No performance data available</p>
        </div>
      </div>
    );
  }

  const { students, assessments, scoreMatrix } = performanceData;
  
  const classAverages = assessments.map((_, assessmentIndex) => {
    let sum = 0;
    let count = 0;
    
    students.forEach(student => {
      const score = scoreMatrix[student.id]?.[assessmentIndex] || 0;
      if (score > 0) {
        sum += score;
        count += 1;
      }
    });
    
    return count > 0 ? sum / count : 0;
  });

  const studentAverages = students.map(student => {
    const topPerformerAvg = topPerformerAverages[student.id];
    
    if (topPerformerAvg !== undefined) {
      let performanceCategory = 'low';
      if (topPerformerAvg >= 85) performanceCategory = 'high';
      else if (topPerformerAvg >= 70) performanceCategory = 'medium';
      
      return {
        studentId: student.id,
        name: student.name,
        average: topPerformerAvg,
        performanceCategory,
        formattedAverage: topPerformerAvg.toFixed(1)
      };
    } else {
      const scores = scoreMatrix[student.id] || [];
      const validScores = scores.filter(score => score > 0);
      const average = validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
      
      let performanceCategory = 'low';
      if (average >= 85) performanceCategory = 'high';
      else if (average >= 70) performanceCategory = 'medium';
      
      return {
        studentId: student.id,
        name: student.name,
        average: average,
        performanceCategory,
        formattedAverage: average.toFixed(1)
      };
    }
  }).sort((a, b) => b.average - a.average);

  const topPerformers = studentAverages.slice(0, 5);
  
  const filteredStudents = studentAverages.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filterOption === 'all') return true;
    return student.performanceCategory === filterOption;
  });
  
  const displayableStudents = showAllStudents ? students : topPerformers.map(avg => 
    students.find(s => s.id === avg.studentId)
  ).filter(Boolean);

  const generateGradient = (ctx, chartArea, startColor, endColor, opacity = 0.2) => {
    if (!ctx || !chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, `rgba(${startColor}, 0)`);
    gradient.addColorStop(1, `rgba(${startColor}, ${opacity})`);
    return gradient;
  };

  const formatAssessmentName = (assessment) => {
    const name = assessment.title || `Assessment ${assessment.id}`;
    return name.length > 12 ? `${name.substring(0, 12)}...` : name;
  };

  const studentColors = {
    classAverage: {
      line: 'rgba(59, 130, 246, 1)',
      point: 'rgba(30, 64, 175, 1)',
      gradient: '59, 130, 246'
    }
  };

  const colorPalette = [
    { line: 'rgba(16, 185, 129, 1)', point: 'rgba(6, 95, 70, 1)', gradient: '16, 185, 129' },
    { line: 'rgba(245, 158, 11, 1)', point: 'rgba(180, 83, 9, 1)', gradient: '245, 158, 11' },
    { line: 'rgba(139, 92, 246, 1)', point: 'rgba(91, 33, 182, 1)', gradient: '139, 92, 246' },
    { line: 'rgba(239, 68, 68, 1)', point: 'rgba(153, 27, 27, 1)', gradient: '239, 68, 68' },
    { line: 'rgba(20, 184, 166, 1)', point: 'rgba(13, 148, 136, 1)', gradient: '20, 184, 166' },
    { line: 'rgba(37, 99, 235, 1)', point: 'rgba(29, 78, 216, 1)', gradient: '37, 99, 235' },
    { line: 'rgba(244, 63, 94, 1)', point: 'rgba(190, 18, 60, 1)', gradient: '244, 63, 94' },
    { line: 'rgba(234, 88, 12, 1)', point: 'rgba(154, 52, 18, 1)', gradient: '234, 88, 12' },
    { line: 'rgba(168, 85, 247, 1)', point: 'rgba(126, 34, 206, 1)', gradient: '168, 85, 247' },
    { line: 'rgba(79, 70, 229, 1)', point: 'rgba(67, 56, 202, 1)', gradient: '79, 70, 229' },
  ];

  displayableStudents.forEach((student, index) => {
    const colorIndex = index % colorPalette.length;
    studentColors[student.id] = colorPalette[colorIndex];
  });

  const data = {
    labels: assessments.map(formatAssessmentName),
    datasets: [
      {
        label: 'Class Average',
        data: classAverages,
        borderColor: studentColors.classAverage.line,
        backgroundColor: studentColors.classAverage.point,
        pointBackgroundColor: studentColors.classAverage.point,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: {
          target: 'origin',
          above: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            return generateGradient(ctx, chartArea, studentColors.classAverage.gradient);
          }
        },
        order: 1
      },
      ...displayableStudents
        .filter(student => !selectedStudent || student.id === selectedStudent)
        .map(student => ({
          label: student.name,
          data: scoreMatrix[student.id] || [],
          borderColor: studentColors[student.id].line,
          backgroundColor: studentColors[student.id].point,
          pointBackgroundColor: studentColors[student.id].point,
          borderWidth: selectedStudent === student.id ? 3 : 2,
          pointRadius: selectedStudent === student.id ? 5 : 3,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: selectedStudent === student.id ? {
            target: 'origin',
            above: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              return generateGradient(ctx, chartArea, studentColors[student.id].gradient);
            }
          } : false,
          order: 0
        }))
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          weight: 'bold',
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          title: function(context) {
            return context[0]?.label || '';
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(243, 244, 246, 1)'
        },
        ticks: {
          callback: function(value) {
            return `${value}%`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    onHover: (event, elements) => {
      const chartElements = elements || [];
      if (chartElements.length > 0) {
        const elementIndex = chartElements[0].index;
        setHoveredAssessment(assessments[elementIndex]);
      } else {
        setHoveredAssessment(null);
      }
    }
  };

  const getPerformanceColorClass = (average) => {
    if (average >= 85) return 'text-green-600';
    if (average >= 70) return 'text-blue-600';
    return 'text-red-600';
  };

  const getPerformanceBgClass = (performanceCategory) => {
    return performanceCategory === 'high' ? 'bg-green-100 text-green-800' : 
           performanceCategory === 'medium' ? 'bg-blue-100 text-blue-800' :
           'bg-red-100 text-red-800';
  };

  const renderDropdownItems = () => {
    if (filteredStudents.length > 0) {
      return filteredStudents.map(student => {
        const isActive = selectedStudent === student.studentId;
        const performanceColorClass = getPerformanceColorClass(student.average);
        const performanceBgClass = getPerformanceBgClass(student.performanceCategory);
        
        return (
          <button
            key={student.studentId}
            className={`flex items-center justify-between w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${isActive ? 'bg-gray-100' : ''}`}
            onClick={() => {
              setSelectedStudent(isActive ? null : student.studentId);
              setIsDropdownOpen(false);
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{backgroundColor: studentColors[student.studentId]?.line || '#888'}}>
                {student.name[0]}
              </span>
              <span className="text-gray-800">{student.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${performanceBgClass}`}>
                {student.formattedAverage}%
              </span>
              {isActive && (
                <span className="text-green-600">
                  <Check size={16} />
                </span>
              )}
            </div>
          </button>
        );
      });
    } else {
      return (
        <div className="px-4 py-6 text-center text-sm text-gray-500">
          No students match your search
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200">
      <div className="p-6 bg-gradient-to-r from-[#212529] to-gray-800 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          
          <div className="flex items-center gap-2">
            <button 
              className={`p-2 rounded-lg transition-colors ${
                showAllStudents ? 'bg-[#F6BA18] text-[#212529]' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              onClick={() => setShowAllStudents(!showAllStudents)}
              title={showAllStudents ? "Show top performers only" : "Show all students"}
            >
              <Users size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 items-center mb-4">
          <button
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
              !selectedStudent ? 'bg-[#F6BA18] text-[#212529] font-medium' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={() => setSelectedStudent(null)}
          >
            <TrendingUp size={16} className="mr-1" />
            All Trends
          </button>
          
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar max-w-md">
            {topPerformers.slice(0, 3).map(performer => {
              const isSelected = selectedStudent === performer.studentId;
              const student = students.find(s => s.id === performer.studentId);
              if (!student) return null;
              
              return (
                <button
                  key={performer.studentId}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    isSelected ? 'bg-[#F6BA18] text-[#212529] font-medium' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedStudent(isSelected ? null : performer.studentId)}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs mr-1"
                        style={{backgroundColor: studentColors[performer.studentId]?.line || '#fff'}}>
                    {performer.name[0]}
                  </span>
                  {performer.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
          
          <div className="relative flex-grow" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-left text-sm text-white transition-all"
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{selectedStudent ? `${students.find(s => s.id === selectedStudent)?.name} selected` : 'Select Student'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[300px] overflow-y-auto">
                <div className="sticky top-0 bg-white p-2 border-b border-gray-200 flex flex-col gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students..."
                      className="w-full px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F6BA18] focus:border-transparent"
                    />
                    <Search size={16} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Filter size={12} />
                      Filter:
                    </span>
                    <button 
                      className={`px-2 py-1 rounded-full ${filterOption === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-50 text-gray-600'}`}
                      onClick={() => setFilterOption('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-2 py-1 rounded-full ${filterOption === 'high' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-600'}`}
                      onClick={() => setFilterOption('high')}
                    >
                      High
                    </button>
                    <button 
                      className={`px-2 py-1 rounded-full ${filterOption === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-600'}`}
                      onClick={() => setFilterOption('medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`px-2 py-1 rounded-full ${filterOption === 'low' ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600'}`}
                      onClick={() => setFilterOption('low')}
                    >
                      Low
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {renderDropdownItems()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="h-[300px] relative">
          <Line data={data} options={options} />
          
          {hoveredAssessment && (
            <div className="absolute top-0 right-0 bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm max-w-[250px]">
              <p className="text-sm font-medium text-gray-800 mb-1">{hoveredAssessment.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(hoveredAssessment.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-6 border-t border-gray-200 mt-4">
          <div className="flex flex-wrap gap-4">
            {[...data.datasets].sort((a, b) => {
              if (a.label === 'Class Average') return -1;
              if (b.label === 'Class Average') return 1;
              return 0;
            }).map((dataset, index) => (
              <div key={index} className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dataset.borderColor }}
                ></span>
                <span className="text-sm text-gray-700 font-medium">{dataset.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>* Hover over data points to see detailed assessment information</p>
            <p>* Use the student selector to focus on specific learners</p>
            <p>* Filter by performance level: High (≥85%), Medium (70-85%), Low (&lt;70%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrendChart;
