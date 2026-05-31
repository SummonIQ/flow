'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from '@summoniq/applab-ui';

export default function TablePage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Sample data for examples
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', status: 'active' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Manager', status: 'inactive' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Developer', status: 'pending' },
  ];

  const invoices = [
    { id: 'INV001', amount: 250.00, status: 'Paid', method: 'Credit Card' },
    { id: 'INV002', amount: 150.00, status: 'Pending', method: 'PayPal' },
    { id: 'INV003', amount: 350.00, status: 'Unpaid', method: 'Bank Transfer' },
    { id: 'INV004', amount: 450.00, status: 'Paid', method: 'Credit Card' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      Paid: 'default',
      Pending: 'outline',
      Unpaid: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Table
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Basic table components for displaying tabular data with consistent styling
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Table Example */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Table</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'code'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('code')}
              >
                Code
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'preview' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
{`import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@summoniq/applab-ui';

const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Developer', status: 'active' },
  // ... more users
];

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell><Badge>{user.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table with Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Table with Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableCaption>A list of recent invoices</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{invoice.method}</TableCell>
                      <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right font-medium">
                      ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Components Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Available Components</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-muted px-1 rounded">Table</code> - Main table wrapper</li>
                  <li><code className="bg-muted px-1 rounded">TableHeader</code> - Table header section</li>
                  <li><code className="bg-muted px-1 rounded">TableBody</code> - Table body section</li>
                  <li><code className="bg-muted px-1 rounded">TableFooter</code> - Table footer section</li>
                  <li><code className="bg-muted px-1 rounded">TableRow</code> - Table row</li>
                  <li><code className="bg-muted px-1 rounded">TableHead</code> - Table header cell</li>
                  <li><code className="bg-muted px-1 rounded">TableCell</code> - Table data cell</li>
                  <li><code className="bg-muted px-1 rounded">TableCaption</code> - Table caption</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
