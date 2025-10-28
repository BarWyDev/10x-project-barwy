/**
 * CreateDeckForm Component
 *
 * Inline form for creating new decks with:
 * - Name input (required)
 * - Description textarea (optional)
 * - Form validation
 * - Cancel and submit actions
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface CreateDeckFormProps {
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreateDeckForm = React.memo(({ onSubmit, onCancel, isSubmitting }: CreateDeckFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length === 0) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    // Reset form on success
    setName("");
    setDescription("");
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utwórz nową talię</CardTitle>
        <CardDescription>Dodaj nazwę i opcjonalny opis dla swojej talii</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="deck-name">Nazwa talii *</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Biologia - Komórka"
              maxLength={100}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="deck-description">Opis (opcjonalnie)</Label>
            <Textarea
              id="deck-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="np. Notatki z lekcji o budowie komórki"
              maxLength={500}
              disabled={isSubmitting}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Tworzenie..." : "Utwórz talię"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

CreateDeckForm.displayName = "CreateDeckForm";
