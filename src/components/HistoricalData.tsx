import {
  AlertCircle,
  Award,
  Brain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Info,
  LineChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { GlucoseReading, TimeRange } from '../types';

interface HistoricalDataProps {
  data: GlucoseReading[];
}

const RANGE_OPTIONS: TimeRange[] = ['24h', '7d', '30d', '90d'];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  color: string;
  icon: React.ReactNode;
  caption?: string;
}> = ({ title, value, unit, color, icon, caption }) => (
  <div className={`rounded-xl p-4 shadow-sm border ${color}-bg`}>
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${color}-border/40`}>{icon}</div>
        <div>
          <p className={`text-sm font-medium ${color}-title`}>{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-base font-medium text-gray-500"> {unit}</span>}
          </p>
        </div>
      </div>
    </div>
    {caption && <p className="mt-2 text-xs text-gray-500">{caption}</p>}
  </div>
);

/* --------------------- MedicalInsights (inlined) --------------------- */

const MedicalInsights: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const insights = [
    {
      id: 1,
      type: 'trend',
      title: 'Glucose Trend Improving',
      description:
        'Your average glucose levels have improved by 12% over the past week. Keep up the excellent work with your current management plan.',
      severity: 'positive',
      icon: TrendingUp,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      value: '12%',
      metric: 'improvement',
      recommendation: 'Continue current diet and exercise routine'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Nocturnal Hypoglycemia Risk',
      description:
        'Pattern detected: glucose levels trending low between 2-4 AM. Consider adjusting evening insulin or bedtime snack timing.',
      severity: 'warning',
      icon: AlertCircle,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      value: '3x',
      metric: 'weekly occurrences',
      recommendation: 'Consult endocrinologist about basal insulin adjustment'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Time in Range Achievement',
      description:
        'Congratulations! You achieved 78% time in range this week - exceeding the clinical target of 70% for optimal diabetes management.',
      severity: 'positive',
      icon: Award,
      gradient: 'from-purple-400 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      value: '78%',
      metric: 'time in range',
      recommendation: 'Maintain current management strategies'
    },
    {
      id: 4,
      type: 'prediction',
      title: 'AI Prediction: Post-Meal Response',
      description:
        'Based on your eating patterns, ML models predict a 23% chance of post-meal spike after lunch. Consider pre-bolusing 15 minutes earlier.',
      severity: 'info',
      icon: Brain,
      gradient: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      value: '23%',
      metric: 'spike probability',
      recommendation: 'Pre-bolus 15 minutes before lunch'
    },
    {
      id: 5,
      type: 'security',
      title: 'Device Security Status',
      description:
        'All connected devices are secure. Last security scan completed successfully with no threats detected in your IoMT ecosystem.',
      severity: 'positive',
      icon: Shield,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      value: '100%',
      metric: 'security score',
      recommendation: 'All systems protected and monitored'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, insights.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % insights.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + insights.length) % insights.length);
    setIsAutoPlaying(false);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'positive':
        return { dot: 'bg-emerald-500', pulse: 'animate-pulse', glow: 'shadow-emerald-200' };
      case 'warning':
        return { dot: 'bg-amber-500', pulse: 'animate-pulse', glow: 'shadow-amber-200' };
      case 'info':
        return { dot: 'bg-blue-500', pulse: '', glow: 'shadow-blue-200' };
      default:
        return { dot: 'bg-gray-500', pulse: '', glow: 'shadow-gray-200' };
    }
  };

  const currentInsight = insights[currentSlide];
  const Icon = currentInsight.icon;
  const styles = getSeverityStyles(currentInsight.severity);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Medical Insights</h2>
            <p className="text-gray-600 text-sm">Personalized health intelligence & recommendations</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span className="text-sm font-semibold text-indigo-600">Live Analysis</span>
        </div>
      </div>

      {/* Main Insight Card */}
      <div className="relative mb-8">
        <div
          className={`bg-gradient-to-br ${currentInsight.bgGradient} border-2 ${currentInsight.borderColor} rounded-2xl p-8 shadow-lg ${styles.glow} transition-all duration-500 transform`}
          style={{ animation: 'slideIn 0.5s ease-out', minHeight: '280px' }}
        >
          {/* Animated Background Elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className={`w-24 h-24 bg-gradient-to-br ${currentInsight.gradient} rounded-full blur-xl animate-pulse`} />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${currentInsight.gradient} rounded-full blur-lg animate-bounce`}
              style={{ animationDelay: '1s' }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`bg-gradient-to-br ${currentInsight.gradient} p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{currentInsight.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${styles.dot} ${styles.pulse}`} />
                    <span className="text-sm font-medium text-gray-600 capitalize">{currentInsight.type}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-3xl font-bold bg-gradient-to-r ${currentInsight.gradient} bg-clip-text text-transparent`}>
                  {currentInsight.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{currentInsight.metric}</div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6 text-lg">{currentInsight.description}</p>

            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-50">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-500 p-1.5 rounded-lg mt-0.5">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Recommendation</h4>
                  <p className="text-gray-700 text-sm">{currentInsight.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 backdrop-blur-sm hover:bg-opacity-100 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 backdrop-blur-sm hover:bg-opacity-100 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center space-x-2 mb-6">
        {insights.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setIsAutoPlaying(false);
            }}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? 'w-8 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300">
          <Heart className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-600">87%</div>
          <div className="text-xs text-emerald-700 font-medium">Health Score</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300">
          <LineChart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-xs text-blue-700 font-medium">Active Insights</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300">
          <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">12</div>
          <div className="text-xs text-purple-700 font-medium">ML Predictions</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300">
          <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">2m</div>
          <div className="text-xs text-amber-700 font-medium">Last Update</div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isAutoPlaying ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isAutoPlaying ? <Zap className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          <span>{isAutoPlaying ? 'Auto-playing' : 'Manual mode'}</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

/* --------------------- HistoricalData main component --------------------- */

export const HistoricalData: React.FC<HistoricalDataProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const filteredData = useMemo(() => {
    const now = new Date();
    let hoursBack = 24;
    switch (timeRange) {
      case '7d':
        hoursBack = 24 * 7;
        break;
      case '30d':
        hoursBack = 24 * 30;
        break;
      case '90d':
        hoursBack = 24 * 90;
        break;
      default:
        hoursBack = 24;
    }
    const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    return data.filter((reading) => reading.timestamp >= cutoff);
  }, [data, timeRange]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return { inRange: 0, low: 0, high: 0 };
    const inRange = filteredData.filter((r) => r.value >= 70 && r.value <= 180).length;
    const low = filteredData.filter((r) => r.value < 70).length;
    const high = filteredData.filter((r) => r.value > 180).length;
    return {
      inRange: Math.round((inRange / total) * 100),
      low: Math.round((low / total) * 100),
      high: Math.round((high / total) * 100)
    };
  }, [filteredData]);

  const avgGlucose = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, r) => acc + r.value, 0);
    return Math.round(sum / filteredData.length);
  }, [filteredData]);

  const chartData = useMemo(() => {
    const hourlyData: { [key: string]: number[] } = {};
    filteredData.forEach((reading) => {
      const hour = reading.timestamp.toISOString().slice(0, 13);
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(reading.value);
    });

    return Object.entries(hourlyData)
      .map(([hour, values]) => {
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        const date = new Date(hour + ':00:00');
        return {
          hour: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
          average: Math.round(avg),
          inRange: values.filter((v) => v >= 70 && v <= 180).length,
          total: values.length
        };
      })
      .slice(-24);
  }, [filteredData]);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-xl border border-indigo-100 shadow-sm">
            <Calendar className="h-6 w-6 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Historical Data</h2>
            <p className="text-sm text-gray-500">Trends and insights from glucose readings</p>
          </div>
        </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all focus:outline-none ${
                timeRange === r ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Time in Range"
          value={`${stats.inRange}%`}
          unit=""
          color="green"
          icon={<Target className="h-5 w-5 text-green-600" />}
          caption="Target range: 70 - 180 mg/dL"
        />

        <StatCard
          title="Average Glucose"
          value={avgGlucose}
          unit="mg/dL"
          color="blue"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          caption={`${filteredData.length} readings analyzed`}
        />

        <StatCard
          title="Time Low"
          value={`${stats.low}%`}
          color="red"
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          caption="Below 70 mg/dL"
        />

        <StatCard
          title="Time High"
          value={`${stats.high}%`}
          color="yellow"
          icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
          caption="Above 180 mg/dL"
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Glucose Trend</h3>
            <p className="text-sm text-gray-500">Average glucose per hour — last {chartData.length} points</p>
          </div>
          <div className="text-sm text-gray-600">Range: 0 - 400 mg/dL</div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={Math.max(0, Math.floor(chartData.length / 6))} />
              <YAxis domain={[0, 400]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [`${value} mg/dL`, name === 'average' ? 'Average' : name]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="average" fill="#6366f1" radius={[6, 6, 0, 0]} name="average" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Medical insights area: only AI Medical Insights carousel (left-side cards removed) */}
      <div className="mt-6">
        <MedicalInsights />
      </div>
    </div>
  );
};

export default HistoricalData;
