'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AdminPetFiltersProps = {
  speciesOptions: string[];
};

type AdvancedFilterFieldsProps = {
  idPrefix: string;
  age: string;
  species: string;
  status: string;
  sort: string;
  speciesOptions: string[];
  onAgeChange: (value: string) => void;
  onSpeciesChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  className?: string;
};

function AdvancedFilterFields({
  idPrefix,
  age,
  species,
  status,
  sort,
  speciesOptions,
  onAgeChange,
  onSpeciesChange,
  onStatusChange,
  onSortChange,
  className,
}: AdvancedFilterFieldsProps) {
  return (
    <div className={className}>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-age`} className="text-sm font-medium">
          Age
        </label>
        <Input
          id={`${idPrefix}-age`}
          type="number"
          min={0}
          max={20}
          step={1}
          value={age}
          onChange={(event) => onAgeChange(event.target.value)}
          placeholder="Any age"
        />
      </div>

      <div className="min-w-0 space-y-1.5">
        <label htmlFor={`${idPrefix}-species`} className="text-sm font-medium">
          Species
        </label>
        <Select value={species} onValueChange={onSpeciesChange}>
          <SelectTrigger id={`${idPrefix}-species`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {speciesOptions.map((speciesOption) => (
              <SelectItem key={speciesOption} value={speciesOption}>
                {speciesOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1.5">
        <label htmlFor={`${idPrefix}-status`} className="text-sm font-medium">
          Status
        </label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id={`${idPrefix}-status`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ADOPTED">Adopted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1.5">
        <label htmlFor={`${idPrefix}-sort`} className="text-sm font-medium">
          Created date
        </label>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger id={`${idPrefix}-sort`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function AdminPetFilters({ speciesOptions }: AdminPetFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentName = (searchParams.get('name') ?? '').slice(0, 50);
  const rawAge = searchParams.get('age') ?? '';
  const numericAge = Number(rawAge);
  const currentAge =
    rawAge !== '' &&
    Number.isInteger(numericAge) &&
    numericAge >= 0 &&
    numericAge <= 20
      ? rawAge
      : '';
  const rawSpecies = searchParams.get('species');
  const currentSpecies =
    rawSpecies && speciesOptions.includes(rawSpecies) ? rawSpecies : 'all';
  const currentStatus =
    searchParams.get('status') === 'AVAILABLE' ||
    searchParams.get('status') === 'ADOPTED'
      ? searchParams.get('status')!
      : 'all';
  const currentSort =
    searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const [name, setName] = useState(currentName);
  const [age, setAge] = useState(currentAge);
  const [species, setSpecies] = useState(currentSpecies);
  const [status, setStatus] = useState(currentStatus);
  const [sort, setSort] = useState(currentSort);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(currentName);
    setAge(currentAge);
    setSpecies(currentSpecies);
    setStatus(currentStatus);
    setSort(currentSort);
  }, [currentAge, currentName, currentSort, currentSpecies, currentStatus]);

  function applyFilters() {
    const params = new URLSearchParams(searchParams);
    const normalizedName = name.trim();

    if (normalizedName) params.set('name', normalizedName);
    else params.delete('name');

    if (age) params.set('age', age);
    else params.delete('age');

    if (species !== 'all') params.set('species', species);
    else params.delete('species');

    if (status !== 'all') params.set('status', status);
    else params.delete('status');

    if (sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');

    params.delete('page');
    const query = params.toString();
    setIsDialogOpen(false);
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters();
  }

  function clearFilters() {
    setName('');
    setAge('');
    setSpecies('all');
    setStatus('all');
    setSort('newest');
    setIsDialogOpen(false);
    startTransition(() => router.push(pathname));
  }

  const hasFilters =
    currentName !== '' ||
    currentAge !== '' ||
    currentSpecies !== 'all' ||
    currentStatus !== 'all' ||
    currentSort !== 'newest';
  const advancedFilterCount =
    Number(currentAge !== '') +
    Number(currentSpecies !== 'all') +
    Number(currentStatus !== 'all') +
    Number(currentSort !== 'newest');

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="admin-pet-name" className="text-sm font-medium">
              Search pets
            </label>
            <Input
              id="admin-pet-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Search by name"
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={isPending} className="shrink-0">
            <SearchIcon />
            <span className="hidden sm:inline">
              {isPending ? 'Searching...' : 'Search'}
            </span>
            <span className="sr-only sm:hidden">Search</span>
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden shrink-0 lg:inline-flex"
              aria-label="Clear filters"
              disabled={isPending}
              onClick={clearFilters}
            >
              <XIcon />
            </Button>
          )}
        </div>

        <AdvancedFilterFields
          idPrefix="desktop-admin-pet"
          age={age}
          species={species}
          status={status}
          sort={sort}
          speciesOptions={speciesOptions}
          onAgeChange={setAge}
          onSpeciesChange={setSpecies}
          onStatusChange={setStatus}
          onSortChange={setSort}
          className="hidden grid-cols-4 gap-4 border-t pt-4 lg:grid"
        />

        <div className="flex items-center justify-between gap-3 border-t pt-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="flex-1 justify-start"
            onClick={() => setIsDialogOpen(true)}
          >
            <SlidersHorizontalIcon />
            Filters
            {advancedFilterCount > 0 && (
              <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-xs leading-none text-primary-foreground">
                {advancedFilterCount}
              </span>
            )}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-b px-6 pt-6 pb-5 pr-12">
            <DialogTitle>Filter pets</DialogTitle>
            <DialogDescription>
              Narrow the list by age, species, status, or creation date.
            </DialogDescription>
          </DialogHeader>

          <AdvancedFilterFields
            idPrefix="mobile-admin-pet"
            age={age}
            species={species}
            status={status}
            sort={sort}
            speciesOptions={speciesOptions}
            onAgeChange={setAge}
            onSpeciesChange={setSpecies}
            onStatusChange={setStatus}
            onSortChange={setSort}
            className="grid gap-4 px-6 py-5"
          />

          <DialogFooter className="border-t px-6 py-4 sm:justify-between">
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Clear all
            </Button>
            <Button type="button" disabled={isPending} onClick={applyFilters}>
              Apply filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
