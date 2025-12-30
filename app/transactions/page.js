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
import { ArrowUpDown, Plus, Pencil, Trash2, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    transaction_id: '',
    transaction_type: '',
    client_id: '',
    transaction_date: '',
    transaction_value: '',
    legal_advisor: '',
    related_contract_id: '',
    approval_status: 'Pending',
    closing_date: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error loading transactions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const endpoint = selectedTransaction 
        ? `/api/transactions/${selectedTransaction.id}`
        : '/api/transactions';
      const method = selectedTransaction ? 'PUT' : 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(selectedTransaction ? 'Transaction updated successfully' : 'Transaction created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchTransactions();
      } else {
        toast.error(data.error || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Error saving transaction');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } else {
        toast.error(data.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error deleting transaction');
    }
  }

  function handleEdit(transaction) {
    setSelectedTransaction(transaction);
    setFormData({
      transaction_id: transaction.transaction_id,
      transaction_type: transaction.transaction_type,
      client_id: transaction.client_id,
      transaction_date: transaction.transaction_date?.split('T')[0] || '',
      transaction_value: transaction.transaction_value,
      legal_advisor: transaction.legal_advisor,
      related_contract_id: transaction.related_contract_id || '',
      approval_status: transaction.approval_status,
      closing_date: transaction.closing_date?.split('T')[0] || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      transaction_id: '',
      transaction_type: '',
      client_id: '',
      transaction_date: '',
      transaction_value: '',
      legal_advisor: '',
      related_contract_id: '',
      approval_status: 'Pending',
      closing_date: ''
    });
    setSelectedTransaction(null);
  }

  const stats = {
    total: transactions.length,
    totalValue: transactions.reduce((sum, t) => sum + parseFloat(t.transaction_value || 0), 0),
    pending: transactions.filter(t => t.approval_status === 'Pending').length,
    approved: transactions.filter(t => t.approval_status === 'Approved').length
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage legal transactions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A list of all legal transactions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first transaction</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Transaction Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Legal Advisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                      <TableCell>{transaction.transaction_type}</TableCell>
                      <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                      <TableCell>${parseFloat(transaction.transaction_value).toLocaleString()}</TableCell>
                      <TableCell>{transaction.legal_advisor}</TableCell>
                      <TableCell>{getStatusBadge(transaction.approval_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Create a new legal transaction record</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID *</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_type">Transaction Type *</Label>
                  <Input
                    id="transaction_type"
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="transaction_date">Transaction Date *</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_value">Transaction Value *</Label>
                  <Input
                    id="transaction_value"
                    type="number"
                    step="0.01"
                    value={formData.transaction_value}
                    onChange={(e) => setFormData({ ...formData, transaction_value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_advisor">Legal Advisor *</Label>
                  <Input
                    id="legal_advisor"
                    value={formData.legal_advisor}
                    onChange={(e) => setFormData({ ...formData, legal_advisor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="related_contract_id">Related Contract ID</Label>
                  <Input
                    id="related_contract_id"
                    value={formData.related_contract_id}
                    onChange={(e) => setFormData({ ...formData, related_contract_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approval_status">Approval Status *</Label>
                  <Select value={formData.approval_status} onValueChange={(value) => setFormData({ ...formData, approval_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_date">Closing Date</Label>
                <Input
                  id="closing_date"
                  type="date"
                  value={formData.closing_date}
                  onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit">Create Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update transaction information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_transaction_id">Transaction ID *</Label>
                  <Input
                    id="edit_transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_transaction_type">Transaction Type *</Label>
                  <Input
                    id="edit_transaction_type"
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="edit_transaction_date">Transaction Date *</Label>
                  <Input
                    id="edit_transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_transaction_value">Transaction Value *</Label>
                  <Input
                    id="edit_transaction_value"
                    type="number"
                    step="0.01"
                    value={formData.transaction_value}
                    onChange={(e) => setFormData({ ...formData, transaction_value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_legal_advisor">Legal Advisor *</Label>
                  <Input
                    id="edit_legal_advisor"
                    value={formData.legal_advisor}
                    onChange={(e) => setFormData({ ...formData, legal_advisor: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_related_contract_id">Related Contract ID</Label>
                  <Input
                    id="edit_related_contract_id"
                    value={formData.related_contract_id}
                    onChange={(e) => setFormData({ ...formData, related_contract_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_approval_status">Approval Status *</Label>
                  <Select value={formData.approval_status} onValueChange={(value) => setFormData({ ...formData, approval_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_closing_date">Closing Date</Label>
                <Input
                  id="edit_closing_date"
                  type="date"
                  value={formData.closing_date}
                  onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Update Transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}