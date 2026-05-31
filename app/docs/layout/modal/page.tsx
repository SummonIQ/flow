'use client';

import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@summoniq/applab-ui';

export default function ModalPage() {
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showFromTriggerModal, setShowFromTriggerModal] = useState(false);
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [showDrawerLeftModal, setShowDrawerLeftModal] = useState(false);
  const [showDrawerRightModal, setShowDrawerRightModal] = useState(false);
  const [showDrawerFullModal, setShowDrawerFullModal] = useState(false);
  const [showDrawerFullMarginModal, setShowDrawerFullMarginModal] =
    useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [showSlideNoOverlayModal, setShowSlideNoOverlayModal] = useState(false);

  const handleFromTriggerClick = () => {
    setShowFromTriggerModal(true);
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Modal Component
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A flexible modal component built with Radix UI. Supports multiple
          animation variants, sizes, and configurations.
        </p>
      </div>

      {/* Modal Component Section */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Modal Component
          </h2>
          <p className="text-muted-foreground mb-6">
            A flexible modal component built with Radix UI and
            class-variance-authority. Supports multiple animation variants and
            sizes.
          </p>
        </div>

        {/* Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Modal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default Modal</CardTitle>
              <CardDescription>
                Slides up from bottom with scale animation (50% to 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDefaultModal(true)}>
                Open Default Modal
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent variant="default" size="md">
  <ModalHeader>
    <ModalTitle>Default Modal</ModalTitle>
    <ModalDescription>Modal content</ModalDescription>
  </ModalHeader>
  <ModalFooter>
    <Button>Confirm</Button>
  </ModalFooter>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* From Trigger Modal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">From Trigger Modal</CardTitle>
              <CardDescription>
                Animates from the exact position of the trigger button
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleFromTriggerClick}>
                Open From Trigger Modal
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<Button onClick={() => setIsOpen(true)}>
  Trigger
</Button>

<ModalContent variant="default" size="md">
  <ModalHeader>
    <ModalTitle>Confirm Action</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Drawer Modal - Center */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drawer Modal (Center)</CardTitle>
              <CardDescription>
                Slides up from the bottom center like a mobile drawer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDrawerModal(true)}>
                Open Drawer Modal
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="drawer"
  drawerSide="center"
  drawerWidth="md"
  drawerHeight="auto"
>
  <ModalHeader>
    <ModalTitle>Drawer Modal</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Drawer Modal - Left */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drawer Modal (Left)</CardTitle>
              <CardDescription>
                Slides up from the bottom left with margin on the left side
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDrawerLeftModal(true)}>
                Open Left Drawer
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="drawer"
  drawerSide="left"
  drawerWidth="lg"
  drawerHeight="1/2"
  marginLeft="lg"
>
  <ModalHeader>
    <ModalTitle>Left Drawer</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Drawer Modal - Right */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drawer Modal (Right)</CardTitle>
              <CardDescription>
                Slides up from the bottom right with large width
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDrawerRightModal(true)}>
                Open Right Drawer
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="drawer"
  drawerSide="right"
  drawerWidth="xl"
  drawerHeight="3/4"
>
  <ModalHeader>
    <ModalTitle>Right Drawer</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Drawer Modal - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drawer Modal (Full)</CardTitle>
              <CardDescription>
                Full width drawer with no margins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDrawerFullModal(true)}>
                Open Full Drawer
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="drawer"
  drawerSide="full"
  drawerHeight="1/2"
  showOverlay={false}
>
  <ModalHeader>
    <ModalTitle>Full Width Drawer</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Drawer Modal - Full Width with Margin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Drawer Modal (Full + Margin)
              </CardTitle>
              <CardDescription>
                Full width drawer with margin spacing and rounded corners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowDrawerFullMarginModal(true)}>
                Open Full Drawer + Margin
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="drawer"
  drawerSide="full"
  drawerHeight="2/3"
  margin="lg"
>
  <ModalHeader>
    <ModalTitle>Full + Margin</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Slide Modal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slide Right Modal</CardTitle>
              <CardDescription>
                Slides in from the right side with overlay and margin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowSlideModal(true)}>
                Open Slide Modal
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="slide"
  slideWidth="lg"
  margin="md"
