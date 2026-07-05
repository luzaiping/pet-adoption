'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
  COMMON_PET_IMAGE_PATH,
  getPetImagePathsForSpecies,
  normalizePetSpecies,
} from '@/lib/constants/pets';
import { cn } from '@/lib/utils';

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
  const normalizedSpecies = normalizePetSpecies(species);
  const imagePaths = getPetImagePathsForSpecies(normalizedSpecies);
  const usesCommonImage = imagePaths[0] === COMMON_PET_IMAGE_PATH;

  useEffect(() => {
    if (usesCommonImage) {
      if (value !== COMMON_PET_IMAGE_PATH) {
        onChange(COMMON_PET_IMAGE_PATH);
      }
      return;
    }

    if (value && !imagePaths.includes(value)) {
      onChange('');
    }
  }, [imagePaths, onChange, usesCommonImage, value]);

  if (usesCommonImage) {
    return (
      <div
        className="space-y-3 rounded-lg border border-border p-3"
        aria-invalid={invalid}
      >
        <div className="relative aspect-4/3 w-full max-w-48 overflow-hidden rounded-md">
          <Image
            src={COMMON_PET_IMAGE_PATH}
            alt="Generic pet placeholder"
            fill
            sizes="192px"
            className="object-cover"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          A generic image is selected automatically for this species.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      aria-invalid={invalid}
    >
      {imagePaths.map((imagePath, index) => {
        const isSelected = value === imagePath;

        return (
          <button
            key={imagePath}
            type="button"
            className={cn(
              'relative aspect-4/3 overflow-hidden rounded-lg border bg-muted transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              isSelected
                ? 'border-primary ring-3 ring-primary/30'
                : 'border-border hover:border-primary/60',
            )}
            aria-label={`Select ${normalizedSpecies.toLowerCase()} image ${index + 1}`}
            aria-pressed={isSelected}
            onClick={() => onChange(imagePath)}
          >
            <Image
              src={imagePath}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 160px"
              className="object-cover"
            />
            {isSelected && (
              <span className="absolute right-2 bottom-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                Selected
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
