import React from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the connection configuration page when it's built
    // For now, this is a placeholder
    navigate("/ConnectionConfig");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="h-14 w-14 rounded-lg bg-blue-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">DataBridge Pro</h1>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8">Enterprise SQL Server Migration Made Simple</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Seamlessly migrate data between SQL Server databases with precision and control.
            Designed for database administrators and IT professionals handling large-scale migrations.
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-8 py-3 text-lg font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Migration Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Database Mapping</h3>
              <p className="text-muted-foreground">Intuitively map tables, columns, and relationships between source and destination databases with our visual drag-and-drop interface.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Bulk Migration</h3>
              <p className="text-muted-foreground">Efficiently handle thousands of applications with our intelligent queuing system that optimizes performance and prevents system overload.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Progress Tracking</h3>
              <p className="text-muted-foreground">Monitor your migration progress with detailed metrics including records migrated, errors, and remaining work in an intuitive dashboard.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Connection Management</h3>
              <p className="text-muted-foreground">Safely store and manage your database connection configurations with enterprise-grade security and easy testing capabilities.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Error Handling</h3>
              <p className="text-muted-foreground">Advanced error detection and recovery mechanisms ensure your migrations are resilient, with detailed logging for rapid troubleshooting.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:border-blue-500/50 transition-all duration-200">
              <div className="h-12 w-12 rounded-md bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed Reporting</h3>
              <p className="text-muted-foreground">Generate comprehensive migration reports with insights on performance, success rates, and actionable recommendations for optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard CTA Section */}
      <section className="py-12 px-4 sm:px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Monitor Your Migrations</h2>
              <p className="text-muted-foreground max-w-2xl">
                Track the progress of all your database migrations in real-time with our comprehensive dashboard. View detailed statistics, filter by status, and quickly identify any issues.
              </p>
            </div>
            <button 
              onClick={() => navigate("/MigrationDashboard")} 
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors duration-200 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Streamlined Migration Workflow</h2>
          
          <div className="relative">
            {/* Connected line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500/20 -translate-y-1/2 hidden md:block"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Connect</h3>
                <p className="text-muted-foreground">Configure and test connections to your source and destination SQL Server databases.</p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Map</h3>
                <p className="text-muted-foreground">Visually map database schemas and relationships between source and destination.</p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Migrate</h3>
                <p className="text-muted-foreground">Execute migrations with real-time monitoring and automatic error handling.</p>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Analyze</h3>
                <p className="text-muted-foreground">Review detailed reports and optimize your migration process for future runs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-blue-600/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Database Migrations?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Start managing your SQL Server migrations with confidence using DataBridge Pro's powerful toolset designed specifically for database administrators.  
          </p>
          <button 
            onClick={handleGetStarted}
            className="px-8 py-3 text-lg font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-bold">DataBridge Pro</span>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DataBridge Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
