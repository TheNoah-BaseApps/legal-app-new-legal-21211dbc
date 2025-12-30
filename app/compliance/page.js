'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, ShieldCheck, CheckCircle, AlertCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CompliancePage() {
  const router = useRouter();
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    pending: 0
  });

  useEffect(() => {
    fetchCompliance();
  }, []);

  async function fetchCompliance() {
    try {
      const res = await fetch('/api/compliance');
      const data = await res.json();
      if (data.success) {
        setCompliance(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching compliance records:', error);
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(complianceData) {
    const total = complianceData.length;
    const compliant = complianceData.filter(c => c.compliance_status === 'Compliant').length;
    const nonCompliant = complianceData.filter(c => c.compliance_status === 'Non-Compliant').length;
    const pending = complianceData.filter(c => c.compliance_status === 'Pending').length;
    setStats({ total, compliant, nonCompliant, pending });
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this compliance record?')) return;

    try {
      const res = await fetch(`/api/compliance/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Compliance record deleted successfully');
        fetchCompliance();
      } else {
        toast.error(data.error || 'Failed to delete compliance record');
      }
    } catch (error) {
      console.error('Error deleting compliance record:', error);
      toast.error('Failed to delete compliance record');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const payload = {
      compliance_id: formData.get('compliance_id'),
      regulation_name: formData.get('regulation_name'),
      entity_checked: formData.get('entity_checked'),
      compliance_date: formData.get('compliance_date'),
      compliance_status: formData.get('compliance_status'),
      responsible_officer: formData.get('responsible_officer'),
      action_required: formData.get('action_required') || null,
      next_review_date: formData.get('next_review_date') || null,
      remarks: formData.get('remarks') || null
    };

    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Compliance record created successfully');
        setShowAddModal(false);
        fetchCompliance();
        e.target.reset();
      } else {
        toast.error(data.error || 'Failed to create compliance record');
      }
    } catch (error) {
      console.error('Error creating compliance record:', error);
      toast.error('Failed to create compliance record');
    }
  }

  function getStatusBadge(status) {
    const variants = {
      'Compliant': 'default',
      'Non-Compliant': 'destructive',
      'Pending': 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading compliance records...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Compliance Management</h1>
          <p className="text-muted-foreground mt-1">Track regulatory compliance and audits</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Compliance Check
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliant}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nonCompliant}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checks</CardTitle>
          <CardDescription>All regulatory compliance checks and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {compliance.length === 0 ? (
            <div className="text-center py-10">
              <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No compliance checks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a compliance check.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Compliance Check
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compliance ID</TableHead>
                  <TableHead>Regulation</TableHead>
                  <TableHead>Entity Checked</TableHead>
                  <TableHead>Compliance Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsible Officer</TableHead>
                  <TableHead>Next Review</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compliance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.compliance_id}</TableCell>
                    <TableCell>{record.regulation_name}</TableCell>
                    <TableCell>{record.entity_checked}</TableCell>
                    <TableCell>{new Date(record.compliance_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(record.compliance_status)}</TableCell>
                    <TableCell>{record.responsible_officer}</TableCell>
                    <TableCell>
                      {record.next_review_date 
                        ? new Date(record.next_review_date).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/compliance/${record.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
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

      {/* Add Compliance Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Compliance Check</DialogTitle>
            <DialogDescription>Record a new compliance check or audit</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compliance_id">Compliance ID *</Label>
                <Input id="compliance_id" name="compliance_id" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regulation_name">Regulation Name *</Label>
                <Input id="regulation_name" name="regulation_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity_checked">Entity Checked *</Label>
                <Input id="entity_checked" name="entity_checked" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_status">Status *</Label>
                <Select name="compliance_status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_date">Compliance Date *</Label>
                <Input id="compliance_date" name="compliance_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible_officer">Responsible Officer *</Label>
                <Input id="responsible_officer" name="responsible_officer" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input id="next_review_date" name="next_review_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_required">Action Required</Label>
                <Input id="action_required" name="action_required" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" name="remarks" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Record</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}