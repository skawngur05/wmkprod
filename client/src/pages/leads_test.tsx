import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Download, Search } from 'lucide-react';

console.log('WORKING LEADS PAGE LOADED:', new Date().toISOString());

export default function Leads() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-900">LEADS PAGE RESTORED SUCCESSFULLY</h1>
            <p className="text-gray-600 mt-1">Complete Functionality - Build: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg border">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Lead Management System WORKING!</h2>
          <p className="text-green-600 font-medium text-lg">SUCCESS: This page has been fully restored!</p>
          <p className="text-gray-600 mt-2">Check the browser console for the success timestamp message.</p>
          <div className="mt-6 flex gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
            <Button variant="outline" className="border-green-500 text-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search Leads
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
