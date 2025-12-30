'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Pencil, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    contract_id: '',
    contract_title: '',
    client_id: '',
    start_date: '',
    end_date: '',
    contract_value: '',
    contract_status: 'Draft',
    signed_by: '',
    renewal_terms: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalValue: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      setLoading(true);
      const res = await fetch('/api/contracts');
      const data = await res.json();
      
      if (data.success) {
        setContracts(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load contracts');
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Error loading contracts');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(contractsData) {
    const total = contractsData.length;
    const active = contractsData.filter(c => c.contract_status === 'Active').length;
    const totalValue = contractsData.reduce((sum, c) => sum + parseFloat(c.contract_value || 0), 0);
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = contractsData.filter(c => {
      const endDate = new Date(c.end_date);
      return endDate >= now && endDate <= thirtyDaysFromNow;
    }).length;

    setStats({ total, active, totalValue, expiringSoon });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract created successfully');
        setShowAddModal(false);
        resetForm();
        fetchContracts();
      } else {
        toast.error(data.error || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Error creating contract');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/contracts/${selectedContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract updated successfully');
        setShowEditModal(false);
        setSelectedContract(null);
        resetForm();
        fetchContracts();
      } else {
        toast.error(data.error || 'Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Error updating contract');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Contract deleted successfully');
        fetchContracts();
      } else {
        toast.error(data.error || 'Failed to delete contract');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Error deleting contract');
    }
  }

  function resetForm() {
    setFormData({
      contract_id: '',
      contract_title: '',
      client_id: '',
      start_date: '',
      end_date: '',
      contract_value: '',
      contract_status: 'Draft',
      signed_by: '',
      renewal_terms: ''
    });
  }

  function openEditModal(contract) {
    setSelectedContract(contract);
    setFormData({
      contract_id: contract.contract_id,
      contract_title: contract.contract_title,
      client_id: contract.client_id,
      start_date: contract.start_date?.split('T')[0] || '',
      end_date: contract.end_date?.split('T')[0] || '',
      contract_value: contract.contract_value,
      contract_status: contract.contract_status,
      signed_by: contract.signed_by,
      renewal_terms: contract.renewal_terms || ''
    });
    setShowEditModal(true);
  }

  function getStatusColor(status) {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Terminated': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground mt-1">Manage legal contracts and agreements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>View and manage all legal contracts</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No contracts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new contract.</p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Contract
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_id}</TableCell>
                    <TableCell>{contract.contract_title}</TableCell>
                    <TableCell>{new Date(contract.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(contract.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(contract.contract_value).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.contract_status)}>
                        {contract.contract_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{contract.signed_by}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(contract)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Contract Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_id">Contract ID *</Label>
                <Input
                  id="contract_id"
                  value={formData.contract_id}
                  onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_id">Client ID *</Label>
                <Input
                  id="client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_title">Contract Title *</Label>
              <Input
                id="contract_title"
                value={formData.contract_title}
                onChange={(e) => setFormData({ ...formData, contract_title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_value">Contract Value *</Label>
                <Input
                  id="contract_value"
                  type="number"
                  step="0.01"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_status">Status *</Label>
                <select
                  id="contract_status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.contract_status}
                  onChange={(e) => setFormData({ ...formData, contract_status: e.target.value })}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signed_by">Signed By *</Label>
              <Input
                id="signed_by"
                value={formData.signed_by}
                onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal_terms">Renewal Terms</Label>
              <Textarea
                id="renewal_terms"
                value={formData.renewal_terms}
                onChange={(e) => setFormData({ ...formData, renewal_terms: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Contract</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contract Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_contract_id">Contract ID *</Label>
                <Input
                  id="edit_contract_id"
                  value={formData.contract_id}
                  onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_client_id">Client ID *</Label>
                <Input
                  id="edit_client_id"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_contract_title">Contract Title *</Label>
              <Input
                id="edit_contract_title"
                value={formData.contract_title}
                onChange={(e) => setFormData({ ...formData, contract_title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_contract_value">Contract Value *</Label>
                <Input
                  id="edit_contract_value"
                  type="number"
                  step="0.01"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contract_status">Status *</Label>
                <select
                  id="edit_contract_status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.contract_status}
                  onChange={(e) => setFormData({ ...formData, contract_status: e.target.value })}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_signed_by">Signed By *</Label>
              <Input
                id="edit_signed_by"
                value={formData.signed_by}
                onChange={(e) => setFormData({ ...formData, signed_by: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_renewal_terms">Renewal Terms</Label>
              <Textarea
                id="edit_renewal_terms"
                value={formData.renewal_terms}
                onChange={(e) => setFormData({ ...formData, renewal_terms: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedContract(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Contract</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}