import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';
import { Assignment } from '../App';
import Logo from '../components/Logo';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardProps {
  assignments: Assignment[];
  error: string | null;
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  fetchAssignments: () => void;
  logout: () => void;
  user?: { email: string };
}

const Dashboard: React.FC<DashboardProps> = ({
  assignments,
  error,
  loading,
  onStatusChange,
  onDelete,
  fetchAssignments,
  logout,
  user
}) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments'>('overview');

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in-progress').length;
    const overdue = assignments.filter(a => {
      const deadline = new Date(a.deadline);
      const now = new Date();
      return deadline < now && a.status !== 'completed';
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, inProgress, overdue, completionRate };
  }, [assignments]);

  // Filter, search, and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments.filter(assignment => {
      // Status filter
      if (filter !== 'all' && assignment.status !== filter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          assignment.title.toLowerCase().includes(searchLower) ||
          (assignment.description && assignment.description.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });

    // Sort by deadline
    filtered.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return sort === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [assignments, filter, searchTerm, sort]);

  // Get upcoming assignments (next 7 days)
  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return assignments
      .filter(a => {
        const deadline = new Date(a.deadline);
        return deadline >= now && deadline <= nextWeek && a.status !== 'completed';
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [assignments]);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <Menu className="w-6 h-6 text-secondary-600" />
              </button>
              <Logo size="md" variant="text" />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-white/50 transition-colors">
                <Bell className="w-6 h-6 text-secondary-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
                  <p className="text-xs text-secondary-500">Student</p>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: showSidebar ? 0 : -300 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-lg lg:shadow-none transition-transform duration-300 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <Logo size="sm" variant="text" />
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-1 rounded hover:bg-white/50"
                >
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-secondary-600 hover:bg-white/50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'assignments'
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-secondary-600 hover:bg-white/50'
                }`}
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">Assignments</span>
              </button>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/20">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Progress</p>
                    <p className="text-xs text-primary-600">{stats.completionRate}% Complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Mobile Search */}
            <div className="md:hidden mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="card p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-600">Total Assignments</p>
                          <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="card p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-600">Completed</p>
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="card p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-600">In Progress</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="card p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-600">Overdue</p>
                          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Progress Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900">Completion Progress</h3>
                      <span className="text-2xl font-bold text-primary-600">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.completionRate}%` }}
                        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        className="h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-secondary-600 mt-2">
                      <span>{stats.completed} completed</span>
                      <span>{stats.total - stats.completed} remaining</span>
                    </div>
                  </motion.div>

                  {/* Upcoming Assignments */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900">Upcoming Deadlines</h3>
                      <Calendar className="w-5 h-5 text-secondary-400" />
                    </div>
                    {upcomingAssignments.length === 0 ? (
                      <p className="text-secondary-500 text-center py-4">No upcoming deadlines</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAssignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-secondary-900">{assignment.title}</p>
                              <p className="text-sm text-secondary-600">
                                Due: {new Date(assignment.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              assignment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                              assignment.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {assignment.status || 'pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="assignments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Assignment Form Toggle */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-secondary-900">Assignments</h2>
                    <motion.button
                      onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                      className="btn-primary flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Assignment</span>
                    </motion.button>
                  </div>

                  {/* Assignment Form */}
                  <AnimatePresence>
                    {showAssignmentForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card p-6"
                      >
                        <AssignmentForm onAdd={fetchAssignments} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Filter and Sort Controls */}
                  <div className="card p-6">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-secondary-400" />
                        <label className="text-sm font-medium text-secondary-700">Filter:</label>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="input-field py-2 px-3 text-sm"
                        >
                          <option value="all">All Assignments</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        {sort === 'asc' ? (
                          <SortAsc className="w-5 h-5 text-secondary-400" />
                        ) : (
                          <SortDesc className="w-5 h-5 text-secondary-400" />
                        )}
                        <label className="text-sm font-medium text-secondary-700">Sort:</label>
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
                          className="input-field py-2 px-3 text-sm"
                        >
                          <option value="asc">Earliest First</option>
                          <option value="desc">Latest First</option>
                        </select>
                      </div>

                      <div className="ml-auto text-sm text-secondary-600">
                        {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Assignment List */}
                  <div className="card p-6">
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" variant="primary" />
                      </div>
                    ) : error ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                      </motion.div>
                    ) : filteredAssignments.length === 0 ? (
                      <div className="text-center py-12">
                        <Target className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-secondary-900 mb-2">No assignments found</h3>
                        <p className="text-secondary-600">
                          {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first assignment.'}
                        </p>
                      </div>
                    ) : (
                      <AssignmentList
                        assignments={filteredAssignments}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                        error={null}
                        filter={''}
                        onUpdate={function (id: string, updatedData: Partial<{ id: string; title: string; deadline: string; description?: string; status?: string; }>): void {
                          throw new Error('Function not implemented.');
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;