import { Card, CardHeader, CardContent, CardTitle, CardDescription, Button, Input, Label } from '@summoniq/applab-ui';

export default function PatternsPage() {
  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Layout Patterns</h1>
      <p className="text-lg text-gray-600 dark:text-gray-200 mb-8">
        Common layout patterns and compositions that ensure consistency across SummonIQ products.
      </p>

      <div className="space-y-12">
        
        {/* Dashboard Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Dashboard Layout</h2>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Sidebar + Main Content</CardTitle>
              <CardDescription>
                Standard dashboard layout with navigation sidebar and main content area
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-50 dark:bg-gray-900 p-6">
                <div className="flex h-64 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                  {/* Sidebar */}
                  <div className="w-1/4 bg-gray-900 text-white p-4">
                    <div className="space-y-2">
                      <div className="h-6 bg-white/20 rounded"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-4 bg-white/20 rounded"></div>
                        <div className="h-4 bg-white/10 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                        <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Structure</h4>
                  <code className="text-xs text-gray-600 dark:text-gray-300 block whitespace-pre">
{`<div className="flex h-screen">
  <aside className="w-64 bg-gray-900 text-white">
    {/* Navigation */}
  </aside>
  <main className="flex-1 overflow-auto p-6">
    {/* Main content */}
  </main>
</div>`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Layout Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Form Layouts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Single Column Form */}
            <Card>
              <CardHeader>
                <CardTitle>Single Column Form</CardTitle>
                <CardDescription>Simple, linear form layout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Acme Inc." />
                  </div>
                  <Button className="w-full">Submit</Button>
                </div>
              </CardContent>
            </Card>

            {/* Two Column Form */}
            <Card>
              <CardHeader>
                <CardTitle>Two Column Form</CardTitle>
                <CardDescription>Efficient use of space for related fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email-2">Email</Label>
                    <Input id="email-2" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="United States" />
                    </div>
                  </div>
                  <Button className="w-full">Submit</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Card Grid Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Card Grid Layouts</h2>
          <div className="space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive Grid</CardTitle>
                <CardDescription>Auto-adjusting grid that works on all screen sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded mb-3"></div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Item {i}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Description text</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Responsive Classes</h4>
              <code className="text-xs text-gray-600 dark:text-gray-300 block">
                grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              </code>
            </div>
          </div>
        </section>

        {/* Page Header Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Page Headers</h2>
          <div className="space-y-6">
            
            {/* Simple Header */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Header</CardTitle>
                <CardDescription>Basic page title and description</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Title</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Brief description of what this page contains or what the user can do here.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Header with Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Header with Actions</CardTitle>
                <CardDescription>Page header with action buttons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <div className="flex gap-2">
                      <Button variant="outline">Import</Button>
                      <Button>New Project</Button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage and organize your projects in one place.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Header with Breadcrumbs */}
            <Card>
              <CardHeader>
                <CardTitle>Header with Breadcrumbs</CardTitle>
                <CardDescription>Navigation breadcrumbs and page title</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span>Projects</span>
                    <span className="mx-2">/</span>
                    <span>Design System</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 dark:text-white">Components</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Button Component</h1>
                    <Button>Edit Component</Button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Primary action component with multiple variants and sizes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modal Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Modal Patterns</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <Card>
              <CardHeader>
                <CardTitle>Confirmation Modal</CardTitle>
                <CardDescription>For destructive or important actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Delete Project?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      This action cannot be undone. All project data will be permanently deleted.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Modal</CardTitle>
                <CardDescription>For quick data entry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Create New Project
                    </h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="My Awesome Project" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" placeholder="Brief description..." />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancel</Button>
                      <Button>Create Project</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Empty State Pattern */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Empty States</h2>
          <Card>
            <CardHeader>
              <CardTitle>Empty State Design</CardTitle>
              <CardDescription>Guiding users when there's no content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
                    Get started by creating your first project. It only takes a few minutes to set up.
                  </p>
                  <Button>Create Your First Project</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
