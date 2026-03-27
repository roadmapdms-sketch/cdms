import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  services?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VendorStats {
  totalVendors: number;
  active: number;
  inactive: number;
  activationRate: string;
  completeness: {
    withContact: number;
    withEmail: number;
    withPhone: number;
    withAddress: number;
    withServices: number;
  };
}

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [activeVendors, setActiveVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [servicesFilter, setServicesFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceResults, setServiceResults] = useState<Vendor[]>([]);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(isActiveFilter && { isActive: isActiveFilter }),
        ...(servicesFilter && { services: servicesFilter })
      });

      const response = await axios.get(`${API_BASE_URL}/vendors?${params}`);
      setVendors(response.data.vendors);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, isActiveFilter, servicesFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('`${API_BASE_URL}/vendors/stats/overview');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchActiveVendors = useCallback(async () => {
    try {
      const response = await axios.get('`${API_BASE_URL}/vendors/active/list?limit=5');
      setActiveVendors(response.data.vendors);
    } catch (err: any) {
      console.error('Failed to fetch active vendors:', err);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
    fetchStats();
    fetchActiveVendors();
  }, [fetchVendors, fetchStats, fetchActiveVendors]);

  const handleCreateVendor = async (vendorData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/vendors', vendorData);
      fetchVendors();
      fetchStats();
      fetchActiveVendors();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create vendor');
    }
  };

  const handleToggleStatus = async (vendorId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/vendors/${vendorId}/toggle-status`, {});
      fetchVendors();
      fetchStats();
      fetchActiveVendors();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to toggle vendor status');
    }
  };

  const handleBulkUpdate = async (bulkData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/vendors/bulk-update', bulkData);
      fetchVendors();
      fetchStats();
      fetchActiveVendors();
      setShowBulkModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process bulk update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/vendors/${id}`);
      fetchVendors();
      fetchStats();
      fetchActiveVendors();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete vendor');
    }
  };

  const handleServiceSearch = async () => {
    if (!serviceSearch.trim()) {
      setServiceResults([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/vendors/services/search?service=${encodeURIComponent(serviceSearch)}`);
      setServiceResults(response.data.vendors);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to search vendors by service');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-600">Manage service providers and contracts</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVendors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">With Contact</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completeness.withContact}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">With Email</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completeness.withEmail}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Activation Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.activationRate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Vendors by Service</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Search for services (e.g., catering, cleaning, printing)..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleServiceSearch()}
            />
            <button
              onClick={handleServiceSearch}
              className="btn btn-primary"
            >
              Search
            </button>
          </div>
          
          {serviceResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Results:</p>
              {serviceResults.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-600">{vendor.services}</p>
                    {vendor.contactPerson && (
                      <p className="text-xs text-gray-500">Contact: {vendor.contactPerson}</p>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendor.isActive)}`}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Vendors */}
      {activeVendors.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Vendors</h3>
            <div className="space-y-3">
              {activeVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-600">
                      {vendor.contactPerson && `Contact: ${vendor.contactPerson}`}
                      {vendor.email && ` • ${vendor.email}`}
                      {vendor.phone && ` • ${vendor.phone}`}
                    </p>
                    {vendor.services && (
                      <p className="text-xs text-gray-500">Services: {vendor.services}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search by name, contact, or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input"
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
              <input
                type="text"
                className="input"
                placeholder="Filter by services..."
                value={servicesFilter}
                onChange={(e) => setServicesFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary mr-2"
              >
                Add Vendor
              </button>
              
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary"
              >
                Bulk Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading vendors...</div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No vendors found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                          {vendor.address && (
                            <div className="text-xs text-gray-500 truncate max-w-xs" title={vendor.address}>
                              {vendor.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.contactPerson || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vendor.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={vendor.services}>
                          {vendor.services || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendor.isActive)}`}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleToggleStatus(vendor.id)}
                          className={`mr-3 ${vendor.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {vendor.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Vendor</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateVendor({
                  name: formData.get('name'),
                  contactPerson: formData.get('contactPerson'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  address: formData.get('address'),
                  services: formData.get('services'),
                  notes: formData.get('notes')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="input"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                  <input
                    type="text"
                    name="services"
                    className="input"
                    placeholder="Optional services offered"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    className="input"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Update Vendors</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const vendorIds = (formData.get('vendorIds') as string).split(',').map(id => id.trim()).filter(id => id);
                handleBulkUpdate({
                  vendorIds,
                  updates: {
                    isActive: formData.get('isActive') === 'true'
                  }
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor IDs (comma-separated)</label>
                  <textarea
                    name="vendorIds"
                    className="input"
                    rows={4}
                    placeholder="vendor1, vendor2, vendor3..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select name="isActive" className="input" required>
                    <option value="">Select Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Bulk Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