>
  <ModalHeader>
    <ModalTitle>Slide Panel</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Slide Modal - No Overlay */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Slide Right (No Overlay)
              </CardTitle>
              <CardDescription>
                Slides in from the right side with no overlay or margin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowSlideNoOverlayModal(true)}>
                Open Slide (No Overlay)
              </Button>
              <div className="bg-muted/40 rounded-lg p-3">
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {`<ModalContent
  variant="slide"
  slideWidth="lg"
  showOverlay={false}
>
  <ModalHeader>
    <ModalTitle>Slide (No Overlay)</ModalTitle>
  </ModalHeader>
</ModalContent>`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/80 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalContent variant="default" size="md">
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <ModalDescription>Modal description text</ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>`}
            </pre>
          </CardContent>
        </Card>

        {/* Available Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground">
                  Animation Variants:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>
                    <code className="bg-muted/30 px-1 rounded">default</code> -
                    Bottom-up slide with 50% scale
                  </li>
                  <li>
                    <code className="bg-muted/30 px-1 rounded">drawer</code> -
                    Slide up from bottom edge
                  </li>
                  <li>
                    <code className="bg-muted/30 px-1 rounded">slide</code> -
                    Slide panel (right side)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Size Variants:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>
                    <code className="bg-muted/30 px-1 rounded">sm</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">md</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">lg</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">xl</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">2xl</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">3xl</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">4xl</code>,{' '}
                    <code className="bg-muted/30 px-1 rounded">full</code>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal Instances */}

      {/* Default Modal */}
      <Modal open={showDefaultModal} onOpenChange={setShowDefaultModal}>
        <ModalContent variant="default" size="md">
          <ModalHeader>
            <ModalTitle>Default Modal</ModalTitle>
            <ModalDescription>
              This modal uses the default animation variant with bottom-up slide
              and scale.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDefaultModal(false)}
            >
              Close
            </Button>
            <Button onClick={() => setShowDefaultModal(false)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* From Trigger Modal */}
      <Modal open={showFromTriggerModal} onOpenChange={setShowFromTriggerModal}>
        <ModalContent variant="default" size="md">
          <ModalHeader>
            <ModalTitle>Delete Project</ModalTitle>
            <ModalDescription>
              This modal animates from the button that triggered it. Perfect for
              contextual actions like delete confirmations.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowFromTriggerModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowFromTriggerModal(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Modal - Center */}
      <Modal open={showDrawerModal} onOpenChange={setShowDrawerModal}>
        <ModalContent
          variant="drawer"
          drawerSide="center"
          drawerWidth="md"
          drawerHeight="auto"
        >
          <ModalHeader>
            <ModalTitle>Drawer Modal (Center)</ModalTitle>
            <ModalDescription>
              This modal slides up from the bottom center like a mobile drawer
              or bottom sheet.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDrawerModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Modal - Left */}
      <Modal open={showDrawerLeftModal} onOpenChange={setShowDrawerLeftModal}>
        <ModalContent
          variant="drawer"
          drawerSide="left"
          drawerWidth="lg"
          drawerHeight="1/2"
          marginLeft="lg"
        >
          <ModalHeader>
            <ModalTitle>Left Drawer Modal</ModalTitle>
            <ModalDescription>
              This drawer is positioned on the left side with a margin on the
              left edge.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Left positioned drawer</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">
                  Left margin for spacing from edge
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">
                  Half height with scaling animation
                </span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDrawerLeftModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Modal - Right */}
      <Modal open={showDrawerRightModal} onOpenChange={setShowDrawerRightModal}>
        <ModalContent
          variant="drawer"
          drawerSide="right"
          drawerWidth="lg"
          drawerHeight="1/2"
        >
          <ModalHeader>
            <ModalTitle>Right Drawer Modal</ModalTitle>
            <ModalDescription>
              This drawer is positioned on the right side with extra large
              width.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Right positioned drawer</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Extra large width (xl)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">3/4 height variant</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDrawerRightModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Modal - Full Width */}
      <Modal open={showDrawerFullModal} onOpenChange={setShowDrawerFullModal}>
        <ModalContent
          variant="drawer"
          drawerSide="full"
          drawerHeight="1/2"
          showOverlay={false}
        >
          <ModalHeader>
            <ModalTitle>Full Width Drawer Modal</ModalTitle>
            <ModalDescription>
              This drawer spans the full width with no overlay and no margins.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Full width</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">No margins</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Half height</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDrawerFullModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Modal - Full Width with Margin */}
      <Modal
        open={showDrawerFullMarginModal}
        onOpenChange={setShowDrawerFullMarginModal}
      >
        <ModalContent
          variant="drawer"
          drawerSide="full"
          drawerHeight="1/2"
          margin="lg"
        >
          <ModalHeader>
            <ModalTitle>Full Width Drawer with Margin</ModalTitle>
            <ModalDescription>
              This drawer spans the full width with large margins and rounded
              corners.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Full width</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Large margins</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Rounded corners</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowDrawerFullMarginModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Slide Modal with Margin */}
      <Modal open={showSlideModal} onOpenChange={setShowSlideModal}>
        <ModalContent variant="slide" slideWidth="md" margin="md">
          <ModalHeader>
            <ModalTitle>Slide Panel with Margin</ModalTitle>
            <ModalDescription>
              This modal slides in from the right with margin, scaling, and
              rounded corners.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">With overlay</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Medium margin</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Scale animation (80% to 100%)</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowSlideModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Slide Modal without Overlay/Margin */}
      <Modal
        open={showSlideNoOverlayModal}
        onOpenChange={setShowSlideNoOverlayModal}
      >
        <ModalContent variant="slide" slideWidth="md" showOverlay={false}>
          <ModalHeader>
            <ModalTitle>Slide Panel (No Overlay)</ModalTitle>
            <ModalDescription>
              This modal slides in from the right with no overlay, no margin,
              and no scaling.
            </ModalDescription>
          </ModalHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">No overlay</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">No margin</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/40">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Pure slide animation</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowSlideNoOverlayModal(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
