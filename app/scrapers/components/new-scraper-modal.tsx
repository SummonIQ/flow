'use client';

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/app/components/modal';
import { Button, Input, Label } from '@summoniq/applab-ui';
import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';

type ScraperDefinition = {
  id: string;
  name: string;
  startUrl: string;
  createdAt: string;
  updatedAt: string;
};

type NewScraperModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (scraper: ScraperDefinition) => void;
};

export function NewScraperModal({
  open,
  onOpenChange,
  onCreated,
}: NewScraperModalProps) {
  const [name, setName] = useState('');
  const [startUrl, setStartUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setStartUrl('');
    setSaving(false);
    setError(null);
  }, [open]);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const trimmedUrl = startUrl.trim();

    setError(null);
    if (!trimmedName) {
      setError('Name is required');
      return;
    }
    if (!trimmedUrl) {
      setError('Start URL is required');
      return;
    }

    setSaving(true);
    try {
      const stepId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const isUpworkScraper =
        /upwork/i.test(trimmedName) || /upwork\.com/i.test(trimmedUrl);
      const initialSteps = isUpworkScraper
        ? [
            {
              id: stepId,
              name: 'Navigate to Upwork',
              type: 'navigate',
              url: 'https://www.upwork.com',
            },
          ]
        : [];
      const resp = await fetch('/api/scrapers', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          startUrl: trimmedUrl,
          steps: initialSteps,
        }),
      });

      if (!resp.ok) {
        setError('Failed to create scraper');
        return;
      }

      const json = await resp.json();
      const scraper = json?.scraper as ScraperDefinition | undefined;
      if (!scraper?.id) {
        setError('Scraper created but response was invalid');
        return;
      }

      onOpenChange(false);
      onCreated(scraper);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl w-full">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            New scraper
          </ModalTitle>
          <ModalDescription>
            Create a new scraper definition and then edit steps/run it.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 p-6">
          {error ? (
            <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="scraper-name">Name</Label>
            <Input
              id="scraper-name"
              value={name}
              placeholder="Upwork job scraper"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scraper-url">Start URL</Label>
            <Input
              id="scraper-url"
              value={startUrl}
              placeholder="https://example.com"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setStartUrl(e.target.value)
              }
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving || !name || !startUrl}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
