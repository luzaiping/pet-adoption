'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, ImageIcon } from 'lucide-react';
import {
  COMMON_PET_IMAGE_PATH,
  getPetImagePathsForSpecies,
  normalizePetSpecies,
} from '@/lib/constants/pets';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const IMAGES_PER_PAGE = 20;

type PetImagePickerProps = {
  species: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function PetImagePicker({
  species,
  value,
  onChange,
  invalid = false,
}: PetImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const normalizedSpecies = normalizePetSpecies(species);
  const imagePaths = getPetImagePathsForSpecies(normalizedSpecies);
  const hasSpecies = normalizedSpecies.length > 0;
  const usesCommonImage =
    hasSpecies && imagePaths[0] === COMMON_PET_IMAGE_PATH;
  const totalPages = Math.max(
    1,
    Math.ceil(imagePaths.length / IMAGES_PER_PAGE),
  );
  const visibleImages = imagePaths.slice(
    (page - 1) * IMAGES_PER_PAGE,
    page * IMAGES_PER_PAGE,
  );

  useEffect(() => {
    if (!hasSpecies) {
      if (value) {
        onChange('');
      }
      return;
    }

    if (usesCommonImage) {
      if (value !== COMMON_PET_IMAGE_PATH) {
        onChange(COMMON_PET_IMAGE_PATH);
      }
      return;
    }

    if (value && !imagePaths.includes(value)) {
      onChange('');
    }
  }, [hasSpecies, imagePaths, onChange, usesCommonImage, value]);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (open) {
      const selectedIndex = imagePaths.indexOf(value);
      setPage(
        selectedIndex >= 0
          ? Math.floor(selectedIndex / IMAGES_PER_PAGE) + 1
          : 1,
      );
    }
  }

  if (!hasSpecies) {
    return (
      <div
        className="flex aspect-4/3 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center"
        aria-invalid={invalid}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
          <ImageIcon className="size-5" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium">No image selected</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Choose a species first to see available images.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled>
          Choose image
        </Button>
      </div>
    );
  }

  if (usesCommonImage) {
    return (
      <div
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        aria-invalid={invalid}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          <Image
            src={COMMON_PET_IMAGE_PATH}
            alt="Generic pet placeholder"
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
            Automatic selection
          </span>
        </div>
        <div className="space-y-1 p-4">
          <p className="text-sm font-medium">Generic pet image</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Used automatically because {normalizedSpecies} has no dedicated
            image collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        aria-invalid={invalid}
      >
        {value ? (
          <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
            <Image
              src={value}
              alt={`Selected ${normalizedSpecies.toLowerCase()} image`}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
            />
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
              <CheckIcon className="size-3.5" />
              Selected
            </span>
          </div>
        ) : (
          <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-3 bg-muted/30 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
              <ImageIcon className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium">Select a pet image</p>
              <p className="text-xs text-muted-foreground">
                {imagePaths.length} {normalizedSpecies.toLowerCase()} images
                available.
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {value ? 'Pet profile image' : 'Image required'}
            </p>
            <p className="text-xs text-muted-foreground">
              {normalizedSpecies} collection
            </p>
          </div>
          <Button
            type="button"
            variant={value ? 'outline' : 'default'}
            size="sm"
            onClick={() => handleOpenChange(true)}
          >
            {value ? 'Change image' : 'Choose image'}
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl gap-5 p-0">
          <DialogHeader className="border-b px-6 pt-6 pb-5 pr-12">
            <DialogTitle>Choose a {normalizedSpecies} image</DialogTitle>
            <DialogDescription>
              Select one image for the pet profile. You can change it before
              saving the form.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visibleImages.map((imagePath) => {
                const imageNumber = imagePaths.indexOf(imagePath) + 1;
                const isSelected = value === imagePath;

                return (
                  <button
                    key={imagePath}
                    type="button"
                    className={cn(
                      'group relative aspect-4/3 overflow-hidden rounded-lg border-2 bg-muted transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-primary/50',
                    )}
                    aria-label={`Select ${normalizedSpecies.toLowerCase()} image ${imageNumber}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      onChange(imagePath);
                      setIsOpen(false);
                    }}
                  >
                    <Image
                      src={imagePath}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      className="object-cover transition duration-200 group-hover:scale-[1.02]"
                    />
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                        <CheckIcon className="size-4" />
                        <span className="sr-only">Currently selected</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="items-center justify-between border-t px-6 py-4 sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {imagePaths.length} images · Page {page} of {totalPages}
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
