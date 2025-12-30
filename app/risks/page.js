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
import { AlertTriangle, Plus, Pencil, Trash2, Shield, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function RisksPage() {
  const router = useRouter();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [formData, setFormData] = useState({
    risk_id: '',
    risk_type: '',
    risk_description: '',
    identified_by: '',
    identified_date: '',
    risk_severity: 'Medium',
    mitigation_plan: '',
    review_date: '',
    risk_status: 'Identified'
  });
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    mitigated: 0,
    active: 0
  });

  useEffect(() => {
    fetchRisks();
  }, []);

  async function fetchRisks() {
    try {
      setLoading(true);
      const res = await fetch('/api/risks');
      const data = await res.json();
      
      if (data.success) {
        setRisks(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load risks');
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast.error('Error loading risks');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(risksData) {
    const total = risksData.length;
    const critical = risksData.filter(r => r.risk_severity === 'Critical' || r.risk_severity === 'High').length;
    const mitigated = risksData.filter(r => r.risk_status === 'Mitigated').length;
    const active = risksData.filter(r => r.risk_status === 'Identified' || r.risk_status === 'Under Review').length;

    setStats({ total, critical, mitigated, active });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Risk created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRisks();
      } else {
        toast.error(data.error || 'Failed to create risk');
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error('Error creating risk');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/risks/${selectedRisk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Risk updated successfully');
        setShowEditModal(false);
        setSelectedRisk(null);
        resetForm();
        fetchRisks();
      } else {
        toast.error(data.error || 'Failed to update risk');
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Error updating risk');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this risk?')) return;
    
    try {
      const res = await fetch(`/api/risks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Risk deleted successfully');
        fetchRisks();
      } else {
        toast.error(data.error || 'Failed to delete risk');
      }
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error('Error deleting risk');
    }
  }

  function resetForm() {
    setFormData({
      risk_id: '',
      risk_type: '',
      risk_description: '',
      identified_by: '',
      identified_date: '',
      risk_severity: 'Medium',
      mitigation_plan: '',
      review_date: '',
      risk_status: 'Identified'
    });
  }

  function openEditModal(risk) {
    setSelectedRisk(risk);
    setFormData({
      risk_id: risk.risk_id,
      risk_type: risk.risk_type,
      risk_description: risk.risk_description,
      identified_by: risk.identified_by,
      identified_date: risk.identified_date?.split('T')[0] || '',
      risk_severity: risk.risk_severity,
      mitigation_plan: risk.mitigation_plan || '',
      review_date: risk.review_date?.split('T')[0] || '',
      risk_status: risk.risk_status
    });
    setShowEditModal(true);
  }

  function getSeverityColor(severity) {
    const colors = {
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  }

  function getStatusColor(status) {
    const colors = {
      'Identified': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Mitigated': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground mt-1">Identify, assess, and mitigate legal risks</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Risk
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Critical/High</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mitigated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risks</CardTitle>
          <CardDescription>View and manage all identified risks</CardDescription>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No risks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by identifying a new risk.</p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Risk
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Identified Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Identified By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.risk_id}</TableCell>
                    <TableCell>{risk.risk_type}</TableCell>
                    <TableCell className="max-w-xs truncate">{risk.risk_description}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(risk.risk_severity)}>
                        {risk.risk_severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(risk.identified_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(risk.risk_status)}>
                        {risk.risk_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{risk.identified_by}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(risk)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(risk.id)}
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

      {/* Add Risk Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  value={formData.risk_id}
                  onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_type">Risk Type *</Label>
                <Input
                  id="risk_type"
                  value={formData.risk_type}
                  onChange={(e) => setFormData({ ...formData, risk_type: e.target.value })}
                  placeholder="e.g., Compliance, Financial, Operational"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="risk_description">Risk Description *</Label>
              <Textarea
                id="risk_description"
                value={formData.risk_description}
                onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identified_by">Identified By *</Label>
                <Input
                  id="identified_by"
                  value={formData.identified_by}
                  onChange={(e) => setFormData({ ...formData, identified_by: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identified_date">Identified Date *</Label>
                <Input
                  id="identified_date"
                  type="date"
                  value={formData.identified_date}
                  onChange={(e) => setFormData({ ...formData, identified_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk_severity">Severity *</Label>
                <select
                  id="risk_severity"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.risk_severity}
                  onChange={(e) => setFormData({ ...formData, risk_severity: e.target.value })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_status">Status *</Label>
                <select
                  id="risk_status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.risk_status}
                  onChange={(e) => setFormData({ ...formData, risk_status: e.target.value })}
                  required
                >
                  <option value="Identified">Identified</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitigation_plan">Mitigation Plan</Label>
              <Textarea
                id="mitigation_plan"
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review_date">Review Date</Label>
              <Input
                id="review_date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Create Risk</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Risk Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Risk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_risk_id">Risk ID *</Label>
                <Input
                  id="edit_risk_id"
                  value={formData.risk_id}
                  onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_risk_type">Risk Type *</Label>
                <Input
                  id="edit_risk_type"
                  value={formData.risk_type}
                  onChange={(e) => setFormData({ ...formData, risk_type: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_risk_description">Risk Description *</Label>
              <Textarea
                id="edit_risk_description"
                value={formData.risk_description}
                onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_identified_by">Identified By *</Label>
                <Input
                  id="edit_identified_by"
                  value={formData.identified_by}
                  onChange={(e) => setFormData({ ...formData, identified_by: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_identified_date">Identified Date *</Label>
                <Input
                  id="edit_identified_date"
                  type="date"
                  value={formData.identified_date}
                  onChange={(e) => setFormData({ ...formData, identified_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_risk_severity">Severity *</Label>
                <select
                  id="edit_risk_severity"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.risk_severity}
                  onChange={(e) => setFormData({ ...formData, risk_severity: e.target.value })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_risk_status">Status *</Label>
                <select
                  id="edit_risk_status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.risk_status}
                  onChange={(e) => setFormData({ ...formData, risk_status: e.target.value })}
                  required
                >
                  <option value="Identified">Identified</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_mitigation_plan">Mitigation Plan</Label>
              <Textarea
                id="edit_mitigation_plan"
                value={formData.mitigation_plan}
                onChange={(e) => setFormData({ ...formData, mitigation_plan: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_review_date">Review Date</Label>
              <Input
                id="edit_review_date"
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedRisk(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">Update Risk</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}