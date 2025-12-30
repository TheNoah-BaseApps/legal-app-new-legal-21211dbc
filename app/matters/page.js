'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Scale, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function MattersPage() {
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [formData, setFormData] = useState({
    matter_id: '',
    matter_title: '',
    matter_description: '',
    matter_type: '',
    client_id: '',
    attorney_assigned: '',
    open_date: '',
    matter_status: 'Open',
    jurisdiction: '',
    opposing_party: '',
    key_deadlines: '',
    amount_billed: '',
    matter_outcome: ''
  });

  useEffect(() => {
    fetchMatters();
  }, []);

  async function fetchMatters() {
    try {
      setLoading(true);
      const res = await fetch('/api/matters');
      const data = await res.json();
      if (data.success) {
        setMatters(data.data);
      } else {
        toast.error('Failed to load matters');
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
      toast.error('Error loading matters');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const endpoint = selectedMatter 
        ? `/api/matters/${selectedMatter.id}`
        : '/api/matters';
      const method = selectedMatter ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(selectedMatter ? 'Matter updated successfully' : 'Matter created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchMatters();
      } else {
        toast.error(data.error || 'Failed to save matter');
      }
    } catch (error) {
      console.error('Error saving matter:', error);
      toast.error('Error saving matter');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this matter?')) return;
    
    try {
      const res = await fetch(`/api/matters/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Matter deleted successfully');
        fetchMatters();
      } else {
        toast.error(data.error || 'Failed to delete matter');
      }
    } catch (error) {
      console.error('Error deleting matter:', error);
      toast.error('Error deleting matter');
    }
  }

  function handleEdit(matter) {
    setSelectedMatter(matter);
    setFormData({
      matter_id: matter.matter_id,
      matter_title: matter.matter_title,
      matter_description: matter.matter_description || '',
      matter_type: matter.matter_type,
      client_id: matter.client_id,
      attorney_assigned: matter.attorney_assigned,
      open_date: matter.open_date?.split('T')[0] || '',
      matter_status: matter.matter_status,
      jurisdiction: matter.jurisdiction,
      opposing_party: matter.opposing_party || '',
      key_deadlines: matter.key_deadlines || '',
      amount_billed: matter.amount_billed || '',
      matter_outcome: matter.matter_outcome || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      matter_id: '',
      matter_title: '',
      matter_description: '',
      matter_type: '',
      client_id: '',
      attorney_assigned: '',
      open_date: '',
      matter_status: 'Open',
      jurisdiction: '',
      opposing_party: '',
      key_deadlines: '',
      amount_billed: '',
      matter_outcome: ''
    });
    setSelectedMatter(null);
  }

  const stats = {
    total: matters.length,
    open: matters.filter(m => m.matter_status === 'Open').length,
    closed: matters.filter(m => m.matter_status === 'Closed').length,
    totalBilled: matters.reduce((sum, m) => sum + parseFloat(m.amount_billed || 0), 0)
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-orange-100 text-orange-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Settled': 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading matters...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matter Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage legal matters and cases</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Matter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matters</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Matters</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Matters</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBilled.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matters</CardTitle>
          <CardDescription>A list of all legal matters in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {matters.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matters yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first matter</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Matter
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matter ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Attorney</TableHead>
                    <TableHead>Open Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matters.map((matter) => (
                    <TableRow key={matter.id}>
                      <TableCell className="font-medium">{matter.matter_id}</TableCell>
                      <TableCell>{matter.matter_title}</TableCell>
                      <TableCell>{matter.matter_type}</TableCell>
                      <TableCell>{matter.attorney_assigned}</TableCell>
                      <TableCell>{new Date(matter.open_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(matter.matter_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(matter)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(matter.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Matter</DialogTitle>
            <DialogDescription>Create a new legal matter record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matter_id">Matter ID *</Label>
                  <Input
                    id="matter_id"
                    value={formData.matter_id}
                    onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matter_type">Matter Type *</Label>
                  <Input
                    id="matter_type"
                    value={formData.matter_type}
                    onChange={(e) => setFormData({ ...formData, matter_type: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matter_title">Matter Title *</Label>
                <Input
                  id="matter_title"
                  value={formData.matter_title}
                  onChange={(e) => setFormData({ ...formData, matter_title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matter_description">Matter Description</Label>
                <Textarea
                  id="matter_description"
                  value={formData.matter_description}
                  onChange={(e) => setFormData({ ...formData, matter_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID *</Label>
                  <Input
                    id="client_id"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attorney_assigned">Attorney Assigned *</Label>
                  <Input
                    id="attorney_assigned"
                    value={formData.attorney_assigned}
                    onChange={(e) => setFormData({ ...formData, attorney_assigned: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open_date">Open Date *</Label>
                  <Input
                    id="open_date"
                    type="date"
                    value={formData.open_date}
                    onChange={(e) => setFormData({ ...formData, open_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matter_status">Matter Status *</Label>
                  <Select value={formData.matter_status} onValueChange={(value) => setFormData({ ...formData, matter_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount_billed">Amount Billed</Label>
                  <Input
                    id="amount_billed"
                    type="number"
                    step="0.01"
                    value={formData.amount_billed}
                    onChange={(e) => setFormData({ ...formData, amount_billed: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opposing_party">Opposing Party</Label>
                <Input
                  id="opposing_party"
                  value={formData.opposing_party}
                  onChange={(e) => setFormData({ ...formData, opposing_party: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key_deadlines">Key Deadlines</Label>
                <Textarea
                  id="key_deadlines"
                  value={formData.key_deadlines}
                  onChange={(e) => setFormData({ ...formData, key_deadlines: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matter_outcome">Matter Outcome</Label>
                <Textarea
                  id="matter_outcome"
                  value={formData.matter_outcome}
                  onChange={(e) => setFormData({ ...formData, matter_outcome: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Create Matter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Matter</DialogTitle>
            <DialogDescription>Update matter information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_matter_id">Matter ID *</Label>
                  <Input
                    id="edit_matter_id"
                    value={formData.matter_id}
                    onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_matter_type">Matter Type *</Label>
                  <Input
                    id="edit_matter_type"
                    value={formData.matter_type}
                    onChange={(e) => setFormData({ ...formData, matter_type: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_matter_title">Matter Title *</Label>
                <Input
                  id="edit_matter_title"
                  value={formData.matter_title}
                  onChange={(e) => setFormData({ ...formData, matter_title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_matter_description">Matter Description</Label>
                <Textarea
                  id="edit_matter_description"
                  value={formData.matter_description}
                  onChange={(e) => setFormData({ ...formData, matter_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_client_id">Client ID *</Label>
                  <Input
                    id="edit_client_id"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_attorney_assigned">Attorney Assigned *</Label>
                  <Input
                    id="edit_attorney_assigned"
                    value={formData.attorney_assigned}
                    onChange={(e) => setFormData({ ...formData, attorney_assigned: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_open_date">Open Date *</Label>
                  <Input
                    id="edit_open_date"
                    type="date"
                    value={formData.open_date}
                    onChange={(e) => setFormData({ ...formData, open_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="edit_jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_matter_status">Matter Status *</Label>
                  <Select value={formData.matter_status} onValueChange={(value) => setFormData({ ...formData, matter_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_amount_billed">Amount Billed</Label>
                  <Input
                    id="edit_amount_billed"
                    type="number"
                    step="0.01"
                    value={formData.amount_billed}
                    onChange={(e) => setFormData({ ...formData, amount_billed: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_opposing_party">Opposing Party</Label>
                <Input
                  id="edit_opposing_party"
                  value={formData.opposing_party}
                  onChange={(e) => setFormData({ ...formData, opposing_party: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_key_deadlines">Key Deadlines</Label>
                <Textarea
                  id="edit_key_deadlines"
                  value={formData.key_deadlines}
                  onChange={(e) => setFormData({ ...formData, key_deadlines: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_matter_outcome">Matter Outcome</Label>
                <Textarea
                  id="edit_matter_outcome"
                  value={formData.matter_outcome}
                  onChange={(e) => setFormData({ ...formData, matter_outcome: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Update Matter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}